import React, { useState } from 'react';

export default function LoginPage({ onLogin, toast }) {
  const [form, setForm] = useState({ username: 'admin', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(form.username, form.password);
    } catch (err) {
      toast('Invalid username or password!', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '60px' }}>
      <header style={{ textAlign: 'center' }}>
        <h1>👷 Labour Management</h1>
        <p>Admin Login</p>
      </header>
      <section className="card">
        <h2>🔐 Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>Username</label>
            <input type="text" placeholder="Username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required />
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>Password</label>
            <input type="password" placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8em', color: '#999' }}>
          Default: admin / admin123
        </p>
      </section>
    </div>
  );
}