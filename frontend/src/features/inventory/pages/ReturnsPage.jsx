import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function ReturnsPage({ user }) {
  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTicketId, setSearchTicketId] = useState('');
  const [foundOrder, setFoundOrder] = useState(null);
  const [returnQuantities, setReturnQuantities] = useState({}); // { productId: qty }
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await fetch(`${API_URL}/erp/returns`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setReturnsList(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    if (!searchTicketId) return;
    try {
      const res = await fetch(`${API_URL}/orders/${searchTicketId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFoundOrder(data);
        const qtys = {};
        data.items?.forEach(i => {
          qtys[i.product.id] = 0; // default 0 to return
        });
        setReturnQuantities(qtys);
      } else {
        alert("Venta no encontrada.");
        setFoundOrder(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQtyChange = (productId, val, max) => {
    const parsed = Math.max(0, Math.min(max, parseInt(val) || 0));
    setReturnQuantities(prev => ({ ...prev, [productId]: parsed }));
  };

  const handleCreateReturn = async (e) => {
    e.preventDefault();
    const items = Object.entries(returnQuantities)
      .map(([prodId, qty]) => ({ productId: parseInt(prodId), quantity: qty }))
      .filter(item => item.quantity > 0);

    if (items.length === 0) {
      alert("Debes seleccionar al menos 1 producto para devolver.");
      return;
    }

    setIsProcessing(true);
    const payload = {
      orderId: foundOrder.id,
      reason,
      items
    };

    try {
      const res = await fetch(`${API_URL}/erp/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Devolución registrada con éxito.");
        setFoundOrder(null);
        setSearchTicketId('');
        setReason('');
        fetchReturns();
      } else {
        const txt = await res.text();
        alert(`Error: ${txt}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-ink dark:text-ghost">
      <div>
        <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Gestión de Devoluciones</h2>
        <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Procesa abonos y reembolsos de tickets emitidos.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Search & Action Column */}
        <div className="xl:col-span-1 space-y-6 min-w-0">
          <div className="bg-light-elevated dark:bg-dark-elevated p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-glass">
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest mb-4">// BUSCAR VENTA</h3>
            <form onSubmit={handleSearchOrder} className="flex gap-2">
              <input 
                type="text" 
                placeholder="ID de ticket (ej: 5)"
                value={searchTicketId}
                onChange={(e) => setSearchTicketId(e.target.value)}
                className="flex-1 p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors text-sm"
              />
              <button 
                type="submit"
                className="bg-vercel-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Buscar
              </button>
            </form>
          </div>

          {foundOrder && (
            <div className="bg-light-elevated dark:bg-dark-elevated p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-glass space-y-4 animate-fade-in">
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest">// DETALLES DE RETORNO</h3>
              
              <div className="space-y-3 text-xs">
                {foundOrder.items?.map(i => (
                  <div key={i.product.id} className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-3 rounded-xl">
                    <div className="flex-1 pr-2">
                      <p className="font-bold truncate w-32">{i.product.name}</p>
                      <p className="text-[10px] text-ink/40 dark:text-ghost/40">Comprado: {i.quantity} uds</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-ink/40 dark:text-ghost/40">Devolver:</span>
                      <input 
                        type="number"
                        min="0"
                        max={i.quantity}
                        value={returnQuantities[i.product.id] || 0}
                        onChange={(e) => handleQtyChange(i.product.id, e.target.value, i.quantity)}
                        className="w-12 p-1.5 text-center bg-black/10 dark:bg-white/10 rounded-lg outline-none font-bold font-mono"
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-2">
                  <label className="block text-[10px] font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Motivo de Devolución</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    rows="2"
                    placeholder="Defectuoso, cambio de opinión..."
                    className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none text-xs font-semibold transition-colors resize-none"
                  />
                </div>

                <button 
                  onClick={handleCreateReturn}
                  disabled={isProcessing}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-red-500/20"
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar Devolución'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Returns History Column */}
        <div className="xl:col-span-2 min-w-0">
          <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden h-full">
            <div className="p-6 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest">// HISTORIAL DE DEVOLUCIONES</h3>
            </div>
            
            {loading ? (
              <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando devoluciones...</p>
            ) : returnsList.length === 0 ? (
              <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">No hay devoluciones registradas.</p>
            ) : (
              <div className="overflow-x-auto hide-scrollbar max-h-[500px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                    <tr>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">ID</th>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Fecha</th>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Ticket Orig.</th>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Autorizado por</th>
                      <th className="py-3 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {returnsList.map(r => (
                      <tr key={r.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs">#{r.id}</td>
                        <td className="py-4 px-6 font-mono text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                        <td className="py-4 px-6 font-mono text-xs text-vercel-blue dark:text-neon-cyan font-bold">#{r.salesOrder?.id}</td>
                        <td className="py-4 px-6 text-xs">{r.user?.name}</td>
                        <td className="py-4 px-6 text-xs italic">{r.reason}</td>
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
