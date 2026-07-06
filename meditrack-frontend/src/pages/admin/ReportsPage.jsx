import React, { useState } from 'react';
import { reportAPI } from '../../api';
import { toast } from 'react-toastify';
import { Button, CircularProgress, TextField } from '@mui/material';
import { PictureAsPdf, TableChart, Download } from '@mui/icons-material';

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const downloadSalesPdf = async () => {
    if (!startDate || !endDate) { toast.warning('Please select date range'); return; }
    setLoadingPdf(true);
    try {
      const res = await reportAPI.salesPdf(startDate + 'T00:00:00', endDate + 'T23:59:59');
      downloadBlob(new Blob([res.data], { type: 'application/pdf' }), `sales-report-${startDate}-${endDate}.pdf`);
      toast.success('Sales report downloaded!');
    } catch { toast.error('Failed to generate report'); }
    finally { setLoadingPdf(false); }
  };

  const downloadInventoryExcel = async () => {
    setLoadingExcel(true);
    try {
      const res = await reportAPI.inventoryExcel();
      downloadBlob(new Blob([res.data]), 'inventory-report.xlsx');
      toast.success('Inventory report downloaded!');
    } catch { toast.error('Failed to generate report'); }
    finally { setLoadingExcel(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Export sales and inventory reports</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Sales Report */}
        <div className="card" style={{ border: '2px solid #BBDEFB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PictureAsPdf sx={{ color: '#1565C0', fontSize: 24 }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '16px' }}>Sales Report</h3>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>PDF export with invoice details</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </div>
          <Button
            variant="contained"
            fullWidth
            startIcon={loadingPdf ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Download />}
            onClick={downloadSalesPdf}
            disabled={loadingPdf}
            sx={{ py: 1.2 }}
          >
            Download Sales PDF
          </Button>
        </div>

        {/* Inventory Report */}
        <div className="card" style={{ border: '2px solid #C8E6C9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TableChart sx={{ color: '#2E7D32', fontSize: 24 }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '16px' }}>Inventory Report</h3>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>Excel export with full stock data</p>
            </div>
          </div>
          <div style={{ padding: '12px', background: '#F9FBF9', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#4A4A4A' }}>
            <p>📊 Includes: Medicine name, category, batch, expiry, prices, stock levels and status for all medicines</p>
          </div>
          <Button
            variant="contained"
            fullWidth
            color="success"
            startIcon={loadingExcel ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Download />}
            onClick={downloadInventoryExcel}
            disabled={loadingExcel}
            sx={{ py: 1.2 }}
          >
            Download Inventory Excel
          </Button>
        </div>
      </div>
    </div>
  );
}
