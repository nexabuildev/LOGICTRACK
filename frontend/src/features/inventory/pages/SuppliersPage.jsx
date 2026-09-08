import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { API_URL } from '../../../api/config';

export default function SuppliersPage({ user }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_URL}/suppliers`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setSuppliers(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sup = null) => {
    if (sup) {
      setEditingSupplier(sup);
      setName(sup.name);
      setContactEmail(sup.contactEmail || '');
      setPhone(sup.phone || '');
      setAddress(sup.address || '');
    } else {
      setEditingSupplier(null);
      setName('');
      setContactEmail('');
      setPhone('');
      setAddress('');
    }
    setIsOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { name, contactEmail, phone, address };

    const url = editingSupplier 
      ? `${API_URL}/suppliers/${editingSupplier.id}`
      : `${API_URL}/suppliers`;
    
    const method = editingSupplier ? 'PUT' : 'POST';

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
        fetchSuppliers();
      } else {
        const txt = await res.text();
        alert(`Error: ${txt}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar este proveedor?')) return;
    try {
      const res = await fetch(`${API_URL}/suppliers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        fetchSuppliers();
      } else {
        alert('Error al eliminar. Puede tener órdenes asociadas.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = () => {
    try {
      const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Dirección'];
      const rows = suppliers.map(s => [
        s.id,
        s.name,
        s.contactEmail || '',
        s.contactPhone || '',
        s.address || ''
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'proveedores.csv'; a.click();
    } catch (err) { alert('Error al exportar: ' + err.message); }
  };

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Directorio de Proveedores", 14, 20);
      doc.setFontSize(10);
      let y = 30;
      suppliers.forEach(s => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(`${s.name} | Correo: ${s.contactEmail||'-'} | Tel: ${s.contactPhone||'-'}`, 14, y);
        y += 8;
      });
      doc.save('proveedores.pdf');
    } catch (err) { alert('Error al exportar: ' + err.message); }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 animate-fade-in text-ink dark:text-ghost">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Proveedores</h2>
          <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Gestiona las compras de hardware y componentes.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <label className="flex-1 sm:flex-none flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer whitespace-nowrap">
              Importar CSV
              <input type="file" accept=".csv" className="hidden" onChange={(e) => { if(e.target.files.length) alert('Próximamente: Importación de proveedores'); e.target.value = ''; }} />
            </label>
            <button onClick={handleExportCsv} className="flex-1 sm:flex-none flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer whitespace-nowrap">
              Exportar CSV
            </button>
            <button onClick={handleExportPdf} className="flex-1 sm:flex-none flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer whitespace-nowrap">
              PDF
            </button>
          </div>
          {isAdmin && (
            <button 
              onClick={() => handleOpenModal()}
              className="w-full sm:w-auto flex items-center justify-center bg-vercel-blue hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer text-[11px] sm:text-xs uppercase tracking-wider whitespace-nowrap"
            >
              + Nuevo Proveedor
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando proveedores...</p>
        ) : suppliers.length === 0 ? (
          <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">No hay proveedores registrados.</p>
        ) : (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                <tr>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Nombre</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Email</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Teléfono</th>
                  <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest">Dirección</th>
                  {isAdmin && <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold">{s.name}</td>
                    <td className="py-4 px-6 font-mono text-xs">{s.contactEmail}</td>
                    <td className="py-4 px-6 font-mono text-xs">{s.phone}</td>
                    <td className="py-4 px-6 text-xs">{s.address || '-'}</td>
                    {isAdmin && (
                      <td className="py-4 px-6 text-right space-x-2">
                        <button 
                          onClick={() => handleOpenModal(s)}
                          className="text-vercel-blue dark:text-neon-cyan hover:underline font-bold text-xs cursor-pointer"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="text-red-500 hover:underline font-bold text-xs cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
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
              {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Contacto Email</label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Teléfono</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Dirección (Opcional)</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="2"
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
