const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { parse } = require('json2csv');

module.exports = {
  // ✅ Read CSV file and return all rows
  readCSV: (filePath, delimiter = ',') => {
    return new Promise((resolve, reject) => {
      const data = [];
      try {
        if (!fs.existsSync(filePath)) {
          return reject(new Error(`❌ File not found: ${filePath}`));
        }

        fs.createReadStream(filePath)
          .pipe(csv({ separator: delimiter }))
          .on('data', (row) => {
            data.push(row);
          })
          .on('end', () => {
            resolve(data);
          })
          .on('error', (err) => {
            console.error('CSV read error:', err.message);
            reject(new Error(`❌ Error reading CSV file: ${err.message}`));
          });
      } catch (err) {
        reject(new Error(`🚨 Unexpected error reading CSV: ${err.message}`));
      }
    });
  },

  // ✅ Write data to CSV file
  writeCSV: (filePath, rows, fields) => {
    return new Promise((resolve, reject) => {
      try {
        if (!Array.isArray(rows) || rows.length === 0) {
          return reject(new Error('❌ No data provided to write to CSV.'));
        }

        const csvContent = parse(rows, { fields });
        fs.writeFile(filePath, csvContent, 'utf8', (err) => {
          if (err) {
            console.error('CSV write error:', err.message);
            return reject(new Error(`❌ Error writing CSV file: ${err.message}`));
          }
          resolve(`✅ CSV file successfully written to: ${filePath}`);
        });
      } catch (err) {
        reject(new Error(`🚨 Failed to generate CSV: ${err.message}`));
      }
    });
  },

  // ✅ Preview top N rows
  previewCSV: (filePath, delimiter = ',', limit = 5) => {
    return new Promise((resolve, reject) => {
      const preview = [];

      try {
        fs.createReadStream(filePath)
          .pipe(csv({ separator: delimiter }))
          .on('data', (row) => {
            if (preview.length < limit) preview.push(row);
          })
          .on('end', () => resolve(preview))
          .on('error', (err) => {
            console.error('CSV preview error:', err.message);
            reject(new Error(`❌ Error previewing CSV: ${err.message}`));
          });
      } catch (err) {
        reject(new Error(`🚨 Unexpected error previewing CSV: ${err.message}`));
      }
    });
  }
};
