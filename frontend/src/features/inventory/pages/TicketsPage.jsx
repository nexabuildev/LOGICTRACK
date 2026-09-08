import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function TicketsPage({ user }) {
  const token = user?.token;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', technicianNotes: '' });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTickets(await res.json());
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
    try {
      const res = await fetch(`${API_URL}/tickets/${editingTicket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        showToast('Ticket actualizado');
        setEditingTicket(null);
        fetchTickets();
      } else {
        showToast('Error al actualizar', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de red', 'error');
    }
  };

  const openEdit = (t) => {
    setEditForm({ status: t.status, technicianNotes: t.technicianNotes || '' });
    setEditingTicket(t);
  };

  return (
    <div className="space-y-6 animate-fade-in relative max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-ink dark:text-ghost mb-2">
            HELPDESK Y SOPORTE
          </h1>
          <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Gestiona las incidencias y solicitudes técnicas de los clientes.</p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-ink/50 dark:text-ghost/50 font-mono">Cargando tickets...</p>
        ) : (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full table-fixed text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-neutral-900/10 text-ink/60 dark:text-ghost/60 font-bold">
                  <th className="py-3 px-4 w-16">ID</th>
                  <th className="py-3 px-4 w-1/4">Asunto</th>
                  <th className="py-3 px-4 w-1/4">Cliente</th>
                  <th className="py-3 px-4 w-24">Prioridad</th>
                  <th className="py-3 px-4 w-32 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {tickets.map(t => (
                  <tr key={t.id} onClick={() => openEdit(t)} className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/10 cursor-pointer transition-colors">
                    <td className="py-3 px-4 font-mono text-ink/40">#{t.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-ink dark:text-ghost truncate">{t.subject}</p>
                    </td>
                    <td className="py-3 px-4 text-ink/70 dark:text-ghost/70 truncate">{t.customerEmail}</td>
                    <td className="py-3 px-4 font-bold">
                      <span className={t.priority === 'URGENT' ? 'text-red-500' : t.priority === 'HIGH' ? 'text-amber-500' : 'text-vercel-blue'}>{t.priority}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${t.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : t.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                        {t.status === 'RESOLVED' ? 'RESUELTO' : t.status === 'IN_PROGRESS' ? 'EN PROGRESO' : 'ABIERTO'}
                      </span>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr><td colSpan="5" className="py-8 text-center text-ink/50 dark:text-ghost/50">No hay tickets activos.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-light-elevated dark:bg-dark-elevated rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-black/5 dark:border-vercel-blue/20">
            <h2 className="text-2xl font-black mb-4">Gestionar Ticket #{editingTicket.id}</h2>
            <div className="mb-4 p-4 bg-black/5 dark:bg-white/5 rounded-xl">
              <h3 className="font-bold text-sm mb-1">{editingTicket.subject}</h3>
              <p className="text-sm text-ink/70 dark:text-ghost/70 mb-2">{editingTicket.description}</p>
              <span className="text-xs font-mono text-ink/50">Cliente: {editingTicket.customerEmail}</span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">Estado</label>
                <select 
                  className="w-full bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm"
                  value={editForm.status} 
                  onChange={e => setEditForm({...editForm, status: e.target.value})}
                >
                  <option value="OPEN">Abierto</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="RESOLVED">Resuelto</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">Notas del Técnico</label>
                <textarea 
                  className="w-full bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm h-24"
                  value={editForm.technicianNotes} 
                  onChange={e => setEditForm({...editForm, technicianNotes: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingTicket(null)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 transition">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-vercel-blue text-white hover:bg-blue-600 transition">Actualizar Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-xl shadow-lg font-bold text-sm z-50 animate-bounce-in ${toast.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
