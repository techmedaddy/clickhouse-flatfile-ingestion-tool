const path = require('path');

module.exports = {
  // Server Port
  PORT: process.env.PORT || 5000,

  // File upload directory
  UPLOAD_DIR: path.join(__dirname, 'data', 'uploads'),

  // Default ClickHouse config (can be overridden by UI input)
  CLICKHOUSE_DEFAULTS: {
    host: 'https://your-clickhouse-host.com', // e.g., http://localhost or cloud URL
    port: 8443, // HTTPS: 8443 / 9440 | HTTP: 8123 / 9000
    database: 'default',
    user: 'default',
    jwtToken: '', // Leave empty; will be set by UI input
  },

  // Flat File config
  FLATFILE: {
    delimiter: ',', // Default CSV delimiter
  }
};
