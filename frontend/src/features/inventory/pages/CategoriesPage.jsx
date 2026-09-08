import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { API_URL } from '../../../api/config';

export default function CategoriesPage({ user }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('CATEGORY');
  const [parentId, setParentId] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/erp/categories`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setType(cat.type || 'CATEGORY');
      setParentId(cat.parentId || '');
      setActive(cat.active !== false);
    } else {
      setEditingCategory(null);
      setName('');
      setType('CATEGORY');
      setParentId('');
      setActive(true);
    }
    setIsOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      type,
      parentId: parentId ? parseInt(parentId) : null,
      active
    };

    const url = editingCategory 
      ? `${API_URL}/erp/categories/${editingCategory.id}`
      : `${API_URL}/erp/categories`;

    const method = editingCategory ? 'PUT' : 'POST';

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
        fetchCategories();
      } else {
        const txt = await res.text();
        alert(`Error: ${txt}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    try {
      const res = await fetch(`${API_URL}/erp/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        fetchCategories();
      } else {
        alert('Error al eliminar. Puede tener productos asociados.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = () => {
    try {
      const headers = ['ID', 'Nombre', 'Tipo', 'Padre', 'Activo'];
      const rows = categories.map(c => [c.id, c.name, c.type, c.parentId || '-', c.active !== false ? 'Si' : 'No']);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'categorias.csv'; a.click();
    } catch (err) { alert('Error al exportar: ' + err.message); }
  };

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Listado de Categorías y Familias", 14, 20);
      doc.setFontSize(10);
      let y = 30;
      categories.forEach(c => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(`ID: ${c.id} | Nombre: ${c.name} | Tipo: ${c.type} | Activo: ${c.active !== false ? 'Si' : 'No'}`, 14, y);
        y += 8;
      });
      doc.save('categorias.pdf');
    } catch (err) { alert('Error al exportar: ' + err.message); }
  };

  return (
    <div className="space-y-6 animate-fade-in text-ink dark:text-ghost">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Categorías y Familias</h2>
          <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Clasifica y estructura los productos del almacén.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <label className="flex-1 sm:flex-none flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer whitespace-nowrap">
              Importar CSV
              <input type="file" accept=".csv" className="hidden" onChange={(e) => { if(e.target.files.length) alert('Próximamente: Importación de categorías'); e.target.value = ''; }} />
            </label>
            <button onClick={handleExportCsv} className="flex-1 sm:flex-none flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer whitespace-nowrap">
              Exportar CSV
            </button>
            <button onClick={handleExportPdf} className="flex-1 sm:flex-none flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer whitespace-nowrap">
              PDF
            </button>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center bg-vercel-blue hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer text-[11px] sm:text-xs uppercase tracking-wider whitespace-nowrap"
          >
            + Nueva Categoría
          </button>
        </div>
      </div>

      <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando categorías...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-center text-ink/50 dark:text-ghost/50 font-mono">No hay categorías registradas.</p>
        ) : (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full table-fixed text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-ink/60 dark:text-ghost/60 bg-gray-50/50 dark:bg-neutral-900/10 font-bold">
                  <th className="py-3 px-3 w-12">ID</th>
                  <th className="py-3 px-3 w-1/4 md:w-1/3">Nombre</th>
                  <th className="py-3 px-3 w-1/6 md:w-1/5">Tipo</th>
                  <th className="py-3 px-3 hidden md:table-cell w-1/6">Padre (ID)</th>
                  <th className="py-3 px-3 w-1/6">Estado</th>
                  <th className="py-3 px-3 text-center w-32 md:w-40">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/10 transition-colors cursor-default">
                    <td className="py-3 px-3 font-mono text-[11px] text-ink/50 dark:text-ghost/50">{c.id}</td>
                    <td className="py-3 px-3 font-bold text-ink dark:text-ghost truncate max-w-[120px] sm:max-w-[200px]">{c.name}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-wider ${
                        c.type === 'FAMILY' 
                          ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' 
                          : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                      }`}>
                        {c.type === 'FAMILY' ? 'FAMILIA' : 'CATEGORÍA'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-ink/50 dark:text-ghost/50 hidden md:table-cell">{c.parentId || '-'}</td>
                    <td className="py-3 px-3">
                      {c.active !== false ? (
                        <div className="flex items-center gap-2">
                          <span className="led-dot led-dot-green" />
                          <span className="text-[11px] font-bold">Activa</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="led-dot led-dot-red" />
                          <span className="text-[11px] font-bold text-ink/50 dark:text-ghost/50">Inactiva</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center space-x-2 whitespace-nowrap">
                      <button onClick={() => handleOpenModal(c)} className="bg-vercel-blue/10 hover:bg-vercel-blue/20 text-vercel-blue dark:text-neon-cyan px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer">Editar</button>
                      <button onClick={() => handleDelete(c.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer">Eliminar</button>
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
              {editingCategory ? 'Editar Categoría / Familia' : 'Nueva Categoría / Familia'}
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
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Tipo</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors"
                >
                  <option value="CATEGORY">Categoría</option>
                  <option value="FAMILY">Familia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-ink/40 dark:text-ghost/40 uppercase mb-1">Categoría Padre (Opcional)</label>
                <select 
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full p-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl focus:border-vercel-blue dark:focus:border-neon-cyan outline-none font-semibold transition-colors"
                >
                  <option value="">Ninguna</option>
                  {categories
                    .filter(c => c.id !== editingCategory?.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-vercel-blue"
                />
                <label htmlFor="active" className="font-semibold cursor-pointer">Activar categoría</label>
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
