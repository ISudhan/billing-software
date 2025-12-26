import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <ShieldX size={64} color="#dc2626" />
        <h1 style={styles.title}>Access Denied</h1>
        <p style={styles.message}>
          You don't have permission to access this page.
        </p>
        <Link to="/" style={styles.link}>
          Go to Home
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  content: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '3rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: '1rem',
  },
  message: {
    color: '#6b7280',
    marginTop: '0.5rem',
    marginBottom: '2rem',
  },
  link: {
    display: 'inline-block',
    padding: '0.75rem 2rem',
    backgroundColor: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: '500',
  },
};
