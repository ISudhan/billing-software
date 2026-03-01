import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import { Save, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    shopName: '',
    shopAddress1: '',
    shopAddress2: '',
    phone: '',
    email: '',
    gstNumber: '',
    billPrefix: 'SES',
    defaultLanguage: 'both',
    enableDiscounts: false,
    enableExtraCharges: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('');

  // Load settings from API on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsAPI.getSettings();
      if (data.settings) {
        setSettings({
          shopName:         data.settings.shopName || '',
          shopAddress1:     data.settings.shopAddress1 || '',
          shopAddress2:     data.settings.shopAddress2 || '',
          phone:            data.settings.phone || '',
          email:            data.settings.email || '',
          gstNumber:        data.settings.gstNumber || '',
          billPrefix:       data.settings.billPrefix || 'SES',
          defaultLanguage:  data.settings.defaultLanguage || 'both',
          enableDiscounts:  data.settings.enableDiscounts || false,
          enableExtraCharges: data.settings.enableExtraCharges || false,
        });
      }
    } catch (err) {
      setErrorMsg('Failed to load settings from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveStatus(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus(null);
      await settingsAPI.updateSettings(settings);
      setHasChanges(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
      setErrorMsg(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerBox}>
        <div className="spinner" />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading settings…</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>⚙️ Settings</h1>
          <p style={styles.subtitle}>Manage shop information and billing configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          style={{
            ...styles.saveBtn,
            opacity: (!hasChanges || saving) ? 0.5 : 1,
            cursor: (!hasChanges || saving) ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? <><Loader size={16} style={{animation:'spin 0.7s linear infinite'}} /> Saving…</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      {/* Status messages */}
      {saveStatus === 'success' && (
        <div style={{ ...styles.alert, background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' }}>
          <CheckCircle size={18} /> Settings saved successfully!
        </div>
      )}
      {saveStatus === 'error' && (
        <div style={{ ...styles.alert, background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}
      {!loading && !saveStatus && (
        <div style={styles.infoBox}>
          <AlertCircle size={16} />
          <span>Changes apply to new bills only and will not affect existing bills.</span>
        </div>
      )}

      <div style={styles.sections}>
        {/* Shop Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🏪 Shop Information</h2>
          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Shop Name *</label>
              <input
                type="text"
                value={settings.shopName}
                onChange={e => handleChange('shopName', e.target.value)}
                style={styles.input}
                placeholder="Smart Energy Solutions"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={e => handleChange('phone', e.target.value)}
                style={styles.input}
                placeholder="9876543210"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Address Line 1</label>
              <input
                type="text"
                value={settings.shopAddress1}
                onChange={e => handleChange('shopAddress1', e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Address Line 2</label>
              <input
                type="text"
                value={settings.shopAddress2}
                onChange={e => handleChange('shopAddress2', e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={e => handleChange('email', e.target.value)}
                style={styles.input}
                placeholder="shop@email.com"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>GST Number</label>
              <input
                type="text"
                value={settings.gstNumber}
                onChange={e => handleChange('gstNumber', e.target.value)}
                style={styles.input}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Bill Configuration */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🧾 Bill Configuration</h2>
          <div style={{ ...styles.grid, gridTemplateColumns: '1fr 1fr' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bill Prefix</label>
              <input
                type="text"
                value={settings.billPrefix}
                onChange={e => handleChange('billPrefix', e.target.value.toUpperCase())}
                style={styles.input}
                placeholder="SES"
                maxLength={10}
              />
              <span style={styles.hint}>Bills will be numbered: {settings.billPrefix || 'SES'}-000001</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Default Language</label>
              <select
                value={settings.defaultLanguage}
                onChange={e => handleChange('defaultLanguage', e.target.value)}
                style={styles.input}
              >
                <option value="en">English Only</option>
                <option value="ta">Tamil Only</option>
                <option value="both">Both Languages</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>⚙️ Billing Features</h2>
          <div style={styles.toggleList}>
            <label style={styles.toggle}>
              <div style={{ flex: 1 }}>
                <div style={styles.toggleLabel}>Enable Discounts</div>
                <div style={styles.toggleDesc}>Allow cashiers to apply discounts on bills</div>
              </div>
              <div
                onClick={() => handleChange('enableDiscounts', !settings.enableDiscounts)}
                style={{
                  ...styles.toggleSwitch,
                  background: settings.enableDiscounts ? '#10b981' : '#d1d5db',
                }}
              >
                <div style={{
                  ...styles.toggleKnob,
                  transform: settings.enableDiscounts ? 'translateX(22px)' : 'translateX(2px)',
                }} />
              </div>
            </label>
            <label style={styles.toggle}>
              <div style={{ flex: 1 }}>
                <div style={styles.toggleLabel}>Enable Extra Charges</div>
                <div style={styles.toggleDesc}>Add delivery, packaging, or installation charges</div>
              </div>
              <div
                onClick={() => handleChange('enableExtraCharges', !settings.enableExtraCharges)}
                style={{
                  ...styles.toggleSwitch,
                  background: settings.enableExtraCharges ? '#10b981' : '#d1d5db',
                }}
              >
                <div style={{
                  ...styles.toggleKnob,
                  transform: settings.enableExtraCharges ? 'translateX(22px)' : 'translateX(2px)',
                }} />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '0 auto' },
  centerBox: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', minHeight: '60vh',
  },
  pageHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap',
  },
  title: { fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '13px', color: '#64748b', marginTop: '4px' },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '14px', fontWeight: '700',
    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
    transition: 'all 0.2s',
  },
  alert: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.875rem 1rem', borderRadius: '10px',
    fontSize: '14px', fontWeight: '600', marginBottom: '1rem',
  },
  infoBox: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.875rem 1rem', borderRadius: '10px',
    background: '#fffbeb', border: '1px solid #fde68a',
    color: '#92400e', fontSize: '13px', marginBottom: '1.5rem',
  },
  sections: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  section: {
    background: 'white', borderRadius: '16px', padding: '1.5rem',
    border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: {
    padding: '0.7rem 0.875rem', border: '1.5px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', background: '#fafbfc',
    color: '#0f172a', transition: 'all 0.15s', width: '100%',
  },
  hint: { fontSize: '11px', color: '#94a3b8' },

  toggleList: { display: 'flex', flexDirection: 'column', gap: '0.875rem' },
  toggle: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '1rem 1.25rem', background: '#f8fafc',
    borderRadius: '12px', border: '1px solid #e2e8f0',
    cursor: 'pointer',
  },
  toggleLabel: { fontSize: '14px', fontWeight: '700', color: '#0f172a' },
  toggleDesc: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  toggleSwitch: {
    width: '44px', height: '24px', borderRadius: '12px',
    position: 'relative', cursor: 'pointer', flexShrink: 0,
    transition: 'background 0.2s',
  },
  toggleKnob: {
    position: 'absolute', top: '2px',
    width: '20px', height: '20px', borderRadius: '50%',
    background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s',
  },
};
