const sourceSelect = document.getElementById('source');
const chConfig = document.getElementById('clickhouse-config');
const flatConfig = document.getElementById('flatfile-config');
const columnSection = document.getElementById('column-section');
const columnForm = document.getElementById('columnForm');
const ingestionSection = document.getElementById('ingestion-section');
const status = document.getElementById('status');

let selectedColumns = [];
let columnList = [];
let clickhouseConfig = {};
let filePath = '';
let isClickHouseSource = false;

// Handle source selection
sourceSelect.addEventListener('change', () => {
  resetUI();
  const source = sourceSelect.value;

  if (source === 'clickhouse') {
    chConfig.style.display = 'block';
    isClickHouseSource = true;
  } else if (source === 'flatfile') {
    flatConfig.style.display = 'block';
    isClickHouseSource = false;
  }
});

// Reset all sections except source
function resetUI() {
  chConfig.style.display = 'none';
  flatConfig.style.display = 'none';
  columnSection.style.display = 'none';
  ingestionSection.style.display = 'none';
  columnForm.innerHTML = '';
  status.innerText = '';
  selectedColumns = [];
  filePath = '';
}

// ClickHouse connect
document.getElementById('connectCH').addEventListener('click', async () => {
  const host = document.getElementById('host').value.trim();
  const port = document.getElementById('port').value.trim();
  const database = document.getElementById('database').value.trim();
  const user = document.getElementById('user').value.trim();
  const jwtToken = document.getElementById('token').value.trim();

  if (!host || !port || !database || !user || !jwtToken) {
    return (status.innerText = '❌ Please fill all ClickHouse fields.');
  }

  status.innerText = '🔌 Connecting to ClickHouse...';
  clickhouseConfig = { host, port, database, user, jwtToken };

  try {
    const connectRes = await fetch('/api/clickhouse/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clickhouseConfig)
    });

    const connectData = await connectRes.json();
    if (!connectRes.ok) throw new Error(connectData.message);

    status.innerText = connectData.message + '\n📋 Fetching tables...';

    const tableRes = await fetch(`/api/clickhouse/tables?host=${host}&port=${port}&database=${database}&user=${user}&jwtToken=${jwtToken}`);
    const tableData = await tableRes.json();
    if (!tableRes.ok) throw new Error(tableData.message);

    const tables = tableData.tables;
    if (!tables.length) throw new Error('No tables found.');

    // Ask user to pick one table for now
    const table = prompt('Available tables:\n' + tables.join('\n') + '\n\nEnter table name to fetch columns:');
    if (!table) return;

    const columnsQuery = `SELECT * FROM ${table} LIMIT 1`;
    const colRes = await fetch('/api/clickhouse/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'clickhouse',
        target: 'flatfile',
        connection: clickhouseConfig,
        selectedTable: table,
        selectedColumns: ['*'], // dummy call to get schema
        joinConfig: null
      })
    });

    const fileData = await colRes.json();
    if (!colRes.ok) throw new Error(fileData.message);

    // Get schema from sample CSV
    const previewRes = await fetch(fileData.file);
    const csvText = await previewRes.text();
    const firstRow = csvText.split('\n')[0].split(',');
    columnList = firstRow.map(col => col.trim().replace(/"/g, ''));

    renderColumns();
    ingestionSection.style.display = 'block';
  } catch (err) {
    status.innerText = `🚨 ${err.message}`;
  }
});

// Flat File upload
document.getElementById('uploadCSV').addEventListener('click', async () => {
  const fileInput = document.getElementById('csvFile');
  const delimiter = document.getElementById('delimiter').value || ',';
  const file = fileInput.files[0];

  if (!file) return (status.innerText = '❌ Please select a CSV file.');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('delimiter', delimiter);

  status.innerText = '📤 Uploading CSV and extracting schema...';

  try {
    const res = await fetch('/api/flatfile/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    filePath = data.filePath;
    columnList = data.columns;

    renderColumns();
    ingestionSection.style.display = 'block';
    status.innerText = data.message;
  } catch (err) {
    status.innerText = `🚨 ${err.message}`;
  }
});

// Render column checkboxes
function renderColumns() {
  columnSection.style.display = 'block';
  columnForm.innerHTML = '';

  columnList.forEach((col) => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = col;
    checkbox.checked = true;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(col));
    columnForm.appendChild(label);
  });
}

// Start ingestion
document.getElementById('startIngestion').addEventListener('click', async () => {
  selectedColumns = Array.from(columnForm.querySelectorAll('input:checked')).map(cb => cb.value);
  const targetTable = document.getElementById('targetTable').value.trim();

  if (selectedColumns.length === 0) {
    return (status.innerText = '❌ Please select at least one column.');
  }

  status.innerText = '🚀 Starting ingestion... Please wait.';

  try {
    let res, data;

    if (isClickHouseSource) {
      // CH → Flat File
      res = await fetch('/api/clickhouse/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'clickhouse',
          target: 'flatfile',
          connection: clickhouseConfig,
          selectedTable: prompt('Enter table name again for confirmation:'),
          selectedColumns,
          joinConfig: null
        })
      });
    } else {
      // Flat File → CH
      res = await fetch('/api/flatfile/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath,
          delimiter: document.getElementById('delimiter').value || ',',
          selectedColumns,
          clickhouseConfig,
          targetTable
        })
      });
    }

    data = await res.json();
    if (!res.ok) throw new Error(data.message);

    status.innerText = `✅ Ingestion completed.\nTotal records processed: ${data.recordCount}`;
  } catch (err) {
    status.innerText = `🚨 ${err.message}`;
  }
});
