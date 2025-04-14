const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { ClickHouse } = require('@apla/clickhouse');

// Helper to get unique column names from CSV
function extractHeaders(filePath, delimiter) {
  return new Promise((resolve, reject) => {
    const headers = new Set();
    const stream = fs.createReadStream(filePath)
      .pipe(csv({ separator: delimiter }))
      .on('headers', (headerList) => {
        headerList.forEach(h => headers.add(h));
        stream.destroy(); // Stop after header
      })
      .on('close', () => resolve(Array.from(headers)))
      .on('error', (err) => reject(err));
  });
}

// Helper to preview first few rows
function previewRows(filePath, delimiter, maxRows = 5) {
  return new Promise((resolve, reject) => {
    const sample = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: delimiter }))
      .on('data', (row) => {
        if (sample.length < maxRows) sample.push(row);
      })
      .on('end', () => resolve(sample))
      .on('error', (err) => reject(err));
  });
}

function createClickHouseClient({ host, port, database, user, jwtToken }) {
  return new ClickHouse({
    url: host,
    port: port,
    debug: false,
    basicAuth: {
      username: user,
      password: jwtToken,
    },
    isUseGzip: false,
    format: 'json',
    config: {
      database: database,
    },
  });
}

module.exports = {
  // ✅ Extract schema and preview
  extractSchema: async (filePath, delimiter) => {
    try {
      const columns = await extractHeaders(filePath, delimiter);
      const sampleRows = await previewRows(filePath, delimiter);
      return { columns, sampleRows };
    } catch (err) {
      console.error('Schema extraction error:', err.message);
      throw new Error('Unable to extract schema from flat file.');
    }
  },

  // 🔄 Ingest CSV to ClickHouse
  ingestToClickHouse: async ({
    filePath,
    delimiter,
    selectedColumns,
    clickhouseConfig,
    targetTable
  }) => {
    try {
      const clickhouse = createClickHouseClient(clickhouseConfig);

      // Create table with simple types (assume all text for now)
      const columnDefs = selectedColumns.map(col => `\`${col}\` String`).join(', ');
      const createTableSQL = `CREATE TABLE IF NOT EXISTS \`${targetTable}\` (${columnDefs}) ENGINE = MergeTree() ORDER BY tuple()`;

      await clickhouse.querying(createTableSQL);

      // Read CSV and insert rows in batches
      const rows = [];
      const BATCH_SIZE = 1000;
      let insertedCount = 0;

      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv({ separator: delimiter }))
          .on('data', async (row) => {
            const filtered = selectedColumns.map(col => row[col] || '');
            rows.push(filtered);

            if (rows.length >= BATCH_SIZE) {
              const values = rows.map(r => `(${r.map(v => `'${v}'`).join(', ')})`).join(', ');
              const insertSQL = `INSERT INTO \`${targetTable}\` (${selectedColumns.join(', ')}) VALUES ${values}`;
              try {
                await clickhouse.querying(insertSQL);
                insertedCount += rows.length;
                rows.length = 0;
              } catch (err) {
                console.error('Batch insert failed:', err.message);
                reject(err);
              }
            }
          })
          .on('end', async () => {
            if (rows.length > 0) {
              const values = rows.map(r => `(${r.map(v => `'${v}'`).join(', ')})`).join(', ');
              const insertSQL = `INSERT INTO \`${targetTable}\` (${selectedColumns.join(', ')}) VALUES ${values}`;
              await clickhouse.querying(insertSQL);
              insertedCount += rows.length;
            }
            resolve();
          })
          .on('error', reject);
      });

      return { count: insertedCount };
    } catch (err) {
      console.error('Flat File ingestion error:', err.message);
      throw new Error('Flat File ingestion to ClickHouse failed.');
    }
  }
};
