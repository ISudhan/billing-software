import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/Layout';
import { getText } from '../utils/translations';
import { reportAPI } from '../services/api';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';

export default function Reports() {
  const { language } = useLanguage();
  const [dateRange, setDateRange] = useState('TODAY');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      let start, end;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (dateRange) {
        case 'TODAY':
          start = today.toISOString().split('T')[0];
          end = today.toISOString().split('T')[0];
          break;
        case 'YESTERDAY':
          const yesterday = new Date(today.getTime() - 86400000);
          start = yesterday.toISOString().split('T')[0];
          end = yesterday.toISOString().split('T')[0];
          break;
        case 'THIS_WEEK':
          const weekAgo = new Date(today.getTime() - 7 * 86400000);
          start = weekAgo.toISOString().split('T')[0];
          end = new Date().toISOString().split('T')[0];
          break;
        case 'THIS_MONTH':
          const monthAgo = new Date(today.getTime() - 30 * 86400000);
          start = monthAgo.toISOString().split('T')[0];
          end = new Date().toISOString().split('T')[0];
          break;
        case 'CUSTOM':
          start = startDate;
          end = endDate;
          break;
        default:
          start = today.toISOString().split('T')[0];
          end = today.toISOString().split('T')[0];
      }

      if (dateRange === 'CUSTOM' && (!start || !end)) {
        return; // Wait for custom dates
      }

      const response = await reportAPI.getDateRangeSales(start, end);
      setReportData(response);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{getText('Reports', language)}</h1>
        <div style={styles.headerControls} className="reports-header-controls">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={styles.select}
          >
            <option value="TODAY">{getText('TODAY', language)}</option>
            <option value="YESTERDAY">{getText('Yesterday', language)}</option>
            <option value="THIS_WEEK">{getText('This Week', language)}</option>
            <option value="THIS_MONTH">{getText('This Month', language)}</option>
            <option value="CUSTOM">{getText('Custom Range', language)}</option>
          </select>

          {dateRange === 'CUSTOM' && (
            <div style={styles.customDateInputs}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.dateInput}
              />
              <span>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.dateInput}
              />
              <button onClick={loadReportData} style={styles.loadBtn}>
                Load
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>{getText('Loading reports...', language)}</div>
        </div>
      )}

      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={loadReportData} style={styles.retryBtn}>
            {getText('Retry', language)}
          </button>
        </div>
      )}

      {!loading && !error && reportData && (
        <>
      {/* Summary Cards */}
      <div style={styles.summaryGrid} className="reports-summary-grid">
        <div style={styles.summaryCard}>
          <div style={{ ...styles.cardIcon, backgroundColor: '#dbeafe' }}>
            <DollarSign size={24} color="#2563eb" />
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardLabel}>Total Sales</div>
            <div style={styles.cardValue}>₹{reportData.totalSales?.toFixed(2) || '0.00'}</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={{ ...styles.cardIcon, backgroundColor: '#d1fae5' }}>
            <ShoppingBag size={24} color="#059669" />
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardLabel}>Total Bills</div>
            <div style={styles.cardValue}>{reportData.totalBills || 0}</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={{ ...styles.cardIcon, backgroundColor: '#fef3c7' }}>
            <TrendingUp size={24} color="#d97706" />
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardLabel}>Avg Bill Value</div>
            <div style={styles.cardValue}>₹{reportData.averageBillValue?.toFixed(2) || '0.00'}</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={{ ...styles.cardIcon, backgroundColor: '#e9d5ff' }}>
            <BarChart3 size={24} color="#9333ea" />
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardLabel}>Total Items</div>
            <div style={styles.cardValue}>{reportData.totalItems || 0}</div>
          </div>
        </div>
      </div>

      <div style={styles.reportsGrid} className="reports-grid">
        {/* Payment Breakdown */}
        <div style={styles.reportCard}>
          <h2 style={styles.reportTitle}>Payment Method Breakdown</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Payment Mode</th>
                <th style={styles.th}>Count</th>
                <th style={styles.th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(reportData.paymentBreakdown || []).map((payment, index) => (
                <tr key={index}>
                  <td style={styles.td}>{payment._id}</td>
                  <td style={styles.td}>{payment.count}</td>
                  <td style={styles.td}>₹{payment.amount?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
              <tr style={styles.totalRow}>
                <td style={styles.td}><strong>Total</strong></td>
                <td style={styles.td}>
                  <strong>{(reportData.paymentBreakdown || []).reduce((sum, p) => sum + p.count, 0)}</strong>
                </td>
                <td style={styles.td}>
                  <strong>₹{(reportData.paymentBreakdown || []).reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div style={styles.reportCard}>
          <h2 style={styles.reportTitle}>Top Selling Products</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(reportData.topProducts || []).map((product, index) => (
                <tr key={index}>
                  <td style={styles.td}>
                    {product.name}<br/>
                    <span className="tamil-text" style={styles.tamilText}>{product.nameTamil}</span>
                  </td>
                  <td style={styles.td}>{product.totalQuantity}</td>
                  <td style={styles.td}>₹{product.totalRevenue?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Category-wise Sales */}
        <div style={styles.reportCard}>
          <h2 style={styles.reportTitle}>Category-wise Sales</h2>
          <div style={styles.categoryList}>
            {(reportData.categorySales || []).map((category, index) => {
              const percentage = reportData.totalSales > 0 ? (category.total / reportData.totalSales * 100) : 0;
              return (
              <div key={index} style={styles.categoryItem}>
                <div style={styles.categoryHeader}>
                  <span style={styles.categoryName}>{category._id || 'Uncategorized'}</span>
                  <span style={styles.categoryAmount}>₹{category.total?.toFixed(2) || '0.00'}</span>
                </div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${percentage}%`,
                    }}
                  />
                </div>
                <div style={styles.categoryPercentage}>{percentage.toFixed(1)}%</div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Staff-wise Summary */}
        <div style={styles.reportCard}>
          <h2 style={styles.reportTitle}>Staff-wise Billing Summary</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Staff Member</th>
                <th style={styles.th}>Bills</th>
                <th style={styles.th}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(reportData.staffSales || []).map((staff, index) => (
                <tr key={index}>
                  <td style={styles.td}>{staff._id?.name || 'Unknown'}</td>
                  <td style={styles.td}>{staff.count}</td>
                  <td style={styles.td}>₹{staff.total?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
              <tr style={styles.totalRow}>
                <td style={styles.td}><strong>Total</strong></td>
                <td style={styles.td}>
                  <strong>{(reportData.staffSales || []).reduce((sum, s) => sum + s.count, 0)}</strong>
                </td>
                <td style={styles.td}>
                  <strong>₹{(reportData.staffSales || []).reduce((sum, s) => sum + s.total, 0).toFixed(2)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  select: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: 'white',
    fontSize: '14px',
    cursor: 'pointer',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  cardIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '0.25rem',
  },
  cardValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  reportTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#1f2937',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem',
    borderBottom: '2px solid #e5e7eb',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
  },
  tamilText: {
    fontSize: '12px',
    color: '#6b7280',
  },
  totalRow: {
    backgroundColor: '#f9fafb',
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  categoryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  categoryName: {
    fontWeight: '500',
  },
  categoryAmount: {
    fontWeight: '600',
    color: '#2563eb',
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    transition: 'width 0.3s',
  },
  categoryPercentage: {
    fontSize: '12px',
    color: '#6b7280',
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  customDateInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  dateInput: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  },
  loadBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '3rem',
  },
  loadingText: {
    fontSize: '16px',
    color: '#6b7280',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '14px',
    marginBottom: '1rem',
  },
  retryBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
