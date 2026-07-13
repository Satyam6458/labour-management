# 👷 Labour Management System

**React Frontend + Node.js Backend with SQLite Database**

## Features

✅ **Add Labour** - Name, work type (Mason, Carpenter, Helper, etc.), daily wage, phone
📅 **Mark Attendance** - Present, Absent, Half Day, Overtime
💰 **Record Payment** - Online (UPI/Bank) or Offline (Cash)
📊 **Auto Calculation** - Total days, total earned, total paid, balance due
🔍 **Search** - Find any labour quickly
🗄️ **SQLite Database** - Data persists on server, no data loss

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js** installed (download from https://nodejs.org)

### Step 1: Start Backend (Terminal 1)
```bash
cd ~/Desktop/labour-management/backend
npm start
```
Server runs on http://localhost:5000

### Step 2: Start Frontend (Terminal 2)
```bash
cd ~/Desktop/labour-management/frontend
npm run dev
```
App opens at http://localhost:3000

---

## 📁 Project Structure

```
labour-management/
├── backend/                  # Node.js + Express API
│   ├── server.js            # All API endpoints
│   ├── database.js          # SQLite setup
│   ├── labour.db            # Database file (auto-created)
│   └── package.json
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   ├── App.css          # Styles
│   │   ├── api.js           # API functions (axios)
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── vite.config.js       # Proxy /api → backend
│   └── package.json
└── README.md
```

## 📋 API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/labours` | Get all labours |
| POST | `/api/labours` | Add a labour |
| GET | `/api/labours/:id` | Get single labour |
| DELETE | `/api/labours/:id` | Delete labour + records |
| POST | `/api/attendances` | Mark attendance |
| GET | `/api/attendances/:labourId` | Get attendance |
| POST | `/api/payments` | Add payment |
| GET | `/api/payments/:labourId` | Get payments |
| GET | `/api/stats` | All labours summary |
| GET | `/api/stats/:labourId` | Single labour stats |

---

## 🚀 Free Hosting Options

### Option 1: Render (Backend) + Netlify (Frontend) - Recommended

**Backend on Render:**
1. Push `backend/` folder to a GitHub repository
2. Go to https://dashboard.render.com → New Web Service
3. Connect GitHub repo → Set:
   - **Name**: `labour-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Click "Create Web Service"
5. Get URL like: `https://labour-api.onrender.com`

**Frontend on Netlify:**
1. In `frontend/vite.config.js`, change proxy target to your Render URL
2. Go to https://app.netlify.com/drop
3. First run: `cd frontend && npm run build`
4. Drag the `frontend/dist` folder into Netlify

### Option 2: Railway (Both backend & frontend)
1. Push entire project to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add two services:
   - `backend`: Start command `node server.js`
   - `frontend`: Start command `npm run dev`

### Option 3: Vercel (Frontend) + Railway (Backend)
Same as Option 1 but use Vercel for frontend instead of Netlify.

---

## 💡 How to Use

1. **Add Labour** → Fill name, work type, daily wage → Click "Add Labour"
2. **Mark Attendance** → Select labour, date, status → Click "Mark Attendance"
3. **Record Payment** → Select labour, amount, Online/Offline, date → Click "Record Payment"
4. **View Summary** → All labours shown with day count, earned, paid, due
5. **Click any labour** → See full attendance + payment history

## 📁 Database Backup
The SQLite database file is at `backend/labour.db`. Backup this file to preserve data.