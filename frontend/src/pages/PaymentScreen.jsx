import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { settingsAPI, billAPI } from '../services/api';
import { Printer, CheckCircle, CreditCard, Banknote, QrCode, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode.react';

export default function PaymentScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { cart } = location.state || { cart: [] };

  const [paymentMode, setPaymentMode] = useState('CASH');
  const [isSaving, setIsSaving]       = useState(false);
  const [billSaved, setBillSaved]     = useState(false);
  const [billData, setBillData]       = useState(null);
  const [error, setError]             = useState('');

  if (!cart || cart.length === 0) {
    navigate('/billing');
    return null;
  }

  // Pre-bill estimates (backend recalculates definitively)
  const displaySubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleConfirmPayment = async () => {
    try {
      setIsSaving(true);
      setError('');
      const response = await billAPI.createBill({
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
        paymentMode,
      });
      setBillData(response.bill);
      setBillSaved(true);
      setTimeout(() => window.print(), 600);
    } catch (err) {
      setError(err.message || 'Failed to save bill. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const bill = billData;

  return (
    <div style={s.container}>

      {/* ── Payment Selection ── */}
      {!billSaved && (
        <div style={s.paySection}>
          <div style={s.payHeader}>
            <h1 style={s.pageTitle}>💳 Confirm Payment</h1>
            <div style={s.orderBadge}>{cart.length} item{cart.length !== 1 ? 's' : ''}</div>
          </div>

          {/* Mode selector */}
          <div style={s.modeGrid}>
            {[
              { value: 'CASH', icon: Banknote, label: 'Cash', color: '#10b981' },
              { value: 'CARD', icon: CreditCard, label: 'Card', color: '#3b82f6' },
              { value: 'UPI',  icon: QrCode,    label: 'UPI',  color: '#8b5cf6' },
            ].map(m => {
              const Icon = m.icon;
              const active = paymentMode === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => setPaymentMode(m.value)}
                  style={{
                    ...s.modeBtn,
                    borderColor: active ? m.color : '#e2e8f0',
                    background: active ? `${m.color}12` : 'white',
                    boxShadow: active ? `0 0 0 3px ${m.color}30` : undefined,
                  }}
                >
                  <Icon size={32} color={active ? m.color : '#94a3b8'} />
                  <span style={{ fontWeight: 700, color: active ? m.color : '#64748b' }}>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* UPI QR */}
          {paymentMode === 'UPI' && (
            <div style={s.qrBox}>
              <QRCode
                value={`upi://pay?pa=smartenergy@upi&pn=SmartEnergySolutions&am=${displaySubtotal.toFixed(2)}&cu=INR`}
                size={180}
              />
              <p style={s.qrNote}>Scan to pay ₹{displaySubtotal.toFixed(2)}</p>
            </div>
          )}

          {/* Order summary */}
          <div style={s.summaryCard}>
            <h3 style={s.summaryTitle}>Order Summary</h3>
            {cart.map((item, i) => (
              <div key={i} style={s.summaryRow}>
                <span>{item.name} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div style={s.summaryDivider} />
            <div style={{ ...s.summaryRow, fontSize: '22px', fontWeight: 800, color: '#10b981' }}>
              <span>Total</span>
              <span>₹{displaySubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {error && (
            <div style={s.errorBox}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button onClick={handleConfirmPayment} disabled={isSaving} style={s.confirmBtn}>
            {isSaving ? '⏳ Processing…' : `✅ Confirm ${paymentMode} Payment — ₹${displaySubtotal.toFixed(2)}`}
          </button>
        </div>
      )}

      {/* ── Success Screen ── */}
      {billSaved && bill && (
        <div style={s.successSection}>
          <CheckCircle size={72} color="#10b981" />
          <h1 style={s.successTitle}>Payment Successful!</h1>
          <p style={s.billNo}>Bill # {bill.billNumber}</p>
          <div style={{ ...s.summaryCard, maxWidth: '400px', textAlign: 'center', margin: '1.5rem auto' }}>
            <div style={s.summaryRow}><span>Subtotal</span><span>₹{bill.subtotal?.toFixed(2)}</span></div>
            {bill.totalTax > 0 && (
              <div style={s.summaryRow}>
                <span>GST (CGST+SGST)</span>
                <span>₹{(bill.totalTax || 0).toFixed(2)}</span>
              </div>
            )}
            {bill.discountAmount > 0 && (
              <div style={{ ...s.summaryRow, color: '#ef4444' }}>
                <span>Discount</span>
                <span>-₹{bill.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={s.summaryDivider} />
            <div style={{ ...s.summaryRow, fontSize: '20px', fontWeight: 800, color: '#10b981' }}>
              <span>Total Paid</span>
              <span>₹{bill.total?.toFixed(2)}</span>
            </div>
          </div>
          <div style={s.successActions}>
            <button onClick={() => window.print()} style={s.printBtn}>
              <Printer size={18} /> Print Receipt
            </button>
            <button onClick={() => navigate('/billing')} style={s.newBillBtn}>
              New Bill →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          THERMAL RECEIPT — 80mm — Print only
          ══════════════════════════════════════════════ */}
      <div className="print-only receipt-80mm">
        <div className="receipt-header">
          <div className="receipt-logo">⚡</div>
          <div className="receipt-shop-name">Smart Energy Solutions</div>
          <div className="receipt-tagline">CCTV | Solar | Inverters | Batteries</div>
          <div className="receipt-divider">{'─'.repeat(32)}</div>
        </div>

        <div className="receipt-meta">
          <div><b>Bill #</b> {bill?.billNumber || '—'}</div>
          <div><b>Date:</b> {bill ? new Date(bill.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}</div>
          <div><b>Time:</b> {bill ? new Date(bill.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
          <div><b>Cashier:</b> {user?.name}</div>
          <div><b>Payment:</b> {paymentMode}</div>
        </div>

        <div className="receipt-divider">{'─'.repeat(32)}</div>

        {/* Items */}
        <table className="receipt-table">
          <thead>
            <tr>
              <th className="receipt-th item-col">Item</th>
              <th className="receipt-th">Qty</th>
              <th className="receipt-th">Rate</th>
              <th className="receipt-th">Amt</th>
            </tr>
          </thead>
          <tbody>
            {(bill?.items || cart).map((item, i) => (
              <tr key={i}>
                <td className="receipt-td item-col">
                  {item.name}
                  {item.nameTamil && <div className="receipt-tamil">{item.nameTamil}</div>}
                  {item.hsnCode && <div className="receipt-hsn">HSN: {item.hsnCode}</div>}
                </td>
                <td className="receipt-td">{item.quantity}</td>
                <td className="receipt-td">₹{Number(item.price).toFixed(0)}</td>
                <td className="receipt-td">₹{(item.subtotal || item.price * item.quantity).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="receipt-divider">{'─'.repeat(32)}</div>

        {/* Totals */}
        <div className="receipt-totals">
          <div className="receipt-row"><span>Subtotal</span><span>₹{(bill?.subtotal || displaySubtotal).toFixed(2)}</span></div>
          {bill?.totalTax > 0 && <>
            <div className="receipt-row tax-row"><span>  CGST</span><span>₹{(bill.totalCgst || 0).toFixed(2)}</span></div>
            <div className="receipt-row tax-row"><span>  SGST</span><span>₹{(bill.totalSgst || 0).toFixed(2)}</span></div>
            <div className="receipt-row"><span>Total GST</span><span>₹{(bill.totalTax || 0).toFixed(2)}</span></div>
          </>}
          {(bill?.discountAmount > 0) && (
            <div className="receipt-row discount-row"><span>Discount</span><span>-₹{(bill.discountAmount || 0).toFixed(2)}</span></div>
          )}
          <div className="receipt-divider">{'═'.repeat(32)}</div>
          <div className="receipt-row total-row">
            <span><b>TOTAL</b></span>
            <span><b>₹{(bill?.total || displaySubtotal).toFixed(2)}</b></span>
          </div>
        </div>

        {/* GST Breakup table */}
        {bill?.totalTax > 0 && (
          <>
            <div className="receipt-divider">{'─'.repeat(32)}</div>
            <div className="receipt-gst-title">GST Breakup</div>
            <table className="receipt-table">
              <thead>
                <tr>
                  <th className="receipt-th">HSN</th>
                  <th className="receipt-th">Taxable</th>
                  <th className="receipt-th">CGST</th>
                  <th className="receipt-th">SGST</th>
                </tr>
              </thead>
              <tbody>
                {(bill?.items || []).filter(i => i.gstRate > 0).map((item, i) => (
                  <tr key={i}>
                    <td className="receipt-td">{item.hsnCode || '—'}</td>
                    <td className="receipt-td">₹{(item.taxableAmount || 0).toFixed(0)}</td>
                    <td className="receipt-td">₹{(item.cgst || 0).toFixed(0)}</td>
                    <td className="receipt-td">₹{(item.sgst || 0).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Footer */}
        <div className="receipt-divider">{'─'.repeat(32)}</div>
        <div className="receipt-footer">
          <div>Thank you for shopping!</div>
          <div>Visit: Smart Energy Solutions</div>
          <div>Ph: 9876543210</div>
          <div className="receipt-divider">{'─'.repeat(32)}</div>
          <div>* Prices are GST inclusive *</div>
        </div>
      </div>
    </div>
  );
}

const s = {
  container: { maxWidth: '700px', margin: '0 auto' },

  paySection: {},
  payHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  pageTitle: { fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 },
  orderBadge: {
    background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', color: 'white',
    padding: '0.3rem 0.875rem', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
  },

  modeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' },
  modeBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '0.625rem', padding: '1.5rem 1rem',
    border: '2px solid', borderRadius: '14px', cursor: 'pointer',
    transition: 'all 0.15s', fontSize: '14px', fontWeight: 600,
  },

  qrBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: '#f8fafc', borderRadius: '16px', padding: '2rem',
    border: '1.5px solid #e2e8f0', marginBottom: '1.5rem',
  },
  qrNote: { marginTop: '0.875rem', color: '#64748b', fontSize: '13px' },

  summaryCard: {
    background: 'white', borderRadius: '16px', padding: '1.25rem',
    border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    marginBottom: '1.5rem',
  },
  summaryTitle: { fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '0.875rem' },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.375rem 0', fontSize: '14px', color: '#374151',
  },
  summaryDivider: { height: '1px', background: '#e2e8f0', margin: '0.625rem 0' },

  errorBox: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: '#fee2e2', color: '#991b1b',
    padding: '0.875rem 1rem', borderRadius: '10px',
    fontSize: '13px', fontWeight: 500, marginBottom: '1rem',
    border: '1px solid #fecaca',
  },

  confirmBtn: {
    width: '100%', padding: '1rem', border: 'none', borderRadius: '14px',
    background: 'linear-gradient(135deg,#10b981,#059669)',
    color: 'white', fontSize: '16px', fontWeight: 800, cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
  },

  successSection: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'white', borderRadius: '20px',
    padding: '3rem 2rem', textAlign: 'center',
    border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  successTitle: { fontSize: '28px', fontWeight: 800, color: '#10b981', margin: '1rem 0 0.25rem' },
  billNo: { fontSize: '16px', color: '#64748b', marginBottom: 0 },
  successActions: { display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' },
  printBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.875rem 1.5rem',
    background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', color: 'white',
    border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
  },
  newBillBtn: {
    padding: '0.875rem 1.5rem',
    background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white',
    border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
  },
};
