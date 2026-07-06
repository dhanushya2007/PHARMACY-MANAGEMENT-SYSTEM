import React, { useState, useEffect } from 'react';
import { medicineAPI } from '../../api';
import { toast } from 'react-toastify';
import { TextField, CircularProgress, Chip, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Search, Medication } from '@mui/icons-material';

export default function MedicineSearchPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    medicineAPI.getCategories().then(r => setCategories(r.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    medicineAPI.getAll({ search, category: category || undefined, size: 20 })
      .then(r => setMedicines(r.data.data.content || []))
      .catch(() => toast.error('Search failed'))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Search Medicines</h1>
          <p className="page-subtitle">Check availability and pricing of medicines</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search sx={{ color: '#9CA3AF' }} />
          <input
            placeholder="Search by name, generic name, brand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select value={category} label="Category" onChange={e => setCategory(e.target.value)}>
            <MenuItem value="">All Categories</MenuItem>
            {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><CircularProgress /></div>
      ) : medicines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
          <Medication sx={{ fontSize: 48, opacity: 0.3 }} />
          <p>No medicines match your search criteria</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {medicines.map(m => (
            <div key={m.id} className="card" style={{ border: m.quantity === 0 ? '1px dashed #C62828' : '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <h4 style={{ fontWeight: 700, fontSize: '15px' }}>{m.medicineName}</h4>
                <Chip label={m.category} size="small" sx={{ fontSize: '10px' }} />
              </div>
              {m.genericName && <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>{m.genericName}</p>}
              <p style={{ fontSize: '13px', color: '#374151', marginBottom: '12px' }}>{m.description || 'No description available.'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '16px', color: '#2E7D32' }}>₹{Number(m.sellingPrice).toFixed(2)}</span>
                {m.quantity === 0 ? (
                  <span className="badge badge-error">Out of Stock</span>
                ) : (
                  <span className="badge badge-success">Available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
