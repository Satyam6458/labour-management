import React, { useState, useEffect, useCallback } from 'react';
import {
  getLabours, addLabour, deleteLabour,
  markAttendance, getAttendances,
  addPayment, getPayments,
  getAllStats, getLabourStats
} from './api';

function App() {
  const [labours, setLabours] = useState([]);
  const [stats, setStats] = useState([]);
  const [selectedLabour, setSelectedLabour] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [labourForm, setLabourForm] = useState({ name: '', workType: '', dailyWage: '', phone: '' });
  const [attendanceForm, setAttendanceForm] = useState({ labourId: '', date: todayStr(), status: 'Present' });
  const [paymentForm, setPaymentForm] = useState({ labourId: '', amount: '', type: 'Online', date: todayStr() });

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [laboursRes, statsRes] = await Promise.all([
        getLabours(), getAllStats()
      ]);
      setLabours(laboursRes.data);
      setStats(statsRes.data);
    } catch (err) {
      showToast('Error loading data: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  // ==================== ADD LABOUR ====================
  const handleAddLabour = async (e) => {
    e.preventDefault();
    const { name, workType, dailyWage, phone } = labourForm;
    if (!name || !workType || !dailyWage) {
      showToast('Please fill all required fields!', 'error');
      return;
    }
    try {
      await addLabour({ name, workType, dailyWage: parseFloat(dailyWage), phone });
      showToast(`${name} added successfully!`, 'success');
      setLabourForm({ name: '', workType: '', dailyWage: '', phone: '' });
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error adding labour', 'error');
    }
  };

  // ==================== MARK ATTENDANCE ====================
  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    const { labourId, date, status } = attendanceForm;
    if (!labourId || !date) {
      showToast('Please select labour and date!', 'error');
      return;
    }
    try {
      await markAttendance({ labourId, date, status });
      showToast(`Attendance marked as ${status}!`, 'success');
      setAttendanceForm({ ...attendanceForm, labourId: '', date: todayStr() });
      await loadData();
      if (selectedLabour) loadDetail(selectedLabour);
    } catch (err) {
      showToast(err.response?.data?.error || 'Error marking attendance', 'error');
    }
  };

  // ==================== ADD PAYMENT ====================
  const handleAddPayment = async (e) => {
    e.preventDefault();
    const { labourId, amount, type, date } = paymentForm;
    if (!labourId || !amount || !date) {
      showToast('Please fill all fields!', 'error');
      return;
    }
    try {
      await addPayment({ labourId, amount: parseFloat(amount), type, date });
      showToast(`Payment of ₹${amount} recorded (${type})!`, 'success');
      setPaymentForm({ ...paymentForm, labourId: '', amount: '', date: todayStr() });
      await loadData();
      if (selectedLabour) loadDetail(selectedLabour);
    } catch (err) {
      showToast(err.response?.data?.error || 'Error adding payment', 'error');
    }
  };

  // ==================== DELETE LABOUR ====================
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this labour and all records?')) return;
    try {
      await deleteLabour(id);
      showToast('Labour deleted successfully!', 'success');
      setSelectedLabour(null);
      setDetailData(null);
      await loadData();
    } catch (err) {
      showToast('Error deleting labour', 'error');
    }
  };

  // ==================== LOAD DETAIL ====================
  const loadDetail = async (labourId) => {
    try {
      const [labourRes, attRes, payRes, statsRes] = await Promise.all([
        getLabours(), // we filter
        getAttendances(labourId),
        getPayments(labourId),
        getLabourStats(labourId)
      ]);
      const labour = labourRes.data.find(l => l.id === labourId);
      if (!labour) { showToast('Labour not found', 'error'); return; }
      setSelectedLabour(labourId);
      setDetailData({
        labour,
        attendances: attRes.data,
        payments: payRes.data,
        stats: statsRes.data
      });
    } catch (err) {
      showToast('Error loading details', 'error');
    }
  };

  const closeDetail = () => {
    setSelectedLabour(null);
    setDetailData(null);
  };

  // ==================== FILTERED LABOURS ====================
  const filteredStats = stats.filter(s =>
    !search || s.labourName.toLowerCase().includes(search.toLowerCase()) ||
    s.workType.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone && s.phone.includes(search))
  );

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div style={{ fontSize: '3em' }}>👷</div>
        <p style={{ marginTop: '16px', color: '#666' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Toast */}
      {toast && <div className={`toast show ${toast.type}`}>{toast.msg}</div>}

      <header>
        <h1>👷 Labour Management System</h1>
        <p>Attendance, Work Type & Payment Tracking - React + Node.js</p>
      </header>

      {/* ADD LABOUR */}
      <section className="card">
        <h2>➕ New Labour</h2>
        <form onSubmit={handleAddLabour}>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input type="text" placeholder="Enter name" value={labourForm.name}
                onChange={e => setLabourForm({ ...labourForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Work Type *</label>
              <select value={labourForm.workType}
                onChange={e => setLabourForm({ ...labourForm, workType: e.target.value })} required>
                <option value="">-- Select --</option>
                <option value="Mason">Mason (Raj Mistri)</option>
                <option value="Carpenter">Carpenter (Bhadai)</option>
                <option value="Helper">Helper (Mazdoor)</option>
                <option value="Painter">Painter</option>
                <option value="Plumber">Plumber</option>
                <option value="Electrician">Electrician</option>
                <option value="Welder">Welder</option>
                <option value="Driver">Driver</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Daily Wage (₹) *</label>
              <input type="number" placeholder="e.g. 500" min="1" value={labourForm.dailyWage}
                onChange={e => setLabourForm({ ...labourForm, dailyWage: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone No.</label>
              <input type="text" placeholder="Optional" value={labourForm.phone}
                onChange={e => setLabourForm({ ...labourForm, phone: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Add Labour</button>
        </form>
      </section>

      {/* MARK ATTENDANCE */}
      <section className="card">
        <h2>📅 Mark Attendance</h2>
        <form onSubmit={handleMarkAttendance}>
          <div className="form-row">
            <div className="form-group">
              <label>Select Labour *</label>
              <select value={attendanceForm.labourId}
                onChange={e => setAttendanceForm({ ...attendanceForm, labourId: e.target.value })} required>
                <option value="">-- Select --</option>
                {labours.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.workType})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input type="date" value={attendanceForm.date}
                onChange={e => setAttendanceForm({ ...attendanceForm, date: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status *</label>
              <select value={attendanceForm.status}
                onChange={e => setAttendanceForm({ ...attendanceForm, status: e.target.value })} required>
                <option value="Present">✅ Present</option>
                <option value="Absent">❌ Absent</option>
                <option value="Half Day">⏳ Half Day</option>
                <option value="Overtime">⚡ Overtime</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-success">Mark Attendance</button>
        </form>
      </section>

      {/* ADD PAYMENT */}
      <section className="card">
        <h2>💰 Add Payment</h2>
        <form onSubmit={handleAddPayment}>
          <div className="form-row">
            <div className="form-group">
              <label>Select Labour *</label>
              <select value={paymentForm.labourId}
                onChange={e => setPaymentForm({ ...paymentForm, labourId: e.target.value })} required>
                <option value="">-- Select --</option>
                {labours.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.workType})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input type="number" placeholder="Enter amount" min="1" value={paymentForm.amount}
                onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Payment Type *</label>
              <select value={paymentForm.type}
                onChange={e => setPaymentForm({ ...paymentForm, type: e.target.value })} required>
                <option value="Online">🏦 Online (UPI/Bank)</option>
                <option value="Offline">💵 Offline (Cash)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input type="date" value={paymentForm.date}
                onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn btn-warning">Record Payment</button>
        </form>
      </section>

      {/* LABOUR SUMMARY LIST */}
      <section className="card">
        <h2>📋 All Labour Summary</h2>
        <div className="search-bar">
          <input type="text" placeholder="🔍 Search labour..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <div id="labourList">
          {filteredStats.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3em' }}>👷</div>
              <p>{stats.length === 0 ? 'No labours added yet. Add one above!' : 'No matching labours found.'}</p>
            </div>
          ) : (
            filteredStats.map(s => {
              const dueAmount = s.totalEarned - s.totalPaid;
              const dueClass = dueAmount > 0 ? 'due' : 'paid';
              return (
                <div key={s.labourId} className="labour-item" onClick={() => loadDetail(s.labourId)}>
                  <div>
                    <span className="name">{s.labourName}</span>
                    <span className="work-type">{s.workType}</span>
                  </div>
                  <div className="summary">
                    <span>📅 {s.totalDays} days</span>
                    <span>💰 ₹{s.totalEarned.toLocaleString()}</span>
                    <span className="paid">✅ Paid: ₹{s.totalPaid.toLocaleString()}</span>
                    <span className={dueClass}>⚖️ Due: ₹{dueAmount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* LABOUR DETAIL VIEW */}
      {detailData && (
        <section className="card">
          <div id="labourDetail">
            <div className="detail-header">
              <div>
                <h3>{detailData.labour.name}</h3>
                <div style={{ marginTop: '4px', fontSize: '0.9em', color: '#666' }}>
                  📞 {detailData.labour.phone || 'N/A'} &nbsp;|&nbsp; 💰 Daily Wage: ₹{detailData.labour.dailyWage}
                </div>
              </div>
              <div>
                <span className="detail-work-type">{detailData.labour.workType}</span>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(detailData.labour.id)}
                  style={{ marginLeft: '8px' }}>Delete</button>
                <button className="btn btn-sm" onClick={closeDetail}
                  style={{ background: '#ddd', color: '#333', marginLeft: '4px' }}>Close</button>
              </div>
            </div>

            <div className="detail-stats">
              <div className="stat-box">
                <div className="stat-label">Total Days</div>
                <div className="stat-value blue">{detailData.stats.totalDays}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Total Earned</div>
                <div className="stat-value purple">₹{detailData.stats.totalEarned.toLocaleString()}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Total Paid</div>
                <div className="stat-value green">₹{detailData.stats.totalPaid.toLocaleString()}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Balance Due</div>
                <div className={`stat-value ${detailData.stats.dueAmount > 0 ? 'red' : 'green'}`}>
                  ₹{detailData.stats.dueAmount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Attendance Records */}
            <h4 style={{ marginBottom: '8px' }}>📅 Attendance Records</h4>
            {detailData.attendances.length === 0 ? (
              <p style={{ color: '#999', fontSize: '0.9em' }}>No attendance records yet.</p>
            ) : (
              <table className="detail-table">
                <thead><tr><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {detailData.attendances.map(a => {
                    let badgeClass = 'badge-present';
                    if (a.status === 'Absent') badgeClass = 'badge-absent';
                    else if (a.status === 'Half Day') badgeClass = 'badge-halfday';
                    else if (a.status === 'Overtime') badgeClass = 'badge-overtime';
                    return (
                      <tr key={a.id}>
                        <td>{formatDate(a.date)}</td>
                        <td><span className={`badge ${badgeClass}`}>{a.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Payment Records */}
            <h4 style={{ margin: '15px 0 8px' }}>💰 Payment Records</h4>
            {detailData.payments.length === 0 ? (
              <p style={{ color: '#999', fontSize: '0.9em' }}>No payment records yet.</p>
            ) : (
              <table className="detail-table">
                <thead><tr><th>Date</th><th>Amount</th><th>Type</th></tr></thead>
                <tbody>
                  {detailData.payments.map(p => (
                    <tr key={p.id}>
                      <td>{formatDate(p.date)}</td>
                      <td>₹{p.amount.toLocaleString()}</td>
                      <td>{p.type === 'Online' ? '🏦' : '💵'} {p.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default App;