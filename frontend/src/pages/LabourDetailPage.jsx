import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLabours, getAttendances, getPayments, getLabourStats, deleteLabour } from '../api';
import { formatDate, getBadgeClass } from '../components/shared';

export default function LabourDetailPage({ toast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
            <thead><tr><th>Date</th><th>Status</th><th>Work Type</th><th>Wage</th><th>Earned</th></tr></thead>
            <tbody>
              {attendances.map(a => {
                let earned = 0;
                if (a.status === 'Full Day') earned = a.wageRate;
                else if (a.status === 'Half Day') earned = a.wageRate * 0.5;
                else if (a.status === 'Overtime') earned = a.wageRate * 1.5;
                return (
                  <tr key={a.id}>
                    <td>{formatDate(a.date)}</td>
                    <td><span className={`badge ${getBadgeClass(a.status)}`}>{a.status}</span></td>
                    <td>{a.workSubType || 'Normal'}</td>
                    <td>₹{a.wageRate}</td>
                    <td>₹{earned.toLocaleString()}</td>
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
            <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Mode</th><th>Note</th></tr></thead>
            <tbody>
              {payments.map(p => {
                let typeBadge = 'badge-present';
                if (p.paymentSubType === 'Advance') typeBadge = 'badge-overtime';
                else if (p.paymentSubType === 'Old Payment') typeBadge = 'badge-halfday';
                const isNegative = p.amount < 0;
                return (
                  <tr key={p.id}>
                    <td>{formatDate(p.date)}</td>
                    <td><span className={`badge ${typeBadge}`}>{p.paymentSubType || 'Regular'}</span></td>
                    <td style={{ color: isNegative ? '#e53e3e' : '#38a169', fontWeight: 600 }}>
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td>{p.type === 'Online' ? '🏦' : '💵'} {p.type}</td>
                    <td style={{ color: '#888', fontSize: '0.85em' }}>{p.note || '-'}</td>
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