import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function PickingOrdersPage({ user }) {
  const token = user?.token;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // orders | picking | shipping
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [pickedItems, setPickedItems] = useState({}); // { itemId: boolean }

  useEffect(() => {
    fetchWebOrders();
  }, []);

  const fetchWebOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/purchases`, {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const handleUpdateStatus = async (orderId, status, tracking = null) => {
    try {
      const payload = { status };
      if (tracking) payload.trackingCode = tracking;
      
      const res = await fetch(`${API_URL}/purchases/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Estado de pedido actualizado');
        setSelectedOrder(null);
        setPickedItems({});
        setTrackingCodeInput('');
        fetchWebOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrintLabel = (order) => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html>
        <head>
          <title>Etiqueta de Envío - Pedido #${order.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; border: 3px dashed black; max-width: 400px; margin: 40px auto; }
            h2 { text-align: center; margin-top: 0; }
            .bar { background: black; height: 40px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h2>LOGITRACK ENVIOS</h2>
          <hr />
          <p><strong>DESTINATARIO:</strong> ${order.buyer.name}</p>
          <p><strong>EMAIL:</strong> ${order.buyer.email}</p>
          <p><strong>DIRECCIÓN:</strong> ${order.buyer.streetAddress || 'Dirección de perfil no especificada'}, ${order.buyer.city || ''}</p>
          <p><strong>TRACKING:</strong> ${order.trackingCode || 'LT-PENDING'}</p>
          <hr />
          <div class="bar"></div>
          <p style="text-align: center;">LT-ORDER-${order.id}</p>
        </body>
      </html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in relative max-w-7xl mx-auto text-ink dark:text-ghost">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight mb-2">
            PREPARACIÓN Y ENVÍOS
          </h1>
          <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Gestiona pedidos del Marketplace, realiza el picking en almacén y controla el tracking de envíos.</p>
        </div>
        
        {/* Sub Navigation */}
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
          <button onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-vercel-blue text-white shadow' : 'text-ink/60 dark:text-ghost/60 hover:text-ink'}`}>Bandeja Pedidos Web</button>
          <button onClick={() => { setActiveTab('picking'); setSelectedOrder(null); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'picking' ? 'bg-vercel-blue text-white shadow' : 'text-ink/60 dark:text-ghost/60 hover:text-ink'}`}>Cola de Picking</button>
          <button onClick={() => { setActiveTab('shipping'); setSelectedOrder(null); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'shipping' ? 'bg-vercel-blue text-white shadow' : 'text-ink/60 dark:text-ghost/60 hover:text-ink'}`}>Tracking Envíos</button>
        </div>
      </div>

      <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass p-6">
        {loading ? (
          <p className="text-center py-8 font-mono text-xs">Cargando pedidos...</p>
        ) : activeTab === 'orders' ? (
          /* Web Orders Inbox */
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">// BANDEJA DE ENTRADA EXCLUSIVA WEB</h2>
            <div className="overflow-x-auto hide-scrollbar">
              <table className="w-full text-left text-xs table-fixed">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-neutral-900/10 text-ink/60 dark:text-ghost/60 font-bold">
                    <th className="py-3 px-4 w-16">ID</th>
                    <th className="py-3 px-4 w-1/4">Comprador</th>
                    <th className="py-3 px-4 w-1/4">Fecha</th>
                    <th className="py-3 px-4 w-1/6">Total</th>
                    <th className="py-3 px-4 w-1/6">Estado</th>
                    <th className="py-3 px-4 w-20 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/10 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold">#{o.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold">{o.buyer.name}</p>
                        <span className="text-[10px] text-ink/40 dark:text-ghost/40">{o.buyer.email}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">{new Date(o.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-vercel-blue dark:text-neon-cyan">{o.totalAmount.toFixed(2)}€</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${
                          o.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          o.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          o.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                          'bg-purple-500/10 text-purple-600 border-purple-500/20'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => setSelectedOrder(o)} className="text-vercel-blue dark:text-neon-cyan hover:underline font-bold">Ver</button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan="6" className="py-8 text-center text-ink/50 dark:text-ghost/50">No hay pedidos web registrados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'picking' ? (
          /* Warehouse Picking */
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">// COLA DE EMISION Y PACKING HOY</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 border-r border-black/5 dark:border-white/5 pr-4 space-y-2">
                <span className="text-[10px] font-bold text-ink/40 dark:text-ghost/40 uppercase block mb-2">Pedidos por empaquetar</span>
                {orders.filter(o => o.status === 'COMPLETED' || o.status === 'PENDING').map(o => (
                  <button 
                    key={o.id} 
                    onClick={() => { setSelectedOrder(o); setPickedItems({}); }}
                    className={`w-full text-left p-3 rounded-xl border transition ${selectedOrder?.id === o.id ? 'bg-vercel-blue/5 border-vercel-blue' : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5'}`}
                  >
                    <p className="text-xs font-bold font-mono">Pedido #${o.id}</p>
                    <span className="text-[10px] text-ink/50 dark:text-ghost/50">{o.buyer.name} | {o.items.length} artículos</span>
                  </button>
                ))}
                {orders.filter(o => o.status === 'COMPLETED' || o.status === 'PENDING').length === 0 && (
                  <p className="text-xs text-ink/40 dark:text-ghost/40">No hay pedidos pendientes de empaquetado.</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                {selectedOrder ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black">Verificación de Artículos - Pedido #{selectedOrder.id}</h3>
                      <button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}
                        className="bg-vercel-blue hover:bg-blue-600 text-white font-bold py-1.5 px-4 rounded-xl text-xs"
                      >
                        Marcar como Listo para Envío
                      </button>
                    </div>
                    <div className="space-y-2">
                      {selectedOrder.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-3 rounded-xl">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              id={`item-${item.id}`} 
                              checked={!!pickedItems[item.id]} 
                              onChange={e => setPickedItems({ ...pickedItems, [item.id]: e.target.checked })} 
                              className="w-4 h-4 rounded text-vercel-blue"
                            />
                            <label htmlFor={`item-${item.id}`} className="text-xs font-bold cursor-pointer">{item.productName}</label>
                          </div>
                          <span className="text-xs font-mono font-bold text-ink/40 dark:text-ghost/40">Cantidad: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-ink/40 dark:text-ghost/40 text-center py-10 font-mono">Selecciona un pedido para realizar el picking.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Shipping Tracking & Labels */
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">// ENVÍOS E INTEGRACIÓN MENSAJERÍA</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 border-r border-black/5 dark:border-white/5 pr-4 space-y-2">
                <span className="text-[10px] font-bold text-ink/40 dark:text-ghost/40 uppercase block mb-2">Pedidos en ruta / Preparados</span>
                {orders.filter(o => o.status === 'PREPARING' || o.status === 'SHIPPED').map(o => (
                  <button 
                    key={o.id} 
                    onClick={() => { setSelectedOrder(o); setTrackingCodeInput(o.trackingCode || ''); }}
                    className={`w-full text-left p-3 rounded-xl border transition ${selectedOrder?.id === o.id ? 'bg-vercel-blue/5 border-vercel-blue' : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5'}`}
                  >
                    <p className="text-xs font-bold font-mono">Pedido #${o.id} - {o.status}</p>
                    <span className="text-[10px] text-ink/50 dark:text-ghost/50">{o.buyer.name} | Tracking: {o.trackingCode || 'Sin código'}</span>
                  </button>
                ))}
              </div>
              
              <div className="md:col-span-2">
                {selectedOrder ? (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-black">Gestión de Tracking y Etiquetas - Pedido #{selectedOrder.id}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Código de Tracking / Seguimiento</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            className="bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs flex-1 text-ink dark:text-ghost focus:outline-none focus:border-vercel-blue"
                            value={trackingCodeInput} 
                            placeholder="LT-123456789-ES"
                            onChange={e => setTrackingCodeInput(e.target.value)} 
                          />
                          <button 
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED', trackingCodeInput)}
                            className="bg-vercel-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition"
                          >
                            Asignar y Enviar (Shipped)
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                        <button 
                          onClick={() => handlePrintLabel(selectedOrder)}
                          className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-ink dark:text-ghost font-bold py-2 px-4 rounded-xl text-xs flex-1 transition"
                        >
                          🖨️ Imprimir Etiqueta de Mensajería
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex-1 transition"
                        >
                          ✅ Confirmar Entregado (Delivered)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-ink/40 dark:text-ghost/40 text-center py-10 font-mono">Selecciona un pedido para gestionar el envío.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Order Detail Modal */}
      {selectedOrder && activeTab === 'orders' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-light-elevated dark:bg-dark-elevated rounded-3xl w-full max-w-lg shadow-2xl p-6 relative border border-black/5 dark:border-white/10 text-ink dark:text-ghost">
            <h2 className="text-xl font-black tracking-tight mb-4">Detalle del Pedido Web #{selectedOrder.id}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-ink/40 dark:text-ghost/40">Comprador:</p>
                  <p className="font-semibold">{selectedOrder.buyer.name} ({selectedOrder.buyer.email})</p>
                </div>
                <div>
                  <p className="font-bold text-ink/40 dark:text-ghost/40">Dirección de Envío:</p>
                  <p className="font-semibold">{selectedOrder.buyer.streetAddress || 'No especificada'}, {selectedOrder.buyer.city || ''}</p>
                </div>
              </div>
              
              <div className="border-t border-black/5 dark:border-white/5 pt-3">
                <span className="text-[10px] font-bold text-ink/40 dark:text-ghost/40 uppercase block mb-2">Artículos</span>
                <div className="space-y-2">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between text-xs font-semibold bg-black/5 dark:bg-white/5 p-2.5 rounded-lg">
                      <span>{item.productName} (x{item.quantity})</span>
                      <span>{item.totalPrice.toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-black/5 dark:border-white/5 pt-3">
                <span className="text-xs font-black">Total Pagado:</span>
                <span className="text-base font-black text-vercel-blue dark:text-neon-cyan">{selectedOrder.totalAmount.toFixed(2)}€</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setSelectedOrder(null)} className="w-full px-4 py-2.5 rounded-xl font-bold text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
