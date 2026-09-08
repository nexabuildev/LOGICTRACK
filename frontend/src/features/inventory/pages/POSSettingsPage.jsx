import { useState, useEffect } from 'react';
import { useErpAuth, useToast } from '../hooks/useErpAuth';
import { ErpHeader, ErpToast } from '../components/ErpLayout';

export default function POSSettingsPage() {
  const { apiFetch, guard } = useErpAuth(['ADMIN']);
  const [form, setForm] = useState({
    posTicketMessage: '',
    currency: 'EUR',
    taxRate: '21.00',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    if (!guard()) return;
    (async () => {
      try {
        const s = await apiFetch('/erp/settings');
        setForm({
          posTicketMessage: s.posTicketMessage || 'Gracias por su compra',
          currency: s.currency || 'EUR',
          taxRate: String(s.taxRate ?? '21.00'),
        });
      } catch (e) { showToast(setToast)(e.message, 'error'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const current = await apiFetch('/erp/settings');
      await apiFetch('/erp/settings', {
        method: 'PUT',
        body: JSON.stringify({
          ...current,
          posTicketMessage: form.posTicketMessage,
          currency: form.currency,
          taxRate: Number(form.taxRate),
        }),
      });
      showToast(setToast)('Ajustes del TPV guardados');
    } catch (e) { showToast(setToast)(e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-fade-in space-y-6 text-ink dark:text-ghost">
      <ErpToast toast={toast} />
      <div className="border-b border-black/5 dark:border-white/5 pb-4">
        <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Ajustes del TPV</h2>
        <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Personaliza la moneda, tasas e impresión del terminal de ventas.</p>
      </div>

      {loading ? <p className="text-center py-12 text-ink/40 dark:text-ghost/40 font-mono">Cargando...</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleSave} className="bg-light-elevated dark:bg-dark-elevated rounded-2xl p-6 border border-black/5 dark:border-white/10 shadow-glass space-y-4">
            <h3 className="font-mono font-bold text-sm uppercase text-vercel-blue dark:text-neon-cyan tracking-wider">// PARÁMETROS DEL TICKET</h3>
            
            <div>
              <label className="text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 block mb-1 uppercase">Mensaje del ticket</label>
              <textarea 
                value={form.posTicketMessage} 
                onChange={e => setForm({ ...form, posTicketMessage: e.target.value })}
                rows={3} 
                required
                className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors text-ink dark:text-ghost resize-none" 
              />
            </div>
            
            <div>
              <label className="text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 block mb-1 uppercase">Moneda</label>
              <select 
                value={form.currency} 
                onChange={e => setForm({ ...form, currency: e.target.value })}
                className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-bold transition-colors"
              >
                <option value="EUR" className="bg-light-surface dark:bg-dark-surface text-ink dark:text-ghost">EUR — Euro (€)</option>
                <option value="USD" className="bg-light-surface dark:bg-dark-surface text-ink dark:text-ghost">USD — Dólar ($)</option>
                <option value="GBP" className="bg-light-surface dark:bg-dark-surface text-ink dark:text-ghost">GBP — Libra (£)</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 block mb-1 uppercase">IVA / Impuesto (%)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0" 
                max="100" 
                value={form.taxRate}
                onChange={e => setForm({ ...form, taxRate: e.target.value })}
                required
                className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors text-ink dark:text-ghost font-mono" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={saving}
              className="w-full py-3 rounded-xl bg-vercel-blue hover:bg-blue-600 text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-vercel-blue/20"
            >
              {saving ? 'Guardando...' : 'Guardar Ajustes TPV'}
            </button>
          </form>

          <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl p-6 border border-black/5 dark:border-white/10 shadow-glass flex flex-col items-center justify-center">
            <h3 className="font-mono font-bold text-xs uppercase text-ink/40 dark:text-ghost/40 tracking-widest mb-6">// VISTA PREVIA IMPRESIÓN</h3>
            
            <div className="bg-white text-black p-6 rounded-lg font-mono text-xs max-w-xs w-full shadow-2xl border border-black/10">
              <p className="text-center font-bold text-sm mb-2 tracking-wider">LOGICTRACK S.L.</p>
              <p className="text-center border-b border-dashed border-black/30 pb-2 mb-2">Ticket #00001</p>
              <p className="flex justify-between">
                <span>Producto ejemplo × 1</span>
                <span>99,00 {form.currency === 'EUR' ? '€' : form.currency}</span>
              </p>
              <p className="flex justify-between mt-1 text-[10px] text-black/60">
                <span>IVA ({form.taxRate}%)</span>
                <span>{(99 * (parseFloat(form.taxRate) / 100)).toFixed(2)} {form.currency === 'EUR' ? '€' : form.currency}</span>
              </p>
              <p className="font-bold mt-2 border-t border-dashed border-black/30 pt-2 flex justify-between">
                <span>TOTAL</span>
                <span>99,00 {form.currency === 'EUR' ? '€' : form.currency}</span>
              </p>
              <p className="text-center mt-4 text-[10px] italic border-t border-dashed border-black/15 pt-2">{form.posTicketMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
