import { fmtMoney, fmtDate, STATUS_COLORS } from '../hooks/useErpAuth';

export function ErpHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-black/5 dark:border-white/5">
      <div>
        <h1 className="text-2xl font-display font-black text-ink dark:text-ghost tracking-tight">{title}</h1>
        {subtitle && <p className="text-ink/50 dark:text-ghost/50 text-sm mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function ErpToast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-glass animate-fade-in ${
      toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
    }`}>
      {toast.msg}
    </div>
  );
}

export function ErpKpi({ label, value, color = 'text-vercel-blue dark:text-neon-cyan' }) {
  return (
    <div className="rounded-2xl p-5 border border-black/5 dark:border-white/6 bg-light-elevated dark:bg-dark-elevated">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-ink/40 dark:text-ghost/40">{label}</span>
      <p className={`text-3xl font-display font-black mt-2 tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

export function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}

export function ErpTable({ columns, rows, emptyMsg = 'Sin registros.' }) {
  return (
    <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden shadow-glass">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/5 text-[10px] font-mono font-bold uppercase tracking-wider text-ink/40 dark:text-ghost/40">
              {columns.map(c => <th key={c.key} className="py-3 px-4">{c.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="py-12 text-center text-ink/40 dark:text-ghost/40">{emptyMsg}</td></tr>
            ) : rows.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                {columns.map(c => (
                  <td key={c.key} className="py-3 px-4 text-ink/80 dark:text-ghost/80">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { fmtMoney, fmtDate };
