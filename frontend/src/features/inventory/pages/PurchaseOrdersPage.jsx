import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function PurchaseOrdersPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsOpen] = useState(false);

  // Form fields
  const [supplierId, setSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState([]); // Array of { productId, quantityOrdered, unitCost }

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/erp/supplier-orders`, {
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

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_URL}/suppliers`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setSuppliers(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantityOrdered: 1, unitCost: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, val) => {
    const updated = [...orderItems];
    updated[index][field] = val;
    setOrderItems(updated);
  };

  const handleAutocompleteLowStock = () => {
    // Filter products that have stock <= minStockAlert
    const lowStockProds = products.filter(p => p.stockQuantity <= p.minStockAlert);
    if (lowStockProds.length === 0) {
      alert("No hay productos con stock bajo actualmente.");
      return;
    }
    const items = lowStockProds.map(p => ({
      productId: p.id,
      quantityOrdered: p.minStockAlert * 2 - p.stockQuantity, // Suggest ordering enough to recover stock
      unitCost: (parseFloat(p.price) * 0.6).toFixed(2) // Approximate cost price
    }));
    setOrderItems(items);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!supplierId || orderItems.length === 0) {
      alert("Por favor, selecciona un proveedor y añade al menos un producto.");
      return;
    }

    const formattedItems = orderItems.map(item => {
      const p = products.find(prod => prod.id === parseInt(item.productId));
      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        quantityOrdered: parseInt(item.quantityOrdered),
        unitCost: parseFloat(item.unitCost)
      };
    });

    const payload = {
      supplierId: parseInt(supplierId),
      expectedDate,
      notes,
      status: 'SENT',
      items: formattedItems
    };

    try {
      const res = await fetch(`${API_URL}/erp/supplier-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsOpen(false);
        setSupplierId('');
        setExpectedDate('');
        setNotes('');
        setOrderItems([]);
        fetchOrders();
      } else {
        const txt = await res.text();
        alert(`Error: ${txt}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-ink dark:text-ghost">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Órdenes de Compra</h2>
          <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Genera y envía pedidos de reposición a tus proveedores.</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-vercel-blue hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer"
        >
          + Nueva Orden de Compra
        </button>
      </div>

      <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando órdenes...</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">No hay órdenes de compra registradas.</p>
        ) : (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                <tr>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">ID</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Fecha Pedido</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Proveedor</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Fecha Prevista</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Estado</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs">#{o.id}</td>
                    <td className="py-4 px-6 font-mono text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6 font-bold">{o.supplier?.name}</td>
                    <td className="py-4 px-6 font-mono text-xs">{o.expectedDate || '-'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                        o.status === 'COMPLETED' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : o.status === 'PARTIAL'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : o.status === 'SENT'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-ink/60 dark:text-ghost/60">{o.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-black/10 dark:border-white/10 p-6 max-w-2xl w-full shadow-glass space-y-4 max-h-[90vh] overflow-y-auto hide-scrollbar">
            <h3 className="text-lg font-display font-black uppercase tracking-wider">Nueva Orden de Compra</h3>
            
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Proveedor</label>
                  <select 
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    required
                    className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors"
                  >
                    <option value="">Selecciona proveedor</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Fecha Entrega Prevista</label>
                  <input 
                    type="date" 
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    required
                    className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Notas del Pedido</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  placeholder="Instrucciones para el proveedor..."
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors resize-none"
                />
              </div>

              <div className="border-t border-black/10 dark:border-white/10 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-mono font-bold text-xs uppercase tracking-wider">// LÍNEAS DE PEDIDO</h4>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={handleAutocompleteLowStock}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
                    >
                      🤖 Reponer Stock Bajo
                    </button>
                    <button 
                      type="button" 
                      onClick={handleAddItem}
                      className="px-3 py-1.5 rounded-lg bg-vercel-blue text-white font-bold text-xs hover:bg-blue-600 transition-all cursor-pointer"
                    >
                      + Añadir Producto
                    </button>
                  </div>
                </div>

                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-3 bg-black/5 dark:bg-white/5 p-3 rounded-xl items-end sm:items-center animate-fade-in">
                    <div className="flex-1 min-w-[200px]">
                      <select 
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        required
                        className="w-full p-2 bg-black/10 dark:bg-white/10 border border-transparent rounded-lg outline-none font-semibold text-xs"
                      >
                        <option value="">Selecciona producto...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Ref: {p.sku})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input 
                        type="number" 
                        min="1"
                        placeholder="Cant."
                        value={item.quantityOrdered}
                        onChange={(e) => handleItemChange(idx, 'quantityOrdered', e.target.value)}
                        required
                        className="w-full p-2 bg-black/10 dark:bg-white/10 border border-transparent rounded-lg outline-none font-semibold font-mono text-xs text-center"
                      />
                    </div>
                    <div className="w-28">
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="Costo u."
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                        required
                        className="w-full p-2 bg-black/10 dark:bg-white/10 border border-transparent rounded-lg outline-none font-semibold font-mono text-xs text-center"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-500 hover:text-red-600 font-bold p-2 text-xs cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-black/10 dark:border-white/10">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-vercel-blue text-white font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Enviar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
