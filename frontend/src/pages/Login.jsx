import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Zap, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Animated background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={styles.wrapper}>
        {/* Left panel — branding */}
        <div style={styles.brandPanel}>
          <div style={styles.brandContent}>
            <div style={styles.brandIconWrap}>
              <Zap size={40} color="#fff" />
            </div>
            <h1 style={styles.brandTitle}>Smart Energy<br />Solutions</h1>
            <p style={styles.brandTagline}>
              Perfect Home Essential Products
            </p>
            <div style={styles.productList}>
              {[
                { emoji: '📹', label: 'CCTV Cameras' },
                { emoji: '☀️', label: 'Solar Water Heaters' },
                { emoji: '⚡', label: 'Inverters & Batteries' },
                { emoji: '💡', label: 'Solar Street Lights' },
              ].map(item => (
                <div key={item.label} style={styles.productItem}>
                  <span style={styles.productEmoji}>{item.emoji}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — login form */}
        <div style={styles.formPanel}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIconWrap}>
                <LogIn size={24} color="#2563eb" />
              </div>
              <h2 style={styles.cardTitle}>Sign In</h2>
              <p style={styles.cardSubtitle}>Welcome back! Enter your credentials.</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {error && (
                <div style={styles.errorBox}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input}
                  placeholder="Enter your username"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...styles.input, paddingRight: '3rem' }}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span style={styles.spinnerSmall} />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div style={styles.credentialsBox}>
              <p style={styles.credTitle}>Demo Credentials</p>
              <div style={styles.credGrid}>
                <div style={styles.credItem}>
                  <span style={styles.credRole}>Admin</span>
                  <code style={styles.credCode}>admin / admin123</code>
                </div>
                <div style={styles.credItem}>
                  <span style={styles.credRole}>Cashier</span>
                  <code style={styles.credCode}>cashier1 / cashier123</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2027 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  // decorative blobs
  orb1: {
    position: 'absolute', top: '-120px', right: '-80px',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-100px', left: '-60px',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb3: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '800px', height: '800px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 60%)',
    pointerEvents: 'none',
  },

  wrapper: {
    display: 'flex',
    width: '100%',
    maxWidth: '900px',
    minHeight: '560px',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
    position: 'relative',
    zIndex: 1,
  },

  // ── Brand panel ──
  brandPanel: {
    flex: '1',
    background: 'linear-gradient(135deg, #0ea5e9, #2563eb, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  brandContent: { position: 'relative', zIndex: 1 },
  brandIconWrap: {
    width: '72px', height: '72px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '1.5rem',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  brandTitle: {
    fontSize: '32px', fontWeight: '800',
    color: 'white', lineHeight: 1.2, marginBottom: '0.75rem',
  },
  brandTagline: {
    color: 'rgba(255,255,255,0.8)', fontSize: '14px',
    marginBottom: '2rem', lineHeight: 1.5,
  },
  productList: { display: 'flex', flexDirection: 'column', gap: '0.875rem' },
  productItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500',
    background: 'rgba(255,255,255,0.1)',
    padding: '0.625rem 1rem', borderRadius: '10px',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  productEmoji: { fontSize: '18px' },

  // ── Form panel ──
  formPanel: {
    width: '380px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem 2rem',
  },
  card: { width: '100%' },
  cardHeader: { marginBottom: '1.75rem' },
  cardIconWrap: {
    width: '48px', height: '48px',
    background: '#dbeafe', borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '1rem',
  },
  cardTitle: { fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' },
  cardSubtitle: { color: '#64748b', fontSize: '13px' },

  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' },

  errorBox: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: '#fee2e2', color: '#991b1b',
    padding: '0.75rem 1rem', borderRadius: '10px',
    fontSize: '13px', fontWeight: '500',
    border: '1px solid #fecaca',
  },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: {
    padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px',
    background: 'white', color: '#0f172a',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    width: '100%',
  },

  passwordWrapper: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: '0.75rem', top: '50%',
    transform: 'translateY(-50%)',
    background: 'none', border: 'none',
    cursor: 'pointer', color: '#64748b', padding: '0.25rem',
    display: 'flex', alignItems: 'center',
  },

  submitBtn: {
    width: '100%', padding: '0.875rem',
    background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '15px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
    transition: 'all 0.2s',
  },

  spinnerSmall: {
    display: 'inline-block',
    width: '16px', height: '16px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: 'white', borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },

  credentialsBox: {
    background: '#f1f5f9', borderRadius: '12px',
    padding: '1rem', border: '1px solid #e2e8f0',
  },
  credTitle: { fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  credGrid: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  credItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  credRole: { fontSize: '12px', fontWeight: '600', color: '#374151' },
  credCode: { fontSize: '11px', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#1e293b' },
};
