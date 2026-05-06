import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, LogIn, Copy, Check } from 'lucide-react';

// Demo credential quick-fill card
function DemoCredentials({ onFill }) {
  const [copied, setCopied] = useState(null);

  const fill = (email, password, label) => {
    onFill(email, password);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(99,102,241,0.3)', borderRadius: '1rem',
      padding: '1rem 1.25rem', minWidth: '220px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      zIndex: 100,
    }}>
      <p style={{ color: '#818cf8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        🎯 Demo Credentials
      </p>

      {[
        { label: 'Admin', email: 'admin@demo.com', password: 'admin123', badge: 'badge-admin' },
        { label: 'Member', email: 'member@demo.com', password: 'member123', badge: 'badge-member' },
      ].map(({ label, email, password, badge }) => (
        <div key={label} style={{ marginBottom: '0.6rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span className={`badge ${badge}`}>{label}</span>
            <button
              onClick={() => fill(email, password, label)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === label ? '#34d399' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', padding: 0, transition: 'color 0.2s' }}
            >
              {copied === label ? <><Check size={11} /> Filled!</> : <><Copy size={11} /> Use</>}
            </button>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', fontFamily: 'monospace', lineHeight: 1.6, margin: 0 }}>
            {email}<br />
            <span style={{ color: '#64748b' }}>{password}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginApi(form);
      loginUser(res.data.data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email, password) => {
    setForm({ email, password });
    toast.success('Credentials filled — click Sign In!', { duration: 2000 });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.08) 1px, transparent 0)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: '0.75rem', padding: '0.6rem' }}>
              <Zap size={22} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#f1f5f9' }}>TaskForge</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Sign in to your workspace</p>
        </div>

        <div className="card glass" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label className="label">
                <Mail size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                id="login-email"
              />
            </div>
            <div className="form-group">
              <label className="label">
                <Lock size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                id="login-password"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              id="login-submit"
              style={{ padding: '0.8rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading
                ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                : <><LogIn size={18} /> Sign In</>
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Demo credentials floating card */}
      <DemoCredentials onFill={fillCredentials} />
    </div>
  );
}
