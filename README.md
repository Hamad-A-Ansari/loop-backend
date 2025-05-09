# Loop Backend Assignment - (🏪 Store Uptime Monitoring System)


A backend service that tracks uptime and downtime of stores at **[LoopAI](https://tryloop.ai/)** based on status logs, considering timezone and business hours, and generates downloadable CSV reports. Built with scalability, timezone accuracy, and extensibility in mind.




&nbsp; 

## ✅ Features

* 📥 Provide Data either by Uploading CSV files for `store status`, `menu hours`, and `timezone` data, or by providing status logs.
* 📊 Trigger uptime/downtime report generation (last hour, day, week).
* 🕒 Timezone calculations using `moment-timezone`.
* 🗓️ Business-hour-based uptime calculation.
* 📤 Download CSV report via unique `report_id`.
* 🔐 Authentication system using `JWT` and Rate Limiting using `Arcjet`.


&nbsp; 
## 🛠️ Tech Stack

**Backend:**

* **Framework** - Node.js
* **Server** - Express.js
* **Database Handling** - MongoDB Atlas + Mongoose (**ODM Library**)

**Utilities:**

* `moment-timezone` — for accurate local time calculation
* `fast-csv` — to convert results to downloadable reports
* `uuid` — to uniquely track report requests
* `multer` — to handle CSV uploads

&nbsp; 
## Demo Video
updating soon ...

&nbsp;


## 📂 Folder Structure

```
├── models/
│   ├── menuHours.model.js
│   ├── storeStatus.model.js
│   ├── timezone.model.js
│   ├── report.model.js
│   └── user.model.js
|
├── routes/
│   ├── auth.routes.js
│   ├── csvImport.routes.js
│   └── report.routes.js
|
├── controllers/
│   ├── auth.controller.js
│   ├── csvImport.controller.js
│   └── report.controller.js
|
├── utils/
│   └── reportGenerator.js
|
├── middlewares/
│   ├── arcjet.middleware.js
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── uploadCsv.middelware.js
|
└── reports/
    └── report_<reportId>.csv
```

&nbsp; 

## 🚀 Setup Instructions

1. Clone the repo:

```bash
git clone https://github.com/Hamad-A-Ansari/loop-backend.git
cd loop-backend
```

2. Install dependencies:

```bash
npm install
```

3. Setup environment variables in `.env`:

```env
# PORT 
PORT = 2025

# JWT Setup
JWT_EXPIRES_IN = '1d'
JWT_SECRET = "your_secret"

# Mongodb Setup
DB_URI = "your_mongodb_uri"

# NODE Environment Setup
NODE_ENV = development

# Arcjet Setup
ARCJET_ENV = "development"
ARCJET_KEY = "your_arcjet_key"
```

4. Start server:

```bash
npm run dev
```

&nbsp; 

## 📬 API Documentation (Postman)

### 🔐 Auth Endpoints

* **POST** `/api/v1/auth/sign-up`

```json
{
  "name" : "yourName"
  "email": "user@example.com",
  "password": "securePassword"
}
```

* **POST** `/api/v1/auth/sign-in`

```json
{
  "email": "user@example.com",
  "password": "securePassword"
}
```

* **POST** `/api/v1/auth/sign-out`




### 📁 Import CSV Endpoints

* **POST** `/api/v1/importCsv/import`
  **Form-data**:
* `file`: upload `.csv` file
* `collectionName`: one of `menu_hours`, `store_status`, `timezones`



### 📊 Report Endpoints

* **POST** `/api/v1/reports/trigger_report`
  Triggers report generation. Returns a `report_id`.

* **GET** `/api/v1/reports/get_report?report_id=<reportId>`
  Downloads generated CSV.


&nbsp; 
## 🧪 Sample CSV Formats

### `store_status.csv`

```
store_id,status,timestamp_utc
alphaNumeric_storeID,active,2024-10-03 23:33:20.412748 UTC
alphaNumeric_storeID,inactive,2024-10-03 23:34:20.51781 UTC
```

### `menu_hours.csv`

```
store_id,dayOfWeek,start_time_local,end_time_local
alphaNumeric_storeID,1,00:00:00,00:01:00
```

### `timezones.csv`

```
store_id,timezone_str
alphaNumeric_storeID,America/Denver
```

&nbsp; 
## 📌 Sample API Usage (trigger + get report)

```bash
curl -X POST http://localhost:5000/api/v1/reports/trigger_report
# Response: { report_id: "report_id" }

curl -X GET http://localhost:5000/api/v1/reports/get_report?report_id=abc-123
# Downloads CSV
```

&nbsp; 

## ⚙️ Scope for Improvements

### ✅ 1. Add Role Based Access Controls (RBAC)
Add `store_owner_id` field to the Store Databases, so that a Store Owner can view reports of their owned Stores only.

### ✅ 2. Custom Report Generation 
Support custom date ranges for uptime/downtime reporting.

### ✅ 3. Report Emailing
Add Nodemailer functionality to email reports to store owners on a daily, bi-weekly or  weekly basis.
### ✅ 4. Storing/Caching Computed Report
Store last computed report in DB to avoid regenerating for frequent/repeated requests.




&nbsp; 

## 🧑‍💻 Developer

Made with ❤️ by **Hamad Ahmad Ansari** \
*Pre-final Year CS Undergrad* @ **NIT Jamshedpur**

## 📞 Contact
Email: **hamad.ansarif90@gmail.com**  
LinkedIn: **[hamad-a-ansari](https://www.linkedin.com/in/hamad-a-ansari/)**
