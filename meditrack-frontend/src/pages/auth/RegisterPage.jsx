import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api';
import { toast } from 'react-toastify';
import {
  TextField, Button, CircularProgress, InputAdornment,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Person, Email, Lock, Phone, LocalPharmacy } from '@mui/icons-material';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    address: '', role: 'CUSTOMER'
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      toast.success('Account created successfully!');
      navigate('/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #2E7D32, #388E3C)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <LocalPharmacy sx={{ color: 'white', fontSize: 28 }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1A1A2E' }}>Create Account</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Join MediTrack Pharmacy System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <TextField
              fullWidth
              label="Full Name"
              value={form.name}
              onChange={set('name')}
              required
              InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#9CA3AF', fontSize: 20 }} /></InputAdornment> }}
              sx={{ gridColumn: 'span 2' }}
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#9CA3AF', fontSize: 20 }} /></InputAdornment> }}
              sx={{ gridColumn: 'span 2' }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={form.password}
              onChange={set('password')}
              required
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#9CA3AF', fontSize: 20 }} /></InputAdornment> }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={form.phone}
              onChange={set('phone')}
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#9CA3AF', fontSize: 20 }} /></InputAdornment> }}
            />
            <TextField
              fullWidth
              label="Address"
              value={form.address}
              onChange={set('address')}
              multiline
              rows={2}
              sx={{ gridColumn: 'span 2' }}
            />
            <FormControl fullWidth sx={{ gridColumn: 'span 2' }}>
              <InputLabel>Account Type</InputLabel>
              <Select value={form.role} label="Account Type" onChange={set('role')}>
                <MenuItem value="CUSTOMER">Customer</MenuItem>
              </Select>
            </FormControl>
          </div>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 2, py: 1.5,
              background: 'linear-gradient(135deg, #2E7D32, #388E3C)',
              fontWeight: 700,
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Create Account'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6B7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1565C0', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
