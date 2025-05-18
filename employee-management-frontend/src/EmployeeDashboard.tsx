import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

interface EmployeeProfile {
  name: string;
  email: string;
  position: string;
  department: string;
  joinDate: string;
  lastCheckIn: string;
}

const EmployeeDashboard: React.FC = () => {
  const employeeId = localStorage.getItem('employeeId');
  const employeeName = localStorage.getItem('employeeName');
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [marked, setMarked] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!employeeId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/employee/profile/${employeeId}`);
        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
        }
      } catch {}
    };
    fetchProfile();
  }, [employeeId]);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setStatus(''); setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      const data = await res.json();
      if (data.success) {
        setMarked(true);
        setStatus('Attendance marked successfully for today!');
      } else {
        setError(data.message || 'Could not mark attendance');
      }
    } catch {
      setError('Server error');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeId');
    localStorage.removeItem('employeeName');
    navigate('/login');
  };

  return (
    <>
      <Header userName={employeeName || (profile && profile.name) || 'Employee'} userRole="Employee Dashboard" onLogout={handleLogout} />
      <div className="centered-container" style={{ marginTop: 32 }}>
        {profile && (
          <div className="profile-card">
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Employee Profile</h2>
            <div style={{ color: '#64748b', marginBottom: 18, fontSize: '1rem' }}>Your personal information and attendance status</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <div>
                <div><strong>Full Name</strong></div>
                <div style={{ marginBottom: 12 }}>{profile.name}</div>
                <div><strong>Position</strong></div>
                <div style={{ marginBottom: 12 }}>{profile.position}</div>
                <div><strong>Join Date</strong></div>
                <div style={{ marginBottom: 12 }}>{profile.joinDate}</div>
              </div>
              <div>
                <div><strong>Email</strong></div>
                <div style={{ marginBottom: 12 }}>{profile.email}</div>
                <div><strong>Department</strong></div>
                <div style={{ marginBottom: 12 }}>{profile.department}</div>
                <div><strong>Last Check-in</strong></div>
                <div style={{ marginBottom: 12 }}>{profile.lastCheckIn}</div>
              </div>
            </div>
          </div>
        )}
        <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, marginBottom: 32, border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>Welcome, {employeeName || (profile && profile.name) || 'Employee'}!</h3>
          <p style={{ color: '#64748b', marginBottom: 24 }}>
            Mark your attendance for today to record your presence.
          </p>
          <form onSubmit={handleMarkAttendance}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <input
                type="checkbox"
                id="attendance"
                checked={marked}
                disabled={marked}
                onChange={() => setMarked(!marked)}
                style={{ width: 20, height: 20, cursor: marked ? 'not-allowed' : 'pointer' }}
              />
              <label htmlFor="attendance" style={{ color: '#475569', cursor: marked ? 'not-allowed' : 'pointer' }}>
                I confirm my attendance for today
              </label>
            </div>
            <button type="submit" disabled={marked || loading} style={{ width: '100%' }}>
              {marked ? 'Attendance Marked' : loading ? 'Marking...' : 'Mark Attendance'}
            </button>
          </form>
        </div>
        {status && <div className="success-message">{status}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
};

export default EmployeeDashboard; 