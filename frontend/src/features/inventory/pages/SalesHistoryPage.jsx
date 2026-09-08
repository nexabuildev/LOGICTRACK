import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function SalesHistoryPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setSelectedOrder(await res.json());
        setIsOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-ink dark:text-ghost">
      <div>
        <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Historial de Ventas</h2>
        <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Consulta todas las transacciones realizadas desde el TPV.</p>
      </div>

      <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando ventas...</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">No hay ventas registradas.</p>
        ) : (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                <tr>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Ticket ID</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Fecha</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Cajero</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Tienda</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Pago</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Total</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-vercel-blue dark:text-neon-cyan">#{o.id}</td>
                    <td className="py-4 px-6 font-mono text-xs">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="py-4 px-6 text-xs">{o.user?.name || 'Sistema'}</td>
                    <td className="py-4 px-6 text-xs">{o.store?.name || 'Tienda Principal'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                        o.paymentMethod === 'TARJETA' 
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {o.paymentMethod || 'EFECTIVO'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold font-mono">{o.totalAmount}€</td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleViewDetails(o.id)}
                        className="text-vercel-blue dark:text-neon-cyan hover:underline font-bold text-xs cursor-pointer"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-black/10 dark:border-white/10 p-6 max-w-md w-full shadow-glass space-y-4 font-sans text-sm">
            <div className="border-b border-dashed border-black/10 dark:border-white/10 pb-4 text-center">
              <h3 className="text-lg font-display font-black uppercase tracking-wider">TICKET DE COMPRA</h3>
              <p className="text-xs font-mono text-ink/40 dark:text-ghost/40">Ticket #{selectedOrder.id}</p>
              <p className="text-[11px] font-mono text-ink/40 dark:text-ghost/40 mt-1">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex justify-between font-mono text-xs font-bold text-ink/40 dark:text-ghost/40">
                <span>CONCEPTO</span>
                <span>TOTAL</span>
              </div>
              <div className="divide-y divide-dashed divide-black/5 dark:divide-white/5">
                {selectedOrder.items?.map(item => (
                  <div key={item.id} className="flex justify-between py-2 items-center">
                    <div className="flex flex-col">
                      <span className="font-bold">{item.product?.name}</span>
                      <span className="text-[11px] text-ink/50 dark:text-ghost/50">{item.quantity} x {item.unitPrice}€</span>
                    </div>
                    <span className="font-mono font-bold">{(item.quantity * item.unitPrice).toFixed(2)}€</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-dashed border-black/10 dark:border-white/10 pt-4 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Método de Pago:</span>
                <span className="font-mono text-xs">{selectedOrder.paymentMethod || 'EFECTIVO'}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Tienda:</span>
                <span className="text-xs">{selectedOrder.store?.name || 'Tienda Principal'}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Cajero:</span>
                <span className="text-xs">{selectedOrder.user?.name || 'Sistema'}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-display font-black pt-2">
                <span>TOTAL:</span>
                <span className="text-vercel-blue dark:text-neon-cyan font-mono">{selectedOrder.totalAmount}€</span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-vercel-blue hover:bg-blue-600 text-white font-bold transition-colors cursor-pointer text-center"
              >
                Cerrar Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
