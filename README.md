# 📥 ClickHouse ↔ Flat File Ingestion Tool

A web-based application that supports **bidirectional data ingestion** between a ClickHouse database and a flat file (CSV).  
Built using **Node.js (Express)** for the backend and **HTML/CSS/JS** for the frontend.

---

## 🚀 Features

- ✅ Ingest data **from ClickHouse to Flat File**
- ✅ Ingest data **from Flat File to ClickHouse**
- ✅ ClickHouse JWT-based authentication
- ✅ Column-level selection for ingestion
- ✅ Record count reporting on completion
- ✅ File upload & preview (Flat File source)
- ✅ Error handling and meaningful status display

---

## 🏗️ Tech Stack

| Layer     | Tech         |
|-----------|--------------|
| Backend   | Node.js, Express |
| Frontend  | HTML, CSS (dark theme), JS |
| DB Client | `@apla/clickhouse` |
| Uploads   | `multer`, `csv-parser`, `json2csv` |

---

## 📂 Project Structure

```bash

clickhouse-flatfile-ingestion-tool/
├── backend/
│   ├── server.js
│   ├── config.js
│   ├── routes/
│   ├── controllers/
│   ├── utils/
│   └── data/
│       └── uploads/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── testdata/
│   ├── uk_price_paid.csv
│   └── sample_output.csv
├── prompts.txt
└── README.md
```

---

## 🔧 Setup Instructions

### 1. Clone the repo

```bash



git clone https://github.com/your-username/clickhouse-flatfile-ingestion-tool.git
cd clickhouse-flatfile-ingestion-tool/backend


