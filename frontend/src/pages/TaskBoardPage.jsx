import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, getTasksByProject, createTask, updateTask, updateTaskStatus, deleteTask, getUsers } from '../api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, ChevronLeft, Calendar, User, AlertTriangle, X, Clock } from 'lucide-react';

const COLUMNS = [
  { id: 'TO_DO', label: '📋 To Do', cls: 'badge-todo' },
  { id: 'IN_PROGRESS', label: '⚡ In Progress', cls: 'badge-inprogress' },
  { id: 'DONE', label: '✅ Done', cls: 'badge-done' },
];

// FIX: Backend returns LocalDateTime as ISO string e.g. "2026-05-10T14:30:00"
// datetime-local input expects "YYYY-MM-DDTHH:mm" (16 chars)
function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  // Handle both string and array formats from Jackson
  if (Array.isArray(dateStr)) {
    const [y, mo, d, h = 0, min = 0] = dateStr;
    return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}T${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
  }
  return String(dateStr).substring(0, 16);
}

function TaskModal({ task, projectId, users, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TO_DO',
    priority: task?.priority || 'MEDIUM',
    dueDate: formatDateForInput(task?.dueDate),
    assigneeId: task?.assigneeId ? String(task.assigneeId) : '',
    projectId: projectId,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
      dueDate: form.dueDate || null,
      projectId: Number(projectId),
    };
    try {
      if (task) {
        await updateTask(task.id, payload);
        toast.success('Task updated!');
      } else {
        await createTask(payload);
        toast.success('Task created!');
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.data || 'Failed to save task';
      toast.error(typeof msg === 'object' ? JSON.stringify(msg) : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="section-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="label">Title *</label>
            <input
              className="input-field"
              placeholder="Task title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              minLength={2}
              id="task-title-input"
            />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              className="input-field"
              placeholder="Task details..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Status</label>
              <select
                className="input-field"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                id="task-status-select"
              >
                <option value="TO_DO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Priority</label>
              <select
                className="input-field"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                id="task-priority-select"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Due Date</label>
              <input
                type="datetime-local"
                className="input-field"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                id="task-due-date"
              />
            </div>
            <div className="form-group">
              <label className="label">Assignee</label>
              <select
                className="input-field"
                value={form.assigneeId}
                onChange={e => setForm({ ...form, assigneeId: e.target.value })}
                id="task-assignee-select"
              >
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} id="task-save-btn">
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const now = new Date();
  // FIX: parse dueDate correctly (could be ISO string or array from Jackson)
  let dueDate = null;
  if (task.dueDate) {
    if (Array.isArray(task.dueDate)) {
      const [y, mo, d, h = 0, min = 0] = task.dueDate;
      dueDate = new Date(y, mo - 1, d, h, min);
    } else {
      dueDate = new Date(task.dueDate);
    }
  }
  const isOverdue = dueDate && task.status !== 'DONE' && dueDate < now;

  return (
    <div className="task-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className={`badge badge-${task.priority?.toLowerCase()}`}>{task.priority}</span>
          {isOverdue && (
            <span className="badge badge-overdue">
              <AlertTriangle size={10} /> Overdue
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button
            onClick={() => onEdit(task)}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.2rem' }}
            title="Edit task"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.2rem' }}
            title="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>
        {task.title}
      </p>
      {task.description && (
        <p style={{
          color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {task.description}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {task.assigneeName && (
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <User size={11} /> {task.assigneeName}
          </span>
        )}
        {dueDate && (
          <span style={{
            color: isOverdue ? '#f87171' : '#64748b',
            fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem'
          }}>
            <Calendar size={11} /> {dueDate.toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Quick status change buttons */}
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
        {COLUMNS.filter(c => c.id !== task.status).map(col => (
          <button
            key={col.id}
            onClick={() => onStatusChange(task.id, col.id)}
            style={{
              fontSize: '0.65rem', padding: '0.2rem 0.5rem',
              borderRadius: '9999px', border: '1px solid #334155',
              background: 'transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#818cf8'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#64748b'; }}
          >
            → {col.label.replace(/[^\w ]/g, '').trim()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TaskBoardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // FIX: wrap in useCallback so useEffect dep array is stable
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [proj, tks, usrs] = await Promise.all([
        getProject(projectId),
        getTasksByProject(projectId),
        getUsers(),
      ]);
      setProject(proj.data.data);
      setTasks(tks.data.data || []);
      setUsers(usrs.data.data || []);
    } catch (err) {
      toast.error('Failed to load task board');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await updateTaskStatus(id, status);
      setTasks(prev => prev.map(t => t.id === id ? res.data.data : t));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditingTask(null);
    fetchData();
  };

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/projects')}
            style={{
              background: 'none', border: 'none', color: '#64748b',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '0.4rem', marginBottom: '1rem', fontSize: '0.9rem'
            }}
          >
            <ChevronLeft size={16} /> Back to Projects
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="page-title">{project?.name || 'Task Board'}</h1>
              {project?.description && (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{project.description}</p>
              )}
            </div>
            <button
              className="btn-primary"
              onClick={() => { setEditingTask(null); setShowModal(true); }}
              id="create-task-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} /> Add Task
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem', alignItems: 'flex-start' }}>
            {COLUMNS.map(col => (
              <div key={col.id} className="task-column">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>{col.label}</h3>
                  <span className={`badge ${col.cls}`}>{tasksByStatus(col.id).length}</span>
                </div>
                {tasksByStatus(col.id).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#334155' }}>
                    <Clock size={28} style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.8rem' }}>No tasks here</p>
                  </div>
                ) : (
                  tasksByStatus(col.id).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={(t) => { setEditingTask(t); setShowModal(true); }}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <TaskModal
          task={editingTask}
          projectId={parseInt(projectId)}
          users={users}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
