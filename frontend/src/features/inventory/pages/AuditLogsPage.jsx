import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../api/config';

export default function AuditLogsPage({ embedded = false }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchEmail, setSearchEmail] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    if (!user) {
      if (!embedded) navigate('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      if (!embedded) navigate('/');
      return;
    }

    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/logs`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (!res.ok) throw new Error("Error al obtener logs de auditoría");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [navigate]);

  if (!user || user.role !== 'ADMIN') return null;

  const uniqueActions = ['ALL', ...new Set(logs.map(log => log.action))];

  const filteredLogs = logs.filter(log => {
    const matchesEmail = (log.userEmail || '').toLowerCase().includes(searchEmail.toLowerCase());
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    return matchesEmail && matchesAction;
  });

  return (
    <div className="animate-fade-in w-full space-y-8 text-ink dark:text-ghost">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-black/5 dark:border-white/5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink dark:text-ghost mb-1.5">Logs de Auditoría</h1>
            <p className="text-ink/60 dark:text-ink/40 text-sm">Supervisión e historial completo de acciones registradas en LogiTrack.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-450 p-4 rounded-xl text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-light-elevated dark:bg-dark-elevated border border-black/5 dark:border-white/10 p-6 rounded-2xl shadow-sm">
          <div>
            <label className="block text-[10px] font-bold text-ink/60 dark:text-ghost/60 uppercase tracking-wider mb-2">Buscar por Correo</label>
            <input 
              type="text"
              placeholder="admin@ejemplo.com"
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
              className="w-full bg-light-base dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-ink dark:text-ghost placeholder-slate-400 focus:outline-none focus:border-vercel-blue dark:focus:border-neon-cyan transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-ink/60 dark:text-ghost/60 uppercase tracking-wider mb-2">Filtrar por Acción</label>
            <select 
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="w-full bg-light-base dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-ink dark:text-ghost focus:outline-none focus:border-vercel-blue dark:focus:border-neon-cyan cursor-pointer"
            >
              {uniqueActions.map(action => (
                <option key={action} value={action} className="bg-white dark:bg-[#1A1D24] text-ink dark:text-ghost">{action}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table / Responsive Card List */}
        <div className="bg-light-surface/40 dark:bg-dark-surface/40 backdrop-blur-md rounded-3xl border border-black/5 dark:border-white/10 overflow-hidden shadow-glass transition-all">
          {loading ? (
            <div className="text-center py-20 text-ink/40 text-xs font-mono tracking-widest uppercase">Cargando logs...</div>
          ) : (
            <>
              {/* Desktop View (Table) */}
              <div className="hidden xl:block overflow-x-auto hide-scrollbar">
                <table className="w-full text-left text-xs text-ink/70 dark:text-ghost/70">
                  <thead className="sticky top-0 bg-light-elevated/80 dark:bg-dark-base/80 backdrop-blur-xl z-10 border-b border-black/5 dark:border-white/10">
                    <tr className="text-ink/40 dark:text-ghost/40 font-bold uppercase tracking-widest text-[10px]">
                      <th className="py-4 px-6 w-[20%]">Fecha</th>
                      <th className="py-4 px-6 w-[20%]">Usuario</th>
                      <th className="py-4 px-6 w-[20%]">Acción</th>
                      <th className="py-4 px-6 w-[40%]">Detalles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-light-base/50 dark:hover:bg-white/5 transition-colors group cursor-default">
                        <td className="py-4 px-6 font-mono text-[10px] text-ink/50 dark:text-ghost/50">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="py-4 px-6 text-ink dark:text-ghost font-semibold">{log.userEmail || 'Sistema'}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-md border text-[9px] font-bold uppercase tracking-widest ${
                            log.action.includes('CREATED') || log.action.includes('IMPORTED') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                            log.action.includes('UPDATED') ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20' :
                            'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-ink/70 dark:text-ghost/70 break-words group-hover:text-ink dark:group-hover:text-ghost transition-colors leading-relaxed">{log.details}</td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr><td colSpan="4" className="py-12 text-center text-ink/40 dark:text-ghost/40 font-bold uppercase tracking-widest text-[10px]">No se encontraron logs de auditoría.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile View (Card List) */}
              <div className="block xl:hidden divide-y divide-black/5 dark:divide-white/5">
                {filteredLogs.map(log => (
                  <div key={log.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-1 rounded-md border text-[9px] font-bold uppercase tracking-widest ${
                        log.action.includes('CREATED') || log.action.includes('IMPORTED') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                        log.action.includes('UPDATED') ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20' :
                        'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                      }`}>
                        {log.action}
                      </span>
                      <span className="font-mono text-[9px] text-ink/40 dark:text-ghost/40">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-ink/80 dark:text-ghost/85 font-semibold">
                      Por: <span className="font-bold text-vercel-blue dark:text-neon-cyan">{log.userEmail || 'Sistema'}</span>
                    </div>
                    <p className="text-xs text-ink/75 dark:text-ghost/75 leading-relaxed break-words pt-1">{log.details}</p>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <p className="py-12 text-center text-ink/40 dark:text-ghost/40 font-bold uppercase tracking-widest text-[10px]">No se encontraron logs.</p>
                )}
              </div>
            </>
          )}
      </div>
    </div>
  );
}
