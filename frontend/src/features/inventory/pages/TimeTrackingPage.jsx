import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function TimeTrackingPage({ user }) {
  const [entries, setEntries] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Status tracking
  const [activeEntry, setActiveEntry] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState('00:00:00');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEntries();
    fetchStores();
  }, []);

  useEffect(() => {
    let interval;
    if (activeEntry) {
      interval = setInterval(() => {
        const start = new Date(activeEntry.clockIn).getTime();
        const now = new Date().getTime();
        const diff = now - start;

        const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

        setTimeElapsed(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    } else {
      setTimeElapsed('00:00:00');
    }
    return () => clearInterval(interval);
  }, [activeEntry]);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`${API_URL}/erp/time-entries`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
        // Find if user has a running entry (clockOut is null and belongs to user)
        const active = data.find(e => !e.clockOut && e.user?.id === user.id);
        if (active) {
          setActiveEntry(active);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/stores`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setStores(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClockIn = async (e) => {
    e.preventDefault();
    if (!selectedStoreId) {
      alert("Por favor, selecciona una tienda para fichar.");
      return;
    }
    setSubmitting(true);

    const payload = {
      userId: user.id,
      storeId: parseInt(selectedStoreId),
      notes
    };

    try {
      const res = await fetch(`${API_URL}/erp/time-entries/clock-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setNotes('');
        fetchEntries();
      } else {
        const txt = await res.text();
        alert(`Error: ${txt}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/erp/time-entries/clock-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ userId: user.id })
      });

      if (res.ok) {
        setActiveEntry(null);
        fetchEntries();
      } else {
        const txt = await res.text();
        alert(`Error: ${txt}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-ink dark:text-ghost">
      <div>
        <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Control de Horarios</h2>
        <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Fichajes diarios de entrada y salida del personal.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Clock In/Out Panel */}
        <div className="xl:col-span-1 space-y-6 min-w-0">
          <div className="bg-light-elevated dark:bg-dark-elevated p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-glass flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest">// FICHAR JORNADA</h3>
            
            {activeEntry ? (
              <div className="space-y-4 w-full">
                <div className="text-4xl font-mono font-black text-vercel-blue dark:text-neon-cyan tracking-wider py-4 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse">
                  {timeElapsed}
                </div>
                <div className="text-xs text-ink/50 dark:text-ghost/50">
                  <p>Fichado en: <span className="font-bold">{activeEntry.store?.name}</span></p>
                  <p className="font-mono mt-0.5">Desde: {new Date(activeEntry.clockIn).toLocaleTimeString()}</p>
                </div>
                <button 
                  onClick={handleClockOut}
                  disabled={submitting}
                  className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-red-500/20 uppercase tracking-widest text-xs"
                >
                  Fichar Salida
                </button>
              </div>
            ) : (
              <form onSubmit={handleClockIn} className="space-y-4 text-sm w-full">
                <div>
                  <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1 text-left">Tienda / Centro</label>
                  <select 
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    required
                    className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors"
                  >
                    <option value="">Selecciona centro...</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1 text-left">Notas / Incidencias (Opcional)</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    placeholder="Comentarios sobre el turno..."
                    className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-vercel-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-vercel-blue/20 uppercase tracking-widest text-xs"
                >
                  Fichar Entrada
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Time Entries History */}
        <div className="xl:col-span-2 min-w-0">
          <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden h-full">
            <div className="p-6 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest">// REGISTRO DE FICHAJES</h3>
            </div>
            
            {loading ? (
              <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando registros...</p>
            ) : entries.length === 0 ? (
              <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">No hay registros de fichajes.</p>
            ) : (
              <div className="overflow-x-auto hide-scrollbar max-h-[500px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                    <tr>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Empleado</th>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Sede</th>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Entrada</th>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Salida</th>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {entries.map(e => (
                      <tr key={e.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6 font-bold">{e.user?.name}</td>
                        <td className="py-4 px-6 text-xs">{e.store?.name}</td>
                        <td className="py-4 px-6 font-mono text-xs">{new Date(e.clockIn).toLocaleString()}</td>
                        <td className="py-4 px-6 font-mono text-xs">
                          {e.clockOut ? new Date(e.clockOut).toLocaleString() : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">ACTIVO</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-ink/60 dark:text-ghost/60 italic">{e.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
