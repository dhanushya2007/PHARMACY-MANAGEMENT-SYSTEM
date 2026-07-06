import React, { useEffect, useState } from 'react';
import { saleAPI } from '../../api';
import { toast } from 'react-toastify';
import { Chip, CircularProgress, Pagination } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';

export default function AdminSalesPage() {
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    saleAPI.getAll({ page: page - 1, size: 10 })
      .then(res => {
        setSales(res.data.data.content || []);
        setTotal(res.data.data.totalPages || 0);
      })
      .catch(() => toast.error('Failed to load sales'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales History</h1>
          <p className="page-subtitle">All transactions across the pharmacy</p>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Discount</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}><CircularProgress size={28} /></td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                <ShoppingCart sx={{ fontSize: 48, opacity: 0.3 }} /><br />No sales yet
              </td></tr>
            ) : sales.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 700, color: '#1565C0', fontSize: '13px' }}>{s.invoiceNumber}</td>
                <td style={{ fontWeight: 600 }}>{s.customerName || 'Walk-in'}</td>
                <td style={{ color: '#6B7280' }}>{s.items?.length || 0} items</td>
                <td>₹{Number(s.discountAmount || 0).toFixed(2)}</td>
                <td>₹{Number(s.taxAmount || 0).toFixed(2)}</td>
                <td style={{ fontWeight: 700, color: '#2E7D32' }}>₹{Number(s.totalAmount || 0).toLocaleString('en-IN')}</td>
                <td><Chip label={s.paymentMethod} size="small" /></td>
                <td style={{ fontSize: '12px', color: '#9CA3AF' }}>{s.saleDate?.split('T')[0] || '—'}</td>
                <td><span className="badge badge-success">{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {total > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
            <Pagination count={total} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </div>
        )}
      </div>
    </div>
  );
}
