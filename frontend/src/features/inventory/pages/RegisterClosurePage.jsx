import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function RegisterClosurePage({ user }) {
  const [closures, setClosures] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  
  // Filters
  const [filterStoreId, setFilterStoreId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Today's summary state
  const [summary, setSummary] = useState(null);
  const [cashCounted, setCashCounted] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClosures();
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      fetchTodaySummary(selectedStoreId);
    } else {
      setSummary(null);
    }
  }, [selectedStoreId]);

  const fetchClosures = async () => {
    try {
      const res = await fetch(`${API_URL}/erp/register-closures`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setClosures(await res.json());
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

  const fetchTodaySummary = async (storeId) => {
    try {
      const res = await fetch(`${API_URL}/erp/register-closures/today-summary?storeId=${storeId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setSummary(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitClosure = async (e) => {
    e.preventDefault();
    if (!selectedStoreId) return;
    setSubmitting(true);

    const payload = {
      storeId: parseInt(selectedStoreId),
      cashCounted: parseFloat(cashCounted) || 0,
      notes
    };

    try {
      const res = await fetch(`${API_URL}/erp/register-closures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Cierre de caja registrado correctamente.");
        setCashCounted('');
        setNotes('');
        setSelectedStoreId('');
        setSummary(null);
        fetchClosures();
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

  const filteredClosures = closures.filter(c => {
    const matchesStore = filterStoreId === 'ALL' || c.store?.id === parseInt(filterStoreId);
    const matchesSearch = !searchQuery || 
      (c.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.store?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStore && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in text-ink dark:text-ghost">
      <div>
        <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Cierres de Caja</h2>
        <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Controla arqueos y descuadres de caja diarios.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Closure Panel */}
        <div className="xl:col-span-1 space-y-6 min-w-0">
          <div className="bg-light-elevated dark:bg-dark-elevated p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-glass">
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest mb-4">// NUEVO ARQUEO</h3>
            
            <form onSubmit={handleSubmitClosure} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Seleccionar Tienda</label>
                <select 
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  required
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors"
                >
                  <option value="">Selecciona tienda...</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {summary && (
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl space-y-2 text-xs animate-fade-in">
                  <div className="flex justify-between">
                    <span className="text-ink/50 dark:text-ghost/50 font-semibold">Ventas del Día:</span>
                    <span className="font-bold font-mono">{summary.ordersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/50 dark:text-ghost/50 font-semibold">Total Teórico Tarjeta:</span>
                    <span className="font-bold font-mono text-purple-500">{summary.cardTotal}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/50 dark:text-ghost/50 font-semibold">Total Teórico Efectivo:</span>
                    <span className="font-bold font-mono text-emerald-500">{summary.cashTotal}€</span>
                  </div>
                  <div className="flex justify-between border-t border-black/10 dark:border-white/10 pt-2 text-sm font-bold">
                    <span>Total Ventas:</span>
                    <span className="font-mono text-vercel-blue dark:text-neon-cyan">{summary.totalSales}€</span>
                  </div>
                </div>
              )}

              {summary && (
                <>
                  <div>
                    <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Efectivo Real en Caja</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={cashCounted}
                      onChange={(e) => setCashCounted(e.target.value)}
                      required
                      placeholder="Dinero contado en cajón"
                      className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Notas / Observaciones</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="2"
                      placeholder="Desajustes por rotura, cambio..."
                      className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-vercel-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-all cursor-pointer"
                  >
                    {submitting ? 'Procesando...' : 'Registrar Cierre'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Closures History Column */}
        <div className="xl:col-span-2 space-y-4 min-w-0">
          {/* Filters */}
          <div className="bg-light-elevated dark:bg-dark-elevated border border-black/5 dark:border-white/10 p-4 rounded-2xl shadow-sm">
            <div>
              <label className="block text-[10px] font-bold text-ink/60 dark:text-ghost/60 uppercase tracking-wider mb-2">Buscar Cierre</label>
              <input 
                type="text"
                placeholder="Buscar por usuario, tienda o notas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-light-base dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-ink dark:text-ghost placeholder-slate-400 focus:outline-none focus:border-vercel-blue dark:focus:border-neon-cyan transition-colors"
              />
            </div>
          </div>

          <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden">
            <div className="p-6 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest">// HISTORIAL DE CIERRES</h3>
            </div>
            
            {loading ? (
              <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando cierres...</p>
            ) : filteredClosures.length === 0 ? (
              <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">No hay cierres de caja registrados.</p>
            ) : (
              <div className="overflow-x-auto hide-scrollbar max-h-[500px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                    <tr>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Fecha</th>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Tienda</th>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Contado</th>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Diferencia</th>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Cajeros</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {filteredClosures.map(c => (
                      <tr key={c.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs">{new Date(c.closedAt).toLocaleString()}</td>
                        <td className="py-4 px-6 text-xs">{c.store?.name}</td>
                        <td className="py-4 px-6 font-mono font-semibold">{c.cashCounted}€</td>
                        <td className={`py-4 px-6 font-mono font-bold ${
                          c.difference >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          {c.difference > 0 ? `+${c.difference}` : `${c.difference}`}€
                        </td>
                        <td className="py-4 px-6 text-xs">{c.user?.name}</td>
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
