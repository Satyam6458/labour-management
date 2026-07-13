import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLabours, getAttendances, getPayments, getLabourStats, deleteLabour, updateAttendance, deleteAttendance, updatePayment, deletePayment } from '../api';
import { formatDate, getBadgeClass, WORK_SUB_TYPES, ATTENDANCE_STATUSES, PAYMENT_SUB_TYPES } from '../components/shared';

export default function LabourDetailPage({ toast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingAtt, setEditingAtt] = useState(null);
  const [editingPay, setEditingPay] = useState(null);
  const [attForm, setAttForm] = useState({ status: 'Full Day', workSubType: 'Normal Work', wageRate: '' });
  const [payForm, setPayForm] = useState({ amount: '', type: 'Offline', paymentSubType: 'Regular', note: '' });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [labourRes, attRes, payRes, statsRes] = await Promise.all([
        getLabours(), getAttendances(id), getPayments(id), getLabourStats(id)
      ]);
      const labour = labourRes.data.find(l => l.id === id);
      if (!labour) { toast('Labour not found', 'error'); navigate('/labour-list'); return; }
      setData({ labour, attendances: attRes.data, payments: payRes.data, stats: statsRes.data });
    } catch (err) {
      toast('Error loading details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this labour and all records?')) return;
    try {
      await deleteLabour(id);
      toast('Labour deleted successfully!', 'success');
      navigate('/labour-list');
    } catch (err) {
      toast('Error deleting labour', 'error');
    }
  };

  if (loading) return <div className="card" style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  if (!data) return <div className="card" style={{ textAlign: 'center', padding: '40px' }}>Labour not found</div>;

  const { labour, attendances, payments, stats } = data;

  return (
    <section className="card">
      <div className="detail-header">
        <div>
          <h3>{labour.name}</h3>
          <div style={{ marginTop: '4px', fontSize: '0.9em', color: '#666' }}>
            📞 {labour.phone || 'N/A'} &nbsp;|&nbsp; 💰 Base: ₹{labour.dailyWage} &nbsp;|&nbsp; 🏷️ {labour.workType}
          </div>
        </div>
        <div>
          <span className="detail-work-type">{labour.workType}</span>
          <button className="btn btn-danger btn-sm" onClick={handleDelete} style={{ marginLeft: '8px' }}>Delete</button>
          <button className="btn btn-sm" onClick={() => navigate('/labour-list')}
            style={{ background: '#ddd', color: '#333', marginLeft: '4px' }}>← Back</button>
        </div>
      </div>

      <div className="detail-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
        <div className="stat-box">
          <div className="stat-label">Total Days</div>
          <div className="stat-value blue">{stats.totalDays}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Total Earned</div>
          <div className="stat-value purple">₹{stats.totalEarned.toLocaleString()}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Total Paid</div>
          <div className="stat-value green">₹{stats.totalPaid.toLocaleString()}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Advance</div>
          <div className="stat-value" style={{ color: '#d69e2e' }}>₹{(stats.advanceBalance || 0).toLocaleString()}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Due</div>
          <div className={`stat-value ${stats.dueAmount > 0 ? 'red' : 'green'}`}>₹{stats.dueAmount.toLocaleString()}</div>
        </div>
      </div>

      <h4 style={{ marginBottom: '8px' }}>📅 Attendance Records</h4>
      {attendances.length === 0 ? (
        <p style={{ color: '#999', fontSize: '0.9em' }}>No attendance records yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="detail-table">
            <thead><tr><th>Date</th><th>Status</th><th>Work Type</th><th>Wage</th><th>Earned</th><th>Actions</th></tr></thead>
            <tbody>
              {attendances.map(a => {
                let earned = 0;
                if (a.status === 'Full Day') earned = a.wageRate;
                else if (a.status === 'Half Day') earned = a.wageRate * 0.5;
                else if (a.status === 'Overtime') earned = a.wageRate * 1.5;
                const isEditing = editingAtt === a.id;
                return (
                  <tr key={a.id}>
                    {isEditing ? (
                      <>
                        <td>{formatDate(a.date)}</td>
                        <td>
                          <select value={attForm.status} onChange={e => setAttForm({...attForm, status: e.target.value})} style={{padding:'4px'}}>
                            {ATTENDANCE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <select value={attForm.workSubType} onChange={e => setAttForm({...attForm, workSubType: e.target.value})} style={{padding:'4px'}}>
                            {WORK_SUB_TYPES.map(w => <option key={w.name} value={w.name}>{w.name}</option>)}
                          </select>
                        </td>
                        <td>
                          <input type="number" value={attForm.wageRate} onChange={e => setAttForm({...attForm, wageRate: e.target.value})} style={{width:'80px',padding:'4px'}} />
                        </td>
                        <td>₹{(() => { if (attForm.status === 'Full Day') return attForm.wageRate; if (attForm.status === 'Half Day') return attForm.wageRate * 0.5; if (attForm.status === 'Overtime') return attForm.wageRate * 1.5; return 0; })().toLocaleString()}</td>
                        <td>
                          <button className="btn btn-sm btn-success" onClick={async () => { await updateAttendance(a.id, attForm); toast('Updated!', 'success'); setEditingAtt(null); loadData(); }}>💾</button>
                          <button className="btn btn-sm" onClick={() => setEditingAtt(null)} style={{marginLeft:'4px'}}>✕</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{formatDate(a.date)}</td>
                        <td><span className={`badge ${getBadgeClass(a.status)}`}>{a.status}</span></td>
                        <td>{a.workSubType || 'Normal'}</td>
                        <td>₹{a.wageRate}</td>
                        <td>₹{earned.toLocaleString()}</td>
                        <td>
                          <button className="btn btn-sm btn-primary" onClick={() => { setEditingAtt(a.id); setAttForm({status: a.status, workSubType: a.workSubType, wageRate: a.wageRate}); }}>✏️</button>
                          <button className="btn btn-sm btn-danger" onClick={async () => { if (confirm('Delete this attendance?')) { await deleteAttendance(a.id); toast('Deleted', 'success'); loadData(); } }} style={{marginLeft:'4px'}}>🗑️</button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h4 style={{ margin: '15px 0 8px' }}>💰 Payment Records</h4>
      {payments.length === 0 ? (
        <p style={{ color: '#999', fontSize: '0.9em' }}>No payment records yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="detail-table">
            <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Mode</th><th>Note</th><th>Actions</th></tr></thead>
            <tbody>
              {payments.map(p => {
                let typeBadge = 'badge-present';
                if (p.paymentSubType === 'Advance') typeBadge = 'badge-overtime';
                else if (p.paymentSubType === 'Old Payment') typeBadge = 'badge-halfday';
                const isNegative = p.amount < 0;
                const isEditing = editingPay === p.id;
                return (
                  <tr key={p.id}>
                    {isEditing ? (
                      <>
                        <td><input type="date" value={payForm.date || p.date} onChange={e => setPayForm({...payForm, date: e.target.value})} style={{padding:'4px'}} /></td>
                        <td>
                          <select value={payForm.paymentSubType} onChange={e => setPayForm({...payForm, paymentSubType: e.target.value})} style={{padding:'4px'}}>
                            {PAYMENT_SUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td>
                          <input type="number" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} style={{width:'100px',padding:'4px'}} />
                        </td>
                        <td>
                          <select value={payForm.type} onChange={e => setPayForm({...payForm, type: e.target.value})} style={{padding:'4px'}}>
                            <option value="Online">🏦 Online</option>
                            <option value="Offline">💵 Offline</option>
                          </select>
                        </td>
                        <td><input type="text" value={payForm.note} onChange={e => setPayForm({...payForm, note: e.target.value})} style={{padding:'4px'}} /></td>
                        <td>
                          <button className="btn btn-sm btn-success" onClick={async () => { await updatePayment(p.id, payForm); toast('Updated!', 'success'); setEditingPay(null); loadData(); }}>💾</button>
                          <button className="btn btn-sm" onClick={() => setEditingPay(null)} style={{marginLeft:'4px'}}>✕</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{formatDate(p.date)}</td>
                        <td><span className={`badge ${typeBadge}`}>{p.paymentSubType || 'Regular'}</span></td>
                        <td style={{ color: isNegative ? '#e53e3e' : '#38a169', fontWeight: 600 }}>
                          ₹{p.amount.toLocaleString()}
                        </td>
                        <td>{p.type === 'Online' ? '🏦' : '💵'} {p.type}</td>
                        <td style={{ color: '#888', fontSize: '0.85em' }}>{p.note || '-'}</td>
                        <td>
                          <button className="btn btn-sm btn-primary" onClick={() => { setEditingPay(p.id); setPayForm({amount: p.amount, type: p.type, paymentSubType: p.paymentSubType, note: p.note, date: p.date}); }}>✏️</button>
                          <button className="btn btn-sm btn-danger" onClick={async () => { if (confirm('Delete this payment?')) { await deletePayment(p.id); toast('Deleted', 'success'); loadData(); } }} style={{marginLeft:'4px'}}>🗑️</button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}