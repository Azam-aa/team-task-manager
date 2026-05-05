import { useState, useEffect } from 'react';
import { getDashboard } from '../api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { FolderKanban, CheckSquare, Clock, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ background: `${color}20`, borderRadius: '0.75rem', padding: '0.75rem' }}>
          {icon}
        </div>
      </div>
      <div>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.2rem' }}>{label}</p>
        <p style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: 800 }}>{value ?? 0}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(r => setStats(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const completionRate = stats && stats.totalTasks > 0
    ? Math.round((stats.doneTasks / stats.totalTasks) * 100)
    : 0;

  const firstName = user?.fullName?.split(' ')[0] || 'there';

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="page-title">Welcome back, {firstName} 👋</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Here's what's happening with your projects today.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard icon={<FolderKanban size={22} color="#818cf8" />} label="Total Projects" value={stats?.totalProjects} color="#6366f1" />
              <StatCard icon={<CheckSquare size={22} color="#34d399" />} label="Total Tasks" value={stats?.totalTasks} color="#10b981" />
              <StatCard icon={<Clock size={22} color="#fbbf24" />} label="In Progress" value={stats?.inProgressTasks} color="#f59e0b" />
              <StatCard icon={<AlertTriangle size={22} color="#f87171" />} label="Overdue" value={stats?.overdueTasks} color="#ef4444" />
              <StatCard icon={<TrendingUp size={22} color="#34d399" />} label="Completed" value={stats?.doneTasks} color="#10b981" />
              <StatCard icon={<Users size={22} color="#818cf8" />} label="Team Members" value={stats?.totalMembers} color="#6366f1" />
            </div>

            {/* Progress Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Completion Progress */}
              <div className="card">
                <h2 className="section-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="#6366f1" /> Overall Progress
                </h2>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Completion Rate</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{completionRate}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${completionRate}%` }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'To Do', value: stats?.todoTasks, cls: 'badge-todo' },
                    { label: 'In Progress', value: stats?.inProgressTasks, cls: 'badge-inprogress' },
                    { label: 'Done', value: stats?.doneTasks, cls: 'badge-done' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      <span className={`badge ${item.cls}`}>{item.label}</span>
                      <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.4rem', marginTop: '0.3rem' }}>
                        {item.value ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card">
                <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>⚡ Quick Stats</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'Tasks To Do', value: stats?.todoTasks, bg: 'rgba(148,163,184,0.08)' },
                    { label: 'In Progress', value: stats?.inProgressTasks, bg: 'rgba(245,158,11,0.08)' },
                    { label: 'Completed Tasks', value: stats?.doneTasks, bg: 'rgba(16,185,129,0.08)' },
                    { label: 'Overdue Tasks', value: stats?.overdueTasks, bg: 'rgba(239,68,68,0.08)' },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.75rem 1rem', background: item.bg, borderRadius: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.03)',
                      }}
                    >
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{item.label}</span>
                      <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem' }}>{item.value ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
