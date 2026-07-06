import React, { useState, useEffect } from 'react';
import { medicineAPI, saleAPI, reportAPI } from '../../api';
import { toast } from 'react-toastify';
import {
  Button, TextField, IconButton, MenuItem, Select, FormControl,
  InputLabel, Card, CircularProgress, Tooltip
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCart, Search, Receipt } from '@mui/icons-material';

export default function NewSalePage() {
  const [search, setSearch] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(18); // Default GST 18%
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (search.trim().length > 1) {
      setLoading(true);
      medicineAPI.getAll({ search, size: 5 })
        .then(r => setMedicines(r.data.data.content || []))
        .finally(() => setLoading(false));
    } else {
      setMedicines([]);
    }
  }, [search]);

  const addToCart = (med) => {
    if (med.quantity === 0) { toast.error('Out of stock'); return; }
    const existing = cart.find(item => item.id === med.id);
    if (existing) {
      if (existing.qty >= med.quantity) { toast.error('Exceeds available stock'); return; }
      setCart(cart.map(item => item.id === med.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...med, qty: 1 }]);
    }
    toast.success(`${med.medicineName} added to bill`);
  };

  const updateQty = (id, change, maxStock) => {
    const item = cart.find(i => i.id === id);
    const nextQty = item.qty + change;
    if (nextQty <= 0) {
      setCart(cart.filter(i => i.id !== id));
    } else if (nextQty > maxStock) {
      toast.error('Exceeds available stock');
    } else {
      setCart(cart.map(i => i.id === id ? { ...i, qty: nextQty } : i));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);
  const calculateDiscount = () => (calculateSubtotal() * discountPercent) / 100;
  const calculateTax = () => ((calculateSubtotal() - calculateDiscount()) * taxPercent) / 100;
  const calculateTotal = () => (calculateSubtotal() - calculateDiscount()) + calculateTax();

  const handleCheckout = async () => {
    if (cart.length === 0) { toast.warning('Cart is empty'); return; }
    setSubmitting(true);
    try {
      const items = cart.map(item => ({ medicineId: item.id, quantity: item.qty }));
      const payload = {
        customerName: customerName.trim() || 'Walk-in Customer',
        items,
        paymentMethod,
        discountPercent,
        taxPercent
      };

      const res = await saleAPI.create(payload);
      toast.success('Invoice generated successfully!');

      // Auto download PDF
      const pdfRes = await reportAPI.invoicePdf(res.data.data.id);
      const file = new Blob([pdfRes.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const windowVal = window.open(fileURL);
      if (!windowVal) {
        // Fallback standard trigger download
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `invoice-${res.data.data.invoiceNumber}.pdf`;
        a.click();
      }

      // Reset cart
      setCart([]);
      setCustomerName('');
      setSearch('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Sale / Billing</h1>
          <p className="page-subtitle">Add items, apply tax, and checkout</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        <div>
          {/* Search Medicine */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 className="card-title" style={{ marginBottom: '14px' }}>🔍 Search Medicine</h3>
            <div className="search-bar" style={{ marginBottom: '14px' }}>
              <Search sx={{ color: '#9CA3AF' }} />
              <input
                placeholder="Type medicine name to search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '10px' }}><CircularProgress size={24} /></div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {medicines.map(m => (
                <div key={m.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: '#F8FAFF', borderRadius: '8px',
                  border: '1px solid #E3F2FD'
                }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{m.medicineName}</span>
                    <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '10px' }}>In Stock: {m.quantity}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 700 }}>₹{m.sellingPrice}</span>
                    <Button size="small" variant="contained" onClick={() => addToCart(m)} disabled={m.quantity === 0}>
                      {m.quantity === 0 ? 'Out of Stock' : 'Add'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Table */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>🛒 Current Items</h3>
            {cart.length === 0 ? (
              <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '30px' }}>Add medicines to start billing</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.medicineName}</td>
                      <td>₹{item.sellingPrice}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <IconButton size="small" onClick={() => updateQty(item.id, -1, item.quantity)}><Remove fontSize="small" /></IconButton>
                          <strong>{item.qty}</strong>
                          <IconButton size="small" onClick={() => updateQty(item.id, 1, item.quantity)}><Add fontSize="small" /></IconButton>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{(item.sellingPrice * item.qty).toFixed(2)}</td>
                      <td>
                        <IconButton size="small" color="error" onClick={() => removeFromCart(item.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Invoice Summary Panel */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="card-title" style={{ marginBottom: '20px' }}>🧾 Billing Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label="Customer Name"
              placeholder="Walk-in Customer"
              fullWidth
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select value={paymentMethod} label="Payment Method" onChange={e => setPaymentMethod(e.target.value)}>
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="CARD">Card</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="ONLINE">Online</MenuItem>
              </Select>
            </FormControl>

            <div style={{ display: 'flex', gap: '10px' }}>
              <TextField
                label="Discount (%)"
                type="number"
                value={discountPercent}
                onChange={e => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                fullWidth
              />
              <TextField
                label="GST Tax (%)"
                type="number"
                value={taxPercent}
                onChange={e => setTaxPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                fullWidth
              />
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #E5E7EB', margin: '8px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Subtotal</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Discount</span>
                <span style={{ color: '#C62828' }}>- ₹{calculateDiscount().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Tax (GST)</span>
                <span>₹{calculateTax().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800 }}>
                <span>Grand Total</span>
                <span style={{ color: '#2E7D32' }}>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="contained"
              fullWidth
              size="large"
              color="success"
              startIcon={<Receipt />}
              onClick={handleCheckout}
              disabled={cart.length === 0 || submitting}
              sx={{ mt: 2, py: 1.5, fontSize: '15px', fontWeight: 700 }}
            >
              {submitting ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Generate Invoice'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
