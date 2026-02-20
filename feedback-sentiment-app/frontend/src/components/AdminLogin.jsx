import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function AdminLogin({ setAdmin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', formData);
      setAdmin(true);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card admin-card">
        <div className="auth-header">
          <div className="auth-icon admin-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 5 L35 15 L35 30 L20 40 L5 30 L5 15 Z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="6" fill="currentColor"/>
            </svg>
          </div>
          <h1>Admin Portal</h1>
          <p>Access the dashboard and analytics</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Admin Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="admin"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button admin-button" disabled={loading}>
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/signin">Back to User Login</Link>
        </div>

        <div className="admin-hint">
          Default credentials: admin / admin123
        </div>
      </div>

      <div className="auth-bg admin-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
    </div>
  );
}

export default AdminLogin;
