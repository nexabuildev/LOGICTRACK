import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export default function TaxBookPage({ user }) {
  const token = user?.token;
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, expensesRes] = await Promise.all([
        fetch(`${API_URL}/orders`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/expenses`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (expensesRes.ok) setExpenses(await expensesRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Group items by quarter
  const getQuarter = (dateStr) => {
    const d = new Date(dateStr);
    const m = d.getMonth();
    if (m >= 0 && m <= 2) return 'Q1';
    if (m >= 3 && m <= 5) return 'Q2';
    if (m >= 6 && m <= 8) return 'Q3';
    return 'Q4';
  };

  const quarters = {
    Q1: { outputVat: 0, inputVat: 0, sales: 0, expenses: 0 },
    Q2: { outputVat: 0, inputVat: 0, sales: 0, expenses: 0 },
    Q3: { outputVat: 0, inputVat: 0, sales: 0, expenses: 0 },
    Q4: { outputVat: 0, inputVat: 0, sales: 0, expenses: 0 },
  };

  // Process Sales (Output VAT / IVA Repercutido - assuming 21% included in sales total)
  orders.forEach(o => {
    const q = getQuarter(o.createdAt);
    const amount = o.totalAmount || 0;
    quarters[q].sales += amount;
    // VAT = total - (total / 1.21)
    quarters[q].outputVat += amount - (amount / 1.21);
  });

  // Process Expenses (Input VAT / IVA Soportado)
  expenses.forEach(e => {
    const q = getQuarter(e.createdAt);
    quarters[q].expenses += e.amount;
    quarters[q].inputVat += e.vatAmount || 0;
  });

  return (
    <div className="space-y-6 animate-fade-in relative max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-ink dark:text-ghost mb-2">
          LIBRO DE IMPUESTOS (IVA)
        </h1>
        <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Resumen trimestral del IVA Repercutido (ventas) e IVA Soportado (gastos corrientes).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(quarters).map(([q, data]) => {
          const balance = data.outputVat - data.inputVat;
          return (
            <div key={q} className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
                <span className="text-sm font-black font-display text-vercel-blue dark:text-neon-cyan">{q} (Trimestre)</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${balance >= 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                  {balance >= 0 ? 'A PAGAR' : 'A DEVOLVER'}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-ink/50 dark:text-ghost/50 font-medium">Facturación Ventas:</span>
                  <span>{data.sales.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-ink/50 dark:text-ghost/50 font-medium">IVA Repercutido:</span>
                  <span className="text-amber-500">+{data.outputVat.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-black/5 dark:border-white/5 pt-2">
                  <span className="text-ink/50 dark:text-ghost/50 font-medium">Gastos Totales:</span>
                  <span>{data.expenses.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-ink/50 dark:text-ghost/50 font-medium">IVA Soportado:</span>
                  <span className="text-emerald-500">-{data.inputVat.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-black text-sm border-t border-black/5 dark:border-white/5 pt-2">
                  <span className="text-ink dark:text-ghost">Balance IVA:</span>
                  <span className={balance >= 0 ? 'text-amber-500' : 'text-emerald-500'}>
                    {balance.toFixed(2)}€
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
