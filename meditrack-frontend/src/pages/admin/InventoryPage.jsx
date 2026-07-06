import React, { useEffect, useState } from 'react';
import { medicineAPI } from '../../api';
import { toast } from 'react-toastify';
import { Chip, CircularProgress, Tab, Tabs } from '@mui/material';
import { Warning, ErrorOutline, AccessTime } from '@mui/icons-material';

export default function InventoryPage() {
  const [tab, setTab] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [expired, setExpired] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      medicineAPI.getLowStock(),
      medicineAPI.getExpired(),
      medicineAPI.getExpiringSoon()
    ]).then(([ls, ex, es]) => {
      setLowStock(ls.data.data);
      setExpired(ex.data.data);
      setExpiring(es.data.data);
    }).catch(() => toast.error('Failed to load inventory data'))
    .finally(() => setLoading(false));
  }, []);

  const lists = [lowStock, expired, expiring];
  const icons = [<Warning />, <ErrorOutline />, <AccessTime />];
  const labels = ['Low Stock', 'Expired', 'Expiring Soon (30 days)'];
  const colors = ['#FF6F00', '#C62828', '#E65100'];
  const badges = ['badge-warning', 'badge-error', 'badge-warning'];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><CircularProgress /></div>;

  const current = lists[tab];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Alerts</h1>
          <p className="page-subtitle">Monitor stock levels and medicine expiry</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {labels.map((label, i) => (
          <div key={i} className="stat-card" onClick={() => setTab(i)} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon" style={{ background: colors[i] + '18' }}>
              {React.cloneElement(icons[i], { sx: { color: colors[i], fontSize: 24 } })}
            </div>
            <div className="stat-card-value" style={{ fontSize: '40px', color: colors[i] }}>{lists[i].length}</div>
            <div className="stat-card-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          {labels.map((label, i) => (
            <Tab key={i} label={`${label} (${lists[i].length})`}
              icon={React.cloneElement(icons[i], { sx: { fontSize: 16 } })}
              iconPosition="start"
            />
          ))}
        </Tabs>

        {current.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
            <p style={{ fontSize: '48px', marginBottom: '8px' }}>✅</p>
            <p>No alerts in this category</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Category</th>
                <th>Batch</th>
                <th>Expiry Date</th>
                <th>Quantity</th>
                <th>Min Stock</th>
                <th>Alert</th>
              </tr>
            </thead>
            <tbody>
              {current.map((m, i) => (
                <tr key={m.id}>
                  <td style={{ color: '#9CA3AF' }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.medicineName}</div>
                    {m.genericName && <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{m.genericName}</div>}
                  </td>
                  <td><Chip label={m.category} size="small" /></td>
                  <td style={{ fontSize: '12px' }}>{m.batchNumber || '—'}</td>
                  <td style={{ fontSize: '13px', color: tab > 0 ? '#C62828' : 'inherit', fontWeight: tab > 0 ? 600 : 400 }}>
                    {m.expiryDate || '—'}
                  </td>
                  <td style={{ fontWeight: 700, color: m.quantity === 0 ? '#C62828' : m.quantity <= m.minimumStock ? '#E65100' : 'inherit' }}>
                    {m.quantity}
                  </td>
                  <td>{m.minimumStock}</td>
                  <td><span className={`badge ${badges[tab]}`}>{tab === 0 ? 'LOW STOCK' : tab === 1 ? 'EXPIRED' : 'EXPIRING'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
