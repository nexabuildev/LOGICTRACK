import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../api/config';
import ShopNavbar from '../../../components/ShopNavbar';

export default function MyAccountPage() {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dni: '',
    lastName: '',
    streetAddress: '',
    postalCode: '',
    city: '',
    country: 'España'
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Purchases state
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'purchases'

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      dni: user.dni || '',
      lastName: user.lastName || '',
      streetAddress: user.streetAddress || '',
      postalCode: user.postalCode || '',
      city: user.city || '',
      country: user.country || 'España'
    });

    const fetchPurchases = async () => {
      try {
        const res = await fetch(`${API_URL}/purchases/my-purchases`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPurchases(data);
        }
      } catch (err) {
        console.error("Error fetching purchases:", err);
      } finally {
        setLoadingPurchases(false);
      }
    };
    
    fetchPurchases();
  }, [userJson, navigate]);

  if (!user) return null;

  const handleCsvImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) return;
      const separator = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0].split(separator).map(h => h.trim().toLowerCase());
      const values = lines[1].split(separator).map(v => v.trim());
      
      const importedData = {};
      headers.forEach((header, index) => {
        if (values[index]) {
          importedData[header] = values[index];
        }
      });
      
      setFormData(prev => ({
        ...prev,
        name: importedData.name || prev.name,
        lastName: importedData.lastname || prev.lastName,
        dni: importedData.dni || prev.dni,
        phoneNumber: importedData.phone || prev.phoneNumber,
        streetAddress: importedData.address || prev.streetAddress,
        postalCode: importedData.zipcode || prev.postalCode,
        city: importedData.city || prev.city,
        country: importedData.country || prev.country
      }));
      setSuccessMessage("Ficha de cliente CSV precargada. Por favor revisa y guarda los cambios.");
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleDownloadTemplate = () => {
    const headers = "name; lastname; dni; phone; address; zipcode; city; country";
    const values = `${formData.name || ''}; ${formData.lastName || ''}; ${formData.dni || ''}; ${formData.phoneNumber || ''}; ${formData.streetAddress || ''}; ${formData.postalCode || ''}; ${formData.city || ''}; ${formData.country || ''}`;
    const csvContent = "\uFEFF" + headers + "\n" + values;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_datos_cuenta.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.status === 'SUCCESS') {
        localStorage.setItem('user', JSON.stringify(data));
        setSuccessMessage("Perfil actualizado con éxito.");
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(data.message || "Error al actualizar perfil");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al guardar cambios");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-vercel-blue transition-colors";
  const labelCls = "block text-[11px] font-bold uppercase tracking-wider mb-1 text-ink/70 dark:text-ghost/70";

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-ink dark:text-ghost font-sans antialiased transition-colors duration-500 overflow-hidden flex flex-col">
      <ShopNavbar />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pb-4 md:pb-6 pt-24 flex flex-col h-screen">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-display font-black tracking-tight mb-1">MI CUENTA</h1>
            <div className="flex gap-4 border-b border-black/5 dark:border-white/5">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'profile' ? 'border-vercel-blue text-vercel-blue' : 'border-transparent text-ink/50 hover:text-ink dark:text-ghost/50 dark:hover:text-ghost'}`}
              >
                Datos Personales
              </button>
              <button 
                onClick={() => setActiveTab('purchases')}
                className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'purchases' ? 'border-vercel-blue text-vercel-blue' : 'border-transparent text-ink/50 hover:text-ink dark:text-ghost/50 dark:hover:text-ghost'}`}
              >
                Mis Compras
              </button>
            </div>
          </div>
          {activeTab === 'profile' && (
            <div className="flex gap-2">
              <button type="button" onClick={handleDownloadTemplate} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors">
                📥 Plantilla
              </button>
              <label className="px-3 py-1.5 rounded-lg text-xs font-bold text-vercel-blue bg-vercel-blue/10 hover:bg-vercel-blue/20 cursor-pointer transition-colors">
                📤 Precargar
                <input type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />
              </label>
            </div>
          )}
        </div>

        {/* Success Toast */}
        {successMessage && (
          <div className="absolute top-24 right-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold shadow-lg animate-fade-in z-50">
            ✅ {successMessage}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden flex flex-col relative">
          
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 content-start hide-scrollbar">
                <div className="col-span-1 md:col-span-3 pb-2 border-b border-black/5 dark:border-white/5">
                  <h2 className="text-lg font-bold">Información Básica</h2>
                </div>
                
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input type="text" className={inputCls} value={formData.name} required onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Apellidos</label>
                  <input type="text" className={inputCls} value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>DNI / NIE</label>
                  <input type="text" className={inputCls} value={formData.dni} onChange={e => setFormData({ ...formData, dni: e.target.value })} />
                </div>

                <div className="col-span-1 md:col-span-3 pb-2 mt-2 border-b border-black/5 dark:border-white/5">
                  <h2 className="text-lg font-bold">Contacto y Facturación</h2>
                </div>

                <div>
                  <label className={labelCls}>Correo Electrónico (Solo lectura)</label>
                  <input type="email" disabled className={`${inputCls} opacity-50 cursor-not-allowed`} value={formData.email} />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input type="tel" className={inputCls} value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>País</label>
                  <input type="text" className={inputCls} value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                </div>

                <div className="col-span-1 md:col-span-3">
                  <label className={labelCls}>Dirección Completa (Calle y número)</label>
                  <input type="text" className={inputCls} value={formData.streetAddress} onChange={e => setFormData({ ...formData, streetAddress: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Localidad / Ciudad</label>
                  <input type="text" className={inputCls} value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Código Postal</label>
                  <input type="text" className={inputCls} value={formData.postalCode} onChange={e => setFormData({ ...formData, postalCode: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Rol en el sistema</label>
                  <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-ink/50 dark:text-ghost/50">
                    {user.role}
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-4 right-4 z-10">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-vercel-blue hover:bg-blue-600 hover:scale-105 active:scale-95 text-white font-black py-3 px-8 rounded-xl shadow-[0_4px_14px_0_rgba(0,112,243,0.39)] hover:shadow-[0_6px_20px_rgba(0,112,243,0.23)] transition-all disabled:opacity-50 text-sm tracking-wide"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'purchases' && (
            <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar bg-gradient-to-br from-transparent to-slate-50/30 dark:to-slate-900/20">
              {loadingPurchases ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-vercel-blue border-t-transparent rounded-full animate-spin shadow-lg shadow-vercel-blue/20"></div></div>
              ) : purchases.length === 0 ? (
                <div className="text-center py-24 rounded-3xl border-2 border-dashed border-black/5 dark:border-white/5 flex flex-col items-center justify-center">
                  <span className="text-5xl mb-4 grayscale opacity-50">🛍️</span>
                  <p className="text-ink/50 dark:text-ghost/50 font-black tracking-tight text-lg">No hay compras registradas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchases.map((order, idx) => {
                    const statusColors = {
                      'DELIVERED': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                      'SHIPPED': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                      'PENDING': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                    };
                    const sc = statusColors[order.status] || 'bg-black/5 dark:bg-white/10 text-ink dark:text-ghost';
                    
                    return (
                      <div key={order.id} className="group p-6 rounded-3xl border border-black/5 dark:border-white/10 bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-md hover:bg-white dark:hover:bg-dark-elevated hover:shadow-2xl hover:shadow-vercel-blue/10 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-vercel-blue/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-vercel-blue/20 transition-all duration-500"></div>
                        
                        <div className="flex justify-between items-start z-10">
                          <div>
                            <span className="text-[10px] font-black tracking-widest text-ink/40 dark:text-ghost/40 uppercase mb-1 block">Nº de Orden</span>
                            <span className="font-black text-2xl tracking-tighter text-ink dark:text-ghost">#{order.id}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${sc} backdrop-blur-sm shadow-sm`}>{order.status}</span>
                        </div>
                        
                        <div className="z-10 py-3 border-y border-black/5 dark:border-white/5 space-y-1">
                          <p className="text-[11px] font-bold text-ink/50 dark:text-ghost/50 flex items-center justify-between">
                            <span>Fecha:</span>
                            <span className="text-ink dark:text-ghost">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </p>
                          <p className="text-[11px] font-bold text-ink/50 dark:text-ghost/50 flex items-center justify-between">
                            <span>Artículos:</span>
                            <span className="text-ink dark:text-ghost">{order.items?.length || 1} uds.</span>
                          </p>
                        </div>

                        <div className="flex justify-between items-end mt-auto pt-2 z-10">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-ink/40 dark:text-ghost/40 mb-1">Total abonado</p>
                            <p className="text-3xl font-black tracking-tighter bg-gradient-to-br from-ink to-ink/60 dark:from-ghost dark:to-ghost/60 bg-clip-text text-transparent">{order.totalAmount}€</p>
                          </div>
                          <button 
                            onClick={() => window.open(`${API_URL}/purchases/${order.id}/invoice?token=${user.token}`, '_blank')}
                            className="text-xs font-bold bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Factura
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
