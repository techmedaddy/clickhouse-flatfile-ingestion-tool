const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const config = require('./config');

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // to parse form data

// Static frontend (optional if serving from same server)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// File uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'data', 'uploads')));

// Routes
const clickhouseRoutes = require('./routes/clickhouse');
const flatfileRoutes = require('./routes/flatfile');

app.use('/api/clickhouse', clickhouseRoutes);
app.use('/api/flatfile', flatfileRoutes);

// Root route (optional)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Start server
app.listen(config.PORT, () => {
  console.log(`Server running at http://localhost:${config.PORT}`);
});
