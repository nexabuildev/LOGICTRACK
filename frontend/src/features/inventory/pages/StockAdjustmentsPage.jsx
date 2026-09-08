import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { API_URL } from '../../../api/config';

export default function StockAdjustmentsPage({ user }) {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsOpen] = useState(false);

  // Form fields
  const [productId, setProductId] = useState('');
  const [quantityChange, setQuantityChange] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('MERMA');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchAdjustments();
    fetchProducts();
  }, []);

  const fetchAdjustments = async () => {
    try {
      const res = await fetch(`${API_URL}/erp/stock/adjustments`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setAdjustments(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      productId: parseInt(productId),
      quantityChange: parseInt(quantityChange),
      adjustmentType,
      reason
    };

    try {
      const res = await fetch(`${API_URL}/erp/stock/adjustments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsOpen(false);
        setProductId('');
        setQuantityChange('');
        setReason('');
        fetchAdjustments();
      } else {
        const txt = await res.text();
        alert(`Error: ${txt}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = () => {
    try {
      const headers = ['Fecha', 'Producto', 'SKU', 'Cantidad', 'Tipo', 'Motivo'];
      const rows = adjustments.map(a => [
        new Date(a.createdAt).toLocaleString(),
        a.productName,
        a.productSku,
        a.quantityChange,
        a.type,
        a.reason || ''
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'ajustes_stock.csv'; a.click();
    } catch (err) { alert('Error al exportar: ' + err.message); }
  };

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Historial de Ajustes de Stock", 14, 20);
      doc.setFontSize(10);
      let y = 30;
      adjustments.forEach(a => {
        if (y > 280) { doc.addPage(); y = 20; }
        const date = new Date(a.createdAt).toLocaleDateString();
        doc.text(`${date} | Producto: ${a.productName} (${a.productSku}) | Cantidad: ${a.quantityChange} | Tipo: ${a.type}`, 14, y);
        y += 8;
      });
      doc.save('ajustes_stock.pdf');
    } catch (err) { alert('Error al exportar: ' + err.message); }
  };

  return (
    <div className="space-y-6 animate-fade-in text-ink dark:text-ghost">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Ajustes y Mermas</h2>
          <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Gestiona pérdidas, mermas o inventariado manual de stock.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <label className="flex-1 sm:flex-none flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer whitespace-nowrap">
              Importar CSV
              <input type="file" accept=".csv" className="hidden" onChange={(e) => { if(e.target.files.length) alert('Próximamente: Importación de ajustes de stock'); e.target.value = ''; }} />
            </label>
            <button onClick={handleExportCsv} className="flex-1 sm:flex-none flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer whitespace-nowrap">
              Exportar CSV
            </button>
            <button onClick={handleExportPdf} className="flex-1 sm:flex-none flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer whitespace-nowrap">
              PDF
            </button>
          </div>
          <button 
            onClick={() => setIsOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center bg-vercel-blue hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer text-[11px] sm:text-xs uppercase tracking-wider whitespace-nowrap"
          >
            + Registrar Ajuste
          </button>
        </div>
      </div>

      <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando historial...</p>
        ) : adjustments.length === 0 ? (
          <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">No hay registros de ajustes.</p>
        ) : (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                <tr>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Fecha</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Producto</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">SKU</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Cantidad</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Tipo</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Usuario</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {adjustments.map(a => (
                  <tr key={a.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs">{new Date(a.createdAt).toLocaleString()}</td>
                    <td className="py-4 px-6 font-bold">{a.productName}</td>
                    <td className="py-4 px-6 font-mono text-xs text-ink/40 dark:text-ghost/40">{a.productSku}</td>
                    <td className={`py-4 px-6 font-bold font-mono ${a.quantityChange > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {a.quantityChange > 0 ? `+${a.quantityChange}` : a.quantityChange}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                        a.type === 'MERMA' 
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {a.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-ink/60 dark:text-ghost/60">{a.userEmail || 'Sistema'}</td>
                    <td className="py-4 px-6 text-xs">{a.reason}</td>
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
          <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-black/10 dark:border-white/10 p-6 max-w-md w-full shadow-glass space-y-4">
            <h3 className="text-lg font-display font-black uppercase tracking-wider">Registrar Ajuste / Merma</h3>
            
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Producto</label>
                <select 
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors"
                >
                  <option value="">Selecciona un producto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Tipo de Ajuste</label>
                <select 
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors"
                >
                  <option value="MERMA">MERMA (Pérdida/Rotura)</option>
                  <option value="CORRECCION">CORRECCIÓN (Ajuste de inventario)</option>
                  <option value="ENTRADA">ENTRADA (Ajuste positivo)</option>
                  <option value="SALIDA">SALIDA (Ajuste negativo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Variación de Cantidad</label>
                <input 
                  type="number" 
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(e.target.value)}
                  required
                  placeholder="Ej: -5 (restar) o 10 (sumar)"
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Motivo / Descripción</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows="3"
                  placeholder="Justifica el cambio de stock..."
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
