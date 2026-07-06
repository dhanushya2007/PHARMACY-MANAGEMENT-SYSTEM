import React, { useEffect, useState, useCallback } from 'react';
import { medicineAPI, supplierAPI } from '../../api';
import { toast } from 'react-toastify';
import {
  Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, Pagination, CircularProgress, Tooltip
} from '@mui/material';
import {
  Add, Edit, Delete, Search, FilterList, Close, Medication
} from '@mui/icons-material';

const EMPTY_MEDICINE = {
  medicineName: '', genericName: '', category: '', brand: '',
  batchNumber: '', manufacturer: '', manufacturingDate: '',
  expiryDate: '', purchasePrice: '', sellingPrice: '',
  quantity: '', minimumStock: 10, description: '', supplierId: ''
};

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null); // 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_MEDICINE);
  const [saving, setSaving] = useState(false);
  const PAGE_SIZE = 10;

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await medicineAPI.getAll({ search, category: category || undefined, page: page - 1, size: PAGE_SIZE });
      setMedicines(res.data.data.content);
      setTotal(res.data.data.totalPages);
    } catch { toast.error('Failed to load medicines'); }
    finally { setLoading(false); }
  }, [search, category, page]);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  useEffect(() => {
    medicineAPI.getCategories().then(r => setCategories(r.data.data));
    supplierAPI.getAll({ page: 0, size: 100 }).then(r => setSuppliers(r.data.data.content || []));
  }, []);

  const openAdd = () => { setForm(EMPTY_MEDICINE); setDialog('add'); };
  const openEdit = (m) => {
    setSelected(m);
    setForm({ ...m, supplierId: m.supplierId || '' });
    setDialog('edit');
  };
  const openDelete = (m) => { setSelected(m); setDialog('delete'); };
  const closeDialog = () => { setDialog(null); setSelected(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (dialog === 'add') {
        await medicineAPI.create(form);
        toast.success('Medicine added successfully!');
      } else {
        await medicineAPI.update(selected.id, form);
        toast.success('Medicine updated!');
      }
      closeDialog();
      fetchMedicines();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await medicineAPI.delete(selected.id);
      toast.success('Medicine deleted');
      closeDialog();
      fetchMedicines();
    } catch { toast.error('Delete failed'); }
    finally { setSaving(false); }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const getStockBadge = (m) => {
    if (m.quantity === 0) return <span className="badge badge-error">Out of Stock</span>;
    if (m.quantity <= m.minimumStock) return <span className="badge badge-warning">Low Stock</span>;
    return <span className="badge badge-success">In Stock</span>;
  };

  const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date();

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Medicines</h1>
          <p className="page-subtitle">Manage your medicine inventory</p>
        </div>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd} sx={{ borderRadius: 2, px: 3 }}>
          Add Medicine
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '240px' }}>
          <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
          <input
            placeholder="Search medicine name, generic name, batch..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select value={category} label="Category" onChange={e => { setCategory(e.target.value); setPage(1); }}>
            <MenuItem value="">All Categories</MenuItem>
            {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Medicine Name</th>
              <th>Category</th>
              <th>Batch</th>
              <th>Expiry</th>
              <th>Selling Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                <CircularProgress size={32} />
              </td></tr>
            ) : medicines.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                <Medication sx={{ fontSize: 48, opacity: 0.3 }} /><br />No medicines found
              </td></tr>
            ) : medicines.map((m, i) => (
              <tr key={m.id}>
                <td style={{ color: '#9CA3AF' }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{m.medicineName}</div>
                  {m.genericName && <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{m.genericName}</div>}
                </td>
                <td><Chip label={m.category} size="small" sx={{ fontSize: '11px' }} /></td>
                <td style={{ fontSize: '12px', color: '#6B7280' }}>{m.batchNumber || '—'}</td>
                <td>
                  <span style={{ color: isExpired(m.expiryDate) ? '#C62828' : 'inherit', fontSize: '13px', fontWeight: isExpired(m.expiryDate) ? 600 : 400 }}>
                    {m.expiryDate || '—'}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>₹{Number(m.sellingPrice).toFixed(2)}</td>
                <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                <td>{getStockBadge(m)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(m)} sx={{ color: '#1565C0' }}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => openDelete(m)} sx={{ color: '#C62828' }}><Delete fontSize="small" /></IconButton></Tooltip>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialog === 'add' || dialog === 'edit'} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {dialog === 'add' ? 'Add New Medicine' : 'Edit Medicine'}
          <IconButton onClick={closeDialog} sx={{ position: 'absolute', right: 8, top: 8 }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '8px' }}>
            <TextField label="Medicine Name *" value={form.medicineName} onChange={set('medicineName')} fullWidth />
            <TextField label="Generic Name" value={form.genericName} onChange={set('genericName')} fullWidth />
            <TextField label="Category *" value={form.category} onChange={set('category')} fullWidth />
            <TextField label="Brand" value={form.brand} onChange={set('brand')} fullWidth />
            <TextField label="Batch Number" value={form.batchNumber} onChange={set('batchNumber')} fullWidth />
            <TextField label="Manufacturer *" value={form.manufacturer} onChange={set('manufacturer')} fullWidth />
            <TextField label="Manufacturing Date" type="date" value={form.manufacturingDate} onChange={set('manufacturingDate')} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Expiry Date *" type="date" value={form.expiryDate} onChange={set('expiryDate')} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Purchase Price (₹) *" type="number" value={form.purchasePrice} onChange={set('purchasePrice')} fullWidth />
            <TextField label="Selling Price (₹) *" type="number" value={form.sellingPrice} onChange={set('sellingPrice')} fullWidth />
            <TextField label="Quantity *" type="number" value={form.quantity} onChange={set('quantity')} fullWidth />
            <TextField label="Minimum Stock" type="number" value={form.minimumStock} onChange={set('minimumStock')} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Supplier</InputLabel>
              <Select value={form.supplierId} label="Supplier" onChange={set('supplierId')}>
                <MenuItem value="">None</MenuItem>
                {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.supplierName}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Description" value={form.description} onChange={set('description')} fullWidth multiline rows={2} />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : (dialog === 'add' ? 'Add Medicine' : 'Save Changes')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={dialog === 'delete'} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <p style={{ color: '#6B7280' }}>
            Are you sure you want to delete <strong>{selected?.medicineName}</strong>? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
