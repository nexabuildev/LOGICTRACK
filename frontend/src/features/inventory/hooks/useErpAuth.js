import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../api/config';

export function useErpAuth(allowedRoles = [], embedded = false) {
  const navigate = useNavigate();
  const user = useMemo(() => {
    const json = localStorage.getItem('user');
    return json ? JSON.parse(json) : null;
  }, []);
  const token = user?.token;

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);

  const apiFetch = async (path, options = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Error ${res.status}`);
    }
    const ct = res.headers.get('content-type');
    if (ct && ct.includes('application/json')) return res.json();
    return res;
  };

  const guard = () => {
    if (!user) {
      if (!embedded) navigate('/login');
      return false;
    }
    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      if (!embedded) navigate('/');
      return false;
    }
    return true;
  };

  return { user, token, headers, apiFetch, navigate, embedded, guard, API_URL };
}

export function useToast() {
  const showToast = (setToast) => (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  return showToast;
}

export const fmtMoney = (n) =>
  Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtDate = (d) => d ? new Date(d).toLocaleString('es-ES') : '—';

export const STATUS_COLORS = {
  DRAFT: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  SENT: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  PARTIAL: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  RECEIVED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-600 border-red-500/20',
  PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
};
