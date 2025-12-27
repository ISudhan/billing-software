import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Key } from 'lucide-react';
import { useLanguage } from '../components/Layout';
import { getText } from '../utils/translations';

export default function StaffManagement() {
  const { language } = useLanguage();
  const [staff, setStaff] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = () => {
    // Mock staff data
    const mockStaff = [
      { id: 2, username: 'staff1', name: 'Ravi Kumar', role: 'STAFF', enabled: true, createdAt: '2024-01-15' },
      { id: 3, username: 'staff2', name: 'Priya Lakshmi', role: 'STAFF', enabled: true, createdAt: '2024-02-20' },
      { id: 4, username: 'staff3', name: 'Muthu Raja', role: 'STAFF', enabled: false, createdAt: '2024-03-10' },
    ];
    setStaff(mockStaff);
  };

  const handleAddNew = () => {
    setEditingStaff({
      id: Date.now(),
      username: '',
      name: '',
      password: '',
      role: 'STAFF',
      enabled: true,
    });
    setShowAddForm(true);
  };

  const handleEdit = (staffMember) => {
    setEditingStaff({ ...staffMember, password: '' });
    setIsEditing(true);
  };

  const handleSaveNew = () => {
    if (!editingStaff.username || !editingStaff.name || !editingStaff.password) {
      alert(getText('Please fill all required fields', language));
      return;
    }

    if (editingStaff.password.length < 6) {
      alert(getText('Password must be at least 6 characters', language));
      return;
    }

    if (window.confirm(`Add staff member "${editingStaff.name}"? / பணியாளரை சேர்க்கலாமா?`)) {
      setStaff([...staff, { ...editingStaff, createdAt: new Date().toISOString() }]);
      setShowAddForm(false);
      setEditingStaff(null);
      alert('Staff added successfully / பணியாளர் வெற்றிகரமாக சேர்க்கப்பட்டார்');
    }
  };

  const handleSaveEdit = () => {
    if (!editingStaff.name) {
      alert('Please enter staff name / பணியாளர் பெயரை உள்ளிடவும்');
      return;
    }

    if (window.confirm(`Update staff details? / விவரங்களை புதுப்பிக்கலாமா?`)) {
      setStaff(staff.map(s =>
        s.id === editingStaff.id ? editingStaff : s
      ));
      setIsEditing(false);
      setEditingStaff(null);
      alert('Staff updated successfully / பணியாளர் புதுப்பிக்கப்பட்டார்');
    }
  };

  const handleToggleEnabled = (staffId) => {
    const staffMember = staff.find(s => s.id === staffId);
    const action = staffMember.enabled ? 'disable' : 'enable';
    if (window.confirm(`${action} this staff member? / இந்த பணியாளரை ${staffMember.enabled ? 'நிறுத்தலாமா' : 'இயக்கலாமா'}?`)) {
      setStaff(staff.map(s =>
        s.id === staffId ? { ...s, enabled: !s.enabled } : s
      ));
    }
  };

  const handleDelete = (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member? This cannot be undone. / இந்த பணியாளரை நீக்கலாமா? இதை மாற்ற முடியாது.')) {
      if (window.confirm('Final confirmation: Delete staff permanently? / இறுதி உறுதிப்படுத்தல்: நிரந்தரமாக நீக்கலாமா?')) {
        setStaff(staff.filter(s => s.id !== staffId));
        alert('Staff deleted / பணியாளர் நீக்கப்பட்டார்');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{getText('Staff Management', language)}</h1>
        <button onClick={handleAddNew} style={styles.addBtn}>
          <Plus size={20} />
          {getText('Add Staff', language)}
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || isEditing) && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {showAddForm ? getText('Add Staff', language) : getText('Edit', language) + ' ' + getText('Staff', language)}
          </h2>
          
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>{getText('Staff Name', language)} *</label>
              <input
                type="text"
                value={editingStaff.name}
                onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                style={styles.input}
                placeholder="Enter full name / பெயர் உள்ளிடவும்"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>{getText('Username', language)} *</label>
              <input
                type="text"
                value={editingStaff.username}
                onChange={(e) => setEditingStaff({ ...editingStaff, username: e.target.value })}
                style={styles.input}
                placeholder="Login username / உள்நுழைவு பெயர்"
                disabled={isEditing}
              />
            </div>

            {showAddForm && (
              <div style={styles.formGroup}>
                <label style={styles.label}>{getText('Password', language)} * (min 6 characters)</label>
                <input
                  type="password"
                  value={editingStaff.password}
                  onChange={(e) => setEditingStaff({ ...editingStaff, password: e.target.value })}
                  style={styles.input}
                  placeholder="Enter password / கடவுச்சொல் உள்ளிடவும்"
                />
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={editingStaff.enabled}
                  onChange={(e) => setEditingStaff({ ...editingStaff, enabled: e.target.checked })}
                  style={styles.checkbox}
                />
                {getText('Enable', language)} (Allow login / உள்நுழைய அனுமதி)
              </label>
            </div>
          </div>

          <div style={styles.formActions}>
            <button
              onClick={showAddForm ? handleSaveNew : handleSaveEdit}
              style={styles.saveBtn}
            >
              <Save size={16} />
              {getText('Save', language)}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setIsEditing(false);
                setEditingStaff(null);
              }}
              style={styles.cancelBtn}
            >
              <X size={16} />
              {getText('Cancel', language)}
            </button>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{getText('Staff Name', language)}</th>
              <th style={styles.th}>{getText('Username', language)}</th>
              <th style={styles.th}>{getText('Role', language)}</th>
              <th style={styles.th}>Status / நிலை</th>
              <th style={styles.th}>Actions / செயல்கள்</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id} style={styles.tr}>
                <td style={styles.td}>{s.name}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Key size={14} />
                    {s.username}
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.roleBadge}>{getText('Staff', language)}</span>
                </td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleToggleEnabled(s.id)}
                    style={{
                      ...styles.statusBtn,
                      backgroundColor: s.enabled ? '#d1fae5' : '#fee2e2',
                      color: s.enabled ? '#065f46' : '#991b1b',
                    }}
                  >
                    {s.enabled ? getText('Enabled', language) : getText('Disabled', language)}
                  </button>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionBtns}>
                    <button
                      onClick={() => handleEdit(s)}
                      style={styles.editBtn}
                      disabled={showAddForm || isEditing}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      style={styles.deleteBtn}
                      disabled={showAddForm || isEditing}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {staff.length === 0 && (
          <div style={styles.emptyState}>
            <p>No staff members yet / இன்னும் பணியாளர்கள் இல்லை</p>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.5rem' }}>
              Click "Add Staff" to create the first staff member
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>Important / முக்கியம்:</h3>
        <ul style={styles.infoList}>
          <li>Staff can only access billing features / பணியாளர்கள் பில்லிங் மட்டும் பயன்படுத்த முடியும்</li>
          <li>Disabled staff cannot login / நிறுத்தப்பட்ட பணியாளர்கள் உள்நுழைய முடியாது</li>
          <li>Deleted staff cannot be recovered / நீக்கப்பட்ட பணியாளர்களை மீட்க முடியாது</li>
          <li>Each staff needs a unique username / ஒவ்வொரு பணியாளருக்கும் தனி பயனர் பெயர் வேண்டும்</li>
        </ul>
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
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 1.5rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '0.875rem',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '15px',
    transition: 'border-color 0.2s',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '15px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    marginTop: '1.5rem',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  cancelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.5rem',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    overflowX: 'auto',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '1rem',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: '600',
    fontSize: '15px',
    color: '#374151',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '1rem',
    fontSize: '15px',
  },
  roleBadge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
  },
  statusBtn: {
    padding: '0.375rem 1rem',
    border: 'none',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  actionBtns: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    padding: '0.5rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: '0.5rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    border: '2px solid #3b82f6',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#1e40af',
  },
  infoList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
};
