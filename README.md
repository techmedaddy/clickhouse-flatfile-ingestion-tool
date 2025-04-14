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

```

### 2. Install dependencies
```bash
npm install
```
### 3. Start the backend server
```bash
npm run dev
```
#### Server runs on: http://localhost:5000

### 4. Open the frontend

#### Just open frontend/index.html in your browser, or serve it with your favorite static server.


## 🔁 How to Use

1. Select **source** (`ClickHouse` or `Flat File`)
2. Provide required config or upload file
3. Choose columns to ingest
4. Click **Start Ingestion**
5. View status and processed record count


## 🥔 Testing Datasets

| **Dataset**            | **Purpose**                        |
|------------------------|------------------------------------|
| `uk_price_paid.csv`    | Flat File ➜ **ClickHouse**         |
| `sample_output.csv`    | Simulated CH ➜ Flat File           |

**Sources**: [ClickHouse Example Datasets](https://clickhouse.com/docs/en/getting-started/example-datasets)

## 🤖 AI Tools Usage

I used **ChatGPT** for:

- Designing project structure  
- Writing clean and modular backend code  
- Generating frontend HTML, CSS, and JS  
- Creating helper utilities and error handling logic  

and Copilot for fixing issues and debugging 

Prompts used are documented in `prompts.txt`.

## 📝 Notes

- Ensure **ClickHouse** is running locally or via Docker  
- JWT tokens are passed as passwords in `@apla/clickhouse` config  
- Flat File ingestion assumes all data as strings (can be extended with type inference)

