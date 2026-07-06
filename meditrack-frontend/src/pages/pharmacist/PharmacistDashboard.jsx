import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../api';
import { toast } from 'react-toastify';
import { Medication, ShoppingCart, Warning, Checklist } from '@mui/icons-material';
import { Skeleton } from '@mui/material';

export default function PharmacistDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getPharmacist()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="fade-in">
      <Skeleton variant="rectangular" height={120} sx={{ mb: 3 }} />
      <div className="grid-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} height={140} />)}
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pharmacist Dashboard</h1>
          <p className="page-subtitle">Track billing, stock levels and pending orders</p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#2E7D3218' }}>
            <ShoppingCart sx={{ color: '#2E7D32', fontSize: 26 }} />
          </div>
          <div className="stat-card-value">₹{Number(data?.todaySales || 0).toLocaleString('en-IN')}</div>
          <div className="stat-card-label">Today's Sales Revenue</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#FF6F0018' }}>
            <Checklist sx={{ color: '#FF6F00', fontSize: 26 }} />
          </div>
          <div className="stat-card-value">{data?.pendingPrescriptions || 0}</div>
          <div className="stat-card-label">Pending Prescriptions</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#C6282818' }}>
            <Warning sx={{ color: '#C62828', fontSize: 26 }} />
          </div>
          <div className="stat-card-value">{data?.lowStockCount || 0}</div>
          <div className="stat-card-label">Low Stock Medicines</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#1565C018' }}>
            <Medication sx={{ color: '#1565C0', fontSize: 26 }} />
          </div>
          <div className="stat-card-value">{data?.totalMedicines || 0}</div>
          <div className="stat-card-label">Available Medicines</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Quick Stock Status */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>⚠️ Critical Low Stock</h3>
          {data?.lowStockMedicines?.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '20px' }}>No low stock alerts</p>
          ) : (
            (data?.lowStockMedicines || []).slice(0, 5).map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{m.medicineName}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Batch: {m.batchNumber || '—'}</div>
                </div>
                <span className="badge badge-warning">{m.quantity} Left</span>
              </div>
            ))
          )}
        </div>

        {/* Prescription Alerts */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>📋 Pending Verification</h3>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>
            There are {data?.pendingPrescriptions || 0} customer prescription uploads waiting for verification.
          </p>
          <a href="/pharmacist/prescriptions" className="btn btn-primary" style={{ display: 'inline-block', textAlign: 'center' }}>
            Go to Prescriptions
          </a>
        </div>
      </div>
    </div>
  );
}
