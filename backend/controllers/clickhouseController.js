const fs = require('fs');
const path = require('path');
const { ClickHouse } = require('@apla/clickhouse');
const config = require('../config');
const { parse } = require('json2csv');

function createClickHouseClient({ host, port, database, user, jwtToken }) {
  return new ClickHouse({
    url: host,
    port: port,
    debug: false,
    basicAuth: {
      username: user,
      password: jwtToken, // JWT is passed as password
    },
    isUseGzip: false,
    format: 'json', // default response format
    config: {
      database: database,
    },
  });
}

module.exports = {
  // ✅ Test ClickHouse Connection
  testConnection: async ({ host, port, database, user, jwtToken }) => {
    try {
      const clickhouse = createClickHouseClient({ host, port, database, user, jwtToken });

      const query = 'SELECT 1';
      const result = await clickhouse.querying(query);

      return result && result.data && result.data.length > 0;
    } catch (err) {
      console.error('ClickHouse Connection Error:', err.message);
      return false;
    }
  },

  // 📋 Fetch List of Tables
  fetchTables: async ({ host, port, database, user, jwtToken }) => {
    try {
      const clickhouse = createClickHouseClient({ host, port, database, user, jwtToken });

      const query = `SELECT name FROM system.tables WHERE database = '${database}'`;
      const result = await clickhouse.querying(query);

      return result.data.map(row => row.name);
    } catch (err) {
      console.error('Error fetching tables:', err.message);
      throw new Error('Failed to retrieve tables from ClickHouse');
    }
  },

  // 🔄 Ingest Data from ClickHouse ➜ Flat File
  ingestData: async ({
    source,
    target,
    connection,
    selectedTable,
    selectedColumns,
    joinConfig,
  }) => {
    try {
      if (source !== 'clickhouse' || target !== 'flatfile') {
        throw new Error('Only ClickHouse ➜ Flat File ingestion is supported in this version.');
      }

      const clickhouse = createClickHouseClient(connection);
      const columnStr = selectedColumns.join(', ');
      let query = `SELECT ${columnStr} FROM ${selectedTable}`;

      // (Optional) JOIN logic can be added here

      const result = await clickhouse.querying(query);
      const records = result.data;

      if (!records || records.length === 0) {
        throw new Error('No data returned from ClickHouse.');
      }

      // Convert to CSV
      const csv = parse(records, { fields: selectedColumns });
      const timestamp = Date.now();
      const outputPath = path.join(config.UPLOAD_DIR, `clickhouse_output_${timestamp}.csv`);

      fs.writeFileSync(outputPath, csv, 'utf8');

      return { count: records.length, file: outputPath };
    } catch (err) {
      console.error('Ingestion error:', err.message);
      throw new Error(`Ingestion failed: ${err.message}`);
    }
  }
};
