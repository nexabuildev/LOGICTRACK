import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { API_URL } from '../../../api/config';
import { Navbar } from '../../../components/Navbar';

// Subcomponents loaded in tabs
import UsersPage from './UsersPage';
import StoresPage from './StoresPage';
import ProductsPage from './ProductsPage';
import AuditLogsPage from './AuditLogsPage';
import POSPage from './POSPage';
import SuppliersPage from './SuppliersPage';
import CustomersPage from './CustomersPage';
import PromotionsPage from './PromotionsPage';
import TicketsPage from './TicketsPage';

// Placeholder subcomponents for new expansion modules
import CategoriesPage from './CategoriesPage';
import StockAdjustmentsPage from './StockAdjustmentsPage';
import TransfersPage from './TransfersPage';
import SalesHistoryPage from './SalesHistoryPage';
import ReturnsPage from './ReturnsPage';
import RegisterClosurePage from './RegisterClosurePage';
import PurchaseOrdersPage from './PurchaseOrdersPage';
import GoodsReceivingPage from './GoodsReceivingPage';
import StoreAnalyticsPage from './StoreAnalyticsPage';
import RolesPermissionsPage from './RolesPermissionsPage';
import TimeTrackingPage from './TimeTrackingPage';
import CompanySettingsPage from './CompanySettingsPage';
import AutomationSettingsPage from './AutomationSettingsPage';
import POSSettingsPage from './POSSettingsPage';
import PlaceholderPage from '../../../components/PlaceholderPage';

const ALLOWED_ROLES = ['ADMIN', 'TECNICO', 'GESTOR_TIENDA', 'COMERCIAL'];

const SIDEBAR_MODULES = [
  { 
    id: 'kpis', 
    label: 'Inicio', 
    roles: ['ADMIN', 'TECNICO', 'GESTOR_TIENDA', 'COMERCIAL'], 
    icon: '📋',
    isSingleRoute: true
  },
  {
    id: 'posGroup',
    label: 'Ventas y TPV',
    roles: ['ADMIN', 'GESTOR_TIENDA', 'COMERCIAL'],
    icon: '🏷️',
    subOptions: [
      { id: 'pos', label: 'Terminal TPV' },
      { id: 'sales_history', label: 'Historial de Ventas' },
      { id: 'returns', label: 'Devoluciones' },
      { id: 'register_closure', label: 'Cierre de Caja' },
    ]
  },
  {
    id: 'inventoryGroup',
    label: 'Inventario',
    roles: ['ADMIN', 'TECNICO', 'GESTOR_TIENDA'],
    icon: '📦',
    subOptions: [
      { id: 'products', label: 'Catálogo de Productos' },
      { id: 'categories', label: 'Categorías y Familias' },
      { id: 'stock_adjustments', label: 'Ajustes y Mermas' },
      { id: 'transfers', label: 'Traspasos entre Tiendas' },
    ]
  },
  {
    id: 'suppliersGroup',
    label: 'Compras y Prov.',
    roles: ['ADMIN', 'TECNICO'],
    icon: '🚚',
    subOptions: [
      { id: 'suppliers', label: 'Directorio de Proveedores' },
      { id: 'purchase_orders', label: 'Órdenes de Compra' },
      { id: 'goods_receiving', label: 'Recepción de Mercancía' },
    ]
  },
  {
    id: 'storesGroup',
    label: 'Tiendas',
    roles: ['ADMIN', 'TECNICO', 'GESTOR_TIENDA'],
    icon: '🏪',
    subOptions: [
      { id: 'stores', label: 'Directorio de Tiendas' },
      { id: 'store_analytics', label: 'Rendimiento y Analytics' },
    ]
  },
  {
    id: 'crmGroup',
    label: 'Clientes y CRM',
    roles: ['ADMIN', 'GESTOR_TIENDA', 'COMERCIAL'],
    icon: '👥',
    subOptions: [
      { id: 'customers', label: 'Directorio B2B/B2C' },
    ]
  },
  {
    id: 'marketingGroup',
    label: 'Marketing',
    roles: ['ADMIN', 'GESTOR_TIENDA'],
    icon: '🎯',
    subOptions: [
      { id: 'promotions', label: 'Promociones y Cupones' },
    ]
  },
  {
    id: 'helpdeskGroup',
    label: 'Helpdesk (Soporte)',
    roles: ['ADMIN', 'TECNICO'],
    icon: '🎧',
    subOptions: [
      { id: 'tickets', label: 'Gestión de Tickets' },
    ]
  },
  {
    id: 'usersGroup',
    label: 'Equipo',
    roles: ['ADMIN', 'TECNICO'],
    icon: '👔',
    subOptions: [
      { id: 'users', label: 'Directorio de Personal' },
      { id: 'roles', label: 'Roles y Permisos' },
      { id: 'time_tracking', label: 'Control de Horarios' },
    ]
  },
  {
    id: 'auditGroup',
    label: 'Auditoría',
    roles: ['ADMIN'],
    icon: '📜',
    subOptions: [
      { id: 'logs', label: 'Logs de Actividad' },
    ]
  },
  {
    id: 'settingsGroup',
    label: 'Configuración',
    roles: ['ADMIN'],
    icon: '⚙️',
    subOptions: [
      { id: 'settings_profile', label: 'Perfil de Empresa' },
      { id: 'settings_automation', label: 'Automatizaciones' },
      { id: 'settings_pos', label: 'Ajustes del TPV' },
    ]
  },
];

