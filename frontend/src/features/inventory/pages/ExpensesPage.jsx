import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function ExpensesPage({ user }) {
  const token = user?.token;
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', category: 'Luz' });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setExpenses(await res.json());
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: form.description,
          amount: parseFloat(form.amount),
          vatAmount: parseFloat(form.amount) * 0.21, // 21% IVA soportado
          category: form.category
        })
      });
      if (res.ok) {
        showToast('Gasto registrado correctamente');
        setIsModalOpen(false);
        setForm({ description: '', amount: '', category: 'Luz' });
        fetchExpenses();
      } else {
        showToast('Error al registrar gasto', 'error');
      }
    } catch (e) {
      showToast('Error de red', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este gasto?')) return;
    try {
      const res = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Gasto eliminado');
        fetchExpenses();
      }
    } catch (e) {
      showToast('Error al eliminar', 'error');
    }
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const inputCls = "w-full bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-ink dark:text-ghost focus:outline-none focus:ring-2 focus:ring-vercel-blue/50 focus:border-vercel-blue transition-all font-medium text-[13px]";
  const labelCls = "block text-[11px] font-bold text-ink/60 dark:text-ghost/60 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="space-y-6 animate-fade-in relative max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-ink dark:text-ghost mb-2">
            CONTROL DE GASTOS
          </h1>
          <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Registra recibos de luz, agua, nóminas y otros gastos corrientes de caja chica.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="bg-light-elevated dark:bg-dark-elevated border border-black/5 dark:border-white/10 rounded-xl px-4 py-2 flex flex-col justify-center shadow-sm">
            <span className="text-[10px] font-bold text-ink/40 dark:text-ghost/40 uppercase">Total Gastos</span>
            <span className="text-lg font-black text-red-500 font-display">{totalExpenses.toFixed(2)}€</span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-vercel-blue hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer text-xs uppercase tracking-wider"
          >
            + Registrar Gasto
          </button>
        </div>
      </div>

      <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando gastos...</p>
        ) : (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full table-fixed text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-neutral-900/10 text-ink/60 dark:text-ghost/60 font-bold">
                  <th className="py-3 px-4 w-1/3">Descripción</th>
                  <th className="py-3 px-4 w-1/4">Categoría</th>
                  <th className="py-3 px-4 w-1/6">Importe</th>
                  <th className="py-3 px-4 w-1/6">IVA Soportado (21%)</th>
                  <th className="py-3 px-4 w-24 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/10 transition-colors">
                    <td className="py-3 px-4 font-bold text-ink dark:text-ghost truncate">{e.description}</td>
                    <td className="py-3 px-4 font-semibold text-vercel-blue dark:text-neon-cyan">{e.category}</td>
                    <td className="py-3 px-4 font-bold text-red-500">{e.amount.toFixed(2)}€</td>
                    <td className="py-3 px-4 font-semibold text-ink/60 dark:text-ghost/60">{e.vatAmount?.toFixed(2) || '0.00'}€</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-600 font-bold hover:underline">Eliminar</button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr><td colSpan="5" className="py-8 text-center text-ink/50 dark:text-ghost/50">No hay gastos registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-light-elevated dark:bg-dark-elevated rounded-3xl w-full max-w-md shadow-2xl p-6 relative border border-black/5 dark:border-white/10 text-ink dark:text-ghost">
            <h2 className="text-xl font-black tracking-tight mb-4">Registrar Nuevo Gasto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Descripción *</label>
                <input required type="text" placeholder="Ej. Factura de luz Enero" className={inputCls} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Importe (€) *</label>
                  <input required type="number" step="0.01" placeholder="120.50" className={inputCls} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Categoría *</label>
                  <select className={inputCls} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="Luz">Luz</option>
                    <option value="Agua">Agua</option>
                    <option value="Nóminas">Nóminas</option>
                    <option value="Alquiler">Alquiler</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-vercel-blue text-white hover:bg-blue-600 transition shadow-lg">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-xl shadow-lg border font-bold text-sm z-50 animate-bounce-in ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
