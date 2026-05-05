import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, updateProject, deleteProject, getUsers } from '../api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { Plus, FolderKanban, Edit2, Trash2, ChevronRight, Users, CheckSquare, X } from 'lucide-react';

function ProjectModal({ project, users, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    memberIds: [],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (project) {
        await updateProject(project.id, form);
        toast.success('Project updated!');
      } else {
        await createProject(form);
        toast.success('Project created!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (id) => {
    setForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(id)
        ? prev.memberIds.filter(m => m !== id)
        : [...prev.memberIds, id],
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="section-title">{project ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="label">Project Name *</label>
            <input className="input-field" placeholder="e.g. Website Redesign" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required minLength={2} id="project-name-input" />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="input-field" placeholder="What is this project about?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label className="label">Add Members</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
              {users.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleMember(u.id)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: form.memberIds.includes(u.id) ? 'rgba(99,102,241,0.2)' : 'transparent',
                    borderColor: form.memberIds.includes(u.id) ? '#6366f1' : '#334155',
                    color: form.memberIds.includes(u.id) ? '#818cf8' : '#94a3b8',
                    transition: 'all 0.15s',
                  }}
                >
                  {u.fullName}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} id="project-save-btn">
              {loading ? 'Saving...' : project ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [proj, usrs] = await Promise.all([getProjects(), getUsers()]);
      setProjects(proj.data.data || []);
      setUsers(usrs.data.data || []);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditingProject(null);
    fetchData();
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">Projects</h1>
            <p style={{ color: '#64748b' }}>{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
          </div>
          {isAdmin() && (
            <button className="btn-primary" onClick={() => { setEditingProject(null); setShowModal(true); }} id="create-project-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> New Project
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <FolderKanban size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ fontSize: '1.1rem' }}>No projects yet</p>
            {isAdmin() && <p style={{ fontSize: '0.9rem' }}>Create your first project to get started.</p>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {projects.map(project => {
              const total = project.taskCount || 0;
              const done = project.doneCount || 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div key={project.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.1))', borderRadius: '0.75rem', padding: '0.6rem' }}>
                      <FolderKanban size={20} color="#818cf8" />
                    </div>
                    {isAdmin() && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); setEditingProject(project); setShowModal(true); }} style={{ padding: '0.4rem 0.6rem' }}><Edit2 size={14} /></button>
                        <button className="btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} style={{ padding: '0.4rem 0.6rem' }}><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                  <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.4rem' }}>{project.name}</h3>
                  {project.description && <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</p>}

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Progress</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckSquare size={13} /> {total} tasks
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Users size={13} /> {project.memberCount}
                      </span>
                    </div>
                    <button className="btn-secondary" onClick={() => navigate(`/projects/${project.id}`)} style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      View <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showModal && (
        <ProjectModal
          project={editingProject}
          users={users}
          onClose={() => { setShowModal(false); setEditingProject(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
