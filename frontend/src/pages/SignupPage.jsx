import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signup as signupApi } from '../api';
import toast from 'react-hot-toast';
import { Zap, User, Mail, Lock, Shield, UserPlus } from 'lucide-react';

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'MEMBER' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await signupApi(form);
      loginUser(res.data.data);
      toast.success('Account created! Welcome to TaskForge!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.08) 1px, transparent 0)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: '0.75rem', padding: '0.6rem' }}>
              <Zap size={22} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#f1f5f9' }}>TaskForge</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Create your account</p>
        </div>

        <div className="card glass" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="label"><User size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Full Name</label>
              <input type="text" className="input-field" placeholder="John Doe" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required minLength={2} id="signup-name" />
            </div>
            <div className="form-group">
              <label className="label"><Mail size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required id="signup-email" />
            </div>
            <div className="form-group">
              <label className="label"><Lock size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Password</label>
              <input type="password" className="input-field" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} id="signup-password" />
            </div>
            <div className="form-group">
              <label className="label"><Shield size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Role</label>
              <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} id="signup-role">
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={loading} id="signup-submit" style={{ padding: '0.8rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
