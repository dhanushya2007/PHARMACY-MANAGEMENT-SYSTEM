import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api';
import { toast } from 'react-toastify';
import {
  TextField, Button, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, LocalPharmacy } from '@mui/icons-material';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      toast.success(`Welcome back, ${userData.name}!`);
      const path = userData.role === 'ADMIN' ? '/admin/dashboard'
        : userData.role === 'PHARMACIST' ? '/pharmacist/dashboard'
        : '/customer/dashboard';
      navigate(path);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${20 + i * 10}px`,
          height: `${20 + i * 10}px`,
          border: '2px solid rgba(255,255,255,0.1)',
          borderRadius: '50%',
          top: `${10 + i * 15}%`,
          left: `${5 + i * 15}%`,
          animation: `pulse ${2 + i * 0.3}s ease-in-out infinite`,
        }} />
      ))}

      <div className="auth-card fade-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #1565C0, #2E7D32)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(21,101,192,0.3)',
          }}>
            <LocalPharmacy sx={{ color: 'white', fontSize: 32 }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A2E', marginBottom: '6px' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            Sign in to MediTrack Pharmacy System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email sx={{ color: '#9CA3AF' }} /></InputAdornment>
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#9CA3AF' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.5,
                background: 'linear-gradient(135deg, #1565C0, #1E88E5)',
                fontSize: '15px',
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(21,101,192,0.4)',
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Sign In'}
            </Button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6B7280' }}>
          New customer?{' '}
          <Link to="/register" style={{ color: '#1565C0', fontWeight: 600, textDecoration: 'none' }}>
            Create account
          </Link>
        </p>

        {/* Demo credentials */}
        <div style={{
          marginTop: '24px', padding: '14px 16px',
          background: '#F0F7FF', borderRadius: '10px',
          border: '1px solid #BBDEFB'
        }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#1565C0', marginBottom: '6px' }}>
            🔐 Demo Credentials
          </p>
          {[
            { role: 'Admin', email: 'admin@meditrack.com', pass: 'admin123' },
            { role: 'Pharmacist', email: 'pharma@meditrack.com', pass: 'pharma123' },
          ].map(c => (
            <div key={c.role} style={{ fontSize: '11px', color: '#374151', marginBottom: '3px' }}>
              <strong>{c.role}:</strong> {c.email} / {c.pass}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
