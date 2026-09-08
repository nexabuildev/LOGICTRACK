import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { API_URL } from '../../../api/config';

export default function ProductsPage({ embedded = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Slide-over panel
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [panelTab, setPanelTab] = useState('info');

  // Create modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [tempFeatures, setTempFeatures] = useState([{k:'', v:''}]);
  const [tempFeaturesEdit, setTempFeaturesEdit] = useState([{k:'', v:''}]);
  const [formData, setFormData] = useState({ sku:'', name:'', description:'', price:'', stockQuantity:'', minStockAlert:'5', serialNumber:'', condition:'NUEVO', features:'{}', storeId:'' });
  const [stores, setStores] = useState([]);

  // Panel edit form
  const [panelForm, setPanelForm] = useState({});
  const [panelError, setPanelError] = useState(null);
  const [panelSaving, setPanelSaving] = useState(false);

  // Kardex
  const [transactions, setTransactions] = useState([]);
  const [loadingTxs, setLoadingTxs] = useState(false);

  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products`, { headers: { 'Authorization': `Bearer ${user.token}` } });
      if (!res.ok) throw new Error("Error al obtener productos");
      setProducts(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/stores`, { headers: { 'Authorization': `Bearer ${user.token}` } });
      if (res.ok) setStores(await res.json());
    } catch (_) {}
  };

  useEffect(() => {
    if (!user) {
      if (!embedded) navigate('/login');
      return;
    }
    if (user.role !== 'ADMIN' && user.role !== 'TECNICO' && user.role !== 'GESTOR_TIENDA') {
      if (!embedded) navigate('/');
      return;
    }
    fetchProducts();
    fetchStores();
  }, [navigate, embedded]);

  const openPanel = async (p) => {
    setSelectedProduct(p);
    setPanelTab('info');
    setPanelError(null);
    setPanelForm({ sku: p.sku||'', name: p.name||'', description: p.description||'', price: p.price.toString(), stockQuantity: p.stockQuantity.toString(), minStockAlert: (p.minStockAlert||5).toString(), serialNumber: p.serialNumber||'', condition: p.condition||'NUEVO', features: p.features||'{}', storeId: p.store?.id ? p.store.id.toString() : '' });
    setLoadingTxs(true);
    setTransactions([]);
    try {
      const res = await fetch(`${API_URL}/products/${p.id}/transactions`, { headers: { 'Authorization': `Bearer ${user.token}` } });
      if (res.ok) setTransactions(await res.json());
    } catch (_) {}
    setLoadingTxs(false);
  };

  const handlePanelSave = async (e) => {
    e.preventDefault(); setPanelError(null); setPanelSaving(true);
    try {
      const featuresObjEdit = {};
      tempFeaturesEdit.forEach(f => { if(f.k.trim() && f.v.trim()) featuresObjEdit[f.k.trim()] = f.v.trim(); });
      const payload = { 
        ...panelForm, 
        price: parseFloat(panelForm.price), 
        stockQuantity: parseInt(panelForm.stockQuantity), 
        minStockAlert: parseInt(panelForm.minStockAlert), 
        userEmail: user.email, 
        features: JSON.stringify(featuresObjEdit),
        storeId: panelForm.storeId ? parseInt(panelForm.storeId) : null
      };
      const res = await fetch(`${API_URL}/products/${selectedProduct.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` }, body: JSON.stringify(payload)
      });
      if (res.ok) { await fetchProducts(); setSelectedProduct({ ...selectedProduct, ...payload }); setPanelTab('info'); }
      else setPanelError(await res.text());
    } catch { setPanelError("Error de conexión"); }
    finally { setPanelSaving(false); }
  };

  const handlePanelDelete = async () => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      const res = await fetch(`${API_URL}/products/${selectedProduct.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${user.token}` } });
      if (res.ok) { setSelectedProduct(null); fetchProducts(); }
      else alert("Error: " + await res.text());
    } catch { alert("Error de conexión"); }
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetch(`${API_URL}/products/export/csv`, { headers: { 'Authorization': `Bearer ${user.token}` } });
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'productos_logictrack.csv'; a.click();
    } catch (err) { alert(err.message); }
  };
  const handleExportPdf = async () => {
    try {
      const res = await fetch(`${API_URL}/products/export/pdf`, { headers: { 'Authorization': `Bearer ${user.token}` } });
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'catalogo_productos.pdf'; a.click();
    } catch (err) { alert(err.message); }
  };
  const handleImportCsv = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    try { setLoading(true); const res = await fetch(`${API_URL}/products/import/csv`, { method:'POST', headers:{'Authorization':`Bearer ${user.token}`}, body:fd }); alert(await res.text()); fetchProducts(); }
    catch { alert("Error de conexión al cargar CSV"); }
    finally { setLoading(false); e.target.value = null; }
  };
  const handleTriggerStockCheck = async () => {
    try { const res = await fetch(`${API_URL}/products/trigger-stock-check`, { method:'POST', headers:{'Authorization':`Bearer ${user.token}`} }); alert(res.ok ? await res.text() : "Error"); }
    catch { alert("Error de conexión"); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setModalError(null);
    try {
      const featuresObj = {};
      tempFeatures.forEach(f => { if(f.k.trim() && f.v.trim()) featuresObj[f.k.trim()] = f.v.trim(); });
      const payload = { 
        ...formData, 
        features: JSON.stringify(featuresObj), 
        price: parseFloat(formData.price), 
        stockQuantity: parseInt(formData.stockQuantity), 
        minStockAlert: parseInt(formData.minStockAlert), 
        userEmail: user.email,
        storeId: formData.storeId ? parseInt(formData.storeId) : null
      };
      const res = await fetch(`${API_URL}/products`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${user.token}`}, body: JSON.stringify(payload) });
      if (res.ok) { setIsModalOpen(false); fetchProducts(); }
      else { const t = await res.text(); try { setModalError(Object.values(JSON.parse(t)).join(', ')); } catch { setModalError(t); } }
    } catch { setModalError("Error al guardar"); }
  };

  const handleGenerateQRs = async () => {
    try {
      const doc = new jsPDF();
      let x = 20, y = 20;
      for (let i = 0; i < products.length; i++) {
        const prod = products[i];
        if (y > 250) { doc.addPage(); x = 20; y = 20; }
        const qrDataUrl = await QRCode.toDataURL(prod.sku, { errorCorrectionLevel: 'M', margin: 1 });
        doc.addImage(qrDataUrl, 'PNG', x, y, 40, 40);
        doc.setFontSize(8);
        doc.text(prod.sku, x + 20, y + 43, { align: 'center' });
        doc.text(prod.name.substring(0, 20), x + 20, y + 47, { align: 'center' });
        
        x += 60;
        if (x > 180) { x = 20; y += 60; }
      }
      doc.save('etiquetas-qr.pdf');
    } catch (err) {
      console.error(err);
      setError('Error al generar etiquetas QR');
    }
  };

  const filteredProducts = products.filter(p =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description||'').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  const inputCls = "w-full p-2.5 bg-light-base/50 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-xl focus:outline-none focus:border-vercel-blue dark:focus:border-neon-cyan text-ink dark:text-ghost placeholder-slate-400 dark:placeholder-slate-500 font-semibold text-xs transition-colors";
  const labelCls = "block text-[10px] font-bold text-ink/60 dark:text-ghost/60 uppercase tracking-widest mb-1";

  return (
    <div className="text-ink dark:text-ghost font-sans tracking-tight antialiased flex flex-col xl:flex-row gap-8 items-start w-full">

        {/* LEFT: Table */}
        <div className="flex-1 min-w-0 space-y-6 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-ghost mb-1.5">Inventario</h1>
              <p className="text-ink/60 dark:text-ink/40 text-sm">
                {user.role === 'ADMIN' ? 'Administra el catálogo completo de hardware.' : 'Tus productos a la venta.'}
              </p>
            </div>
            <button onClick={() => { setIsModalOpen(true); setModalError(null); setFormData({ sku:'', name:'', description:'', price:'', stockQuantity:'', minStockAlert:'5', serialNumber:'', condition:'NUEVO', features:'{}', storeId:'' }); setTempFeatures([{k:'', v:''}]); }}
              className="bg-vercel-blue dark:bg-neon-cyan hover:bg-[#0070F3] dark:hover:bg-[#00E5FF] text-white dark:text-black px-5 py-2.5 rounded-xl text-xs font-black shadow-neon-sm transition-colors cursor-pointer whitespace-nowrap self-start md:self-auto">
              + Añadir Producto
            </button>
          </div>

          {/* Combined Search & Actions Toolbar */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3">
            <div className="relative flex-1">
              <input type="text" placeholder="Buscar por nombre, SKU o descripción..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-light-elevated dark:bg-dark-elevated border border-black/5 dark:border-white/5 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-slate-400 text-ink dark:text-ghost placeholder-slate-400 transition-colors shadow-sm" />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button onClick={handleExportCsv} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer">Exportar CSV</button>
              <button onClick={handleExportPdf} className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer">PDF</button>
              <button onClick={handleGenerateQRs} className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer">Generar QR</button>
              <label className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center">
                Importar CSV <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
              </label>
              {user.role === 'ADMIN' && (
                <button onClick={handleTriggerStockCheck} className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer">
                  Revisar Stock
                </button>
              )}
            </div>
          </div>

          {error && <div className="bg-red-55 border border-red-200 text-red-600 p-4 rounded-xl text-xs font-semibold">⚠️ {error}</div>}

          {loading ? <div className="text-center py-20 text-ink/40 text-xs">Cargando catálogo...</div> : (
            <div className="bg-light-elevated dark:bg-dark-elevated/40 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-black/5 dark:border-white/5 text-ink/60 dark:text-ghost/60 bg-gray-50/50 dark:bg-neutral-900/10 font-bold">
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Nombre</th>
                      {!selectedProduct && <th className="py-3 px-4 hidden xl:table-cell">Descripción</th>}
                      <th className="py-3 px-4">Precio</th>
                      {!selectedProduct && <th className="py-3 px-4 hidden lg:table-cell">Mercado</th>}
                      <th className="py-3 px-4 text-center">Stock</th>
                      <th className="py-3 px-4 text-center">Mín.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-nord-border/60">
                    {filteredProducts.map(p => (
                      <tr key={p.id} onClick={() => openPanel(p)}
                        className={`cursor-pointer transition-colors ${selectedProduct?.id === p.id ? 'bg-slate-100/50 dark:bg-[#1c1c1e]/80 font-medium border-l border-slate-900 dark:border-neutral-200' : 'hover:bg-slate-50/50 dark:hover:bg-neutral-900/10'}`}>
                        <td className="py-3 px-4 font-mono text-[11px] text-ink/80 dark:text-ghost/80">{p.sku}</td>
                        <td className="py-3 px-4 text-ink dark:text-ghost truncate max-w-[140px] sm:max-w-[200px]">{p.name}</td>
                        {!selectedProduct && <td className="py-3 px-4 text-ink/60 dark:text-ghost/60 text-[11px] max-w-[150px] truncate hidden xl:table-cell">{p.description}</td>}
                        <td className="py-3 px-4 font-bold text-ink dark:text-ghost">{p.price}€</td>
                        {!selectedProduct && (
                          <td className="py-3 px-4 text-[11px] hidden lg:table-cell">
                            {(() => {
                              const compPrice = Math.round(p.price * (p.id % 2 === 0 ? 0.92 : 1.08) * 100) / 100;
                              const diff = Math.round(((p.price - compPrice) / compPrice) * 100);
                              return diff > 0 
                                ? <span className="text-red-500 font-semibold">+{diff}% (vs {compPrice}€)</span>
                                : <span className="text-emerald-500 font-semibold">-{Math.abs(diff)}% (óptimo)</span>;
                            })()}
                          </td>
                        )}
                        <td className="py-3 px-4 text-center">
                          <span className={`font-semibold px-2 py-0.5 rounded border text-[10px] ${p.stockQuantity <= p.minStockAlert ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                            {p.stockQuantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-ink/40 dark:text-ghost/40">{p.minStockAlert}</td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr><td colSpan={7} className="py-12 text-center text-neutral-500">No hay productos en el catálogo.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Detail & Edit Panel */}
        {selectedProduct && (
          <>
            {/* Mobile backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden" onClick={() => setSelectedProduct(null)}></div>
            
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md md:max-w-lg z-50 xl:static xl:translate-x-0 xl:translate-y-0 xl:w-[420px] 2xl:w-[500px] shrink-0 xl:sticky xl:top-24 max-h-[85vh] xl:max-h-[calc(100vh-7rem)] flex flex-col bg-light-surface/90 dark:bg-dark-surface/95 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-glass overflow-hidden">
            {/* Panel header */}
            <div className="p-5 border-b border-black/5 dark:border-white/10 flex items-start justify-between shrink-0 bg-light-base/30 dark:bg-white/5">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-ink/40 dark:text-ghost/40 uppercase tracking-widest mb-0.5">{selectedProduct.sku}</p>
                <h2 className="text-sm font-bold text-ink dark:text-ghost truncate leading-tight">{selectedProduct.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-base font-bold text-ink dark:text-ghost">{selectedProduct.price}€</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${selectedProduct.stockQuantity <= selectedProduct.minStockAlert ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                    Stock: {selectedProduct.stockQuantity}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-ink/40 hover:text-slate-655 dark:hover:text-white ml-2 text-lg leading-none cursor-pointer shrink-0">✕</button>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-black/5 dark:border-white/5 shrink-0">
              {[['info','Info'],['edit','Editar'],['kardex','Kardex']].map(([tab, label]) => (
                <button key={tab} onClick={() => {
                  if (tab === 'edit') {
                    let parsed = {};
                    try { if (selectedProduct.features && selectedProduct.features.startsWith('{')) parsed = JSON.parse(selectedProduct.features); } catch(e) {}
                    const feats = Object.entries(parsed).map(([k, v]) => ({ k, v }));
                    setTempFeaturesEdit(feats.length ? feats : [{ k: '', v: '' }]);
                  }
                  setPanelTab(tab);
                }}
                  className={`flex-1 py-3 text-xs font-bold transition-colors ${panelTab === tab ? 'text-ink dark:text-ghost border-b-2 border-vercel-blue dark:border-neon-cyan bg-light-base/50 dark:bg-white/5' : 'text-ink/40 dark:text-ghost/50 hover:text-ink/80 dark:hover:text-ghost'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

              {panelTab === 'info' && (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['SKU', selectedProduct.sku],
                      ['Precio', selectedProduct.price + '€'],
                      ['Stock actual', selectedProduct.stockQuantity],
                      ['Aviso mínimo', selectedProduct.minStockAlert],
                      ['N.º Serie', selectedProduct.serialNumber || '—'],
                      ['Condición', selectedProduct.condition === 'REACONDICIONADO' ? 'Reacondicionado' : 'Nuevo'],
                      ['Propietario', selectedProduct.user?.email || '—'],
                      ['Tienda', selectedProduct.store?.name || 'Ninguna'],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-light-base/50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-ink/40 dark:text-ghost/40 uppercase tracking-wider mb-0.5">{k}</p>
                        <p className="text-xs font-semibold text-ink dark:text-ghost truncate">{v}</p>
                      </div>
                    ))}
                  </div>

                  {selectedProduct.description && (
                    <div>
                      <p className="text-[10px] font-bold text-ink/40 dark:text-ghost/40 uppercase tracking-wider mb-1.5">Descripción / Notas</p>
                      <div className="bg-light-base/50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-3 text-xs text-ink/80 dark:text-ghost/90 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line shadow-sm">
                        {selectedProduct.description}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                    <button onClick={() => {
                        setPanelTab('edit');
                        let parsed = {};
                        try { if(selectedProduct.features && selectedProduct.features.startsWith('{')) parsed = JSON.parse(selectedProduct.features); } catch(e){}
                        const feats = Object.entries(parsed).map(([k,v]) => ({k,v}));
                        setTempFeaturesEdit(feats.length ? feats : [{k:'', v:''}]);
                      }}
                      className="flex-1 bg-light-elevated dark:bg-white/5 hover:bg-light-base dark:hover:bg-white/10 text-ink dark:text-ghost py-3 rounded-xl text-xs font-bold border border-black/5 dark:border-white/5 cursor-pointer transition-colors shadow-sm">
                      Editar
                    </button>
                    <button onClick={handlePanelDelete}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-450 py-3 rounded-xl text-xs font-bold border border-red-500/20 cursor-pointer transition-colors shadow-sm">
                      Eliminar
                    </button>
                  </div>
                </div>
              )}

              {panelTab === 'edit' && (
                <form onSubmit={handlePanelSave} className="p-5 space-y-3">
                  {panelError && <div className="bg-red-50 border border-red-205 text-red-600 p-3 rounded-xl text-xs font-semibold">⚠️ {panelError}</div>}
                  <div className="grid grid-cols-2 gap-2">
                    {[['SKU','sku'],['Nombre','name']].map(([label, key]) => (
                      <div key={key}>
                        <label className={labelCls}>{label}</label>
                        <input type="text" className={inputCls} value={panelForm[key]||''} required onChange={e => setPanelForm({...panelForm, [key]: e.target.value})} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className={labelCls}>Descripción</label>
                    <textarea rows={2} className={inputCls + ' resize-none'} value={panelForm.description||''} onChange={e => setPanelForm({...panelForm, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={labelCls}>Nº Serie</label>
                      <input type="text" className={inputCls} value={panelForm.serialNumber||''} onChange={e => setPanelForm({...panelForm, serialNumber: e.target.value})} />
                    </div>
                    <div>
                      <label className={labelCls}>Estado</label>
                      <select className={inputCls} value={panelForm.condition||'NUEVO'} onChange={e => setPanelForm({...panelForm, condition: e.target.value})}>
                        <option value="NUEVO" className="bg-white dark:bg-[#0B0D11]">Nuevo</option>
                        <option value="REACONDICIONADO" className="bg-white dark:bg-[#0B0D11]">Reacond.</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Tienda</label>
                      <select className={inputCls} value={panelForm.storeId||''} onChange={e => setPanelForm({...panelForm, storeId: e.target.value})}>
                        <option value="" className="bg-white dark:bg-[#0B0D11]">Ninguna</option>
                        {stores.map(s => (
                          <option key={s.id} value={s.id} className="bg-white dark:bg-[#0B0D11]">{s.name} ({s.city})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-black/5 dark:border-neutral-900">
                    <label className={labelCls}>Características</label>
                    {tempFeaturesEdit.map((feat, i) => (
                      <div key={i} className="flex gap-1.5 mb-1.5">
                        <input type="text" placeholder="Ej. RAM" className={inputCls + " flex-1"} value={feat.k} onChange={e => { const nw=[...tempFeaturesEdit]; nw[i].k=e.target.value; setTempFeaturesEdit(nw); }} />
                        <input type="text" placeholder="Ej. 16GB" className={inputCls + " flex-1"} value={feat.v} onChange={e => { const nw=[...tempFeaturesEdit]; nw[i].v=e.target.value; setTempFeaturesEdit(nw); }} />
                        {tempFeaturesEdit.length > 1 && (
                          <button type="button" onClick={() => setTempFeaturesEdit(tempFeaturesEdit.filter((_, idx)=>idx!==i))} className="text-ink/40 dark:text-ghost/40 hover:text-red-500 dark:hover:text-red-400 font-bold px-1.5 transition-colors">✕</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => setTempFeaturesEdit([...tempFeaturesEdit, {k:'', v:''}])} className="text-[11px] text-vercel-blue dark:text-neon-cyan font-bold hover:underline">+ Añadir</button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[['Precio','price','0.01'],['Stock','stockQuantity','1'],['Mín.','minStockAlert','1']].map(([label, key, step]) => (
                      <div key={key}>
                        <label className={labelCls}>{label}</label>
                        <input type="number" step={step} className={inputCls} value={panelForm[key]||''} required onChange={e => setPanelForm({...panelForm, [key]: e.target.value})} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-black/5 dark:border-white/10 mt-auto">
                    <button type="button" onClick={() => setPanelTab('info')} className="flex-1 bg-light-elevated dark:bg-white/5 hover:bg-light-base dark:hover:bg-white/10 text-ink dark:text-ghost py-3 rounded-xl text-xs font-bold cursor-pointer border border-black/5 dark:border-white/5 transition-colors shadow-sm">Cancelar</button>
                    <button type="submit" disabled={panelSaving} className="flex-1 bg-vercel-blue dark:bg-neon-cyan hover:bg-[#0070F3] dark:hover:bg-[#00E5FF] text-white dark:text-black py-3 rounded-xl text-xs font-black cursor-pointer disabled:opacity-60 transition-colors shadow-neon-sm">
                      Guardar
                    </button>
                  </div>
                </form>
              )}

              {panelTab === 'kardex' && (
                <div className="p-5">
                  <p className="text-[10px] font-bold text-ink/40 dark:text-ghost/40 uppercase tracking-wider mb-4">Historial de movimientos</p>
                  {loadingTxs ? (
                    <div className="text-center py-8 text-ink/40 dark:text-ghost/50 text-xs">Cargando...</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-ink/40 dark:text-ghost/50 text-xs">Sin movimientos registrados.</div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map(tx => (
                        <div key={tx.id} className="bg-light-base/50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-3 flex items-start justify-between gap-3 text-[11px] shadow-sm">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`font-semibold ${tx.quantityChange > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange}
                              </span>
                              <span className="text-[9px] font-bold text-ink/40 dark:text-ghost/50 uppercase tracking-widest">{tx.type}</span>
                            </div>
                            <p className="text-ink/80 dark:text-ghost/90 truncate font-medium">{tx.reason || '—'}</p>
                            <p className="text-ink/40 dark:text-ghost/60 text-[10px] mt-1 tracking-wide">{tx.user?.email || 'Sistema'}</p>
                          </div>
                          <span className="text-[10px] text-ink/40 dark:text-ghost/60 shrink-0">{new Date(tx.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </>
        )}

      {/* Create modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-light-surface dark:bg-dark-surface/90 border border-black/5 dark:border-white/10 rounded-3xl w-full max-w-md p-6 shadow-glass space-y-5">
            <h2 className="text-lg font-bold text-ink dark:text-ghost">Añadir Producto</h2>
            {modalError && <div className="bg-red-50 border border-red-200 text-red-655 p-3 rounded-xl text-xs font-semibold">⚠️ {modalError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              {[['SKU','sku'],['Nombre','name']].map(([label, key]) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input type="text" className={inputCls} value={formData[key]} required onChange={e => setFormData({...formData, [key]: e.target.value})} />
                </div>
              ))}
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea rows={3} className={inputCls + ' resize-none'} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Nº Serie (Opcional)</label>
                    <input type="text" className={inputCls} value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelCls}>Estado</label>
                    <select className={inputCls} value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}>
                      <option value="NUEVO" className="bg-white dark:bg-[#0B0D11]">Nuevo</option>
                      <option value="REACONDICIONADO" className="bg-white dark:bg-[#0B0D11]">Reacondicionado</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className={labelCls}>Asignar a Tienda</label>
                  <select className={inputCls} value={formData.storeId} onChange={e => setFormData({...formData, storeId: e.target.value})}>
                    <option value="" className="bg-white dark:bg-[#0B0D11]">Ninguna</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id} className="bg-white dark:bg-[#0B0D11]">{s.name} ({s.city})</option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-2 border-t border-black/5 dark:border-neutral-900">
                  <label className={labelCls}>Características</label>
                  {tempFeatures.map((feat, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input type="text" placeholder="Ej. Pantalla" className={inputCls + " flex-1"} value={feat.k} onChange={e => { const nw=[...tempFeatures]; nw[i].k=e.target.value; setTempFeatures(nw); }} />
                      <input type="text" placeholder="Ej. 6.1 OLED" className={inputCls + " flex-1"} value={feat.v} onChange={e => { const nw=[...tempFeatures]; nw[i].v=e.target.value; setTempFeatures(nw); }} />
                      {tempFeatures.length > 1 && (
                        <button type="button" onClick={() => setTempFeatures(tempFeatures.filter((_, idx)=>idx!==i))} className="text-ink/40 dark:text-ghost/40 hover:text-red-500 dark:hover:text-red-400 font-bold px-2 transition-colors">✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setTempFeatures([...tempFeatures, {k:'', v:''}])} className="text-xs text-vercel-blue dark:text-neon-cyan font-bold hover:underline">+ Añadir característica</button>
                </div>
              <div className="grid grid-cols-3 gap-3">
                {[['Precio','price','0.01'],['Stock','stockQuantity','1'],['Mín.','minStockAlert','1']].map(([label, key, step]) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <input type="number" step={step} className={inputCls} value={formData[key]} required onChange={e => setFormData({...formData, [key]: e.target.value})} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-4 border-t border-black/5 dark:border-neutral-900">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full bg-gray-100 dark:bg-neutral-900 hover:bg-gray-250 text-ink/80 py-3 rounded-xl font-semibold border border-black/5 dark:border-white/5 transition cursor-pointer text-sm">Cancelar</button>
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold cursor-pointer text-sm transition">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
