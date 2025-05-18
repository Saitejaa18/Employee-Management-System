import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  lastCheckIn?: string;
}

interface Attendance {
  employee: Employee;
  present: boolean;
}

const AdminDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [viewDate, setViewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/employees');
      const data = await res.json();
      if (data.success) setEmployees(data.employees);
    } catch {}
  };

  // Fetch attendance for selected date
  const fetchAttendance = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/attendance/list?date=${viewDate}`);
      const data = await res.json();
      if (data.success) setAttendance(data.attendance);
    } catch {}
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [viewDate]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/employee/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, department, joinDate })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Employee added successfully');
        setName('');
        setEmail('');
        setRole('');
        setDepartment('');
        setJoinDate(new Date().toISOString().slice(0, 10));
        fetchEmployees();
      } else {
        setError(data.message || 'Failed to add employee');
      }
    } catch {
      setError('Server error');
    }
  };

  const handleLogout = async () => {
    await fetch('http://localhost:5000/api/admin/logout', { method: 'POST' });
    navigate('/login');
  };

  // Map attendance by employeeId for quick lookup
  const attendanceMap = attendance.reduce((acc, a) => {
    acc[a.employee._id] = a.present;
    return acc;
  }, {} as Record<string, boolean>);

  // Sort employees: present first, then by name
  const sortedEmployees = [...employees].sort((a, b) => {
    const aPresent = attendanceMap[a._id] ? 1 : 0;
    const bPresent = attendanceMap[b._id] ? 1 : 0;
    if (bPresent !== aPresent) return bPresent - aPresent;
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <Header userName="Admin" userRole="Administrator" onLogout={handleLogout} />
      <div className="centered-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <h3>Add New Employee</h3>
            <form onSubmit={handleAddEmployee}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="name" style={{ display: 'block', marginBottom: 8, color: '#475569' }}>
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter employee name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: 8, color: '#475569' }}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter employee email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="role" style={{ display: 'block', marginBottom: 8, color: '#475569' }}>
                  Role
                </label>
                <input
                  id="role"
                  type="text"
                  placeholder="Enter employee role"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label htmlFor="department" style={{ display: 'block', marginBottom: 8, color: '#475569' }}>
                  Department
                </label>
                <select
                  id="department"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label htmlFor="joinDate" style={{ display: 'block', marginBottom: 8, color: '#475569' }}>
                  Join Date
                </label>
                <input
                  id="joinDate"
                  type="date"
                  value={joinDate}
                  onChange={e => setJoinDate(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Add Employee</button>
            </form>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </div>

          <div>
            <h3>Attendance Overview</h3>
            <div style={{ marginBottom: 24 }}>
              <label htmlFor="viewDate" style={{ display: 'block', marginBottom: 8, color: '#475569' }}>
                Select Date
              </label>
              <input
                id="viewDate"
                type="date"
                value={viewDate}
                onChange={e => setViewDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp._id}>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>
                        {attendance.find(a => a.employee._id === emp._id)?.present ? (
                          <span style={{ color: '#059669' }}>Present</span>
                        ) : (
                          <span style={{ color: '#dc2626' }}>Absent</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard; 