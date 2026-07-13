import React, { useState } from 'react';
import { addLabour, getLabours } from '../api';
import { WORK_CATEGORIES } from '../components/shared';

export default function AddLabourPage({ toast }) {
  const [form, setForm] = useState({ name: '', workType: '', dailyWage: '', phone: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.workType || !form.dailyWage) {
      toast('Please fill all required fields!', 'error');
      return;
    }
    try {
      await addLabour({
        name: form.name, workType: form.workType,
        dailyWage: parseFloat(form.dailyWage), phone: form.phone
      });
      toast(`${form.name} added successfully!`, 'success');
      setForm({ name: '', workType: '', dailyWage: '', phone: '' });
    } catch (err) {
      toast(err.response?.data?.error || 'Error adding labour', 'error');
    }
  };

  return (
    <section className="card">
      <h2>👷 New Labour</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Name *</label>
            <input type="text" placeholder="Enter name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Work Category *</label>
            <select value={form.workType} onChange={e => setForm({ ...form, workType: e.target.value })} required>
              <option value="">-- Select --</option>
              {WORK_CATEGORIES.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Base Daily Wage (₹) *</label>
            <input type="number" placeholder="e.g. 500" min="1" value={form.dailyWage}
              onChange={e => setForm({ ...form, dailyWage: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phone No.</label>
            <input type="text" placeholder="Optional" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Add Labour</button>
      </form>
    </section>
  );
}