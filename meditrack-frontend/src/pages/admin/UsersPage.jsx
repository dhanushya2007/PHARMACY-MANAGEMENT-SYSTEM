import React, { useEffect, useState } from 'react';
import { userAPI } from '../../api';
import { toast } from 'react-toastify';
import { Chip, IconButton, Pagination, CircularProgress, Tooltip, Avatar } from '@mui/material';
import { Block, CheckCircle, Delete, ManageAccounts } from '@mui/icons-material';

const roleColors = { ADMIN: '#1565C0', PHARMACIST: '#2E7D32', CUSTOMER: '#6A1B9A' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ page: page - 1, size: 10 });
      setUsers(res.data.data.content || []);
      setTotal(res.data.data.totalPages || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const toggleStatus = async (id) => {
    try {
      await userAPI.toggleStatus(id);
      toast.success('User status updated');
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await userAPI.delete(id);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage all system users and their roles</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}><CircularProgress size={28} /></td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: roleColors[u.role], fontSize: '13px' }}>
                      {u.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: '13px', color: '#1565C0' }}>{u.email}</td>
                <td style={{ fontSize: '13px' }}>{u.phone || '—'}</td>
                <td>
                  <Chip
                    label={u.role}
                    size="small"
                    sx={{ bgcolor: roleColors[u.role] + '18', color: roleColors[u.role], fontWeight: 700, fontSize: '11px' }}
                  />
                </td>
                <td>
                  <Chip
                    label={u.active ? 'Active' : 'Inactive'}
                    color={u.active ? 'success' : 'default'}
                    size="small"
                  />
                </td>
                <td style={{ fontSize: '12px', color: '#9CA3AF' }}>{u.createdAt?.split('T')[0] || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Tooltip title={u.active ? 'Deactivate' : 'Activate'}>
                      <IconButton size="small" onClick={() => toggleStatus(u.id)} sx={{ color: u.active ? '#C62828' : '#2E7D32' }}>
                        {u.active ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => deleteUser(u.id)} sx={{ color: '#C62828' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
    </div>
  );
}
