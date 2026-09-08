import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function CompanySettingsPage({ user }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Store management state
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeCity, setStoreCity] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeActive, setStoreActive] = useState(true);
  const [isSavingStore, setIsSavingStore] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/stores`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStores(data);
        if (data.length > 0) {
          handleSelectStore(data[0]);
        }
      }
    } catch (e) {
      console.error("Error loading stores", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStore = (store) => {
    setSelectedStoreId(store.id);
    setStoreName(store.name || '');
    setStoreAddress(store.address || '');
    setStoreCity(store.city || '');
    setStorePhone(store.phone || '');
    setStoreEmail(store.email || '');
    setStoreActive(store.isActive !== false);
  };

  const handleStoreSelectChange = (e) => {
    const storeId = parseInt(e.target.value);
    const store = stores.find(s => s.id === storeId);
    if (store) {
      handleSelectStore(store);
    } else {
      setSelectedStoreId('');
      setStoreName('');
      setStoreAddress('');
      setStoreCity('');
      setStorePhone('');
      setStoreEmail('');
      setStoreActive(true);
    }
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    setIsSavingStore(true);

    const payload = {
      name: storeName,
      address: storeAddress,
      city: storeCity,
      phone: storePhone,
      email: storeEmail,
      isActive: storeActive
    };

    const isNew = !selectedStoreId;
    const url = isNew ? `${API_URL}/stores` : `${API_URL}/stores/${selectedStoreId}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isNew ? "Sucursal creada con éxito." : "Sucursal actualizada con éxito.");
        fetchStores();
      } else {
        const txt = await res.text();
        alert(`Error: ${txt}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingStore(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-ink dark:text-ghost">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Configuración de Tiendas (Sedes)</h2>
          <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Administra, crea y edita las sucursales del sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sede Selector */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-light-elevated dark:bg-dark-elevated p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-glass">
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest mb-4">// SELECCIONAR SEDE</h3>
            
            <div className="space-y-4">
              <select 
                value={selectedStoreId}
                onChange={handleStoreSelectChange}
                className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-bold text-vercel-blue dark:text-neon-cyan transition-colors"
              >
                {stores.map(s => (
                  <option key={s.id} value={s.id} className="bg-light-surface dark:bg-dark-surface text-ink dark:text-ghost">
                    {s.name}
                  </option>
                ))}
                <option value="" className="bg-light-surface dark:bg-dark-surface text-ink dark:text-ghost">+ Nueva Sede/Tienda</option>
              </select>
              
              <div className="text-xs text-ink/50 dark:text-ghost/50 space-y-2">
                <p>Configura las sedes físicas de tu inventario.</p>
                <p className="font-mono">// ID Sede Activa: {selectedStoreId || 'NUEVA'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sede Form */}
        <div className="xl:col-span-2">
          <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass p-6">
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest mb-6">// DATOS DE LA SEDE</h3>
            
            {loading ? (
              <p className="text-center font-mono">Cargando...</p>
            ) : (
              <form onSubmit={handleSaveStore} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Nombre Comercial</label>
                    <input 
                      type="text" 
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                      placeholder="Ej: LogicTrack Central"
                      className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Email de Contacto</label>
                    <input 
                      type="email" 
                      value={storeEmail}
                      onChange={(e) => setStoreEmail(e.target.value)}
                      required
                      placeholder="Ej: tienda@logictrack.com"
                      className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Teléfono</label>
                    <input 
                      type="text" 
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      required
                      placeholder="Ej: +34 900 123 456"
                      className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Ciudad</label>
                    <input 
                      type="text" 
                      value={storeCity}
                      onChange={(e) => setStoreCity(e.target.value)}
                      required
                      placeholder="Ej: Madrid"
                      className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Dirección Completa</label>
                  <textarea 
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    required
                    rows="2"
                    placeholder="Calle, número, oficina..."
                    className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input 
                    type="checkbox" 
                    id="storeActive"
                    checked={storeActive}
                    onChange={(e) => setStoreActive(e.target.checked)}
                    className="w-4 h-4 accent-vercel-blue"
                  />
                  <label htmlFor="storeActive" className="font-semibold cursor-pointer">Sede operativa / activa</label>
                </div>

                <div className="flex justify-end pt-4 border-t border-black/10 dark:border-white/10">
                  <button 
                    type="submit"
                    disabled={isSavingStore}
                    className="px-6 py-3 bg-vercel-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-vercel-blue/20"
                  >
                    {isSavingStore ? 'Guardando...' : 'Guardar Sucursal'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
