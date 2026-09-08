import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function CustomersPage({ user }) {
  const token = user?.token;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', taxId: '', address: '', active: true });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/crm/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCustomers(await res.json());
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
    const method = editingCustomer === 'create' ? 'POST' : 'PUT';
    const url = editingCustomer === 'create' ? `${API_URL}/crm/customers` : `${API_URL}/crm/customers/${editingCustomer.id}`;
    
    const payload = { ...editForm };
    if (!payload.email) payload.email = null;
    if (!payload.phone) payload.phone = null;
    if (!payload.taxId) payload.taxId = null;
    if (!payload.address) payload.address = null;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(editingCustomer === 'create' ? 'Cliente creado' : 'Cliente actualizado');
        setEditingCustomer(null);
        fetchCustomers();
      } else {
        showToast('Error al guardar cliente', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de red', 'error');
    }
  };

  const openCreate = () => {
    setEditForm({ name: '', email: '', phone: '', taxId: '', address: '', active: true });
    setEditingCustomer('create');
  };

  const openEdit = (c) => {
    setEditForm({ ...c, email: c.email || '', phone: c.phone || '', taxId: c.taxId || '', address: c.address || '' });
    setEditingCustomer(c);
  };

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.taxId?.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "w-full bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-ink dark:text-ghost focus:outline-none focus:ring-2 focus:ring-vercel-blue/50 focus:border-vercel-blue transition-all font-medium text-[13px]";
  const labelCls = "block text-[11px] font-bold text-ink/60 dark:text-ghost/60 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="space-y-6 animate-fade-in relative max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-ink dark:text-ghost mb-2">
            DIRECTORIO CRM
          </h1>
          <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Gestiona tus clientes B2B y B2C, fidelización y saldo.</p>
        </div>
        <button 
          onClick={openCreate}
          className="w-full sm:w-auto bg-vercel-blue hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer text-xs uppercase tracking-wider"
        >
          + Nuevo Cliente
        </button>
      </div>

      {/* Main Panel */}
      <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden">
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre, email o NIF..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-light-surface dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-ink dark:text-ghost focus:outline-none focus:border-vercel-blue transition-colors font-medium"
          />
        </div>

        {loading ? (
          <p className="p-8 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando directorio...</p>
        ) : (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full table-fixed text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-neutral-900/10 text-ink/60 dark:text-ghost/60 font-bold">
                  <th className="py-3 px-4 w-1/3">Cliente</th>
                  <th className="py-3 px-4 w-1/5 hidden lg:table-cell">NIF/CIF</th>
                  <th className="py-3 px-4 w-1/5">Puntos</th>
                  <th className="py-3 px-4 w-1/5">Deuda / Saldo</th>
                  <th className="py-3 px-4 w-24 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filtered.map(c => (
                  <tr key={c.id} onClick={() => openEdit(c)} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/10 cursor-pointer transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-ink dark:text-ghost truncate">{c.name}</p>
                      <p className="text-[11px] text-ink/50 dark:text-ghost/50 truncate">{c.email || c.phone || 'Sin contacto'}</p>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell font-mono text-ink/70 dark:text-ghost/70">{c.taxId || '-'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-vercel-blue">{c.logicPoints || 0} pts</td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {c.debtAmount > 0 ? (
                        <span className="text-red-500">-{c.debtAmount.toFixed(2)}€</span>
                      ) : c.storeCredit > 0 ? (
                        <span className="text-emerald-500">+{c.storeCredit.toFixed(2)}€</span>
                      ) : '0.00€'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${c.active ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                        {c.active ? 'ACTIVO' : 'BAJA'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="5" className="py-8 text-center text-ink/50 dark:text-ghost/50">No hay clientes registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingCustomer !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-light-elevated dark:bg-dark-elevated rounded-3xl w-full max-w-lg shadow-2xl p-6 relative border border-black/5 dark:border-neon-cyan/20 overflow-hidden">
            <h2 className="text-2xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-vercel-blue to-neon-cyan">
              {editingCustomer === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4 relative z-10">
              <div>
                <label className={labelCls}>Razón Social / Nombre *</label>
                <input type="text" required className={inputCls} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>NIF / CIF</label>
                  <input type="text" className={inputCls} value={editForm.taxId} onChange={e => setEditForm({...editForm, taxId: e.target.value})} />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input type="text" className={inputCls} value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" className={inputCls} value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
              </div>
              <div>
                <label className={labelCls}>Dirección Física</label>
                <input type="text" className={inputCls} value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                <input type="checkbox" id="c_active" checked={editForm.active} onChange={e => setEditForm({...editForm, active: e.target.checked})} className="rounded bg-black/10 dark:bg-white/10" />
                <label htmlFor="c_active" className="text-sm font-semibold text-ink dark:text-ghost">Cliente Activo</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingCustomer(null)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-black/5 dark:bg-white/5 text-ink dark:text-ghost hover:bg-black/10 dark:hover:bg-white/10 transition">Cancelar</button>
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
