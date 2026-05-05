import { useState, useEffect } from 'react';
import { getMyTasks, updateTaskStatus } from '../api';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { CheckSquare, AlertTriangle, Calendar, User, FolderKanban } from 'lucide-react';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    getMyTasks()
      .then(r => setTasks(r.data.data || []))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await updateTaskStatus(id, status);
      setTasks(prev => prev.map(t => t.id === id ? res.data.data : t));
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);
  const now = new Date();

  const StatusBtn = ({ s, label }) => (
    <button
      onClick={() => setFilter(s)}
      style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.15s',
        background: filter === s ? 'rgba(99,102,241,0.2)' : 'transparent',
        borderColor: filter === s ? '#6366f1' : '#334155',
        color: filter === s ? '#818cf8' : '#64748b'
      }}
    >{label} ({s === 'ALL' ? tasks.length : tasks.filter(t => t.status === s).length})</button>
  );

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="page-title">My Tasks</h1>
          <p style={{ color: '#64748b' }}>Tasks assigned to you across all projects</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <StatusBtn s="ALL" label="All" />
          <StatusBtn s="TO_DO" label="To Do" />
          <StatusBtn s="IN_PROGRESS" label="In Progress" />
          <StatusBtn s="DONE" label="Done" />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <CheckSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>No tasks found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(task => {
              const due = task.dueDate ? new Date(task.dueDate) : null;
              const isOverdue = due && task.status !== 'DONE' && due < now;
              return (
                <div key={task.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span className={`badge badge-${task.priority?.toLowerCase()}`}>{task.priority}</span>
                      <span className={`badge badge-${task.status === 'TO_DO' ? 'todo' : task.status === 'IN_PROGRESS' ? 'inprogress' : 'done'}`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                      {isOverdue && <span className="badge badge-overdue"><AlertTriangle size={10} /> Overdue</span>}
                    </div>
                    <h3 style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '0.4rem' }}>{task.title}</h3>
                    {task.description && <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{task.description}</p>}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FolderKanban size={12} /> {task.projectName}
                      </span>
                      {due && (
                        <span style={{ color: isOverdue ? '#f87171' : '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={12} /> {due.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    {['TO_DO', 'IN_PROGRESS', 'DONE'].filter(s => s !== task.status).map(s => (
                      <button key={s} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }} onClick={() => handleStatusChange(task.id, s)}>
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
