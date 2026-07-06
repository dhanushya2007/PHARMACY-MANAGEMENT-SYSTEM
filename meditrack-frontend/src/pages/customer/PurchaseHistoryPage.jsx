import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { saleAPI, reportAPI } from '../../api';
import { toast } from 'react-toastify';
import { IconButton, Pagination, CircularProgress, Tooltip } from '@mui/material';
import { Download, ShoppingBag } from '@mui/icons-material';

export default function PurchaseHistoryPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      saleAPI.getByCustomer(user.id, { page: page - 1, size: 10 })
        .then(res => {
          setSales(res.data.data.content || []);
          setTotal(res.data.data.totalPages || 0);
        })
        .catch(() => toast.error('Failed to load purchases'))
        .finally(() => setLoading(false));
    }
  }, [page, user]);

  const downloadInvoice = async (id, invNum) => {
    try {
      const res = await reportAPI.invoicePdf(id);
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = fileURL;
      a.download = `invoice-${invNum}.pdf`;
      a.click();
      toast.success('Invoice downloaded!');
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase History</h1>
          <p className="page-subtitle">View and download your billing invoices</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Items Purchased</th>
              <th>Discount</th>
              <th>Tax (GST)</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}><CircularProgress size={28} /></td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                <ShoppingBag sx={{ fontSize: 48, opacity: 0.3 }} /><br />No purchase history
              </td></tr>
            ) : sales.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 700, color: '#1565C0' }}>{s.invoiceNumber}</td>
                <td>{s.saleDate?.split('T')[0]}</td>
                <td style={{ color: '#6B7280' }}>{s.items?.length || 0} items</td>
                <td style={{ color: '#C62828' }}>₹{Number(s.discountAmount).toFixed(2)}</td>
                <td>₹{Number(s.taxAmount).toFixed(2)}</td>
                <td style={{ fontWeight: 700, color: '#2E7D32' }}>₹{Number(s.totalAmount).toFixed(2)}</td>
                <td><span className="badge badge-success">{s.paymentMethod}</span></td>
                <td>
                  <Tooltip title="Download Invoice">
                    <IconButton size="small" onClick={() => downloadInvoice(s.id, s.invoiceNumber)} sx={{ color: '#1565C0' }}>
                      <Download fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </td>
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
