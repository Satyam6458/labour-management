import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStats } from '../api';

export default function LabourListPage({ toast }) {
  const [stats, setStats] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAllStats().then(r => setStats(r.data)).catch(() => toast('Error loading data', 'error'));
  }, []);

  const filtered = stats.filter(s =>
    !search || s.labourName.toLowerCase().includes(search.toLowerCase()) ||
    s.workType.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone && s.phone.includes(search))
  );

  return (
    <section className="card">
      <h2>📋 All Labour Summary</h2>
      <div className="search-bar">
        <input type="text" placeholder="🔍 Search by name, work type, or phone..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3em' }}>👷</div>
          <p>{stats.length === 0 ? 'No labours added yet.' : 'No matching labours found.'}</p>
        </div>
      ) : (
        filtered.map(s => {
          const dueAmount = s.totalEarned - s.totalPaid;
          const dueClass = dueAmount > 0 ? 'due' : 'paid';
          return (
            <div key={s.labourId} className="labour-item" onClick={() => navigate(`/labour/${s.labourId}`)}>
              <div>
                <span className="name">{s.labourName}</span>
                <span className="work-type">{s.workType}</span>
              </div>
              <div className="summary">
                <span>📅 {s.totalDays} days</span>
                <span>💰 ₹{s.totalEarned.toLocaleString()}</span>
                <span className="paid">✅ Paid: ₹{s.totalPaid.toLocaleString()}</span>
                {s.advanceBalance > 0 && <span style={{ color: '#d69e2e', fontWeight: 600 }}>
                  💳 Advance: ₹{s.advanceBalance.toLocaleString()}
                </span>}
                <span className={dueClass}>⚖️ Due: ₹{dueAmount.toLocaleString()}</span>
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}