import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { saleAPI, prescriptionAPI } from '../../api';
import { toast } from 'react-toastify';
import { Card, CircularProgress, Chip } from '@mui/material';
import { ShoppingCart, Description, LocalPharmacy } from '@mui/icons-material';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        saleAPI.getByCustomer(user.id, { page: 0, size: 5 }),
        prescriptionAPI.getByCustomer(user.id, { page: 0, size: 5 })
      ]).then(([sRes, pRes]) => {
        setSales(sRes.data.data.content || []);
        setPrescriptions(pRes.data.data.content || []);
      }).catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><CircularProgress /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name}</h1>
          <p className="page-subtitle">Track your purchases and prescription statuses</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Purchases */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-title">🛒 Recent Purchases</h3>
            <a href="/customer/purchases" style={{ color: '#1565C0', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>View All</a>
          </div>
          {sales.length === 0 ? (
            <p style={{ color: '#9CA3AF', padding: '16px', textAlign: 'center' }}>No purchases yet</p>
          ) : (
            sales.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1565C0' }}>{s.invoiceNumber}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{s.saleDate?.split('T')[0]}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#2E7D32' }}>₹{Number(s.totalAmount).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>

        {/* Prescription Status */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-title">📋 Prescription Status</h3>
            <a href="/customer/prescriptions" style={{ color: '#1565C0', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Upload New</a>
          </div>
          {prescriptions.length === 0 ? (
            <p style={{ color: '#9CA3AF', padding: '16px', textAlign: 'center' }}>No prescriptions uploaded</p>
          ) : (
            prescriptions.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Prescription #{p.id}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Uploaded: {p.uploadedDate?.split('T')[0]}</div>
                </div>
                <Chip
                  label={p.status}
                  size="small"
                  color={p.status === 'APPROVED' ? 'success' : p.status === 'REJECTED' ? 'error' : 'warning'}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
