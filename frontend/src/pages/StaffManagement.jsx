import React, { useState, useEffect } from 'react';
import { Plus, Edit, Save, X, Key, DollarSign, Clock, Calendar, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '../components/Layout';
import { getText } from '../utils/translations';
import { userAPI, staffPaymentAPI } from '../services/api';

export default function StaffManagement() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'payments'
  
  // User Management State
  const [staff, setStaff] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Payment Management State
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({
    staff: '',
    workDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    hourlyRate: 100,
    notes: ''
  });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadStaff();
    if (activeTab === 'payments') {
      loadPaymentRecords();
      loadPaymentStats();
    }
  }, [activeTab]);

  // USER MANAGEMENT FUNCTIONS
  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getUsers();
      setStaff(response.users || []);
    } catch (err) {
      console.error('Failed to load staff:', err);
      setError(err.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingStaff({
      username: '',
      name: '',
      password: '',
      role: 'CASHIER',
    });
    setShowAddForm(true);
  };

  const handleEdit = (staffMember) => {
    setEditingStaff({ ...staffMember, password: '' });
    setIsEditing(true);
  };

  const handleSaveNew = async () => {
    if (!editingStaff.username || !editingStaff.name || !editingStaff.password) {
      alert('Please fill all fields / அனைத்து புலங்களையும் நிரப்பவும்');
      return;
    }
    if (editingStaff.password.length < 6) {
      alert('Password must be at least 6 characters / கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்');
      return;
    }
    if (window.confirm(`Add staff member "${editingStaff.name}"? / பணியாளரை சேர்க்கலாமா?`)) {
      try {
        await userAPI.createUser(editingStaff);
        await loadStaff();
        setShowAddForm(false);
        setEditingStaff(null);
        alert('Staff added successfully / பணியாளர் வெற்றிகரமாக சேர்க்கப்பட்டார்');
      } catch (error) {
        console.error('Failed to add staff:', error);
        alert(error.message || 'Failed to add staff');
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingStaff.name) {
      alert('Please enter staff name / பணியாளர் பெயரை உள்ளிடவும்');
      return;
    }
    if (window.confirm(`Update staff details? / விவரங்களை புதுப்பிக்கலாமா?`)) {
      try {
        const updateData = { name: editingStaff.name, role: editingStaff.role };
        if (editingStaff.password) {
          updateData.password = editingStaff.password;
        }
        await userAPI.updateUser(editingStaff._id, updateData);
        await loadStaff();
        setIsEditing(false);
        setEditingStaff(null);
        alert('Staff updated successfully / பணியாளர் புதுப்பிக்கப்பட்டார்');
      } catch (error) {
        console.error('Failed to update staff:', error);
        alert(error.message || 'Failed to update staff');
      }
    }
  };

  const handleToggleEnabled = async (staffId) => {
    const staffMember = staff.find(s => s._id === staffId);
    const action = staffMember.enabled ? 'disable' : 'enable';
    if (window.confirm(`${action} this staff member? / இந்த பணியாளரை ${staffMember.enabled ? 'நிறுத்தலாமா' : 'இயக்கலாமா'}?`)) {
      try {
        await userAPI.updateUser(staffId, { enabled: !staffMember.enabled });
        await loadStaff();
      } catch (error) {
        console.error('Failed to toggle staff:', error);
      }
    }
  };

  // PAYMENT MANAGEMENT FUNCTIONS
  const loadPaymentRecords = async () => {
    try {
      const response = await staffPaymentAPI.getWorkRecords();
      setPaymentRecords(response.records || []);
    } catch (err) {
      console.error('Failed to load payment records:', err);
    }
  };

  const loadPaymentStats = async () => {
    try {
      const response = await staffPaymentAPI.getPaymentStats();
      setPaymentStats(response.stats || {});
    } catch (err) {
      console.error('Failed to load payment stats:', err);
    }
  };

  const handleCreateWorkRecord = async (e) => {
    e.preventDefault();
    try {
      await staffPaymentAPI.createWorkRecord(paymentFormData);
      setShowPaymentForm(false);
      setPaymentFormData({
        staff: '',
        workDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        hourlyRate: 100,
        notes: ''
      });
      loadPaymentRecords();
      loadPaymentStats();
      alert('Work record created successfully!');
    } catch (error) {
      console.error('Failed to create work record:', error);
      alert(error.message || 'Failed to create work record');
    }
  };

  const handleAddPayment = async (recordId) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    try {
      await staffPaymentAPI.addPayment(recordId, parseFloat(paymentAmount));
      setPaymentAmount('');
      setSelectedRecord(null);
      loadPaymentRecords();
      loadPaymentStats();
      alert('Payment added successfully!');
    } catch (error) {
      console.error('Failed to add payment:', error);
      alert(error.message || 'Failed to add payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return '#10b981'; // green
      case 'PARTIAL':
        return '#f59e0b'; // amber
      case 'ADVANCE':
        return '#3b82f6'; // blue
      default:
        return '#ef4444'; // red
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      PAID: 'Paid',
      PARTIAL: 'Partial',
      ADVANCE: 'Advance',
      UNPAID: 'Unpaid'
    };
    return labels[status] || status;
  };

  // RENDER FUNCTIONS
  const renderUserManagement = () => (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>{getText('Staff Management', language)}</h1>
        <button onClick={handleAddNew} style={styles.addButton}>
          <Plus size={20} />
          {getText('Add Staff', language)}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {(showAddForm || isEditing) && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>{isEditing ? 'Edit Staff / பணியாளரை திருத்து' : 'Add New Staff / புதிய பணியாளர்'}</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setIsEditing(false);
                  setEditingStaff(null);
                }}
                style={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>{getText('Username', language)}</label>
                <input
                  type="text"
                  value={editingStaff?.username || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, username: e.target.value })}
                  style={styles.input}
                  disabled={isEditing}
                  placeholder="username"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>{getText('Staff Name', language)}</label>
                <input
                  type="text"
                  value={editingStaff?.name || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  style={styles.input}
                  placeholder="Full Name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>{getText('Password', language)}</label>
                <input
                  type="password"
                  value={editingStaff?.password || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, password: e.target.value })}
                  style={styles.input}
                  placeholder={isEditing ? 'Leave blank to keep current' : 'Min 6 characters'}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>{getText('Role', language)}</label>
                <select
                  value={editingStaff?.role || 'CASHIER'}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  style={styles.input}
                >
                  <option value="ADMIN">{getText('Admin', language)}</option>
                  <option value="CASHIER">{getText('Cashier', language)}</option>
                </select>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setIsEditing(false);
                  setEditingStaff(null);
                }}
                style={styles.cancelButton}
              >
                <X size={16} />
                Cancel
              </button>
              <button onClick={isEditing ? handleUpdate : handleSaveNew} style={styles.saveButton}>
                <Save size={16} />
                {isEditing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{getText('Username', language)}</th>
              <th style={styles.th}>{getText('Staff Name', language)}</th>
              <th style={styles.th}>{getText('Role', language)}</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member._id} style={styles.tr}>
                <td style={styles.td}>{member.username}</td>
                <td style={styles.td}>{member.name}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: member.role === 'ADMIN' ? '#dbeafe' : '#fef3c7',
                    color: member.role === 'ADMIN' ? '#1e40af' : '#92400e'
                  }}>
                    {getText(member.role === 'ADMIN' ? 'Admin' : 'Cashier', language)}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: member.enabled ? '#dcfce7' : '#fee2e2',
                    color: member.enabled ? '#15803d' : '#991b1b'
                  }}>
                    {member.enabled ? getText('Enabled', language) : getText('Disabled', language)}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button onClick={() => handleEdit(member)} style={styles.editButton}>
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleEnabled(member._id)}
                      style={{
                        ...styles.toggleButton,
                        backgroundColor: member.enabled ? '#fef3c7' : '#dcfce7'
                      }}
                    >
                      {member.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPaymentManagement = () => {
    const cashiers = staff.filter(s => s.role === 'CASHIER' && s.enabled);

    return (
      <div>
        <div style={styles.header}>
          <h1 style={styles.title}>Staff Payment Management</h1>
          <button onClick={() => setShowPaymentForm(true)} style={styles.addButton}>
            <Plus size={20} />
            Add Work Record
          </button>
        </div>

        {/* Stats Cards */}
        {paymentStats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <Users size={24} color="#3b82f6" />
              </div>
              <div>
                <div style={styles.statValue}>{paymentStats.totalRecords || 0}</div>
                <div style={styles.statLabel}>Total Records</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <Clock size={24} color="#10b981" />
              </div>
              <div>
                <div style={styles.statValue}>{paymentStats.totalHours?.toFixed(1) || '0.0'}h</div>
                <div style={styles.statLabel}>Total Hours</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <DollarSign size={24} color="#f59e0b" />
              </div>
              <div>
                <div style={styles.statValue}>₹{paymentStats.totalPayable?.toFixed(0) || '0'}</div>
                <div style={styles.statLabel}>Total Payable</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <TrendingUp size={24} color="#8b5cf6" />
              </div>
              <div>
                <div style={styles.statValue}>₹{paymentStats.totalPaid?.toFixed(0) || '0'}</div>
                <div style={styles.statLabel}>Total Paid</div>
              </div>
            </div>
          </div>
        )}

        {/* Work Record Form Modal */}
        {showPaymentForm && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2>Create Work Record</h2>
                <button onClick={() => setShowPaymentForm(false)} style={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateWorkRecord}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Select Cashier</label>
                    <select
                      value={paymentFormData.staff}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, staff: e.target.value })}
                      style={styles.input}
                      required
                    >
                      <option value="">-- Select Cashier --</option>
                      {cashiers.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Work Date</label>
                    <input
                      type="date"
                      value={paymentFormData.workDate}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, workDate: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Start Time</label>
                    <input
                      type="time"
                      value={paymentFormData.startTime}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, startTime: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>End Time</label>
                    <input
                      type="time"
                      value={paymentFormData.endTime}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, endTime: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Hourly Rate (₹)</label>
                    <input
                      type="number"
                      value={paymentFormData.hourlyRate}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, hourlyRate: e.target.value })}
                      style={styles.input}
                      min="1"
                      required
                    />
                  </div>

                  <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                    <label style={styles.label}>Notes (Optional)</label>
                    <textarea
                      value={paymentFormData.notes}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                      style={{ ...styles.input, minHeight: '60px' }}
                      placeholder="Any additional notes..."
                    />
                  </div>
                </div>

                <div style={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    style={styles.cancelButton}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button type="submit" style={styles.saveButton}>
                    <Save size={16} />
                    Create Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Records Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Cashier</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Hours</th>
                <th style={styles.th}>Rate</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Paid</th>
                <th style={styles.th}>Balance</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentRecords.map((record) => (
                <tr key={record._id} style={styles.tr}>
                  <td style={styles.td}>{record.staff?.name || 'N/A'}</td>
                  <td style={styles.td}>{new Date(record.workDate).toLocaleDateString()}</td>
                  <td style={styles.td}>{record.startTime} - {record.endTime}</td>
                  <td style={styles.td}>{record.hoursWorked?.toFixed(1)}h</td>
                  <td style={styles.td}>₹{record.hourlyRate}</td>
                  <td style={styles.td}>₹{record.totalPayable?.toFixed(0)}</td>
                  <td style={styles.td}>₹{record.paidAmount?.toFixed(0)}</td>
                  <td style={styles.td}>
                    {record.advanceBalance > 0 ? (
                      <span style={{ color: '#3b82f6' }}>₹{record.advanceBalance?.toFixed(0)} adv</span>
                    ) : (
                      <span style={{ color: record.remainingBalance > 0 ? '#ef4444' : '#10b981' }}>
                        ₹{record.remainingBalance?.toFixed(0)}
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: record.paymentStatus === 'PAID' ? '#dcfce7' : 
                                     record.paymentStatus === 'PARTIAL' ? '#fef3c7' :
                                     record.paymentStatus === 'ADVANCE' ? '#dbeafe' : '#fee2e2',
                      color: getStatusColor(record.paymentStatus)
                    }}>
                      {getStatusLabel(record.paymentStatus)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {record.paymentStatus !== 'PAID' && (
                      <button
                        onClick={() => setSelectedRecord(record._id)}
                        style={styles.paymentButton}
                      >
                        <DollarSign size={14} />
                        Add Payment
                      </button>
                    )}
                    {selectedRecord === record._id && (
                      <div style={styles.paymentInput}>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          style={styles.smallInput}
                          placeholder="Amount"
                          min="0"
                        />
                        <button
                          onClick={() => handleAddPayment(record._id)}
                          style={styles.confirmButton}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRecord(null);
                            setPaymentAmount('');
                          }}
                          style={styles.cancelSmallButton}
                        >
                          ✗
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      {/* Tab Navigation */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            ...styles.tab,
            ...(activeTab === 'users' ? styles.activeTab : {})
          }}
        >
          <Users size={18} />
          User Management
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          style={{
            ...styles.tab,
            ...(activeTab === 'payments' ? styles.activeTab : {})
          }}
        >
          <DollarSign size={18} />
          Payment Tracking
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' ? renderUserManagement() : renderPaymentManagement()}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '2px solid #e5e7eb',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#6b7280',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
  },
  activeTab: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  statIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '10px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    backgroundColor: '#f9fafb',
    fontWeight: '600',
    color: '#374151',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '16px',
    color: '#4b5563',
    fontSize: '14px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '8px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  toggleButton: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  paymentButton: {
    padding: '6px 12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  paymentInput: {
    display: 'flex',
    gap: '4px',
    marginTop: '8px',
  },
  smallInput: {
    padding: '6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '13px',
    width: '80px',
  },
  confirmButton: {
    padding: '6px 10px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelSmallButton: {
    padding: '6px 10px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#6b7280',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '18px',
    color: '#6b7280',
  },
  error: {
    padding: '16px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    marginBottom: '20px',
  },
};
