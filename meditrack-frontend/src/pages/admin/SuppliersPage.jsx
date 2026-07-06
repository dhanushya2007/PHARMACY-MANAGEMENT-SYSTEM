import React, { useEffect, useState, useCallback } from 'react';
import { supplierAPI } from '../../api';
import { toast } from 'react-toastify';
import {
  Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Pagination, CircularProgress, Chip, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Search, Close, Business } from '@mui/icons-material';

const EMPTY = { supplierName: '', company: '', phone: '', email: '', address: '' };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supplierAPI.getAll({ page: page - 1, size: 10 });
      setSuppliers(res.data.data.content || []);
      setTotal(res.data.data.totalPages || 0);
    } catch { toast.error('Failed to load suppliers'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const openAdd = () => { setForm(EMPTY); setDialog('add'); };
  const openEdit = (s) => { setSelected(s); setForm(s); setDialog('edit'); };
  const openDelete = (s) => { setSelected(s); setDialog('delete'); };
  const close = () => { setDialog(null); setSelected(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (dialog === 'add') await supplierAPI.create(form);
      else await supplierAPI.update(selected.id, form);
      toast.success(dialog === 'add' ? 'Supplier added!' : 'Supplier updated!');
      close(); fetchSuppliers();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await supplierAPI.delete(selected.id);
      toast.success('Supplier deleted');
      close(); fetchSuppliers();
    } catch { toast.error('Delete failed'); }
    finally { setSaving(false); }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const filtered = search
    ? suppliers.filter(s => s.supplierName?.toLowerCase().includes(search.toLowerCase()) || s.company?.toLowerCase().includes(search.toLowerCase()))
    : suppliers;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">Manage medicine suppliers and vendors</p>
        </div>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd} sx={{ borderRadius: 2, px: 3 }}>
          Add Supplier
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
          <input placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Supplier Name</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}><CircularProgress size={28} /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                <Business sx={{ fontSize: 48, opacity: 0.3 }} /><br />No suppliers found
              </td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id}>
                <td style={{ color: '#9CA3AF' }}>{(page - 1) * 10 + i + 1}</td>
                <td><div style={{ fontWeight: 600 }}>{s.supplierName}</div></td>
                <td>{s.company}</td>
                <td style={{ fontSize: '13px' }}>{s.phone}</td>
                <td style={{ fontSize: '13px', color: '#1565C0' }}>{s.email}</td>
                <td><Chip label={s.active ? 'Active' : 'Inactive'} color={s.active ? 'success' : 'default'} size="small" /></td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(s)} sx={{ color: '#1565C0' }}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => openDelete(s)} sx={{ color: '#C62828' }}><Delete fontSize="small" /></IconButton></Tooltip>
                  </div>
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

      <Dialog open={dialog === 'add' || dialog === 'edit'} onClose={close} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {dialog === 'add' ? 'Add Supplier' : 'Edit Supplier'}
          <IconButton onClick={close} sx={{ position: 'absolute', right: 8, top: 8 }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', pt: 1, paddingTop: '8px' }}>
            <TextField label="Supplier Name *" value={form.supplierName} onChange={set('supplierName')} fullWidth />
            <TextField label="Company *" value={form.company} onChange={set('company')} fullWidth />
            <TextField label="Phone *" value={form.phone} onChange={set('phone')} fullWidth />
            <TextField label="Email *" type="email" value={form.email} onChange={set('email')} fullWidth />
            <TextField label="Address" value={form.address} onChange={set('address')} fullWidth multiline rows={2} />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={close}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === 'delete'} onClose={close} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <p>Delete supplier <strong>{selected?.supplierName}</strong>?</p>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={close}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={saving}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
