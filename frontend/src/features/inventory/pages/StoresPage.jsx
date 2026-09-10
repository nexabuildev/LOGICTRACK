import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../api/config';

const emptyForm = { name: '', address: '', city: '', phone: '', email: '' };

export default function StoresPage({ embedded = false }) {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const token = user?.token;

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState(null); // null | 'create' | store object
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user || !['ADMIN', 'TECNICO', 'GESTOR_TIENDA'].includes(user.role)) {
      if (!embedded) navigate('/');
      return;
    }
    fetchStores();
  }, [embedded]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/stores`, { headers: { Authorization: `Bearer ${token}` } });
      setStores(await res.json());
    } catch (e) { showToast('Error al cargar tiendas', 'error'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setForm(emptyForm); setPanel('create'); };
  const openEdit = (s) => { setForm({ name: s.name || '', address: s.address || '', city: s.city || '', phone: s.phone || '', email: s.email || '' }); setPanel(s); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isCreate = panel === 'create';
      const url = isCreate ? `${API_URL}/stores` : `${API_URL}/stores/${panel.id}`;
      const method = isCreate ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const t = await res.text(); showToast(t, 'error'); return; }
      showToast(isCreate ? 'Tienda creada' : 'Tienda actualizada');
      setPanel(null);
      fetchStores();
    } catch (e) { showToast('Error al guardar', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta tienda?')) return;
    try {
      const res = await fetch(`${API_URL}/stores/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const t = await res.text(); showToast(t, 'error'); return; }
      showToast('Tienda eliminada');
      fetchStores();
    } catch (e) { showToast('Error al eliminar', 'error'); }
  };

  const toggleActive = async (s) => {
    try {
      const currentActive = s.active !== false;
      const res = await fetch(`${API_URL}/stores/${s.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...s, isActive: !currentActive }),
      });
      if (!res.ok) { const t = await res.text(); showToast(t, 'error'); return; }
      showToast(`Tienda ${!currentActive ? 'activada' : 'pausada'}`);
      fetchStores();
    } catch (e) { showToast('Error', 'error'); }
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetch(`${API_URL}/stores/export/csv`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tiendas.csv';
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
      const res = await fetch(`${API_URL}/stores/import/csv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      showToast(await res.text());
      fetchStores();
    } catch (e) { showToast('Error al importar', 'error'); }
    finally { setLoading(false); e.target.value = null; }
  };

  const filtered = stores.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = 'w-full bg-light-base dark:bg-dark-elevated border border-black/5 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm text-ink dark:text-ghost placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors';
  const labelCls = 'block text-[11px] font-semibold text-ink/60 dark:text-ghost/60 tracking-wide mb-1.5';
  const canEdit = ['ADMIN', 'TECNICO'].includes(user?.role);

  return (
    <div className="text-ink dark:text-ghost font-sans tracking-tight flex flex-col w-full">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-xs font-semibold shadow-2xl transition-all border bg-emerald-50 text-emerald-600 border-emerald-200">
          {toast.msg}
        </div>
      )}

      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-black/5 dark:border-white/5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-ghost mb-1.5">Tiendas</h1>
            <p className="text-ink/60 dark:text-ink/40 text-sm">Gestiona la red de tiendas de hardware tecnológico asociadas.</p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button onClick={openCreate} className="bg-vercel-blue dark:bg-neon-cyan hover:bg-[#0070F3] dark:hover:bg-[#00E5FF] text-white dark:text-black px-5 py-2.5 rounded-xl text-xs font-black shadow-neon-sm transition-colors cursor-pointer whitespace-nowrap">
                + Nueva Tienda
              </button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        {canEdit && (
          <div className="mb-6 bg-light-surface/40 dark:bg-dark-surface/40 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-4 flex flex-wrap gap-2.5 items-center shadow-glass">
            <span className="text-[11px] font-medium text-ink/60 dark:text-ghost/60 mr-2 uppercase tracking-widest">Automatizaciones:</span>
            <button onClick={handleExportCsv} className="bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm">
              Exportar CSV
            </button>
            <label className="bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center shadow-sm">
              Importar CSV <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
            </label>
          </div>
        )}

        <div className="mb-6 relative">
          <input type="text" placeholder="Buscar por nombre o ciudad..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-light-elevated dark:bg-dark-elevated border border-black/5 dark:border-white/5 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-slate-400 text-ink dark:text-ghost placeholder-slate-400 transition-colors shadow-sm" />
        </div>

        {/* Minimal KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Tiendas', value: stores.length },
            { label: 'Activas', value: stores.filter(s => s.active !== false).length },
            { label: 'Pausadas', value: stores.filter(s => s.active === false).length },
          ].map(k => (
            <div key={k.label} className="bg-light-elevated dark:bg-dark-elevated/60 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col shadow-sm">
              <span className="text-ink/60 dark:text-ghost/60 text-[11px] font-medium mb-1">{k.label}</span>
              <span className="text-2xl font-bold text-ink dark:text-ghost">{k.value}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-ink/40 text-xs">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-light-elevated dark:bg-dark-elevated/40 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
            <p className="text-ink/60 dark:text-ghost/60 font-bold text-sm">No hay tiendas registradas aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(s => (
              <div key={s.id} className={`bg-light-elevated dark:bg-dark-elevated/50 rounded-2xl border p-5 flex flex-col gap-4 shadow-sm transition-all ${s.active === false ? 'border-black/5 dark:border-white/5 opacity-55' : 'border-black/5 dark:border-white/5 hover:border-gray-300 dark:hover:border-neutral-800'}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-ink dark:text-ghost text-sm">{s.name}</h3>
                    <span className="text-[10px] text-ink/40 dark:text-ghost/40 font-mono">#{s.id}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] ${s.active !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    <span className={`w-1 h-1 rounded-full ${s.active !== false ? 'bg-[#30d158]' : 'bg-[#ff453a]'}`}></span>
                    {s.active !== false ? 'Activa' : 'Pausada'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-ink/60 dark:text-ghost/60">
                  {s.address && <p className="truncate">📍 {s.address}</p>}
                  {s.city && <p>🌆 {s.city}</p>}
                  {s.phone && <p>📞 {s.phone}</p>}
                  {s.email && <p className="truncate">✉️ {s.email}</p>}
                </div>

                {canEdit && (
                  <div className="flex gap-2 mt-auto pt-3 border-t border-black/5 dark:border-neutral-900/60">
                    <button onClick={() => openEdit(s)} className="flex-1 bg-light-elevated dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-ink/80 dark:text-ghost/80 py-1.5 rounded-lg text-xs font-semibold border border-black/5 dark:border-white/10 transition cursor-pointer shadow-sm">Editar</button>
                    <button onClick={() => toggleActive(s)} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer shadow-sm ${s.active !== false ? 'bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'}`}>
                      {s.active !== false ? 'Pausar' : 'Activar'}
                    </button>
                    {user.role === 'ADMIN' && (
                      <button onClick={() => handleDelete(s.id)} className="bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 px-3 py-1.5 rounded-lg transition cursor-pointer shadow-sm flex items-center justify-center">🗑</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide Panel / Modal */}
      {panel !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-light-surface dark:bg-dark-surface/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-6 relative shadow-glass">
            <button onClick={() => setPanel(null)} className="absolute top-4 right-4 text-ink/40 hover:text-ink/80 dark:hover:text-white text-xl cursor-pointer">✕</button>
            <h2 className="text-lg font-semibold text-ink dark:text-ghost mb-6">{panel === 'create' ? 'Nueva Tienda' : 'Editar Tienda'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              {[
                { label: 'Nombre *', key: 'name', required: true, placeholder: 'Ej. LogiTrack Madrid Centro' },
                { label: 'Dirección', key: 'address', placeholder: 'Calle Gran Vía 45, 2ºA' },
                { label: 'Ciudad', key: 'city', placeholder: 'Madrid' },
                { label: 'Teléfono', key: 'phone', placeholder: '+34 600 000 000' },
                { label: 'Email de contacto', key: 'email', placeholder: 'tienda@logictrack.com' },
              ].map(f => (
                <div key={f.key}>
                  <label className={labelCls}>{f.label}</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    required={f.required}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                <button type="button" onClick={() => setPanel(null)} className="flex-1 bg-light-elevated dark:bg-white/5 hover:bg-light-base dark:hover:bg-white/10 text-ink dark:text-ghost border border-black/5 dark:border-white/5 py-3 rounded-xl font-bold cursor-pointer transition-colors shadow-sm">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-vercel-blue dark:bg-neon-cyan hover:bg-[#0070F3] dark:hover:bg-[#00E5FF] text-white dark:text-black py-3 rounded-xl font-black transition-colors shadow-neon-sm disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
