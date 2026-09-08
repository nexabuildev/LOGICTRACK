import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function GoodsReceivingPage({ user }) {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receiveQuantities, setReceiveQuantities] = useState({}); // { itemId: qty }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/erp/supplier-orders/pending`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setPendingOrders(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    const qtys = {};
    order.items?.forEach(i => {
      qtys[i.id] = i.quantityOrdered - i.quantityReceived; // suggest remaining quantity
    });
    setReceiveQuantities(qtys);
  };

  const handleQtyChange = (itemId, val, max) => {
    const parsed = Math.max(0, Math.min(max, parseInt(val) || 0));
    setReceiveQuantities(prev => ({ ...prev, [itemId]: parsed }));
  };

  const handleReceiveGoods = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSubmitting(true);

    const items = Object.entries(receiveQuantities).map(([itemId, qty]) => ({
      itemId: parseInt(itemId),
      quantityReceived: qty
    })).filter(item => item.quantityReceived > 0);

    if (items.length === 0) {
      alert("Por favor, introduce al menos una cantidad mayor que 0.");
      setSubmitting(false);
      return;
    }

    const payload = { items };

    try {
      const res = await fetch(`${API_URL}/erp/supplier-orders/${selectedOrder.id}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Mercancía recibida correctamente.");
        setSelectedOrder(null);
        fetchPendingOrders();
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
        <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Recepción de Mercancía</h2>
        <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Chequea e ingresa los productos comprados al almacén.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending Orders Column */}
        <div className="xl:col-span-1">
          <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden h-full">
            <div className="p-6 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest">// PEDIDOS PENDIENTES</h3>
            </div>
            
            {loading ? (
              <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando...</p>
            ) : pendingOrders.length === 0 ? (
              <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">No hay pedidos pendientes de recibir.</p>
            ) : (
              <div className="divide-y divide-black/5 dark:divide-white/5 overflow-y-auto max-h-[500px] hide-scrollbar">
                {pendingOrders.map(o => (
                  <button
                    key={o.id}
                    onClick={() => handleSelectOrder(o)}
                    className={`w-full text-left p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer block ${
                      selectedOrder?.id === o.id ? 'bg-black/5 dark:bg-white/5 border-l-4 border-vercel-blue dark:border-neon-cyan' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-vercel-blue dark:text-neon-cyan">Pedido #{o.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">{o.status}</span>
                    </div>
                    <p className="text-sm font-bold mt-1">{o.supplier?.name}</p>
                    <p className="text-[10px] text-ink/40 dark:text-ghost/40 mt-1 font-mono">Previsto: {o.expectedDate || 'Sin fecha'}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Goods Check-in Column */}
        <div className="xl:col-span-2">
          {selectedOrder ? (
            <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <h3 className="text-sm font-mono font-bold uppercase tracking-widest">// ALBARÁN DE ENTREGA - PEDIDO #{selectedOrder.id}</h3>
              </div>
              
              <form onSubmit={handleReceiveGoods} className="p-6 space-y-4 text-sm">
                <div className="space-y-3">
                  {selectedOrder.items?.map(i => {
                    const remaining = i.quantityOrdered - i.quantityReceived;
                    return (
                      <div key={i.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-black/5 dark:bg-white/5 rounded-xl gap-3">
                        <div className="flex-1 pr-2">
                          <p className="font-bold">{i.productName}</p>
                          <p className="text-[10px] text-ink/40 dark:text-ghost/40 font-mono">Ref: {i.sku}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                          <div>
                            <span className="text-ink/40 dark:text-ghost/40">Pedidas: </span>
                            <span className="font-bold font-mono">{i.quantityOrdered}</span>
                          </div>
                          <div>
                            <span className="text-ink/40 dark:text-ghost/40">Recibidas: </span>
                            <span className="font-bold font-mono text-emerald-500">{i.quantityReceived}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-ink/40 dark:text-ghost/40">Ingresar: </span>
                            <input 
                              type="number"
                              min="0"
                              max={remaining}
                              value={receiveQuantities[i.id] || 0}
                              onChange={(e) => handleQtyChange(i.id, e.target.value, remaining)}
                              className="w-16 p-1.5 text-center bg-black/10 dark:bg-white/10 rounded-lg outline-none font-bold font-mono text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-black/10 dark:border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors cursor-pointer"
                  >
                    {submitting ? 'Procesando...' : 'Confirmar Recepción'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass flex flex-col items-center justify-center text-ink/30 dark:text-ghost/30 p-8 text-center min-h-[300px]">
              <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              <p className="text-sm font-mono font-bold uppercase tracking-widest">Selecciona un pedido pendiente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
