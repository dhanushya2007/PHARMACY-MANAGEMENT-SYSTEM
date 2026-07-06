import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../api';
import { toast } from 'react-toastify';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Medication, People, Business, Warning, TrendingUp,
  ShoppingCart, MonetizationOn, LocalPharmacy, Inventory
} from '@mui/icons-material';
import { Skeleton, Chip } from '@mui/material';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#1565C0','#2E7D32','#FF6F00','#6A1B9A','#C62828','#0277BD'];

function StatCard({ icon, value, label, color, trend }) {
  return (
    <div className="stat-card fade-in">
      <div className="stat-card-icon" style={{ background: color + '18' }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 26 } })}
      </div>
      <div className="stat-card-value">{value ?? '—'}</div>
      <div className="stat-card-label">{label}</div>
      {trend && (
        <div className={`stat-card-trend ${trend.dir}`}>
          <TrendingUp sx={{ fontSize: 14 }} />
          {trend.text}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getAdmin()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const monthlySalesChart = (data?.monthlySalesChart || []).map(d => ({
    name: MONTHS[(d.month || 1) - 1],
    revenue: Number(d.total || 0).toFixed(0),
  }));

  const categoryChart = (data?.categoryDistribution || []).map(d => ({
    name: d.category,
    value: Number(d.count || 0),
  }));

  if (loading) return (
    <div>
      <div className="page-header">
        <div><Skeleton variant="text" width={220} height={36} /><Skeleton variant="text" width={180} height={20} /></div>
      </div>
      <div className="grid-4">
        {[...Array(8)].map((_, i) => <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: 4 }} />)}
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Real-time pharmacy operations overview</p>
        </div>
        <Chip
          icon={<LocalPharmacy sx={{ fontSize: 16 }} />}
          label="Live Data"
          color="primary"
          variant="outlined"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <StatCard icon={<Medication />} value={data?.totalMedicines} label="Total Medicines" color="#1565C0" />
        <StatCard icon={<MonetizationOn />} value={`₹${Number(data?.todaySales || 0).toLocaleString('en-IN')}`} label="Today's Revenue" color="#2E7D32" trend={{ dir: 'up', text: 'Today' }} />
        <StatCard icon={<MonetizationOn />} value={`₹${Number(data?.monthlyRevenue || 0).toLocaleString('en-IN')}`} label="Monthly Revenue" color="#FF6F00" />
        <StatCard icon={<People />} value={data?.totalCustomers} label="Total Customers" color="#6A1B9A" />
        <StatCard icon={<Business />} value={data?.totalSuppliers} label="Suppliers" color="#0277BD" />
        <StatCard icon={<Warning />} value={data?.lowStockCount} label="Low Stock Alerts" color="#E65100" />
        <StatCard icon={<Warning />} value={data?.expiredCount} label="Expired Medicines" color="#C62828" />
        <StatCard icon={<Inventory />} value={data?.pendingPrescriptions} label="Pending Prescriptions" color="#2E7D32" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Revenue</h3>
            <Chip label="2025" size="small" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlySalesChart}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1565C0" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1565C0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#1565C0" strokeWidth={2.5} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Category Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryChart} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {categoryChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts Row */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚠️ Low Stock Medicines</h3>
            <Chip label={`${data?.lowStockMedicines?.length || 0} items`} color="warning" size="small" />
          </div>
          {data?.lowStockMedicines?.length === 0 && (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px', fontSize: '14px' }}>
              ✅ All medicines well stocked
            </p>
          )}
          {(data?.lowStockMedicines || []).slice(0, 5).map(m => (
            <div key={m.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #F3F4F6'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{m.medicineName}</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{m.category}</div>
              </div>
              <span className="badge badge-warning">{m.quantity} left</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔴 Expired Medicines</h3>
            <Chip label={`${data?.expiredMedicines?.length || 0} items`} color="error" size="small" />
          </div>
          {data?.expiredMedicines?.length === 0 && (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px', fontSize: '14px' }}>
              ✅ No expired medicines
            </p>
          )}
          {(data?.expiredMedicines || []).slice(0, 5).map(m => (
            <div key={m.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #F3F4F6'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{m.medicineName}</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Exp: {m.expiryDate}</div>
              </div>
              <span className="badge badge-error">EXPIRED</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
