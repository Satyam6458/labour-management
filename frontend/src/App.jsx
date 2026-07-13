import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  getAllStats, getLabours,
  login, setAuthToken, clearAuthToken, isAuthenticated
} from './api';

// Import pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddLabourPage from './pages/AddLabourPage';
import AttendancePage from './pages/AttendancePage';
import PaymentPage from './pages/PaymentPage';
import LabourListPage from './pages/LabourListPage';
import LabourDetailPage from './pages/LabourDetailPage';

function Layout({ children, onLogout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? { background: 'rgba(255,255,255,0.25)' } : {};

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
            <h1>👷 Labour Management</h1>
          </Link>
          <p>Attendance, Work Type & Payment Tracking</p>
        </div>
        <button className="btn btn-sm" onClick={onLogout}
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
          🚪 Logout
        </button>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'white', borderRadius: '10px', padding: '12px 16px',
        marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex', gap: '8px', flexWrap: 'wrap'
      }}>
        <Link to="/dashboard" className="btn btn-sm" style={{ ...isActive('/dashboard'), textDecoration: 'none' }}>
          📊 Dashboard
        </Link>
        <Link to="/labours" className="btn btn-sm" style={{ background: '#667eea', color: 'white', textDecoration: 'none' }}>
          👷 Add Labour
        </Link>
        <Link to="/attendance" className="btn btn-sm" style={{ background: '#48bb78', color: 'white', textDecoration: 'none' }}>
          📅 Attendance
        </Link>
        <Link to="/payments" className="btn btn-sm" style={{ background: '#ecc94b', color: '#333', textDecoration: 'none' }}>
          💰 Payments
        </Link>
        <Link to="/labour-list" className="btn btn-sm" style={{ background: '#805ad5', color: 'white', textDecoration: 'none' }}>
          📋 Labour List
        </Link>
      </nav>

      {children}
    </div>
  );
}

function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(null);

  const toast = useCallback((msg, type = 'info') => {
    setShowToast({ msg, type });
    setTimeout(() => setShowToast(null), 2500);
  }, []);

  const handleLogin = async (username, password) => {
    try {
      const res = await login(username, password);
      setAuthToken(res.data.token);
      setAuthenticated(true);
      toast('Login successful!', 'success');
      navigate('/dashboard');
    } catch (err) {
      throw new Error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setAuthenticated(false);
    navigate('/');
  };

  if (!authenticated) {
    return (
      <>
        {showToast && <div className={`toast show ${showToast.type}`}>{showToast.msg}</div>}
        <Routes>
          <Route path="*" element={<LoginPage onLogin={handleLogin} toast={toast} />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      {showToast && <div className={`toast show ${showToast.type}`}>{showToast.msg}</div>}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={
          <Layout onLogout={handleLogout}>
            <DashboardPage toast={toast} />
          </Layout>
        } />
        <Route path="/labours" element={
          <Layout onLogout={handleLogout}>
            <AddLabourPage toast={toast} />
          </Layout>
        } />
        <Route path="/attendance" element={
          <Layout onLogout={handleLogout}>
            <AttendancePage toast={toast} />
          </Layout>
        } />
        <Route path="/payments" element={
          <Layout onLogout={handleLogout}>
            <PaymentPage toast={toast} />
          </Layout>
        } />
        <Route path="/labour-list" element={
          <Layout onLogout={handleLogout}>
            <LabourListPage toast={toast} />
          </Layout>
        } />
        <Route path="/labour/:id" element={
          <Layout onLogout={handleLogout}>
            <LabourDetailPage toast={toast} />
          </Layout>
        } />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}

export default App;