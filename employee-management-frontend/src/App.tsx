import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';

function App() {
  return (
    <Router>
      <div className="app-bg">
        <h1 className="main-heading">Employee Management</h1>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
