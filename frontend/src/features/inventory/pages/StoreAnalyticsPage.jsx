import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { API_URL } from '../../../api/config';

export default function StoreAnalyticsPage({ user }) {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [storesRes, productsRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/stores`, { headers: { 'Authorization': `Bearer ${user.token}` } }),
        fetch(`${API_URL}/products`, { headers: { 'Authorization': `Bearer ${user.token}` } }),
        fetch(`${API_URL}/orders`, { headers: { 'Authorization': `Bearer ${user.token}` } })
      ]);

      if (storesRes.ok) setStores(await storesRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by store
  const filteredOrders = selectedStoreId
    ? orders.filter(o => o.store?.id === parseInt(selectedStoreId))
    : orders;

  // Filter products by store
  const filteredProducts = selectedStoreId
    ? products.filter(p => p.storeId === parseInt(selectedStoreId))
    : products;

  // KPIs
  const totalSales = filteredOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalStock = filteredProducts.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const totalValuation = filteredProducts.reduce((acc, p) => acc + ((p.price || 0) * (p.stockQuantity || 0)), 0);

  // Chart data: Sales over time (by date)
  const salesByDate = {};
  filteredOrders.forEach(o => {
    const date = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    salesByDate[date] = (salesByDate[date] || 0) + (o.totalAmount || 0);
  });
  const salesChartData = Object.entries(salesByDate).map(([date, total]) => ({
    date,
    Ventas: parseFloat(total.toFixed(2))
  })).reverse().slice(-7); // Last 7 days

  // Chart data: Stock distribution by category/product
  const stockData = filteredProducts.slice(0, 5).map(p => ({
    name: p.name,
    Stock: p.stockQuantity
  }));

  const COLORS = ['#0070F3', '#00E5FF', '#FACC15', '#B026FF', '#FF4500'];

  return (
    <div className="space-y-6 animate-fade-in text-ink dark:text-ghost">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Analíticas de Tiendas</h2>
          <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Métricas de facturación y stock consolidado por sede.</p>
        </div>
        
        {/* Store Selector - Improved Dark Mode visibility */}
        <div className="w-full sm:w-64 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-vercel-blue to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <select 
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="relative w-full p-3 bg-light-surface/90 dark:bg-[#13151A]/90 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-bold text-sm text-ink dark:text-ghost transition-colors appearance-none cursor-pointer"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%230070f3%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
          >
            <option value="" className="bg-light-surface dark:bg-dark-surface text-ink dark:text-ghost">🌎 Todas las Tiendas</option>
            {stores.map(s => (
              <option key={s.id} value={s.id} className="bg-light-surface dark:bg-dark-surface text-ink dark:text-ghost">
                🏪 {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando analíticas...</p>
      ) : (
        <>
          {/* Bento Grid KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="relative overflow-hidden rounded-2xl p-6 border border-transparent bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-vercel-blue/20 dark:to-neon-cyan/5 shadow-glass group hover:scale-[1.02] transition-transform cursor-default">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-neon-cyan/80">Facturación Total</span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-black mt-2 text-ink dark:text-ghost truncate">{totalSales.toFixed(2)}€</h3>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl p-6 border border-transparent bg-gradient-to-br from-emerald-500/10 to-teal-600/5 dark:from-emerald-500/20 dark:to-teal-400/5 shadow-glass group hover:scale-[1.02] transition-transform cursor-default">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400/80">Artículos en Stock</span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-black mt-2 text-ink dark:text-ghost truncate">{totalStock} uds</h3>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl p-6 border border-transparent bg-gradient-to-br from-purple-500/10 to-pink-600/5 dark:from-purple-500/20 dark:to-pink-500/5 shadow-glass group hover:scale-[1.02] transition-transform cursor-default">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-pink-400/80">Valoración de Inventario</span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-black mt-2 text-ink dark:text-ghost truncate">{totalValuation.toFixed(2)}€</h3>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-light-elevated dark:bg-dark-elevated p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-glass group hover:border-vercel-blue/30 transition-colors">
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest mb-6 text-vercel-blue dark:text-neon-cyan">// EVOLUCIÓN DE VENTAS</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: '#13151A', border: '1px solid #333', borderRadius: '12px', color: '#F1F1F3', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} />
                    <Bar dataKey="Ventas" fill="#00E5FF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-light-elevated dark:bg-dark-elevated p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-glass group hover:border-purple-500/30 transition-colors">
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest mb-6 text-purple-500 dark:text-purple-400">// STOCK TOP 5 PRODUCTOS</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} width={120} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: '#13151A', border: '1px solid #333', borderRadius: '12px', color: '#F1F1F3', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} />
                    <Bar dataKey="Stock" fill="#B026FF" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
