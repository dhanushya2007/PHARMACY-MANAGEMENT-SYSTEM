import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { IconButton, Badge, Avatar, Tooltip } from '@mui/material';
import { Notifications, Settings, Search } from '@mui/icons-material';

const pageTitles = {
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/medicines': 'Medicine Management',
  '/admin/suppliers': 'Supplier Management',
  '/admin/inventory': 'Inventory Alerts',
  '/admin/sales': 'Sales History',
  '/admin/reports': 'Reports & Analytics',
  '/admin/users': 'User Management',
  '/admin/prescriptions': 'Prescriptions',
  '/pharmacist/dashboard': 'Pharmacist Dashboard',
  '/pharmacist/medicines': 'Medicine Catalog',
  '/pharmacist/new-sale': 'Create New Sale',
  '/pharmacist/sales': 'Sales History',
  '/pharmacist/prescriptions': 'Prescriptions',
  '/customer/dashboard': 'My Dashboard',
  '/customer/search': 'Find Medicine',
  '/customer/prescriptions': 'My Prescriptions',
  '/customer/purchases': 'Purchase History',
};

export default function Topbar() {
  const { user } = useAuth();
  const path = window.location.pathname;
  const title = pageTitles[path] || 'MediTrack';

  const avatarColor = user?.role === 'ADMIN' ? '#1565C0' :
                      user?.role === 'PHARMACIST' ? '#2E7D32' : '#6A1B9A';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <div className="topbar-title">{title}</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <Tooltip title="Notifications">
          <IconButton size="small">
            <Badge badgeContent={3} color="error">
              <Notifications sx={{ color: '#6B7280' }} />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton size="small">
            <Settings sx={{ color: '#6B7280' }} />
          </IconButton>
        </Tooltip>
        <Avatar
          sx={{
            width: 36, height: 36, bgcolor: avatarColor,
            fontSize: '14px', fontWeight: 700, cursor: 'pointer'
          }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
      </div>
    </header>
  );
}
