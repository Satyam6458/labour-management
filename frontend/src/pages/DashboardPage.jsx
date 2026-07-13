import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStats } from '../api';

export default function DashboardPage({ toast }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getAllStats();
      setStats(res.data);
    } catch (err) {
      toast('Error loading dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="card" style={{ textAlign: 'center', padding: '40px' }}>Loading dashboard...</div>;

  const totalLabours = stats.length;
  const totalDays = stats.reduce((s, d) => s + d.totalDays, 0);
  const totalEarned = stats.reduce((s, d) => s + d.totalEarned, 0);
  const totalPaid = stats.reduce((s, d) => s + d.totalPaid, 0);
  const totalDue = stats.reduce((s, d) => s + d.dueAmount, 0);
  const totalAdvance = stats.reduce((s, d) => s + (d.advanceBalance || 0), 0);

  return (
    <>
      <section className="card">
        <h2>📊 Admin Dashboard</h2>
        <div className="detail-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div className="stat-box">
            <div className="stat-label">Total Labours</div>
            <div className="stat-value blue">{totalLabours}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Days Worked</div>
            <div className="stat-value blue">{totalDays}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Earnings</div>
            <div className="stat-value purple">₹{totalEarned.toLocaleString()}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Paid</div>
            <div className="stat-value green">₹{totalPaid.toLocaleString()}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Advance</div>
            <div className="stat-value" style={{ color: '#d69e2e' }}>₹{totalAdvance.toLocaleString()}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Due</div>
            <div className="stat-value red">₹{totalDue.toLocaleString()}</div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>⚡ Quick Actions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/labours')}>
            👷 Add New Labour
          </button>
          <button className="btn btn-success" onClick={() => navigate('/attendance')}>
            📅 Mark Attendance
          </button>
          <button className="btn btn-warning" onClick={() => navigate('/payments')}>
            💰 Record Payment
          </button>
          <button className="btn" style={{ background: '#805ad5', color: 'white' }} onClick={() => navigate('/labour-list')}>
            📋 View All Labours
          </button>
        </div>
      </section>

      {/* Labour Summary */}
      <section className="card">
        <h2>📋 Labour Summary</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="detail-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Work</th>
                <th>Days</th>
                <th>Earned</th>
                <th>Paid</th>
                <th>Advance</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(s => {
                const due = s.totalEarned - s.totalPaid;
                return (
                  <tr key={s.labourId} style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/labour/${s.labourId}`)}>
                    <td><strong>{s.labourName}</strong></td>
                    <td><span className="badge badge-present">{s.workType}</span></td>
                    <td>{s.totalDays}</td>
                    <td>₹{s.totalEarned.toLocaleString()}</td>
                    <td>₹{s.totalPaid.toLocaleString()}</td>
                    <td style={{ color: '#d69e2e' }}>₹{(s.advanceBalance || 0).toLocaleString()}</td>
                    <td style={{ color: due > 0 ? '#e53e3e' : '#38a169', fontWeight: 600 }}>
                      ₹{due.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {stats.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  No labours added yet. Click "Add New Labour" to start!
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}