import { useState, useEffect } from 'react';
import { getDashboard } from '../api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { FolderKanban, CheckSquare, Clock, AlertTriangle, TrendingUp, Users } from 'lucide-react';

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ background: `${color}20`, borderRadius: '0.75rem', padding: '0.75rem' }}>
          {icon}
        </div>
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{sub}</span>
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completionRate = stats && stats.totalTasks > 0
    ? Math.round((stats.doneTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="page-title">
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Here's what's happening with your projects today.</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
        ) : (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard icon={<FolderKanban size={22} color="#818cf8" />} label="Total Projects" value={stats?.totalProjects} color="#6366f1" sub="Active" />
              <StatCard icon={<CheckSquare size={22} color="#34d399" />} label="Total Tasks" value={stats?.totalTasks} color="#10b981" sub="All time" />
              <StatCard icon={<Clock size={22} color="#fbbf24" />} label="In Progress" value={stats?.inProgressTasks} color="#f59e0b" sub="Active" />
              <StatCard icon={<AlertTriangle size={22} color="#f87171" />} label="Overdue" value={stats?.overdueTasks} color="#ef4444" sub="Urgent" />
              <StatCard icon={<TrendingUp size={22} color="#34d399" />} label="Completed" value={stats?.doneTasks} color="#10b981" sub="Tasks" />
              <StatCard icon={<Users size={22} color="#818cf8" />} label="Team Members" value={stats?.totalMembers} color="#6366f1" sub="Total" />
            </div>

            {/* Progress Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Completion Progress */}
              <div className="card">
                <h2 className="section-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="#6366f1" /> Overall Progress
                </h2>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Completion Rate</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{completionRate}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${completionRate}%` }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'To Do', value: stats?.todoTasks, cls: 'badge-todo' },
                    { label: 'In Progress', value: stats?.inProgressTasks, cls: 'badge-inprogress' },
                    { label: 'Done', value: stats?.doneTasks, cls: 'badge-done' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      <span className={`badge ${item.cls}`}>{item.label}</span>
                      <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.2rem', marginTop: '0.3rem' }}>{item.value ?? 0}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Info */}
              <div className="card">
                <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>⚡ Quick Stats</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'Tasks To Do', value: stats?.todoTasks, bg: '#94a3b820' },
                    { label: 'In Progress', value: stats?.inProgressTasks, bg: '#f59e0b20' },
                    { label: 'Completed Tasks', value: stats?.doneTasks, bg: '#10b98120' },
                    { label: 'Overdue Tasks', value: stats?.overdueTasks, bg: '#ef444420' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: item.bg, borderRadius: '0.5rem' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{item.label}</span>
                      <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{item.value ?? 0}</span>
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
