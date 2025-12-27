import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/Layout';
import { getText } from '../utils/translations';
import { Eye, Printer, Search } from 'lucide-react';

export default function BillHistory() {
  const { user, isAdmin } = useAuth();
  const { language } = useLanguage();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [dateFilter, setDateFilter] = useState('TODAY');

  useEffect(() => {
    loadBills();
  }, []);

  useEffect(() => {
    filterBills();
  }, [searchTerm, dateFilter, bills]);

  const loadBills = () => {
    // Mock bills data
    const mockBills = [
      {
        id: 1,
        billNumber: 'BILL-1734960000001',
        items: [
          { name: 'Rice', nameTamil: 'அரிசி', quantity: 2, price: 50 },
          { name: 'Sugar', nameTamil: 'சர்க்கரை', quantity: 1, price: 40 },
        ],
        total: 140,
        paymentMode: 'CASH',
        createdBy: user.id,
        createdByName: user.name,
        createdAt: new Date().toISOString(),
        status: 'PAID',
      },
      {
        id: 2,
        billNumber: 'BILL-1734960000002',
        items: [
          { name: 'Tea', nameTamil: 'தேநீர்', quantity: 1, price: 250 },
          { name: 'Coffee', nameTamil: 'காபி', quantity: 1, price: 350 },
        ],
        total: 600,
        paymentMode: 'UPI',
        createdBy: user.id,
        createdByName: user.name,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'PAID',
      },
    ];

    // Staff can only see their own bills
    const userBills = isAdmin() ? mockBills : mockBills.filter(b => b.createdBy === user.id);
    setBills(userBills);
  };

  const filterBills = () => {
    let filtered = [...bills];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bill =>
        bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.createdByName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateFilter === 'TODAY') {
      filtered = filtered.filter(bill => {
        const billDate = new Date(bill.createdAt);
        billDate.setHours(0, 0, 0, 0);
        return billDate.getTime() === today.getTime();
      });
    }

    setFilteredBills(filtered);
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
  };

  const handlePrintBill = (bill) => {
    setSelectedBill(bill);
    setTimeout(() => window.print(), 500);
  };

  const handleCloseBillDetails = () => {
    setSelectedBill(null);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        {isAdmin() ? getText('All Bills', language) : getText('My Bills', language)}
      </h1>

      <div style={styles.filters}>
        <div style={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder={getText('Search bills', language) + '...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={styles.select}
        >
          <option value="TODAY">{getText('TODAY', language)}</option>
          <option value="ALL">{getText('ALL', language)}</option>
        </select>
      </div>

      <div style={styles.billsGrid}>
        {filteredBills.length === 0 ? (
          <div style={styles.noBills}>{getText('No bills found', language)}</div>
        ) : (
          filteredBills.map(bill => (
            <div key={bill.id} style={styles.billCard}>
              <div style={styles.billHeader}>
                <div style={styles.billNumber}>{bill.billNumber}</div>
                <div style={styles.billStatus}>{bill.status}</div>
              </div>

              <div style={styles.billInfo}>
                <div style={styles.infoRow}>
                  <span>{getText('Date', language)}:</span>
                  <span>{new Date(bill.createdAt).toLocaleString()}</span>
                </div>
                <div style={styles.infoRow}>
                  <span>{getText('Cashier', language)}:</span>
                  <span>{bill.createdByName}</span>
                </div>
                <div style={styles.infoRow}>
                  <span>{getText('items', language)}:</span>
                  <span>{bill.items.length}</span>
                </div>
                <div style={styles.infoRow}>
                  <span>{getText('Payment', language)}:</span>
                  <span>{bill.paymentMode}</span>
                </div>
              </div>

              <div style={styles.billTotal}>
                {getText('Total Amount', language)}: ₹{bill.total}
              </div>

              <div style={styles.billActions}>
                <button onClick={() => handleViewBill(bill)} style={styles.viewBtn}>
                  <Eye size={16} />
                  {getText('View', language)}
                </button>
                <button onClick={() => handlePrintBill(bill)} style={styles.printBtn}>
                  <Printer size={16} />
                  {getText('Print', language)}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Details Modal */}
      {selectedBill && (
        <div style={styles.modal} onClick={handleCloseBillDetails}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Bill Details</h2>
              <button onClick={handleCloseBillDetails} style={styles.closeBtn}>
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailRow}>
                <strong>Bill Number:</strong>
                <span>{selectedBill.billNumber}</span>
              </div>
              <div style={styles.detailRow}>
                <strong>Date:</strong>
                <span>{new Date(selectedBill.createdAt).toLocaleString()}</span>
              </div>
              <div style={styles.detailRow}>
                <strong>Cashier:</strong>
                <span>{selectedBill.createdByName}</span>
              </div>
              <div style={styles.detailRow}>
                <strong>Payment Mode:</strong>
                <span>{selectedBill.paymentMode}</span>
              </div>

              <h3 style={styles.itemsTitle}>Items:</h3>
              <table style={styles.itemsTable}>
                <thead>
                  <tr>
                    <th style={styles.tableTh}>Item</th>
                    <th style={styles.tableTh}>Qty</th>
                    <th style={styles.tableTh}>Price</th>
                    <th style={styles.tableTh}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((item, index) => (
                    <tr key={index}>
                      <td style={styles.tableTd}>
                        {item.name}<br/>
                        <span className="tamil-text" style={styles.tamilText}>
                          {item.nameTamil}
                        </span>
                      </td>
                      <td style={styles.tableTd}>{item.quantity}</td>
                      <td style={styles.tableTd}>₹{item.price}</td>
                      <td style={styles.tableTd}>₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.modalTotal}>
                <strong>Total: ₹{selectedBill.total}</strong>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => handlePrintBill(selectedBill)} style={styles.modalPrintBtn}>
                <Printer size={16} />
                Print Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Area */}
      {selectedBill && (
        <div className="print-area" style={styles.printArea}>
          <div style={styles.printContent}>
            <div style={styles.printHeader}>
              <h2>Senthur Billing</h2>
              <p>Shop Address</p>
            </div>
            <div style={styles.printInfo}>
              <p>Bill: {selectedBill.billNumber}</p>
              <p>Date: {new Date(selectedBill.createdAt).toLocaleString()}</p>
              <p>Cashier: {selectedBill.createdByName}</p>
            </div>
            <table style={styles.printTable}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price}</td>
                    <td>₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.printTotal}>
              <strong>Total: ₹{selectedBill.total}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '2rem',
  },
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  },
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: 'white',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: 'white',
    fontSize: '14px',
  },
  billsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  noBills: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    color: '#6b7280',
  },
  billCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  billHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  billNumber: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
  },
  billStatus: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  billInfo: {
    marginBottom: '1rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    fontSize: '14px',
    color: '#6b7280',
  },
  billTotal: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
  billActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  viewBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  printBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  closeBtn: {
    fontSize: '32px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#6b7280',
  },
  modalBody: {
    padding: '1.5rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    fontSize: '14px',
  },
  itemsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginTop: '1.5rem',
    marginBottom: '1rem',
  },
  itemsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableTh: {
    textAlign: 'left',
    padding: '0.75rem',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: '600',
  },
  tableTd: {
    padding: '0.75rem',
    borderBottom: '1px solid #e5e7eb',
  },
  tamilText: {
    fontSize: '12px',
    color: '#6b7280',
  },
  modalTotal: {
    textAlign: 'right',
    fontSize: '20px',
    fontWeight: 'bold',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '2px solid #e5e7eb',
    color: '#2563eb',
  },
  modalFooter: {
    padding: '1.5rem',
    borderTop: '1px solid #e5e7eb',
  },
  modalPrintBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  printArea: {
    display: 'none',
  },
  printContent: {
    padding: '20px',
    width: '80mm',
  },
  printHeader: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  printInfo: {
    fontSize: '12px',
    marginBottom: '10px',
  },
  printTable: {
    width: '100%',
    fontSize: '12px',
  },
  printTotal: {
    textAlign: 'right',
    fontSize: '16px',
    marginTop: '10px',
  },
};
