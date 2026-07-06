import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Dashboard, Medication, LocalPharmacy, People, Business,
  Assessment, ShoppingCart, Description, Inventory2,
  Logout, Warning, Analytics, ManageAccounts
} from '@mui/icons-material';

const adminLinks = [
  { label: 'Overview', section: true },
  { to: '/admin/dashboard', label: 'Dashboard', icon: <Dashboard /> },
  { label: 'Inventory', section: true },
  { to: '/admin/medicines', label: 'Medicines', icon: <Medication /> },
  { to: '/admin/suppliers', label: 'Suppliers', icon: <Business /> },
  { to: '/admin/inventory', label: 'Inventory Alerts', icon: <Warning /> },
  { label: 'Sales', section: true },
  { to: '/admin/sales', label: 'Sales History', icon: <ShoppingCart /> },
  { to: '/admin/reports', label: 'Reports', icon: <Assessment /> },
  { label: 'Administration', section: true },
  { to: '/admin/users', label: 'Manage Users', icon: <ManageAccounts /> },
  { to: '/admin/prescriptions', label: 'Prescriptions', icon: <Description /> },
];

const pharmacistLinks = [
  { label: 'Overview', section: true },
  { to: '/pharmacist/dashboard', label: 'Dashboard', icon: <Dashboard /> },
  { label: 'Pharmacy', section: true },
  { to: '/pharmacist/medicines', label: 'Medicines', icon: <Medication /> },
  { to: '/pharmacist/new-sale', label: 'New Sale', icon: <ShoppingCart /> },
  { to: '/pharmacist/sales', label: 'Sales History', icon: <Analytics /> },
  { to: '/pharmacist/prescriptions', label: 'Prescriptions', icon: <Description /> },
];

const customerLinks = [
  { label: 'My Account', section: true },
  { to: '/customer/dashboard', label: 'Dashboard', icon: <Dashboard /> },
  { to: '/customer/search', label: 'Find Medicine', icon: <Medication /> },
  { to: '/customer/prescriptions', label: 'My Prescriptions', icon: <Description /> },
  { to: '/customer/purchases', label: 'Purchase History', icon: <ShoppingCart /> },
];

const roleLinks = {
  ADMIN: adminLinks,
  PHARMACIST: pharmacistLinks,
  CUSTOMER: customerLinks,
};

const roleColors = {
  ADMIN: '#1565C0',
  PHARMACIST: '#2E7D32',
  CUSTOMER: '#6A1B9A',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = roleLinks[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💊</div>
        <div className="sidebar-logo-text">
          <h2>MediTrack</h2>
          <span>Pharmacy System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link, idx) => {
          if (link.section) {
            return <div key={idx} className="sidebar-section-label">{link.label}</div>;
          }
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
              {link.badge && <span className="nav-badge">{link.badge}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ padding: '8px 8px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
            Signed in as
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{user?.name}</div>
          <div style={{
            display: 'inline-block',
            marginTop: '6px',
            padding: '2px 10px',
            borderRadius: '20px',
            background: roleColors[user?.role],
            fontSize: '11px',
            fontWeight: 700,
            color: 'white'
          }}>
            {user?.role}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', marginTop: '8px', background: 'rgba(255,59,48,0.12)', color: '#FF6B6B' }}
        >
          <Logout sx={{ fontSize: 20 }} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
