import React, { useState } from 'react';
import { getBilingual } from '../utils/translations';
import { Save, AlertCircle } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    shopName: 'Senthur Billing',
    shopAddress1: 'Address Line 1',
    shopAddress2: 'Address Line 2',
    phone: '1234567890',
    email: 'shop@email.com',
    gstNumber: '',
    
    enableDiscounts: true,
    maxDiscountPercent: 10,
    enableExtraCharges: false,
    enableRoundOff: true,
    
    defaultPaymentMode: 'CASH',
    languagePriority: 'BOTH',
    printerWidth: '80mm',
    
    showProductImages: true,
    autoBackup: true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (window.confirm(`${getBilingual('Save Changes')}? / மாற்றங்களை சேமிக்கவா?`)) {
      // In production: save to API
      console.log('Saving settings:', settings);
      setHasChanges(false);
      alert(`${getBilingual('Settings saved successfully')}!`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{getBilingual('Settings')}</h1>
        <button
          onClick={handleSave}
          style={{
            ...styles.saveBtn,
            opacity: hasChanges ? 1 : 0.5,
            cursor: hasChanges ? 'pointer' : 'not-allowed',
          }}
          disabled={!hasChanges}
        >
          <Save size={20} />
          {getBilingual('Save Changes')}
        </button>
      </div>

      <div style={styles.warning}>
        <AlertCircle size={20} />
        <span>Settings changes will apply only to new bills and will not modify existing bills.</span>
      </div>

      <div style={styles.sections}>
        {/* Shop Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Shop Information</h2>
          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Shop Name *</label>
              <input
                type="text"
                value={settings.shopName}
                onChange={(e) => handleChange('shopName', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number *</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Address Line 1 *</label>
              <input
                type="text"
                value={settings.shopAddress1}
                onChange={(e) => handleChange('shopAddress1', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Address Line 2</label>
              <input
                type="text"
                value={settings.shopAddress2}
                onChange={(e) => handleChange('shopAddress2', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>GST Number</label>
              <input
                type="text"
                value={settings.gstNumber}
                onChange={(e) => handleChange('gstNumber', e.target.value)}
                style={styles.input}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Billing Features */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Billing Features</h2>
          
          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.enableDiscounts}
                onChange={(e) => handleChange('enableDiscounts', e.target.checked)}
                style={styles.checkbox}
              />
              <span>Enable Discounts</span>
            </label>
            {settings.enableDiscounts && (
              <div style={styles.subOption}>
                <label style={styles.label}>Maximum Discount (%)</label>
                <input
                  type="number"
                  value={settings.maxDiscountPercent}
                  onChange={(e) => handleChange('maxDiscountPercent', parseInt(e.target.value) || 0)}
                  style={styles.input}
                  min="0"
                  max="100"
                />
              </div>
            )}
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.enableExtraCharges}
                onChange={(e) => handleChange('enableExtraCharges', e.target.checked)}
                style={styles.checkbox}
              />
              <span>Enable Extra Charges (Delivery, Packaging, etc.)</span>
            </label>
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.enableRoundOff}
                onChange={(e) => handleChange('enableRoundOff', e.target.checked)}
                style={styles.checkbox}
              />
              <span>Enable Round-off</span>
            </label>
          </div>
        </div>

        {/* Display & Printing */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Display & Printing</h2>
          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Default Payment Mode</label>
              <select
                value={settings.defaultPaymentMode}
                onChange={(e) => handleChange('defaultPaymentMode', e.target.value)}
                style={styles.input}
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Language Priority</label>
              <select
                value={settings.languagePriority}
                onChange={(e) => handleChange('languagePriority', e.target.value)}
                style={styles.input}
              >
                <option value="ENGLISH">English Only</option>
                <option value="TAMIL">Tamil Only</option>
                <option value="BOTH">Both Languages</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Printer Width</label>
              <select
                value={settings.printerWidth}
                onChange={(e) => handleChange('printerWidth', e.target.value)}
                style={styles.input}
              >
                <option value="58mm">58mm</option>
                <option value="80mm">80mm</option>
              </select>
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.showProductImages}
                onChange={(e) => handleChange('showProductImages', e.target.checked)}
                style={styles.checkbox}
              />
              <span>Show Product Images in Billing Screen</span>
            </label>
          </div>
        </div>

        {/* System */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>System</h2>
          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => handleChange('autoBackup', e.target.checked)}
                style={styles.checkbox}
              />
              <span>Enable Automatic Daily Backup</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'opacity 0.2s',
  },
  warning: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: '4px',
    color: '#92400e',
    marginBottom: '2rem',
    fontSize: '14px',
  },
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#1f2937',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
  },
  checkboxGroup: {
    marginBottom: '1rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  subOption: {
    marginLeft: '2rem',
    marginTop: '0.75rem',
    maxWidth: '200px',
  },
};
