import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { API_URL } from '../../../api/config';

export default function TransfersPage({ user }) {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);

  // Form fields
  const [fromStoreId, setFromStoreId] = useState('');
  const [toStoreId, setToStoreId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchTransfers();
    fetchProducts();
    fetchStores();
  }, []);

  const fetchTransfers = async () => {
    try {
      const res = await fetch(`${API_URL}/erp/stock/transfers`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setTransfers(await res.json());
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

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/stores`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setStores(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenModal = (transfer = null) => {
    if (transfer) {
      setEditingTransfer(transfer);
      setFromStoreId(transfer.fromStore?.id || '');
      setToStoreId(transfer.toStore?.id || '');
      setProductId(transfer.product?.id || '');
      setQuantity(transfer.quantity || '');
      setNotes(transfer.notes || '');
    } else {
      setEditingTransfer(null);
      setFromStoreId('');
      setToStoreId('');
      setProductId('');
      setQuantity('');
      setNotes('');
    }
    setIsOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingTransfer && editingTransfer.status === 'COMPLETED') return;

    if (parseInt(fromStoreId) === parseInt(toStoreId)) {
      alert("La tienda de origen y destino no pueden ser iguales.");
      return;
    }
    const payload = {
      fromStoreId: parseInt(fromStoreId),
      toStoreId: parseInt(toStoreId),
      productId: parseInt(productId),
      quantity: parseInt(quantity),
      notes
    };

    const url = editingTransfer 
      ? `${API_URL}/erp/stock/transfers/${editingTransfer.id}`
      : `${API_URL}/erp/stock/transfers`;
    const method = editingTransfer ? 'PUT' : 'POST';

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
        setIsOpen(false);
        fetchTransfers();
      } else {
        const txt = await res.text();
        alert(`Error: ${txt}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (e, id) => {
    e.stopPropagation(); // Avoid triggering modal edit
    if (!confirm('¿Seguro que quieres completar este traspaso? Se moverá el stock.')) return;
    try {
      const res = await fetch(`${API_URL}/erp/stock/transfers/${id}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        fetchTransfers();
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
      const headers = ['ID', 'Fecha', 'Origen', 'Destino', 'Estado', 'Notas'];
      const rows = transfers.map(t => [
        t.id,
        new Date(t.createdAt).toLocaleDateString(),
        t.sourceStoreName || t.sourceStoreId,
        t.destinationStoreName || t.destinationStoreId,
        t.status,
        t.notes || ''
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'traspasos.csv'; a.click();
    } catch (err) { alert('Error al exportar: ' + err.message); }
  };

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Historial de Traspasos", 14, 20);
      doc.setFontSize(10);
      let y = 30;
      transfers.forEach(t => {
        if (y > 280) { doc.addPage(); y = 20; }
        const date = new Date(t.createdAt).toLocaleDateString();
        doc.text(`${date} | Origen: ${t.sourceStoreName||t.sourceStoreId} | Destino: ${t.destinationStoreName||t.destinationStoreId} | Estado: ${t.status}`, 14, y);
        y += 8;
      });
      doc.save('traspasos.pdf');
    } catch (err) { alert('Error al exportar: ' + err.message); }
  };

  const isReadOnly = false;

  return (
    <div className="space-y-6 animate-fade-in text-ink dark:text-ghost">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Traspasos de Stock</h2>
          <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Mueve mercancías de una sucursal a otra. Pincha en cualquier fila para ver todos los detalles.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 justify-end w-full lg:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <label className="flex-1 sm:flex-none flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer ">
              Importar CSV
              <input type="file" accept=".csv" className="hidden" onChange={(e) => { if(e.target.files.length) alert('Próximamente: Importación de traspasos'); e.target.value = ''; }} />
            </label>
            <button onClick={handleExportCsv} className="flex-1 sm:flex-none flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer ">
              Exportar CSV
            </button>
            <button onClick={handleExportPdf} className="flex-1 sm:flex-none flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer ">
              PDF
            </button>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center bg-vercel-blue hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer text-[11px] sm:text-xs uppercase tracking-wider "
          >
            + Solicitar Traspaso
          </button>
        </div>
      </div>

      <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando traspasos...</p>
        ) : transfers.length === 0 ? (
          <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">No hay registros de traspasos.</p>
        ) : (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full table-fixed text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-ink/60 dark:text-ghost/60 bg-gray-50/50 dark:bg-neutral-900/10 font-bold">
                  <th className="py-3 px-2 w-12">ID</th>
                  <th className="py-3 px-2 w-1/3 md:w-1/4 lg:w-1/5">Producto</th>
                  <th className="py-3 px-2 text-center w-16 md:w-20">Cantidad</th>
                  <th className="py-3 px-2 hidden lg:table-cell w-1/6">Origen</th>
                  <th className="py-3 px-2 hidden lg:table-cell w-1/6">Destino</th>
                  <th className="py-3 px-2 text-center w-24">Estado</th>
                  <th className="py-3 px-2 hidden md:table-cell w-1/5">Notas</th>
                  <th className="py-3 px-2 text-center w-28 md:w-32">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-nord-border/60">
                {transfers.map(t => (
                  <tr 
                    key={t.id} 
                    onClick={() => handleOpenModal(t)}
                    className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/10 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-2 font-mono text-[11px] text-ink/50 dark:text-ghost/50">{t.id}</td>
                    <td className="py-3 px-2 font-bold text-ink dark:text-ghost truncate max-w-[150px]">{t.product?.name}</td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-ink dark:text-ghost">{t.quantity}</td>
                    <td className="py-3 px-2 truncate max-w-[120px] text-ink/70 dark:text-ghost/70 hidden lg:table-cell">{t.fromStore?.name || 'Central'}</td>
                    <td className="py-3 px-2 truncate max-w-[120px] text-ink/70 dark:text-ghost/70 hidden lg:table-cell">{t.toStore?.name}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-wider ${
                        t.status === 'COMPLETED' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                          : t.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                          : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-[11px] italic text-ink/40 dark:text-ghost/40 truncate max-w-[120px] hidden md:table-cell">{t.notes || '-'}</td>
                    <td className="py-3 px-2 text-center">
                      {t.status === 'PENDING' ? (
                        <button 
                          onClick={(e) => handleComplete(e, t.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] py-1.5 px-3 rounded-lg transition-all shadow-md hover:scale-105"
                        >
                          Recibir
                        </button>
                      ) : (
                        <span className="text-ink/30 dark:text-ghost/30 font-bold">—</span>
                      )}
                    </td>
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
            <h3 className="text-lg font-display font-black uppercase tracking-wider">
              {editingTransfer 
                ? (isReadOnly ? 'Detalles de Traspaso (Completado)' : `Editar Traspaso #${editingTransfer.id}`) 
                : 'Solicitar Traspaso'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Producto</label>
                <select 
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                  disabled={isReadOnly}
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors disabled:opacity-60"
                >
                  <option value="">Selecciona un producto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Tienda Origen</label>
                <select 
                  value={fromStoreId}
                  onChange={(e) => setFromStoreId(e.target.value)}
                  required
                  disabled={isReadOnly}
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors disabled:opacity-60"
                >
                  <option value="">Selecciona origen</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Tienda Destino</label>
                <select 
                  value={toStoreId}
                  onChange={(e) => setToStoreId(e.target.value)}
                  required
                  disabled={isReadOnly}
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors disabled:opacity-60"
                >
                  <option value="">Selecciona destino</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Cantidad</label>
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="1"
                  disabled={isReadOnly}
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Notas / Instrucciones</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  disabled={isReadOnly}
                  placeholder="Detalles sobre el transporte..."
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors resize-none disabled:opacity-60"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2 py-2 rounded-xl bg-black/5 dark:bg-white/5 font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isReadOnly ? 'Cerrar' : 'Cancelar'}
                </button>
                {!isReadOnly && (
                  <button 
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-vercel-blue text-white font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    {editingTransfer ? 'Guardar Cambios' : 'Enviar Traspaso'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
