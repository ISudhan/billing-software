import React, { useState } from 'react';
import { getBilingual } from '../utils/translations';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';

export default function Reports() {
  const [dateRange, setDateRange] = useState('TODAY');
  const [reportData, setReportData] = useState(getMockReportData());

  function getMockReportData() {
    return {
      summary: {
        totalSales: 15420,
        totalBills: 45,
        averageBillValue: 342.67,
        totalItems: 178,
      },
      paymentBreakdown: [
        { mode: 'CASH', count: 25, amount: 8500 },
        { mode: 'UPI', count: 15, amount: 5200 },
        { mode: 'CARD', count: 5, amount: 1720 },
      ],
      topProducts: [
        { name: 'Rice', nameTamil: 'அரிசி', quantity: 45, revenue: 2250 },
        { name: 'Sugar', nameTamil: 'சர்க்கரை', quantity: 38, revenue: 1520 },
        { name: 'Tea', nameTamil: 'தேநீர்', quantity: 12, revenue: 3000 },
        { name: 'Coffee', nameTamil: 'காபி', quantity: 10, revenue: 3500 },
        { name: 'Wheat', nameTamil: 'கோதுமை', quantity: 32, revenue: 1440 },
      ],
      categoryWise: [
        { category: 'Groceries', sales: 9200, percentage: 59.7 },
        { category: 'Beverages', sales: 4800, percentage: 31.1 },
        { category: 'Snacks', sales: 1420, percentage: 9.2 },
      ],
      staffWise: [
        { name: 'Staff Member 1', bills: 28, revenue: 9640 },
        { name: 'Staff Member 2', bills: 17, revenue: 5780 },
      ],
    };
  }

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // In production: fetch new data based on range
    setReportData(getMockReportData());
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{getBilingual('Reports')}</h1>
        <select
          value={dateRange}
          onChange={(e) => handleDateRangeChange(e.target.value)}
          style={styles.select}
        >
          <option value="TODAY">{getBilingual('TODAY')}</option>
          <option value="YESTERDAY">{getBilingual('Yesterday')}</option>
          <option value="THIS_WEEK">{getBilingual('This Week')}</option>
          <option value="THIS_MONTH">{getBilingual('This Month')}</option>
          <option value="CUSTOM">{getBilingual('Custom Range')}</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.cardIcon, backgroundColor: '#dbeafe' }}>
            <DollarSign size={24} color="#2563eb" />
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardLabel}>Total Sales</div>
            <div style={styles.cardValue}>₹{reportData.summary.totalSales}</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={{ ...styles.cardIcon, backgroundColor: '#d1fae5' }}>
            <ShoppingBag size={24} color="#059669" />
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardLabel}>Total Bills</div>
            <div style={styles.cardValue}>{reportData.summary.totalBills}</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={{ ...styles.cardIcon, backgroundColor: '#fef3c7' }}>
            <TrendingUp size={24} color="#d97706" />
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardLabel}>Avg Bill Value</div>
            <div style={styles.cardValue}>₹{reportData.summary.averageBillValue.toFixed(2)}</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={{ ...styles.cardIcon, backgroundColor: '#e9d5ff' }}>
            <BarChart3 size={24} color="#9333ea" />
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardLabel}>Total Items</div>
            <div style={styles.cardValue}>{reportData.summary.totalItems}</div>
          </div>
        </div>
      </div>

      <div style={styles.reportsGrid}>
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
              {reportData.paymentBreakdown.map((payment, index) => (
                <tr key={index}>
                  <td style={styles.td}>{payment.mode}</td>
                  <td style={styles.td}>{payment.count}</td>
                  <td style={styles.td}>₹{payment.amount}</td>
                </tr>
              ))}
              <tr style={styles.totalRow}>
                <td style={styles.td}><strong>Total</strong></td>
                <td style={styles.td}>
                  <strong>{reportData.paymentBreakdown.reduce((sum, p) => sum + p.count, 0)}</strong>
                </td>
                <td style={styles.td}>
                  <strong>₹{reportData.paymentBreakdown.reduce((sum, p) => sum + p.amount, 0)}</strong>
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
              {reportData.topProducts.map((product, index) => (
                <tr key={index}>
                  <td style={styles.td}>
                    {product.name}<br/>
                    <span className="tamil-text" style={styles.tamilText}>{product.nameTamil}</span>
                  </td>
                  <td style={styles.td}>{product.quantity}</td>
                  <td style={styles.td}>₹{product.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Category-wise Sales */}
        <div style={styles.reportCard}>
          <h2 style={styles.reportTitle}>Category-wise Sales</h2>
          <div style={styles.categoryList}>
            {reportData.categoryWise.map((category, index) => (
              <div key={index} style={styles.categoryItem}>
                <div style={styles.categoryHeader}>
                  <span style={styles.categoryName}>{category.category}</span>
                  <span style={styles.categoryAmount}>₹{category.sales}</span>
                </div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${category.percentage}%`,
                    }}
                  />
                </div>
                <div style={styles.categoryPercentage}>{category.percentage}%</div>
              </div>
            ))}
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
              {reportData.staffWise.map((staff, index) => (
                <tr key={index}>
                  <td style={styles.td}>{staff.name}</td>
                  <td style={styles.td}>{staff.bills}</td>
                  <td style={styles.td}>₹{staff.revenue}</td>
                </tr>
              ))}
              <tr style={styles.totalRow}>
                <td style={styles.td}><strong>Total</strong></td>
                <td style={styles.td}>
                  <strong>{reportData.staffWise.reduce((sum, s) => sum + s.bills, 0)}</strong>
                </td>
                <td style={styles.td}>
                  <strong>₹{reportData.staffWise.reduce((sum, s) => sum + s.revenue, 0)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
};
