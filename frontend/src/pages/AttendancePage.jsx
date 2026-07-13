import React, { useState, useEffect } from 'react';
import { getLabours, markAttendance } from '../api';
import { WORK_SUB_TYPES, ATTENDANCE_STATUSES, todayStr } from '../components/shared';

export default function AttendancePage({ toast }) {
  const [labours, setLabours] = useState([]);
  const [form, setForm] = useState({
    labourId: '', date: todayStr(), status: 'Full Day',
    workSubType: 'Normal Work', wageRate: ''
  });

  useEffect(() => {
    getLabours().then(r => setLabours(r.data)).catch(() => {});
  }, []);

  const handleLabourChange = (labourId) => {
    const labour = labours.find(l => l.id === labourId);
    const subType = WORK_SUB_TYPES.find(s => s.name === form.workSubType) || WORK_SUB_TYPES[0];
    const wage = labour ? Math.round(labour.dailyWage * subType.multiplier) : '';
    setForm({ ...form, labourId, wageRate: wage });
  };

  const handleWorkSubTypeChange = (workSubType) => {
    const labour = labours.find(l => l.id === form.labourId);
    const subType = WORK_SUB_TYPES.find(s => s.name === workSubType) || WORK_SUB_TYPES[0];
    const wage = labour ? Math.round(labour.dailyWage * subType.multiplier) : '';
    setForm({ ...form, workSubType, wageRate: wage });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.labourId || !form.date) {
      toast('Please select labour and date!', 'error');
      return;
    }
    try {
      await markAttendance({
        labourId: form.labourId, date: form.date, status: form.status,
        workSubType: form.workSubType, wageRate: parseFloat(form.wageRate) || 0
      });
      toast(`Attendance marked as ${form.status} (${form.workSubType})!`, 'success');
      setForm({ ...form, labourId: '', date: todayStr() });
    } catch (err) {
      toast(err.response?.data?.error || 'Error marking attendance', 'error');
    }
  };

  return (
    <section className="card">
      <h2>📅 Mark Attendance</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Select Labour *</label>
            <select value={form.labourId} onChange={e => handleLabourChange(e.target.value)} required>
              <option value="">-- Select --</option>
              {labours.map(l => <option key={l.id} value={l.id}>{l.name} ({l.workType})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date *</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Attendance Type *</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} required>
              {ATTENDANCE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Work Type *</label>
            <select value={form.workSubType} onChange={e => handleWorkSubTypeChange(e.target.value)} required>
              {WORK_SUB_TYPES.map(w => <option key={w.name} value={w.name}>{w.name} (×{w.multiplier})</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Wage Rate (₹)</label>
            <input type="number" placeholder="Auto-calculated" min="1"
              value={form.wageRate} onChange={e => setForm({ ...form, wageRate: e.target.value })} />
            <small style={{ color: '#888', fontSize: '0.75em' }}>Auto-calculated. Edit manually if needed.</small>
          </div>
        </div>
        <button type="submit" className="btn btn-success">Mark Attendance</button>
      </form>
    </section>
  );
}