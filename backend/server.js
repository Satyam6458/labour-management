const express = require('express');
const cors = require('cors');
const db = require('./database');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + crypto.randomBytes(4).toString('hex');
}

// Get today's date as YYYY-MM-DD
function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

// ============================
// LABOUR CRUD
// ============================

// Get all labours
app.get('/api/labours', (req, res) => {
    try {
        const labours = db.prepare('SELECT * FROM labours ORDER BY name ASC').all();
        res.json(labours);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single labour
app.get('/api/labours/:id', (req, res) => {
    try {
        const labour = db.prepare('SELECT * FROM labours WHERE id = ?').get(req.params.id);
        if (!labour) return res.status(404).json({ error: 'Labour not found' });
        res.json(labour);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add labour
app.post('/api/labours', (req, res) => {
    try {
        const { name, workType, dailyWage, phone } = req.body;

        if (!name || !workType || !dailyWage) {
            return res.status(400).json({ error: 'Name, workType, and dailyWage are required' });
        }

        // Check duplicate
        const existing = db.prepare('SELECT id FROM labours WHERE LOWER(name) = LOWER(?)').get(name);
        if (existing) {
            return res.status(400).json({ error: 'Labour with this name already exists' });
        }

        const id = generateId();
        const stmt = db.prepare(
            'INSERT INTO labours (id, name, workType, dailyWage, phone, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
        );
        stmt.run(id, name.trim(), workType, parseFloat(dailyWage), phone || '', todayStr());

        const labour = db.prepare('SELECT * FROM labours WHERE id = ?').get(id);
        res.status(201).json(labour);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete labour
app.delete('/api/labours/:id', (req, res) => {
    try {
        const labour = db.prepare('SELECT * FROM labours WHERE id = ?').get(req.params.id);
        if (!labour) return res.status(404).json({ error: 'Labour not found' });

        // CASCADE will delete attendances and payments
        db.prepare('DELETE FROM labours WHERE id = ?').run(req.params.id);
        res.json({ message: 'Labour deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================
// ATTENDANCE
// ============================

// Get attendances for a labour
app.get('/api/attendances/:labourId', (req, res) => {
    try {
        const attendances = db.prepare(
            'SELECT * FROM attendances WHERE labourId = ? ORDER BY date DESC'
        ).all(req.params.labourId);
        res.json(attendances);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all attendances
app.get('/api/attendances', (req, res) => {
    try {
        const attendances = db.prepare(
            'SELECT a.*, l.name as labourName FROM attendances a JOIN labours l ON a.labourId = l.id ORDER BY a.date DESC'
        ).all();
        res.json(attendances);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark attendance
app.post('/api/attendances', (req, res) => {
    try {
        const { labourId, date, status } = req.body;

        if (!labourId || !date || !status) {
            return res.status(400).json({ error: 'labourId, date, and status are required' });
        }

        if (!['Present', 'Absent', 'Half Day', 'Overtime'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Check labour exists
        const labour = db.prepare('SELECT id FROM labours WHERE id = ?').get(labourId);
        if (!labour) return res.status(404).json({ error: 'Labour not found' });

        // Check duplicate
        const existing = db.prepare(
            'SELECT id FROM attendances WHERE labourId = ? AND date = ?'
        ).get(labourId, date);
        if (existing) {
            return res.status(400).json({ error: 'Attendance already marked for this date' });
        }

        const id = generateId();
        db.prepare(
            'INSERT INTO attendances (id, labourId, date, status) VALUES (?, ?, ?, ?)'
        ).run(id, labourId, date, status);

        const attendance = db.prepare('SELECT * FROM attendances WHERE id = ?').get(id);
        res.status(201).json(attendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================
// PAYMENTS
// ============================

// Get payments for a labour
app.get('/api/payments/:labourId', (req, res) => {
    try {
        const payments = db.prepare(
            'SELECT * FROM payments WHERE labourId = ? ORDER BY date DESC'
        ).all(req.params.labourId);
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all payments
app.get('/api/payments', (req, res) => {
    try {
        const payments = db.prepare(
            'SELECT p.*, l.name as labourName FROM payments p JOIN labours l ON p.labourId = l.id ORDER BY p.date DESC'
        ).all();
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add payment
app.post('/api/payments', (req, res) => {
    try {
        const { labourId, amount, type, date } = req.body;

        if (!labourId || !amount || !type || !date) {
            return res.status(400).json({ error: 'labourId, amount, type, and date are required' });
        }

        if (!['Online', 'Offline'].includes(type)) {
            return res.status(400).json({ error: 'Payment type must be Online or Offline' });
        }

        const labour = db.prepare('SELECT id FROM labours WHERE id = ?').get(labourId);
        if (!labour) return res.status(404).json({ error: 'Labour not found' });

        const id = generateId();
        db.prepare(
            'INSERT INTO payments (id, labourId, amount, type, date) VALUES (?, ?, ?, ?, ?)'
        ).run(id, labourId, parseFloat(amount), type, date);

        const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
        res.status(201).json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================
// STATS / SUMMARY
// ============================

// Get stats for a single labour
app.get('/api/stats/:labourId', (req, res) => {
    try {
        const labour = db.prepare('SELECT * FROM labours WHERE id = ?').get(req.params.labourId);
        if (!labour) return res.status(404).json({ error: 'Labour not found' });

        const attendances = db.prepare(
            'SELECT * FROM attendances WHERE labourId = ?'
        ).all(req.params.labourId);

        const payments = db.prepare(
            'SELECT * FROM payments WHERE labourId = ?'
        ).all(req.params.labourId);

        let totalDays = 0;
        let totalEarned = 0;

        attendances.forEach(a => {
            if (a.status === 'Present') {
                totalDays += 1;
                totalEarned += labour.dailyWage;
            } else if (a.status === 'Half Day') {
                totalDays += 0.5;
                totalEarned += labour.dailyWage * 0.5;
            } else if (a.status === 'Overtime') {
                totalDays += 1;
                totalEarned += labour.dailyWage * 1.5;
            }
        });

        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const dueAmount = totalEarned - totalPaid;

        res.json({
            labourId: labour.id,
            labourName: labour.name,
            workType: labour.workType,
            dailyWage: labour.dailyWage,
            totalDays,
            totalEarned,
            totalPaid,
            dueAmount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get stats for all labours
app.get('/api/stats', (req, res) => {
    try {
        const labours = db.prepare('SELECT * FROM labours ORDER BY name ASC').all();
        const stats = labours.map(labour => {
            const attendances = db.prepare(
                'SELECT * FROM attendances WHERE labourId = ?'
            ).all(labour.id);

            const payments = db.prepare(
                'SELECT * FROM payments WHERE labourId = ?'
            ).all(labour.id);

            let totalDays = 0;
            let totalEarned = 0;

            attendances.forEach(a => {
                if (a.status === 'Present') {
                    totalDays += 1;
                    totalEarned += labour.dailyWage;
                } else if (a.status === 'Half Day') {
                    totalDays += 0.5;
                    totalEarned += labour.dailyWage * 0.5;
                } else if (a.status === 'Overtime') {
                    totalDays += 1;
                    totalEarned += labour.dailyWage * 1.5;
                }
            });

            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            const dueAmount = totalEarned - totalPaid;

            return {
                labourId: labour.id,
                labourName: labour.name,
                workType: labour.workType,
                dailyWage: labour.dailyWage,
                phone: labour.phone,
                totalDays,
                totalEarned,
                totalPaid,
                dueAmount
            };
        });

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================
// START SERVER
// ============================
app.listen(PORT, () => {
    console.log(`✅ Labour Management Backend running on http://localhost:${PORT}`);
});