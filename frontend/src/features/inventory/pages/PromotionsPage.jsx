import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function PromotionsPage({ user }) {
  const token = user?.token;
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingPromo, setEditingPromo] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', code: '', type: 'PERCENTAGE', discountValue: 0, minOrderAmount: 0, active: true });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${API_URL}/crm/promotions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPromotions(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = editingPromo === 'create' ? 'POST' : 'PUT';
    const url = editingPromo === 'create' ? `${API_URL}/crm/promotions` : `${API_URL}/crm/promotions/${editingPromo.id}`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        showToast(editingPromo === 'create' ? 'Cupón creado' : 'Cupón actualizado');
        setEditingPromo(null);
        fetchPromotions();
      } else {
        showToast('Error al guardar cupón', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de red', 'error');
    }
  };

  const openCreate = () => {
    setEditForm({ name: '', code: '', type: 'PERCENTAGE', discountValue: 10, minOrderAmount: 0, active: true });
    setEditingPromo('create');
  };

  const openEdit = (p) => {
    setEditForm({ ...p });
    setEditingPromo(p);
  };

  const inputCls = "w-full bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-ink dark:text-ghost focus:outline-none focus:ring-2 focus:ring-vercel-blue/50 focus:border-vercel-blue transition-all font-medium text-[13px]";
  const labelCls = "block text-[11px] font-bold text-ink/60 dark:text-ghost/60 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="space-y-6 animate-fade-in relative max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-ink dark:text-ghost mb-2">
            MARKETING
          </h1>
          <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Gestiona cupones de descuento y promociones para el TPV.</p>
        </div>
        <button 
          onClick={openCreate}
          className="w-full sm:w-auto bg-neon-cyan hover:bg-[#00E5FF] text-black font-black py-2.5 px-6 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all hover:scale-105 cursor-pointer text-xs uppercase tracking-wider"
        >
          + Nuevo Cupón
        </button>
      </div>

      {/* Main Panel */}
      <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando promociones...</p>
        ) : (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full table-fixed text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-neutral-900/10 text-ink/60 dark:text-ghost/60 font-bold">
                  <th className="py-3 px-4 w-1/3">Promoción</th>
                  <th className="py-3 px-4 w-1/5">Código TPV</th>
                  <th className="py-3 px-4 w-1/6">Descuento</th>
                  <th className="py-3 px-4 w-1/6 hidden md:table-cell">Mínimo Compra</th>
                  <th className="py-3 px-4 w-24 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {promotions.map(p => (
                  <tr key={p.id} onClick={() => openEdit(p)} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/10 cursor-pointer transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-ink dark:text-ghost truncate">{p.name}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-neon-cyan tracking-wider">{p.code}</td>
                    <td className="py-3 px-4 font-bold">
                      {p.type === 'PERCENTAGE' ? `${p.discountValue}%` : `-${p.discountValue}€`}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-ink/60 dark:text-ghost/60">
                      {p.minOrderAmount > 0 ? `Desde ${p.minOrderAmount}€` : 'Sin mínimo'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${p.active ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                        {p.active ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                  </tr>
                ))}
                {promotions.length === 0 && (
                  <tr><td colSpan="5" className="py-8 text-center text-ink/50 dark:text-ghost/50">No hay cupones creados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPromo !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-light-elevated dark:bg-dark-elevated rounded-3xl w-full max-w-lg shadow-2xl p-6 relative border border-black/5 dark:border-neon-cyan/20 overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-2xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-vercel-blue to-neon-cyan relative z-10">
              {editingPromo === 'create' ? 'Crear Cupón' : 'Editar Cupón'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4 relative z-10">
              <div>
                <label className={labelCls}>Nombre de la Campaña *</label>
                <input type="text" required className={inputCls} placeholder="Rebajas de Verano" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Código para TPV *</label>
                  <input type="text" required className={`${inputCls} uppercase font-mono font-bold text-neon-cyan`} placeholder="VERANO20" value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className={labelCls}>Tipo de Descuento</label>
                  <select className={inputCls} value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED_AMOUNT">Cantidad Fija (€)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Valor del Descuento *</label>
                  <input type="number" step="0.01" required className={inputCls} value={editForm.discountValue} onChange={e => setEditForm({...editForm, discountValue: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className={labelCls}>Compra Mínima (€)</label>
                  <input type="number" step="0.01" className={inputCls} value={editForm.minOrderAmount} onChange={e => setEditForm({...editForm, minOrderAmount: parseFloat(e.target.value)})} />
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                <input type="checkbox" id="p_active" checked={editForm.active} onChange={e => setEditForm({...editForm, active: e.target.checked})} className="rounded bg-black/10 dark:bg-white/10" />
                <label htmlFor="p_active" className="text-sm font-semibold text-ink dark:text-ghost">Cupón Activo</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingPromo(null)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-black/5 dark:bg-white/5 text-ink dark:text-ghost hover:bg-black/10 dark:hover:bg-white/10 transition">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-vercel-blue text-white hover:bg-blue-600 transition shadow-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-xl shadow-lg border font-bold text-sm z-50 animate-bounce-in ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
