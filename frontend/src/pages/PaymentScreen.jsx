import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { billAPI } from '../services/api';
import { getText, getBilingual } from '../utils/translations';
import { Printer, CheckCircle, CreditCard, Banknote, QrCode } from 'lucide-react';
import QRCode from 'qrcode.react';

export default function PaymentScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const printRef = useRef();
  const [language, setLanguage] = useState('en');

  const { cart } = location.state || { cart: [] };
  
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [billSaved, setBillSaved] = useState(false);
  const [billData, setBillData] = useState(null);
  const [printError, setPrintError] = useState(null);

  if (cart.length === 0) {
    navigate('/billing');
    return null;
  }

  // Calculate display total (backend will recalculate)
  const displayTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePaymentConfirm = async () => {
    try {
      setIsSaving(true);
      setPrintError(null);

      // Prepare bill data for backend
      const billPayload = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentMode,
      };

      // Create bill via backend API - backend calculates totals
      const response = await billAPI.createBill(billPayload);
      
      // Store backend-calculated bill data
      setBillData(response.bill);
      setBillSaved(true);
      
      // Auto print
      setTimeout(() => handlePrint(), 500);
    } catch (error) {
      console.error('Failed to save bill:', error);
      alert(error.message || `${getText('Failed to save', language)} / சேமிக்க தவறிவிட்டது. ${getText('Try again', language)}.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setPrintError(null);

    try {
      window.print();
      setIsPrinting(false);
    } catch (error) {
      setIsPrinting(false);
      setPrintError(`${getText('Printing failed', language)} / அச்சிடல் தோல்வி. ${getText('Try again', language)}.`);
    }
  };

  const handleNewBill = () => {
    navigate('/billing');
  };

  const paymentModes = [
    { value: 'CASH', label: getText('CASH', language), icon: Banknote },
    { value: 'CARD', label: getText('CARD', language), icon: CreditCard },
    { value: 'UPI', label: getText('UPI', language), icon: QrCode },
  ];

  return (
    <div style={styles.container}>
      {!billSaved ? (
        <div style={styles.paymentSection}>
          <h1 style={styles.title}>{getText('Payment', language)}</h1>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>{getText('Select Payment Mode', language)}</h2>
            <div style={styles.paymentModes}>
              {paymentModes.map(mode => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.value}
                    onClick={() => setPaymentMode(mode.value)}
                    style={{
                      ...styles.paymentModeBtn,
                      ...(paymentMode === mode.value ? styles.paymentModeBtnActive : {})
                    }}
                  >
                    <Icon size={32} />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMode === 'UPI' && (
              <div style={styles.qrSection}>
                <p style={styles.qrLabel}>Scan to Pay</p>
                <QRCode value={`upi://pay?pa=merchant@upi&pn=Senthur&am=${displayTotal}&cu=INR`} size={200} />
              </div>
            )}

            <div style={styles.summary}>
              <div style={styles.summaryRow}>
                <span>Items:</span>
                <span>{cart.length}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Total Amount:</span>
                <span style={styles.totalAmount}>₹{displayTotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handlePaymentConfirm} 
              style={styles.confirmBtn}
              disabled={isSaving}
            >
              {isSaving ? getText('Saving...', language) : getText('Confirm Payment', language)}
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.successSection}>
          <CheckCircle size={64} color="#10b981" />
          <h1 style={styles.successTitle}>{getText('Payment Successful', language)}!</h1>
          <p style={styles.billNumberText}>{getText('Bill Number', language)}: {billData?.billNumber}</p>

          {printError && (
            <div style={styles.errorBox}>
              <p>{printError}</p>
              <button onClick={handlePrint} style={styles.retryBtn}>
                {getText('Retry Print', language)}
              </button>
            </div>
          )}

          <div style={styles.actions}>
            <button onClick={handlePrint} style={styles.printBtn} disabled={isPrinting}>
              <Printer size={20} />
              {isPrinting ? getText('Printing', language) + '...' : getText('Print Bill', language)}
            </button>
            <button onClick={handleNewBill} style={styles.newBillBtn}>
              {getText('New Bill', language)}
            </button>
          </div>
        </div>
      )}

      {/* Print Template */}
      <div ref={printRef} className="print-area" style={styles.printArea}>
        <div style={styles.printContent}>
          <div style={styles.printHeader}>
            <h2>Senthur Billing</h2>
            <p>Shop Address Line 1</p>
            <p>Shop Address Line 2</p>
            <p>Phone: 1234567890</p>
          </div>

          <div style={styles.printInfo}>
            <p>Bill No: {billData?.billNumber}</p>
            <p>Date: {billData ? new Date(billData.createdAt).toLocaleString() : new Date().toLocaleString()}</p>
            <p>Cashier: {user.name}</p>
            <p>Payment: {paymentMode}</p>
          </div>

          <table style={styles.printTable}>
            <thead>
              <tr>
                <th style={styles.printTh}>Item</th>
                <th style={styles.printTh}>Qty</th>
                <th style={styles.printTh}>Price</th>
                <th style={styles.printTh}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(billData?.items || cart).map((item, index) => (
                <tr key={index}>
                  <td style={styles.printTd}>
                    {item.name}<br/>
                    <span className="tamil-text" style={styles.tamilText}>{item.nameTamil}</span>
                  </td>
                  <td style={styles.printTd}>{item.quantity}</td>
                  <td style={styles.printTd}>₹{item.price?.toFixed(2)}</td>
                  <td style={styles.printTd}>₹{item.subtotal?.toFixed(2) || (item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.printTotal}>
            <strong>Total: ₹{billData?.total?.toFixed(2) || displayTotal.toFixed(2)}</strong>
          </div>

          <div style={styles.printFooter}>
            <p>Thank you for your business!</p>
            <p>Visit again!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  paymentSection: {},
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  paymentModes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  paymentModeBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1.5rem',
    border: '2px solid #e5e7eb',
    backgroundColor: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  paymentModeBtnActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '2rem',
  },
  qrLabel: {
    marginBottom: '1rem',
    fontSize: '16px',
    fontWeight: '500',
  },
  summary: {
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    fontSize: '16px',
  },
  totalAmount: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2563eb',
  },
  confirmBtn: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  successSection: {
    textAlign: 'center',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '3rem',
  },
  successTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginTop: '1rem',
    color: '#10b981',
  },
  billNumberText: {
    fontSize: '18px',
    color: '#6b7280',
    marginTop: '1rem',
    marginBottom: '2rem',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    color: '#991b1b',
  },
  retryBtn: {
    marginTop: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  printBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  newBillBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  printArea: {
    display: 'none',
  },
  printContent: {
    padding: '20px',
    fontFamily: 'monospace',
    width: '80mm',
  },
  printHeader: {
    textAlign: 'center',
    borderBottom: '1px dashed black',
    paddingBottom: '10px',
    marginBottom: '10px',
  },
  printInfo: {
    fontSize: '12px',
    marginBottom: '10px',
    borderBottom: '1px dashed black',
    paddingBottom: '10px',
  },
  printTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    marginBottom: '10px',
  },
  printTh: {
    borderBottom: '1px solid black',
    padding: '5px',
    textAlign: 'left',
  },
  printTd: {
    padding: '5px',
    borderBottom: '1px dashed black',
  },
  tamilText: {
    fontSize: '10px',
    color: '#666',
  },
  printTotal: {
    textAlign: 'right',
    fontSize: '16px',
    borderTop: '2px solid black',
    paddingTop: '10px',
    marginTop: '10px',
  },
  printFooter: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '12px',
    borderTop: '1px dashed black',
    paddingTop: '10px',
  },
};
