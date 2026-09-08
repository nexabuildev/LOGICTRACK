import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function RecycleBinPage({ user }) {
  const token = user?.token;
  const [deletedItems, setDeletedItems] = useState({ users: [], products: [], categories: [], customers: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  const fetchDeletedItems = async () => {
    try {
      const res = await fetch(`${API_URL}/recycle-bin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeletedItems(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRestore = async (type, id) => {
    try {
      const res = await fetch(`${API_URL}/recycle-bin/restore/${type}/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Elemento restaurado con éxito');
        fetchDeletedItems();
      } else {
        showToast('Error al restaurar', 'error');
      }
    } catch (e) {
      showToast('Error de red', 'error');
    }
  };

  const handlePermanentDelete = async (type, id) => {
    if (!confirm('¿Estás seguro de eliminar permanentemente este elemento? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`${API_URL}/recycle-bin/permanent/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Elemento eliminado de forma permanente');
        fetchDeletedItems();
      } else {
        showToast('Error al eliminar', 'error');
      }
    } catch (e) {
      showToast('Error de red', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative max-w-7xl mx-auto text-ink dark:text-ghost">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight mb-2">
          PAPELERA DE RECICLAJE
        </h1>
        <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Recupera elementos eliminados del sistema o bórralos definitivamente.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Productos Eliminados */}
        <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass p-6">
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest mb-4 text-vercel-blue dark:text-neon-cyan">📦 Productos Eliminados</h2>
          {deletedItems.products.length === 0 ? (
            <p className="text-xs text-ink/40 dark:text-ghost/40">No hay productos en la papelera.</p>
          ) : (
            <div className="space-y-3">
              {deletedItems.products.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-3 rounded-xl">
                  <div>
                    <p className="text-sm font-bold">{p.name}</p>
                    <span className="text-[10px] font-mono text-ink/50 dark:text-ghost/50">SKU: {p.sku} | Precio: {p.price}€</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRestore('products', p.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition">Restaurar</button>
                    <button onClick={() => handlePermanentDelete('products', p.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition">Eliminar Definitivo</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usuarios Eliminados */}
        <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass p-6">
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest mb-4 text-vercel-blue dark:text-neon-cyan">👤 Personal / Usuarios Eliminados</h2>
          {deletedItems.users.length === 0 ? (
            <p className="text-xs text-ink/40 dark:text-ghost/40">No hay usuarios en la papelera.</p>
          ) : (
            <div className="space-y-3">
              {deletedItems.users.map(u => (
                <div key={u.id} className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-3 rounded-xl">
                  <div>
                    <p className="text-sm font-bold">{u.name} {u.lastName}</p>
                    <span className="text-[10px] font-mono text-ink/50 dark:text-ghost/50">Email: {u.email} | Rol: {u.role}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRestore('users', u.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition">Restaurar</button>
                    <button onClick={() => handlePermanentDelete('users', u.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition">Eliminar Definitivo</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categorías Eliminadas */}
        <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass p-6">
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest mb-4 text-vercel-blue dark:text-neon-cyan">📁 Categorías Eliminadas</h2>
          {deletedItems.categories.length === 0 ? (
            <p className="text-xs text-ink/40 dark:text-ghost/40">No hay categorías en la papelera.</p>
          ) : (
            <div className="space-y-3">
              {deletedItems.categories.map(c => (
                <div key={c.id} className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-3 rounded-xl">
                  <div>
                    <p className="text-sm font-bold">{c.name}</p>
                    <span className="text-[10px] font-mono text-ink/50 dark:text-ghost/50">Tipo: {c.type}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRestore('categories', c.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition">Restaurar</button>
                    <button onClick={() => handlePermanentDelete('categories', c.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition">Eliminar Definitivo</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-xl shadow-lg border font-bold text-sm z-50 animate-bounce-in ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
