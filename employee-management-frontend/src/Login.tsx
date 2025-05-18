import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [role, setRole] = useState<'admin' | 'employee'>('admin');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as 'admin' | 'employee');
    setError('');
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const data = await res.json();
      if (data.success) {
        navigate('/admin');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Server error');
    }
  };

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: employeeEmail })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('employeeId', data.employeeId);
        localStorage.setItem('employeeName', data.name);
        navigate('/employee');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Server error');
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome Back</h2>
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="role" style={{ display: 'block', marginBottom: 8, color: '#475569' }}>
          Login as:
        </label>
        <select id="role" value={role} onChange={handleRoleChange}>
          <option value="admin">Administrator</option>
          <option value="employee">Employee</option>
        </select>
      </div>
      {role === 'admin' ? (
        <form onSubmit={handleAdminLogin}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="username" style={{ display: 'block', marginBottom: 8, color: '#475569' }}>
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={adminUsername}
              onChange={e => setAdminUsername(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: 8, color: '#475569' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Sign in as Administrator</button>
        </form>
      ) : (
        <form onSubmit={handleEmployeeLogin}>
          <div style={{ marginBottom: 24 }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: 8, color: '#475569' }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={employeeEmail}
              onChange={e => setEmployeeEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">Sign in as Employee</button>
        </form>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Login; 