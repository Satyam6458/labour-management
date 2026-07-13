const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'labour.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS labours (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    workType TEXT NOT NULL,
    dailyWage REAL NOT NULL,
    phone TEXT DEFAULT '',
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attendances (
    id TEXT PRIMARY KEY,
    labourId TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    workSubType TEXT NOT NULL DEFAULT 'Normal',
    wageRate REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (labourId) REFERENCES labours(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    labourId TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Online','Offline')),
    date TEXT NOT NULL,
    paymentSubType TEXT NOT NULL DEFAULT 'Regular',
    note TEXT DEFAULT '',
    FOREIGN KEY (labourId) REFERENCES labours(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_attendance_labour ON attendances(labourId);
  CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendances(date);
  CREATE INDEX IF NOT EXISTS idx_payment_labour ON payments(labourId);
  CREATE INDEX IF NOT EXISTS idx_payment_date ON payments(date);
`);

// Migration: Add new columns if they don't exist (for existing databases)
try {
  db.exec(`ALTER TABLE attendances ADD COLUMN workSubType TEXT NOT NULL DEFAULT 'Normal'`);
} catch (e) { /* column already exists */ }
try {
  db.exec(`ALTER TABLE attendances ADD COLUMN wageRate REAL NOT NULL DEFAULT 0`);
} catch (e) { /* column already exists */ }
// Update old 'Present' status to 'Full Day'
db.exec(`UPDATE attendances SET status = 'Full Day' WHERE status = 'Present'`);
// Set wageRate for old records where it's 0
db.exec(`UPDATE attendances SET wageRate = (SELECT dailyWage FROM labours WHERE labours.id = attendances.labourId) WHERE wageRate = 0`);

module.exports = db;