const TAB_LABELS = {
  products: 'Catálogo de Productos',
  categories: 'Categorías y Familias',
  stock_adjustments: 'Ajustes y Mermas',
  transfers: 'Traspasos entre Tiendas',
  pos: 'Terminal TPV',
  sales_history: 'Historial de Ventas',
  returns: 'Devoluciones',
  register_closure: 'Cierre de Caja',
  suppliers: 'Directorio de Proveedores',
  purchase_orders: 'Órdenes de Compra',
  goods_receiving: 'Recepción de Mercancía',
  stores: 'Directorio de Tiendas',
  store_analytics: 'Rendimiento y Analytics',
  users: 'Directorio de Personal',
  roles: 'Roles y Permisos',
  time_tracking: 'Control de Horarios',
  logs: 'Logs de Actividad',
  settings_profile: 'Perfil de Empresa',
  settings_automation: 'Automatizaciones',
  settings_pos: 'Ajustes del TPV',
  customers: 'Directorio B2B/B2C',
  promotions: 'Promociones y Cupones',
  tickets: 'Gestión de Tickets',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useMemo(() => {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }, []);
  const token = user?.token;
  const userRole = user?.role;

  const [activeTab, setActiveTab] = useState('kpis');
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [stats, setStats] = useState({ totalProducts: 0, lowStockCount: 0, totalInventoryValue: 0 });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Internal ticket state
  const [isInternalTicketModalOpen, setIsInternalTicketModalOpen] = useState(false);
  const [internalTicketForm, setInternalTicketForm] = useState({ subject: '', description: '', priority: 'MEDIUM' });
  const [internalTicketLoading, setInternalTicketLoading] = useState(false);
  const [internalTicketSuccess, setInternalTicketSuccess] = useState(false);

  const sidebarModules = useMemo(
    () => (userRole ? SIDEBAR_MODULES.filter(module => module.roles.includes(userRole)) : []),
    [userRole]
  );

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!ALLOWED_ROLES.includes(userRole)) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const prodRes = await fetch(`${API_URL}/products`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!prodRes.ok) throw new Error('Error al cargar productos');
        const products = await prodRes.json();
        setProductsList(products);

        const total = products.length;
        const lowStock = products.filter(p => p.stockQuantity <= p.minStockAlert);
        const value = products.reduce((acc, curr) => acc + (curr.price * curr.stockQuantity), 0);
        setStats({ totalProducts: total, lowStockCount: lowStock.length, totalInventoryValue: value });
        setLowStockProducts(lowStock);

        if (userRole === 'ADMIN') {
          const logsRes = await fetch(`${API_URL}/logs`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (logsRes.ok) {
            const logsData = await logsRes.json();
            setLogs(logsData);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token, userRole]);

  const handleInternalTicketSubmit = async (e) => {
    e.preventDefault();
    setInternalTicketLoading(true);
    setInternalTicketSuccess(false);
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: `[INTERNO] ${internalTicketForm.subject}`,
          description: internalTicketForm.description,
          priority: internalTicketForm.priority,
          customerEmail: user.email
        })
      });
      if (res.ok) {
        setInternalTicketSuccess(true);
        setInternalTicketForm({ subject: '', description: '', priority: 'MEDIUM' });
        setTimeout(() => {
          setInternalTicketSuccess(false);
          setIsInternalTicketModalOpen(false);
        }, 3000);
      } else {
        alert("Error al enviar ticket interno.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con soporte.");
    } finally {
      setInternalTicketLoading(false);
    }
  };

  const selectSubOption = useCallback((moduleId, subId) => {
    setActiveTab(subId);
    setExpandedMenu(moduleId);
  }, []);

  const toggleMenu = useCallback((moduleId) => {
    setExpandedMenu(prev => (prev === moduleId ? null : moduleId));
  }, []);

  const goToInicio = useCallback(() => {
    setActiveTab('kpis');
    setExpandedMenu(null);
  }, []);

  if (!user || !ALLOWED_ROLES.includes(userRole)) return null;

  const renderContent = () => {
    switch (activeTab) {
      // INVENTORY
      case 'products': return <ProductsPage embedded />;
      case 'categories': return <CategoriesPage user={user} />;
      case 'stock_adjustments': return <StockAdjustmentsPage user={user} />;
      case 'transfers': return <TransfersPage user={user} />;
      
      // CRM & MARKETING
      case 'customers': return <CustomersPage user={user} />;
      case 'promotions': return <PromotionsPage user={user} />;
      
      // HELPDESK
      case 'tickets': return <TicketsPage user={user} />;
      
      // SALES
      case 'pos': return <POSPage user={user} onBack={goToInicio} />;
      case 'sales_history': return <SalesHistoryPage user={user} />;
      case 'returns': return <ReturnsPage user={user} />;
      case 'register_closure': return <RegisterClosurePage user={user} />;

      // SUPPLIERS
      case 'suppliers': return <SuppliersPage user={user} />;
      case 'purchase_orders': return <PurchaseOrdersPage user={user} />;
      case 'goods_receiving': return <GoodsReceivingPage user={user} />;

      // STORES
      case 'stores': return <StoresPage embedded />;
      case 'store_analytics': return <StoreAnalyticsPage user={user} />;

      // USERS
      case 'users': return <UsersPage embedded />;
      case 'roles': return <RolesPermissionsPage user={user} />;
      case 'time_tracking': return <TimeTrackingPage user={user} />;

      // AUDIT
      case 'logs': return <AuditLogsPage embedded />;

      // SETTINGS
      case 'settings_profile': return <CompanySettingsPage user={user} />;
      case 'settings_automation': return <AutomationSettingsPage user={user} />;
      case 'settings_pos': return <POSSettingsPage user={user} />;

      case 'kpis':
        return (
          <div className="space-y-8 animate-fade-in">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            {/* Bento KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* KPI 1: Productos */}
              <div className="relative overflow-hidden rounded-2xl p-6 border border-black/5 dark:border-white/6 bg-light-elevated dark:bg-dark-elevated group hover:-translate-y-0.5 transition-transform">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #00E5FF, transparent)' }} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ink/40 dark:text-ghost/40">PRODUCTOS REGISTRADOS</span>
                <h3 className="text-5xl font-display font-black text-ink dark:text-ghost mt-3 tabular-nums">{stats.totalProducts}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="led-dot led-dot-green" />
                  <span className="text-[10px] font-mono text-emerald-500">SISTEMA ACTIVO</span>
                </div>
              </div>
              {/* KPI 2: Bajo Stock */}
              <div className="relative overflow-hidden rounded-2xl p-6 border border-black/5 dark:border-white/6 bg-light-elevated dark:bg-dark-elevated group hover:-translate-y-0.5 transition-transform">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle, ${stats.lowStockCount > 0 ? '#EF4444' : '#22C55E'}, transparent)` }} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ink/40 dark:text-ghost/40">BAJO STOCK</span>
                <h3 className={`text-5xl font-display font-black mt-3 tabular-nums ${stats.lowStockCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {stats.lowStockCount}
                </h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`led-dot ${stats.lowStockCount > 0 ? 'led-dot-red' : 'led-dot-green'}`} />
                  <span className={`text-[10px] font-mono ${stats.lowStockCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {stats.lowStockCount > 0 ? 'ALERTA ACTIVA' : 'TODO OK'}
                  </span>
                </div>
              </div>
              {/* KPI 3: Valor */}
              <div className="relative overflow-hidden rounded-2xl p-6 border border-black/5 dark:border-white/6 bg-light-elevated dark:bg-dark-elevated group hover:-translate-y-0.5 transition-transform">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #FACC15, transparent)' }} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ink/40 dark:text-ghost/40">VALOR DEL INVENTARIO</span>
                <h3 className="text-2xl xl:text-3xl font-display font-black text-ink dark:text-ghost mt-3 tabular-nums font-mono truncate" title={`${stats.totalInventoryValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}>
                  {stats.totalInventoryValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-lg font-medium text-ink/40 dark:text-ghost/40 ml-1">€</span>
                </h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="led-dot led-dot-yellow" />
                  <span className="text-[10px] font-mono text-cyber-yellow">VALOR EN TIEMPO REAL</span>
                </div>
              </div>
            </div>

            {/* Advanced Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-light-elevated dark:bg-dark-elevated border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-glass">
                <h3 className="text-sm font-bold text-ink dark:text-ghost mb-6">Evolución del Valor (6 Meses)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'Feb', valor: stats.totalInventoryValue * 0.7 },
                      { name: 'Mar', valor: stats.totalInventoryValue * 0.75 },
                      { name: 'Abr', valor: stats.totalInventoryValue * 0.8 },
                      { name: 'May', valor: stats.totalInventoryValue * 0.9 },
                      { name: 'Jun', valor: stats.totalInventoryValue * 0.95 },
                      { name: 'Jul', valor: stats.totalInventoryValue }
                    ]}>
                      <defs>
                        <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0070F3" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0070F3" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1A1D24', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: '#00E5FF' }} />
                      <Area type="monotone" dataKey="valor" stroke="#0070F3" strokeWidth={3} fillOpacity={1} fill="url(#colorValor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-light-elevated dark:bg-dark-elevated border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-glass">
                <h3 className="text-sm font-bold text-ink dark:text-ghost mb-6">Estado del Stock (Top Categorías)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Nuevos', stock: productsList.filter(p => p.condition === 'NUEVO').length },
                      { name: 'Reacond.', stock: productsList.filter(p => p.condition === 'REACONDICIONADO').length },
                      { name: 'Usados', stock: productsList.filter(p => p.condition === 'USADO').length },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1A1D24', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="stock" fill="#00E5FF" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-1 border border-black/5 dark:border-white/5 rounded-2xl bg-light-elevated dark:bg-dark-elevated p-6 shadow-glass flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-default">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-ink/50 dark:text-ghost/50">// NIVELES DE EXISTENCIA (TOP 5)</h3>
                  <div className="space-y-4">
                    {[...productsList]
                      .sort((a, b) => b.stockQuantity - a.stockQuantity)
                      .slice(0, 5)
                      .map(p => {
                        const maxPercent = Math.min(100, (p.stockQuantity / 120) * 100);
                        return (
                          <div key={p.id} className="space-y-1.5 group">
                            <div className="flex justify-between text-[11px] font-medium text-ink/50 dark:text-ghost/50">
                              <span className="group-hover:text-ink dark:group-hover:text-ghost transition-colors truncate max-w-[180px]">{p.name}</span>
                              <span className="font-mono font-bold text-neon-cyan dark:text-neon-cyan text-vercel-blue tabular-nums">{p.stockQuantity} uds</span>
                            </div>
                            <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${maxPercent}%`, background: 'linear-gradient(90deg, #00E5FF, #0070F3)' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Inventory Health Donut */}
                <div className="xl:col-span-2 bg-light-elevated dark:bg-dark-elevated border border-black/5 dark:border-white/6 p-6 rounded-2xl flex flex-col justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-ink/50 dark:text-ghost/50 mb-4">// SALUD DEL INVENTARIO</h3>
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6 flex-1">
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                        {(() => {
                          const total = stats.totalProducts || 1;
                          const lowPercent = (stats.lowStockCount / total) * 100;
                          const okPercent = 100 - lowPercent;
                          return (
                            <>
                              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22C55E" strokeWidth="3.2" strokeDasharray={`${okPercent} ${lowPercent}`} strokeDashoffset="0" style={{ filter: 'drop-shadow(0 0 4px #22C55E)' }} />
                              {stats.lowStockCount > 0 && (
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EF4444" strokeWidth="3.2" strokeDasharray={`${lowPercent} ${okPercent}`} strokeDashoffset={100 - okPercent} style={{ filter: 'drop-shadow(0 0 4px #EF4444)' }} />
                              )}
                            </>
                          );
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-mono text-ink/40 dark:text-ghost/40 uppercase tracking-widest">Total</span>
                        <span className="text-xl font-display font-black text-ink dark:text-ghost">{stats.totalProducts}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="led-dot led-dot-green" />
                        <span className="text-ink/50 dark:text-ghost/50">Stock Correcto:</span>
                        <span className="font-mono font-bold text-ink dark:text-ghost">{stats.totalProducts - stats.lowStockCount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="led-dot led-dot-red" />
                        <span className="text-ink/50 dark:text-ghost/50">Stock Crítico:</span>
                        <span className="font-mono font-bold text-red-500">{stats.lowStockCount}</span>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-red-500/10">
                  <span className="led-dot led-dot-red" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-red-500">// ALERTAS DE REPOSICIÓN</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-red-500/10">
                        {['SKU', 'Nombre', 'Stock', 'Mínimo'].map(h => (
                          <th key={h} className="py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-ink/30 dark:text-ghost/30">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-500/5">
                      {lowStockProducts.map(p => (
                        <tr key={p.id} className="hover:bg-red-500/5 transition-colors">
                          <td className="py-3 font-mono text-ink/40 dark:text-ghost/40">{p.sku}</td>
                          <td className="py-3 font-semibold text-ink dark:text-ghost">{p.name}</td>
                          <td className="py-3 font-mono font-black text-red-500">{p.stockQuantity}</td>
                          <td className="py-3 font-mono text-ink/40 dark:text-ghost/40">{p.minStockAlert}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Admin Audit Logs */}
            {user.role === 'ADMIN' && (
              <div className="bg-light-elevated dark:bg-dark-elevated border border-black/5 dark:border-white/5 rounded-2xl p-6 space-y-4 shadow-glass transition-all">
                <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-3">
                  <h2 className="text-sm font-bold text-ink dark:text-ghost">Últimos Logs de Auditoría</h2>
                  <button onClick={() => selectSubOption('auditGroup', 'logs')} className="text-xs text-vercel-blue dark:text-neon-cyan hover:underline font-bold">Ver todos →</button>
                </div>
                <div>
                  <table className="w-full text-left text-xs text-ink/70 dark:text-ghost/70 table-fixed">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-black/5 dark:border-white/5 text-ink/40 dark:text-ghost/40 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-4 w-[15%]">Fecha</th>
                        <th className="py-2.5 px-4 w-[20%]">Usuario</th>
                        <th className="py-2.5 px-4 w-[25%]">Acción</th>
                        <th className="py-2.5 px-4 w-[40%]">Detalles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {logs.slice(0, 5).map(log => (
                        <tr key={log.id} className="hover:bg-light-base/50 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-mono text-[10px] text-ink/50 dark:text-ghost/50">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="py-3 px-4 text-ink dark:text-ghost font-semibold">{log.userEmail || 'Sistema'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold tracking-widest uppercase ${
                              log.action.includes('CREATED') || log.action.includes('IMPORTED') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                              log.action.includes('UPDATED') ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                              'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-ink/70 dark:text-ghost/70 break-words">{log.details}</td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr><td colSpan="4" className="py-8 text-center text-ink/40 dark:text-ghost/40">Sin logs registrados.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return (
          <PlaceholderPage
            title={TAB_LABELS[activeTab] || 'Módulo en desarrollo'}
            description="Esta sección estará disponible próximamente. Mientras tanto, puedes seguir usando el resto del panel."
            icon="🚧"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-light-surface dark:bg-dark-base text-ink dark:text-ghost font-sans tracking-tight antialiased transition-colors duration-500 flex flex-col">
      <Navbar />

      <div className="flex-1 w-full mx-auto px-4 md:px-8 flex flex-col md:flex-row">
        {/* Floating Glass Island Sidebar */}
        <aside className="w-full md:w-64 m-4 md:mr-0 bg-light-elevated dark:bg-dark-surface rounded-2xl border border-black/5 dark:border-white/6 p-4 flex flex-col gap-5 shrink-0 md:self-start md:sticky md:top-20 shadow-card dark:shadow-glass z-20 overflow-y-auto max-h-[calc(100vh-6rem)] hide-scrollbar">
          <div className="px-2">
            <h2 className="text-[9px] font-mono font-black text-ink/30 dark:text-ghost/30 uppercase tracking-[0.2em]">// NAVEGACIÓN ERP</h2>
          </div>
          <nav className="flex flex-col gap-1">
            {sidebarModules.map(module => {
              const isActiveRoute = activeTab === module.id;
              const isGroupActive = module.subOptions?.some(sub => activeTab === sub.id);
              const isExpanded = expandedMenu === module.id;
              
              if (module.isSingleRoute) {
                return (
                  <button
                    key={module.id}
                    onClick={goToInicio}
                    className={`w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isActiveRoute
                        ? 'text-dark-base'
                        : 'text-ink/60 dark:text-ghost/60 hover:text-ink dark:hover:text-ghost hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={isActiveRoute ? { background: 'linear-gradient(135deg, #00E5FF, #0070F3)' } : {}}
                  >
                    <span className="text-base leading-none">{module.icon}</span>
                    <span className="text-[13px]">{module.label}</span>
                  </button>
                );
              }

              return (
                <div key={module.id} className="flex flex-col">
                  <button
                    onClick={() => toggleMenu(module.id)}
                    aria-expanded={isExpanded}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isGroupActive
                        ? 'text-vercel-blue dark:text-neon-cyan bg-vercel-blue/5 dark:bg-neon-cyan/5'
                        : 'text-ink/60 dark:text-ghost/60 hover:text-ink dark:hover:text-ghost hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-base leading-none shrink-0">{module.icon}</span>
                      <span className="text-[13px] truncate">{module.label}</span>
                    </div>
                    <svg 
                      className={`w-4 h-4 shrink-0 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                      isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                    aria-hidden={!isExpanded}
                  >
                    <div className={`overflow-hidden ${isExpanded ? '' : 'pointer-events-none'}`}>
                      <div className="flex flex-col gap-0.5 pl-4 ml-2 border-l border-black/5 dark:border-white/10 py-1">
                        {module.subOptions.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => selectSubOption(module.id, sub.id)}
                            className={`text-left px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
                              activeTab === sub.id
                                ? 'text-ink dark:text-ghost bg-black/5 dark:bg-white/5'
                                : 'text-ink/40 dark:text-ghost/40 hover:text-ink/80 dark:hover:text-ghost/80 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                          >
                            {activeTab === sub.id && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 rounded-full bg-vercel-blue dark:bg-neon-cyan shadow-neon-sm" />
                            )}
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-10 w-full overflow-x-hidden">
          {activeTab === 'kpis' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 mb-8 border-b border-black/5 dark:border-white/5">
              <div>
                <h1 className="text-2xl font-display font-black text-ink dark:text-ghost tracking-tight">Panel ERP</h1>
                <p className="text-ink/40 dark:text-ghost/40 text-sm mt-1 font-mono">
                  Bienvenido, <span className="text-neon-cyan dark:text-neon-cyan text-vercel-blue font-bold">{user.name}</span>. Visión general del catálogo.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-black/5 dark:border-white/6 bg-light-elevated dark:bg-dark-elevated">
                <span className="led-dot led-dot-green" />
                <span className="text-xs font-mono font-bold text-ink/50 dark:text-ghost/50">{user.role}</span>
              </div>
            </div>
          )}

          {renderContent()}
        </main>
      </div>

      {/* Floating Support Button for Employees */}
      {userRole && ALLOWED_ROLES.includes(userRole) && (
        <button
          onClick={() => setIsInternalTicketModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-vercel-blue hover:bg-blue-600 dark:bg-neon-cyan dark:hover:bg-[#00E5FF] dark:text-black text-white font-bold p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
          title="Soporte Interno (Ticket)"
        >
          <span className="text-xl leading-none">🎧</span>
        </button>
      )}

      {/* Internal Ticket Modal */}
      {isInternalTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-light-elevated dark:bg-dark-elevated rounded-3xl w-full max-w-md shadow-2xl p-6 relative border border-black/5 dark:border-white/10 overflow-hidden text-ink dark:text-ghost">
            <h2 className="text-xl font-black tracking-tight mb-4">
              Reportar Incidencia / Ticket Interno
            </h2>
            {internalTicketSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-xs font-bold text-center">
                ✅ Ticket creado con éxito. El equipo técnico lo revisará.
              </div>
            ) : (
              <form onSubmit={handleInternalTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-ink/60 dark:text-ghost/60 uppercase tracking-wider mb-1">Asunto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Error en lector de código de barras"
                    className="w-full bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-vercel-blue transition-colors text-ink dark:text-ghost"
                    value={internalTicketForm.subject}
                    onChange={e => setInternalTicketForm({ ...internalTicketForm, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-ink/60 dark:text-ghost/60 uppercase tracking-wider mb-1">Descripción del Problema *</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Describe detalladamente el error o solicitud..."
                    className="w-full bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-vercel-blue transition-colors resize-none text-ink dark:text-ghost"
                    value={internalTicketForm.description}
                    onChange={e => setInternalTicketForm({ ...internalTicketForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-ink/60 dark:text-ghost/60 uppercase tracking-wider mb-1">Prioridad</label>
                  <select
                    className="w-full bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-vercel-blue transition-colors text-ink dark:text-ghost"
                    value={internalTicketForm.priority}
                    onChange={e => setInternalTicketForm({ ...internalTicketForm, priority: e.target.value })}
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">💥 Urgente / Bloqueante</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsInternalTicketModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-black/5 dark:bg-white/5 text-ink dark:text-ghost hover:bg-black/10 dark:hover:bg-white/10 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={internalTicketLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-vercel-blue text-white hover:bg-blue-600 transition shadow-lg disabled:opacity-50"
                  >
                    {internalTicketLoading ? 'Enviando...' : 'Enviar Ticket'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
