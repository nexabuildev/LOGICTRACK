import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function POSPage({ user, onBack }) {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH | CARD
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Customer & loyalty state
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [useStoreCredit, setUseStoreCredit] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchStores();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/crm/customers`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setCustomers(await res.json());
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
        const data = await res.json();
        setProducts(data);
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
        const data = await res.json();
        setStores(data);
        if (data.length > 0) {
          setSelectedStoreId(data[0].id); // Default to first store
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prev; // Limit to stock
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (product.stockQuantity > 0) {
        return [...prev, { ...product, quantity: 1 }];
      }
      return prev;
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQ = item.quantity + delta;
        if (newQ > 0 && newQ <= item.stockQuantity) return { ...item, quantity: newQ };
        if (newQ <= 0) return null; // Marked for removal
      }
      return item;
    }).filter(Boolean));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!selectedStoreId) {
      alert("Por favor, selecciona una tienda para asociar la venta.");
      return;
    }
    setIsProcessing(true);
    try {
      const payload = {
        items: cart.map(c => ({ productId: c.id, quantity: c.quantity })),
        paymentMethod,
        storeId: parseInt(selectedStoreId),
        customerId: selectedCustomerId ? parseInt(selectedCustomerId) : null,
        redeemPoints,
        useStoreCredit
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("¡Venta completada con éxito!");
        setCart([]);
        setSelectedCustomerId('');
        setRedeemPoints(false);
        setUseStoreCredit(false);
        fetchProducts(); // Refresh stock
        fetchCustomers(); // Refresh loyalty info
      } else {
        const txt = await res.text();
        alert(`Error al procesar la venta: ${txt}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const promoDiscount = cart.reduce((acc, item) => {
    const freeUnits = Math.floor(item.quantity / 2);
    return acc + (freeUnits * item.price);
  }, 0);
  const totalAfterPromo = subtotal - promoDiscount;

  const activeCustomer = customers.find(c => c.id === parseInt(selectedCustomerId));
  let pointsDiscount = 0;
  if (activeCustomer && redeemPoints) {
    pointsDiscount = Math.min(activeCustomer.logicPoints / 10.0, totalAfterPromo);
  }

  let creditDiscount = 0;
  if (activeCustomer && useStoreCredit) {
    creditDiscount = Math.min(activeCustomer.storeCredit, totalAfterPromo - pointsDiscount);
  }

  const finalTotal = Math.max(0, totalAfterPromo - pointsDiscount - creditDiscount);
  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-auto xl:h-[calc(100vh-6rem)] w-full flex flex-col-reverse xl:flex-row gap-6 p-0 md:p-2 text-ink dark:text-ghost">
      
      {/* Products Grid (Left side on desktop) */}
      <div className="flex-1 flex flex-col min-h-[50vh] xl:min-h-0 bg-light-elevated dark:bg-dark-elevated rounded-3xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="p-4 sm:p-6 border-b border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-black/5 dark:bg-white/5 shrink-0">
          <div className="flex items-center gap-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer"
              >
                ←
              </button>
            )}
            <div>
              <h2 className="text-xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">TPV</h2>
              <p className="text-xs font-mono font-medium text-ink/40 dark:text-ghost/40">Terminal de Punto de Venta rápido.</p>
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar producto por nombre o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-light-surface dark:bg-[#0B0C10] border border-black/5 dark:border-white/6 rounded-xl px-4 py-2.5 text-xs text-ink dark:text-ghost focus:outline-none focus:border-vercel-blue dark:focus:border-neon-cyan transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 hide-scrollbar">
          {loading ? (
            <p className="text-center py-10 font-mono text-xs">Cargando catálogo...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center py-10 font-mono text-xs">No se encontraron productos.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map(p => (
                <button 
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={p.stockQuantity <= 0}
                  className="flex flex-col text-left p-3 sm:p-4 rounded-2xl border border-black/5 dark:border-white/6 bg-light-surface dark:bg-dark-surface hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 relative group cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  <span className="text-[9px] font-mono font-bold text-ink/40 dark:text-ghost/40 tracking-wider block uppercase">{p.sku}</span>
                  <span className="text-xs sm:text-sm font-bold text-ink dark:text-ghost mt-1 line-clamp-2 pr-6 leading-snug">{p.name}</span>
                  <span className="text-base sm:text-lg font-black text-vercel-blue dark:text-neon-cyan mt-auto pt-4 font-display">{p.price}€</span>
                  <span className="absolute top-3 right-3 text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/6 text-ink/60 dark:text-ghost/60">
                    Stock: {p.stockQuantity}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shopping Cart (Right side on desktop) */}
      <div className="w-full xl:w-96 flex flex-col h-[55vh] xl:h-full bg-light-elevated dark:bg-dark-elevated rounded-3xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden shrink-0">
        <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/5 shrink-0">
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest">// TICKET ACTUAL</h2>
          <span className="px-2 py-1 rounded-md bg-vercel-blue text-white text-[10px] font-bold">{cart.length} items</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar min-h-[150px]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-ink/30 dark:text-ghost/30 space-y-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <p className="text-xs font-mono font-bold uppercase tracking-widest">Carrito Vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col gap-2 p-3 rounded-xl border border-black/5 dark:border-white/5 bg-light-surface dark:bg-dark-surface animate-fade-in">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold leading-tight flex-1 pr-2">{item.name}</span>
                  <span className="text-sm font-black tabular-nums shrink-0 text-vercel-blue dark:text-neon-cyan">{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-mono text-ink/40 dark:text-ghost/40">{item.price}€ / ud</span>
                  <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-black text-ink dark:text-ghost transition-colors cursor-pointer">-</button>
                    <span className="text-xs font-bold w-4 text-center tabular-nums">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} disabled={item.quantity >= item.stockQuantity} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-black text-ink dark:text-ghost transition-colors disabled:opacity-30 cursor-pointer">+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* TPV Payment and Store Settings */}
        <div className="p-6 border-t border-black/5 dark:border-white/10 bg-light-surface dark:bg-dark-surface shrink-0 space-y-4 text-xs font-semibold">
          
          {/* Customer Selection */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Cliente (Fidelización)</label>
            <select 
              value={selectedCustomerId} 
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setRedeemPoints(false);
                setUseStoreCredit(false);
              }}
              className="w-full p-2 bg-black/5 dark:bg-white/5 rounded-lg font-bold border border-transparent focus:border-vercel-blue outline-none"
            >
              <option value="">-- Cliente General / Sin Registrar --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email || 'Sin Email'})</option>
              ))}
            </select>
          </div>

          {/* Customer Balance & Checkboxes */}
          {activeCustomer && (
            <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-ink/60 dark:text-ghost/60">
                <span>Puntos: {activeCustomer.logicPoints} pts</span>
                <span>Crédito: {activeCustomer.storeCredit.toFixed(2)}€</span>
                <span>Deuda: {activeCustomer.debtAmount.toFixed(2)}€</span>
              </div>
              <div className="flex gap-4 pt-1">
                {activeCustomer.logicPoints > 0 && (
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input type="checkbox" checked={redeemPoints} onChange={e => setRedeemPoints(e.target.checked)} className="rounded" />
                    Canjear Puntos
                  </label>
                )}
                {activeCustomer.storeCredit > 0 && (
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input type="checkbox" checked={useStoreCredit} onChange={e => setUseStoreCredit(e.target.checked)} className="rounded" />
                    Usar Crédito
                  </label>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Tienda</label>
              <select 
                value={selectedStoreId} 
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full p-2 bg-black/5 dark:bg-white/5 rounded-lg font-bold border border-transparent focus:border-vercel-blue outline-none"
              >
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[10px] font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Método de Pago</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 bg-black/5 dark:bg-white/5 rounded-lg font-bold border border-transparent focus:border-vercel-blue outline-none"
              >
                <option value="CASH">Efectivo</option>
                <option value="CARD">Tarjeta</option>
                {selectedCustomerId && <option value="DEBT">A Deber (Deuda)</option>}
              </select>
            </div>
          </div>

          {/* Pricing breakdowns */}
          <div className="space-y-1.5 border-t border-black/5 dark:border-white/5 pt-3 text-xs font-semibold">
            {promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-500 font-bold">
                <span>Auto-Promo (2x1):</span>
                <span>-{promoDiscount.toFixed(2)}€</span>
              </div>
            )}
            {pointsDiscount > 0 && (
              <div className="flex justify-between text-amber-500 font-bold">
                <span>Descuento Puntos:</span>
                <span>-{pointsDiscount.toFixed(2)}€</span>
              </div>
            )}
            {creditDiscount > 0 && (
              <div className="flex justify-between text-blue-500 font-bold">
                <span>Descuento Crédito:</span>
                <span>-{creditDiscount.toFixed(2)}€</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-mono font-bold text-ink/50 dark:text-ghost/50 uppercase tracking-widest">Total a Cobrar</span>
              <span className="text-3xl font-display font-black tabular-nums text-vercel-blue dark:text-neon-cyan">{finalTotal.toFixed(2)}€</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full py-4 rounded-2xl bg-vercel-blue hover:bg-blue-600 text-white font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-vercel-blue/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isProcessing ? 'Procesando...' : `Cobrar con ${paymentMethod === 'CASH' ? 'Efectivo' : paymentMethod === 'CARD' ? 'Tarjeta' : 'Deuda'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
