import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { prescriptionAPI } from '../../api';
import { toast } from 'react-toastify';
import { Button, CircularProgress, Chip, Pagination } from '@mui/material';
import { CloudUpload, Description, AccessTime } from '@mui/icons-material';

export default function CustomerPrescriptionsPage() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await prescriptionAPI.getByCustomer(user.id, { page: page - 1, size: 5 });
      setPrescriptions(res.data.data.content || []);
      setTotal(res.data.data.totalPages || 0);
    } catch { toast.error('Failed to load prescriptions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPrescriptions(); }, [page, user]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { toast.warning('Please select a file to upload'); return; }
    setUploading(true);
    try {
      await prescriptionAPI.upload(user.id, file);
      toast.success('Prescription uploaded successfully!');
      setFile(null);
      setPage(1);
      fetchPrescriptions();
    } catch (e) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') return <span className="badge badge-success">Approved</span>;
    if (status === 'REJECTED') return <span className="badge badge-error">Rejected</span>;
    if (status === 'COMPLETED') return <span className="badge badge-info">Completed</span>;
    return <span className="badge badge-warning">Pending Review</span>;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Prescriptions</h1>
          <p className="page-subtitle">Upload and check status of your prescription orders</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '20px' }}>
        {/* Upload Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Upload Prescription</h3>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              border: '2px dashed #1565C0',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#F8FAFF',
              position: 'relative'
            }}>
              <CloudUpload sx={{ fontSize: 40, color: '#1565C0', mb: 1 }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1565C0' }}>
                {file ? file.name : 'Select prescription image/PDF'}
              </p>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={e => setFile(e.target.files[0])}
                style={{
                  position: 'absolute',
                  top: 0, left: 0, width: '100%', height: '100%',
                  opacity: 0, cursor: 'pointer'
                }}
              />
            </div>
            <Button
              type="submit"
              variant="contained"
              disabled={uploading || !file}
              fullWidth
              sx={{ py: 1.2 }}
            >
              {uploading ? <CircularProgress size={20} /> : 'Upload'}
            </Button>
          </form>
        </div>

        {/* Status List */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>My Upload History</h3>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><CircularProgress /></div>
          ) : prescriptions.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>No upload history</p>
          ) : (
            <div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map(p => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td style={{ fontSize: '13px' }}>{p.uploadedDate?.split('T')[0]}</td>
                      <td>{getStatusBadge(p.status)}</td>
                      <td style={{ fontSize: '13px', color: '#4B5563' }}>{p.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {total > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                  <Pagination count={total} page={page} onChange={(_, v) => setPage(v)} color="primary" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
