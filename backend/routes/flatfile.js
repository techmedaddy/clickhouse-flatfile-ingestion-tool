const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const flatfileController = require('../controllers/flatfileController');
const config = require('../config');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Rename with timestamp to avoid collision
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `flatfile_${timestamp}${ext}`);
  },
});

const upload = multer({ storage });

// POST /api/flatfile/upload
// Uploads a flat file (CSV) and returns basic schema info
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '❌ No file uploaded.' });
    }

    const filePath = req.file.path;
    const delimiter = req.body.delimiter || ',';

    const schema = await flatfileController.extractSchema(filePath, delimiter);

    res.status(200).json({
      message: '✅ File uploaded and schema extracted.',
      filePath,
      columns: schema.columns,
      sampleRows: schema.sampleRows,
    });
  } catch (err) {
    console.error('Error in /upload:', err.message);
    res.status(500).json({ message: '🚨 File upload failed.', error: err.message });
  }
});

// POST /api/flatfile/ingest
// Ingests data from Flat File to ClickHouse
router.post('/ingest', async (req, res) => {
  try {
    const {
      filePath,
      delimiter,
      selectedColumns,
      clickhouseConfig,
      targetTable,
    } = req.body;

    const result = await flatfileController.ingestToClickHouse({
      filePath,
      delimiter,
      selectedColumns,
      clickhouseConfig,
      targetTable,
    });

    res.status(200).json({
      message: '✅ Flat File successfully ingested into ClickHouse.',
      recordCount: result.count,
    });
  } catch (err) {
    console.error('Error in /ingest:', err.message);
    res.status(500).json({ message: '🚨 Flat File ingestion failed.', error: err.message });
  }
});

module.exports = router;
