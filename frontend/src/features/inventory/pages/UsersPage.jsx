import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../api/config';

const ROLE_LABELS = {
  ADMIN: { label: 'Administrador', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20' },
  TECNICO: { label: 'Técnico', color: 'text-blue-600 dark:text-vercel-blue bg-blue-50 dark:bg-vercel-blue/10 border-blue-200 dark:border-vercel-blue/20' },
  GESTOR_TIENDA: { label: 'Gestor Tienda', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
  COMERCIAL: { label: 'Comercial', color: 'text-cyan-600 dark:text-neon-cyan bg-cyan-50 dark:bg-neon-cyan/10 border-cyan-200 dark:border-neon-cyan/20' },
  USER: { label: 'Cliente', color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
};

export default function UsersPage({ standalone = false, embedded = false }) {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const token = user?.token;

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', lastName: '', phoneNumber: '', city: '', country: '', role: '', active: true });
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    if (!user || !['ADMIN', 'TECNICO'].includes(user.role)) {
      if (!standalone && !embedded) navigate('/');
      return;
    }
    fetchData();
  }, [standalone, embedded]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, sRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/users/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setUsers(await uRes.json());
      setStats(await sRes.json());
    } catch (e) {
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (u) => {
    setSavingId(u.id + '-active');
    try {
      const res = await fetch(`${API_URL}/users/${u.id}/active`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !u.active }),
      });
      if (!res.ok) { const t = await res.text(); showToast(t, 'error'); return; }
      showToast(`Usuario ${!u.active ? 'desbloqueado' : 'bloqueado'} correctamente`);
      fetchData();
    } catch (e) { showToast('Error al cambiar estado', 'error'); }
    finally { setSavingId(null); }
  };

  const handleRoleChange = async (u, newRole) => {
    if (user.role !== 'ADMIN') return;
    setSavingId(u.id + '-role');
    try {
      const res = await fetch(`${API_URL}/users/${u.id}/role`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) { const t = await res.text(); showToast(t, 'error'); return; }
      showToast(`Rol actualizado a ${newRole}`);
      if (u.id === user.id) {
        const updatedUser = { ...user, role: newRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload();
      }
      fetchData();
    } catch (e) { showToast('Error al cambiar rol', 'error'); }
    finally { setSavingId(null); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Eliminar cuenta permanentemente?')) return;
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const t = await res.text(); showToast(t, 'error'); return; }
      showToast('Usuario eliminado correctamente');
      fetchData();
    } catch (e) { showToast('Error al eliminar', 'error'); }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({
      email: u.email || '',
      password: '',
      name: u.name || '',
      lastName: u.lastName || '',
      phoneNumber: u.phoneNumber || '',
      city: u.city || '',
      country: u.country || '',
      role: u.role || 'USER',
      active: u.active
    });
  };

  const openCreate = () => {
    setEditingUser('create');
    setEditForm({
      email: '',
      password: '',
      name: '',
      lastName: '',
      phoneNumber: '',
      city: '',
      country: '',
      role: 'USER',
      active: true
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      const isCreate = editingUser === 'create';
      const url = isCreate ? `${API_URL}/users` : `${API_URL}/users/${editingUser.id}`;
      const method = isCreate ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) { const t = await res.text(); showToast(t, 'error'); return; }
      showToast(isCreate ? 'Usuario creado correctamente' : 'Usuario actualizado correctamente');
      
      // If the edited user is the current logged-in user, update localStorage to prevent stale permissions
      if (!isCreate && editingUser.id === user.id) {
        const updatedUser = { ...user, ...editForm };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Force reload or redirect to apply changes
        window.location.reload();
      }
      
      setEditingUser(null);
      fetchData();
    } catch (e) { showToast('Error al actualizar', 'error'); }
    finally { setSavingUser(false); }
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetch(`${API_URL}/users/export/csv`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'usuarios.csv';
      a.click();
    } catch (e) { showToast('Error al exportar', 'error'); }
  };

  const handleImportCsv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/users/import/csv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const txt = await res.text();
      if (res.ok) {
        showToast(txt);
        fetchData();
      } else {
        showToast(txt, 'error');
      }
    } catch (e) { showToast('Error al importar', 'error'); }
    finally { setLoading(false); e.target.value = null; }
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const kpis = [
    { label: 'Total', value: stats?.total ?? '-' },
    { label: 'Activos', value: stats?.active ?? '-' },
    { label: 'Bloqueados', value: stats?.inactive ?? '-' },
    { label: 'Administradores', value: stats?.byRole?.ADMIN ?? 0 },
    { label: 'Técnicos', value: stats?.byRole?.TECNICO ?? 0 },
    { label: 'Gestores', value: stats?.byRole?.GESTOR_TIENDA ?? 0 },
  ];

  const inputCls = 'w-full bg-light-base dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-ink dark:text-ghost placeholder-slate-400 focus:outline-none focus:border-vercel-blue dark:focus:border-neon-cyan transition-colors';
  const labelCls = 'block text-[11px] font-bold text-ink/60 dark:text-ghost/60 uppercase tracking-wide mb-1.5';

  return (
    <div className="text-ink dark:text-ghost font-sans tracking-tight">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-xs font-semibold shadow-2xl transition-all border bg-emerald-50 text-emerald-600 border-emerald-200">
          {toast.msg}
        </div>
      )}

      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-black/5 dark:border-white/5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-ghost mb-1.5">Usuarios</h1>
            <p className="text-ink/60 dark:text-ink/40 text-sm">Gestiona accesos, roles y configuraciones de cuenta del equipo.</p>
          </div>
          <div className="flex items-center gap-2">
            {['ADMIN', 'TECNICO'].includes(user?.role) && (
              <button onClick={openCreate} className="bg-vercel-blue dark:bg-neon-cyan hover:bg-[#0070F3] dark:hover:bg-[#00E5FF] text-white dark:text-black px-5 py-2.5 rounded-xl text-xs font-black shadow-neon-sm transition-colors cursor-pointer whitespace-nowrap">
                + Nuevo Usuario
              </button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 bg-light-surface/40 dark:bg-dark-surface/40 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-4 flex flex-wrap gap-2.5 items-center shadow-glass">
          <span className="text-[11px] font-medium text-ink/60 dark:text-ghost/60 mr-2 uppercase tracking-widest">Automatizaciones:</span>
          <button onClick={handleExportCsv} className="bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm">
            Exportar CSV
          </button>
          <label className="bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center shadow-sm">
            Importar CSV <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
          </label>
        </div>

        {/* Minimal KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {kpis.map(k => (
            <div key={k.label} className="bg-light-elevated dark:bg-dark-elevated/60 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col shadow-sm min-w-0">
              <span className="text-ink/60 dark:text-ghost/60 text-[11px] font-medium mb-1 truncate">{k.label}</span>
              <span className="text-2xl font-bold text-ink dark:text-ghost truncate">{k.value}</span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-light-elevated dark:bg-dark-elevated border border-black/5 dark:border-white/5 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-slate-400 text-ink dark:text-ghost placeholder-slate-400 transition-colors shadow-sm"
          />
        </div>

        {/* List / Table */}
        <div className="bg-light-elevated dark:bg-dark-elevated/40 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
          {loading ? (
            <div className="text-center py-16 text-ink/40 text-sm">Cargando...</div>
          ) : (
            <div className="overflow-x-auto hide-scrollbar">
              <table className="w-full table-fixed text-xs">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-neutral-900/10 text-ink/60 dark:text-ghost/60 font-bold">
                    <th className="text-left px-3 py-4 w-1/3">Usuario</th>
                    <th className="text-left px-3 py-4 w-1/5">Rol</th>
                    <th className="text-left px-3 py-4 w-1/5">Estado</th>
                    <th className="text-left px-3 py-4 hidden lg:table-cell w-1/5">Ubicación</th>
                    <th className="text-left px-3 py-4 w-1/5 lg:w-[15%]">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-155 dark:divide-nord-border/50">
                  {filtered.map(u => {
                    const roleInfo = ROLE_LABELS[u.role] || { label: u.role, color: 'text-ink/40 border-black/5' };
                    const isCurrentUser = u.email === user.email;
                    return (
                      <tr 
                        key={u.id} 
                        onClick={() => openEdit(u)}
                        className="hover:bg-slate-50/40 dark:hover:bg-neutral-900/10 transition-colors cursor-pointer"
                      >
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-ink/70 dark:text-ghost/80">
                              {(u.name || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-ink dark:text-ghost">{u.name} {u.lastName || ''}</p>
                              <p className="text-[11px] text-ink/60 dark:text-ghost/60 mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          {user.role === 'ADMIN' && !isCurrentUser ? (
                            <select
                              value={u.role}
                              disabled={savingId === u.id + '-role'}
                              onClick={e => e.stopPropagation()}
                              onChange={e => handleRoleChange(u, e.target.value)}
                              className={`border rounded-lg px-2.5 py-1 text-[11px] font-bold focus:outline-none cursor-pointer ${roleInfo.color}`}
                            >
                              {Object.entries(ROLE_LABELS).map(([val, info]) => (
                                <option key={val} value={val} className="bg-white dark:bg-dark-elevated text-ink dark:text-ghost">{info.label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium ${roleInfo.color}`}>
                              {roleInfo.label}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold ${u.active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
                            <span className={`w-1 h-1 rounded-full ${u.active ? 'bg-[#30d158]' : 'bg-[#ff453a]'}`}></span>
                            {u.active ? 'Activo' : 'Bloqueado'}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-ink/60 dark:text-ghost/60 hidden lg:table-cell">
                          {u.city || u.country ? `${u.city || ''}${u.city && u.country ? ', ' : ''}${u.country || ''}` : '—'}
                        </td>
                        <td className="px-3 py-4 text-left text-ink/40 dark:text-ghost/40">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-ES') : '—'}</td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-12 text-ink/60">No se encontraron usuarios</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-light-elevated dark:bg-dark-elevated border border-black/5 dark:border-neon-cyan/30 rounded-3xl w-full max-w-sm shadow-2xl dark:shadow-neon-sm p-6 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-neon-cyan/20 rounded-full blur-3xl pointer-events-none group-hover:bg-neon-cyan/30 transition-colors" />
            <button onClick={() => setEditingUser(null)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full text-ink dark:text-ghost transition-colors cursor-pointer z-10">✕</button>
            <h2 className="text-2xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-vercel-blue to-neon-cyan">{editingUser === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {editingUser === 'create' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Email *</label>
                    <input type="email" className={inputCls} value={editForm.email} required onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Contraseña *</label>
                    <input type="password" minLength={6} className={inputCls} value={editForm.password} required onChange={e => setEditForm({ ...editForm, password: e.target.value })} />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input type="text" className={inputCls} value={editForm.name} required onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Apellidos</label>
                  <input type="text" className={inputCls} value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Teléfono</label>
                <input type="text" className={inputCls} value={editForm.phoneNumber} onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Ciudad</label>
                  <input type="text" className={inputCls} value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>País</label>
                  <input type="text" className={inputCls} value={editForm.country} onChange={e => setEditForm({ ...editForm, country: e.target.value })} />
                </div>
              </div>
              {user.role === 'ADMIN' && (
                <div>
                  <label className={labelCls}>Rol Asignado</label>
                  <select value={editForm.role} className={inputCls} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <option key={k} value={k} className="bg-white dark:bg-[#1A1D24] text-ink dark:text-ghost">{v.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className={labelCls}>Estado de Cuenta</label>
                <select 
                  value={editForm.active ? 'true' : 'false'} 
                  className={inputCls} 
                  onChange={e => setEditForm({ ...editForm, active: e.target.value === 'true' })}
                >
                  <option value="true" className="bg-white dark:bg-[#1A1D24] text-ink dark:text-ghost">Activo</option>
                  <option value="false" className="bg-white dark:bg-[#1A1D24] text-ink dark:text-ghost">Inactivo (Bloqueado)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-black/5 dark:border-neutral-900">
                {user.role === 'ADMIN' && editingUser !== 'create' && editingUser.email !== user.email && (
                  <button 
                    type="button" 
                    onClick={() => { handleDeleteUser(editingUser.id); setEditingUser(null); }} 
                    className="bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition shadow-sm flex items-center justify-center"
                    title="Eliminar usuario"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-ink/80 dark:text-ghost/80 py-2.5 rounded-xl font-bold cursor-pointer transition">Cancelar</button>
                <button type="submit" disabled={savingUser} className="flex-1 bg-gradient-to-r from-vercel-blue to-neon-cyan hover:opacity-90 text-white py-2.5 rounded-xl font-bold cursor-pointer transition shadow-md shadow-neon-cyan/20 disabled:opacity-50 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:translate-x-full skew-x-12 transition-transform duration-700" />
                  <span className="relative z-10">Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
