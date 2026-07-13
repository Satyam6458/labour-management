import React, { useState, useEffect } from 'react';
import { getLabours, addPayment } from '../api';
import { PAYMENT_SUB_TYPES, todayStr } from '../components/shared';

export default function PaymentPage({ toast }) {
  const [labours, setLabours] = useState([]);
  const [form, setForm] = useState({
    labourId: '', amount: '', type: 'Offline', date: todayStr(),
    paymentSubType: 'Regular', note: ''
  });

  useEffect(() => {
    getLabours().then(r => setLabours(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.labourId || form.amount === '' || !form.date) {
      toast('Please fill all fields!', 'error');
      return;
    }
    try {
      const label = form.paymentSubType === 'Advance' ? 'Advance' :
                    form.paymentSubType === 'Old Payment' ? 'Old Payment' : 'Payment';
      await addPayment({
        labourId: form.labourId, amount: parseFloat(form.amount),
        type: form.type, date: form.date,
        paymentSubType: form.paymentSubType, note: form.note
      });
      toast(`${label} of ₹${form.amount} recorded (${form.type})!`, 'success');
      setForm({ labourId: '', amount: '', type: 'Offline', date: todayStr(), paymentSubType: 'Regular', note: '' });
    } catch (err) {
      toast(err.response?.data?.error || 'Error adding payment', 'error');
    }
  };

  return (
    <section className="card">
      <h2>💰 Add Payment</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Select Labour *</label>
            <select value={form.labourId} onChange={e => setForm({ ...form, labourId: e.target.value })} required>
              <option value="">-- Select --</option>
              {labours.map(l => <option key={l.id} value={l.id}>{l.name} ({l.workType})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Payment Type *</label>
            <select value={form.paymentSubType} onChange={e => setForm({ ...form, paymentSubType: e.target.value })} required>
              {PAYMENT_SUB_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Amount (₹) * <small style={{color:'#999'}}>(+/- dono dal sakte hain)</small></label>
            <input type="number" placeholder="e.g. 1000 ya -500" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Mode *</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
              <option value="Online">🏦 Online (UPI/Bank)</option>
              <option value="Offline">💵 Offline (Cash)</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Date *</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Note</label>
            <input type="text" placeholder="e.g. January wages" value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="btn btn-warning">Record Payment</button>
      </form>
    </section>
  );
}