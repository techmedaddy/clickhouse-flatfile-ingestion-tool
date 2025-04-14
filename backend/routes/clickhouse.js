const express = require('express');
const router = express.Router();
const clickhouseController = require('../controllers/clickhouseController');

// POST /api/clickhouse/connect
// Verifies connection to ClickHouse with provided config and JWT
router.post('/connect', async (req, res) => {
  try {
    const { host, port, database, user, jwtToken } = req.body;
    const success = await clickhouseController.testConnection({ host, port, database, user, jwtToken });

    if (success) {
      res.status(200).json({ message: '✅ Successfully connected to ClickHouse.' });
    } else {
      res.status(400).json({ message: '❌ Failed to connect to ClickHouse. Please check credentials.' });
    }
  } catch (err) {
    console.error('Error in /connect:', err.message);
    res.status(500).json({ message: '🚨 Server error while connecting to ClickHouse.', error: err.message });
  }
});

// GET /api/clickhouse/tables
// Fetches list of tables from ClickHouse
router.get('/tables', async (req, res) => {
  try {
    const { host, port, database, user, jwtToken } = req.query;
    const tables = await clickhouseController.fetchTables({ host, port, database, user, jwtToken });

    res.status(200).json({ tables });
  } catch (err) {
    console.error('Error in /tables:', err.message);
    res.status(500).json({ message: '🚨 Failed to fetch tables.', error: err.message });
  }
});

// POST /api/clickhouse/ingest
// Ingests data from ClickHouse to Flat File or vice versa
router.post('/ingest', async (req, res) => {
  try {
    const {
      source,               // "clickhouse" or "flatfile"
      target,               // "clickhouse" or "flatfile"
      connection,           // ClickHouse config object
      selectedTable,
      selectedColumns,
      joinConfig            // Optional, for JOINs
    } = req.body;

    const result = await clickhouseController.ingestData({
      source,
      target,
      connection,
      selectedTable,
      selectedColumns,
      joinConfig
    });

    res.status(200).json({ message: '✅ Ingestion completed.', recordCount: result.count });
  } catch (err) {
    console.error('Error in /ingest:', err.message);
    res.status(500).json({ message: '🚨 Ingestion failed.', error: err.message });
  }
});

module.exports = router;
