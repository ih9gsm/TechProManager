import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          TechProManager
        </Link>
        
        {user ? (
          <>
            <div className="navbar-menu">
              <Link to="/" className="navbar-item">Dashboard</Link>
              <Link to="/projects" className="navbar-item">Progetti</Link>
              <Link to="/tasks" className="navbar-item">Task</Link>
              {user.role === 'admin' && (
                <Link to="/users" className="navbar-item">Utenti</Link>
              )}
            </div>
            
            <div className="navbar-user">
              <div className="user-menu-dropdown">
                <button className="user-menu-button">
                  <span className="user-avatar">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </span>
                  <span className="user-name">{user.name}</span>
                </button>
                <div className="dropdown-content">
                  <Link to="/profile" className="dropdown-item">Profilo</Link>
                  <Link to="/settings" className="dropdown-item">Impostazioni</Link>
                  <button onClick={handleLogout} className="dropdown-item logout-button">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="navbar-auth">
            <Link to="/login" className="navbar-button">Accedi</Link>
            <Link to="/register" className="navbar-button navbar-button-outline">Registrati</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;