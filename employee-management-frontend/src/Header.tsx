import React from 'react';

interface HeaderProps {
  userName: string;
  userRole: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, userRole, onLogout }) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <span className="header-logo">
          <svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#ede9fe" />
            <path d="M16 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5z" fill="#7c3aed" />
          </svg>
        </span>
        <span className="header-title">AttendNow</span>
      </div>
      <div className="header-right">
        <div className="header-user-info">
          <span className="header-user-name">{userName}</span>
          <span className="header-user-role">{userRole}</span>
        </div>
        <button className="logout-button" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header; 