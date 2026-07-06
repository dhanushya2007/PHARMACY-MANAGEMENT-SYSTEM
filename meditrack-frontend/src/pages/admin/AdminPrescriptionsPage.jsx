import React, { useEffect, useState } from 'react';
import { prescriptionAPI } from '../../api';
import { toast } from 'react-toastify';
import {
  Chip, CircularProgress, IconButton, Pagination, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField
} from '@mui/material';
import { Check, Close, Visibility } from '@mui/icons-material';

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await prescriptionAPI.getAll({ page: page - 1, size: 10 });
      setPrescriptions(res.data.data.content || []);
      setTotal(res.data.data.totalPages || 0);
    } catch { toast.error('Failed to load prescriptions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPrescriptions(); }, [page]);

  const handleUpdateStatus = async (status) => {
    setActionLoading(true);
    try {
      await prescriptionAPI.updateStatus(selected.id, { status, notes });
      toast.success(`Prescription ${status.toLowerCase()} successfully`);
      setSelected(null);
      setNotes('');
      fetchPrescriptions();
    } catch { toast.error('Failed to update status'); }
    finally { setActionLoading(false); }
  };

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') return <span className="badge badge-success">Approved</span>;
    if (status === 'REJECTED') return <span className="badge badge-error">Rejected</span>;
    if (status === 'COMPLETED') return <span className="badge badge-info">Completed</span>;
    return <span className="badge badge-warning">Pending</span>;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Prescriptions</h1>
          <p className="page-subtitle">Verify and approve uploaded customer prescriptions</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Uploaded Date</th>
              <th>Status</th>
              <th>Reviewed By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}><CircularProgress size={28} /></td></tr>
            ) : prescriptions.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>No prescriptions uploaded yet</td></tr>
            ) : prescriptions.map(p => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.customer?.name}</td>
                <td>{p.uploadedDate ? p.uploadedDate.split('T')[0] : '—'}</td>
                <td>{getStatusBadge(p.status)}</td>
                <td>{p.reviewedBy ? p.reviewedBy.name : '—'}</td>
                <td>
                  <Tooltip title="View & Review">
                    <IconButton size="small" onClick={() => setSelected(p)} sx={{ color: '#1565C0' }}>
                      <Visibility fontSize="small" />
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

      {selected && (
        <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            Review Prescription #{selected.id}
            <IconButton onClick={() => setSelected(null)} sx={{ position: 'absolute', right: 8, top: 8 }}><Close /></IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ marginBottom: '10px' }}>Customer Information</h4>
                <p><strong>Name:</strong> {selected.customer?.name}</p>
                <p><strong>Email:</strong> {selected.customer?.email}</p>
                <p><strong>Phone:</strong> {selected.customer?.phone || '—'}</p>
                <p style={{ marginTop: '16px' }}><strong>Uploaded At:</strong> {selected.uploadedDate}</p>
                <p><strong>Current Status:</strong> {getStatusBadge(selected.status)}</p>

                {selected.notes && (
                  <div style={{ marginTop: '16px', padding: '10px', background: '#F5F5F5', borderRadius: '6px' }}>
                    <strong>Reviewer Notes:</strong>
                    <p style={{ margin: 0, fontSize: '13px' }}>{selected.notes}</p>
                  </div>
                )}

                {selected.status === 'PENDING' && (
                  <div style={{ marginTop: '24px' }}>
                    <TextField
                      label="Review Decision Notes"
                      multiline
                      rows={3}
                      fullWidth
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Add comments or instructions for the customer..."
                      sx={{ mb: 2 }}
                    />
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'center', background: '#F0F2F5', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <img
                  src={`http://localhost:8080/uploads/prescriptions/${selected.prescriptionImage}`}
                  alt="Prescription Scan"
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  onError={(e) => { e.target.src = 'https://placehold.co/400x500?text=Prescription+Image'; }}
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelected(null)}>Cancel</Button>
            {selected.status === 'PENDING' && (
              <>
                <Button variant="outlined" color="error" startIcon={<Close />} onClick={() => handleUpdateStatus('REJECTED')} disabled={actionLoading}>
                  Reject
                </Button>
                <Button variant="contained" color="success" startIcon={<Check />} onClick={() => handleUpdateStatus('APPROVED')} disabled={actionLoading}>
                  Approve
                </Button>
              </>
            )}
            {selected.status === 'APPROVED' && (
              <Button variant="contained" color="primary" onClick={() => handleUpdateStatus('COMPLETED')} disabled={actionLoading}>
                Mark as Completed
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
