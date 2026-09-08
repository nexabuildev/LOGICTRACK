import { useState, useEffect } from 'react';
import { useErpAuth, useToast } from '../hooks/useErpAuth';
import { ErpHeader, ErpToast } from '../components/ErpLayout';

export default function AutomationSettingsPage() {
  const { apiFetch, guard, API_URL, token } = useErpAuth(['ADMIN']);
  const [form, setForm] = useState({
    stockAlertsEnabled: true,
    stockAlertEmail: '',
    defaultMinStockAlert: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    if (!guard()) return;
    (async () => {
      try {
        const s = await apiFetch('/erp/settings');
        setForm({
          stockAlertsEnabled: s.stockAlertsEnabled ?? true,
          stockAlertEmail: s.stockAlertEmail || '',
          defaultMinStockAlert: s.defaultMinStockAlert ?? 5,
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
        body: JSON.stringify({ ...current, ...form }),
      });
      showToast(setToast)('Reglas de automatización guardadas');
    } catch (e) { showToast(setToast)(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const triggerStockCheck = async () => {
    setTriggering(true);
    try {
      const res = await fetch(`${API_URL}/products/trigger-stock-check`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      showToast(setToast)(text || 'Revisión ejecutada');
    } catch (e) { showToast(setToast)(e.message, 'error'); }
    finally { setTriggering(false); }
  };

  return (
    <div className="animate-fade-in space-y-6 text-ink dark:text-ghost">
      <ErpToast toast={toast} />
      <div className="border-b border-black/5 dark:border-white/5 pb-4">
        <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Automatizaciones</h2>
        <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Alertas de stock, umbrales y notificaciones automáticas del ERP.</p>
      </div>

      {loading ? <p className="text-center py-12 text-ink/40 dark:text-ghost/40 font-mono">Cargando...</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleSave} className="bg-light-elevated dark:bg-dark-elevated rounded-2xl p-6 border border-black/5 dark:border-white/10 shadow-glass space-y-4">
            <h3 className="font-mono font-bold text-sm uppercase text-vercel-blue dark:text-neon-cyan tracking-wider">// ALERTAS DE STOCK BAJO</h3>
            
            <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer">
              <input 
                type="checkbox" 
                checked={form.stockAlertsEnabled}
                onChange={e => setForm({ ...form, stockAlertsEnabled: e.target.checked })} 
                className="w-4 h-4 accent-vercel-blue"
              />
              Activar alertas automáticas por email
            </label>
            
            <div>
              <label className="text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 block mb-1 uppercase">Email de notificación</label>
              <input 
                type="email" 
                value={form.stockAlertEmail}
                onChange={e => setForm({ ...form, stockAlertEmail: e.target.value })}
                placeholder="admin@empresa.com"
                required
                className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors text-ink dark:text-ghost font-mono" 
              />
            </div>
            
            <div>
              <label className="text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 block mb-1 uppercase">Umbral mínimo por defecto (uds.)</label>
              <input 
                type="number" 
                min="0" 
                value={form.defaultMinStockAlert}
                onChange={e => setForm({ ...form, defaultMinStockAlert: Number(e.target.value) })}
                required
                className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors text-ink dark:text-ghost font-mono" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={saving}
              className="w-full py-3 rounded-xl bg-vercel-blue hover:bg-blue-600 text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-vercel-blue/20"
            >
              {saving ? 'Guardando...' : 'Guardar Reglas'}
            </button>
          </form>

          <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl p-6 border border-black/5 dark:border-white/10 shadow-glass space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-mono font-bold text-sm uppercase text-vercel-blue dark:text-neon-cyan tracking-wider">// ACCIONES MANUALES</h3>
              <p className="text-xs text-ink/60 dark:text-ghost/60 mt-2 leading-relaxed">
                El motor inteligente del ERP comprueba de forma automática los niveles de stock para asegurar la continuidad del catálogo. Puedes disparar una verificación forzada de inmediato si lo requieres.
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 text-xs text-ink/50 dark:text-ghost/50 space-y-2 font-mono">
              <p>• Alerta cuando stock ≤ mínimo de producto</p>
              <p>• Informe consolidado de compras</p>
              <p>• Registro histórico en logs</p>
            </div>
            
            <button 
              onClick={triggerStockCheck} 
              disabled={triggering}
              className="w-full py-3 rounded-xl border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 font-bold text-sm transition-all cursor-pointer"
            >
              {triggering ? 'Ejecutando...' : '⚡ Forzar Revisión de Stock'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
