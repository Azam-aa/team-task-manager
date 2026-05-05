import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, Zap } from 'lucide-react';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: '0.5rem', padding: '0.4rem' }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9' }}>TaskForge</span>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Team Task Manager</p>
      </div>

      <nav style={{ flex: 1 }}>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FolderKanban size={18} /> Projects
        </NavLink>
        <NavLink to="/my-tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CheckSquare size={18} /> My Tasks
        </NavLink>
      </nav>

      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: 'white', flexShrink: 0 }}>
            {user?.fullName?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: '#f1f5f9', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName}</p>
            <span className={`badge badge-${user?.role?.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>{user?.role}</span>
          </div>
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ borderRadius: '0.5rem', color: '#f87171' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
