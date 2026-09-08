import { useState } from 'react';
import { API_URL } from '../../../api/config';

export default function CampaignsPage({ user }) {
  const token = user?.token;
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSendCampaign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/crm/campaigns/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, message })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(`Campaña enviada con éxito a ${data.sentCount} clientes registrados.`);
        setSubject('');
        setMessage('');
      } else {
        alert('Error al enviar la campaña.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de red al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-ink dark:text-ghost focus:outline-none focus:ring-2 focus:ring-vercel-blue/50 focus:border-vercel-blue transition-all font-medium text-[13px]";
  const labelCls = "block text-[11px] font-bold text-ink/60 dark:text-ghost/60 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="space-y-6 animate-fade-in relative max-w-7xl mx-auto text-ink dark:text-ghost">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight mb-2">
          CAMPAÑAS DE MARKETING (EMAIL)
        </h1>
        <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Redacta y envía notificaciones masivas de novedades de stock o promociones a tus clientes fidelizados.</p>
      </div>

      <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass p-6">
        {result && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-xs font-bold text-center mb-6">
            ✅ {result}
          </div>
        )}
        
        <form onSubmit={handleSendCampaign} className="space-y-4 max-w-xl">
          <div>
            <label className={labelCls}>Asunto de la Campaña *</label>
            <input 
              type="text" 
              required 
              placeholder="Ej. ¡Nueva reposición de tarjetas gráficas NVIDIA!" 
              className={inputCls} 
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Mensaje / Cuerpo del Correo *</label>
            <textarea 
              required 
              rows="6"
              placeholder="Escribe el mensaje detallado para enviar de forma masiva..." 
              className={`${inputCls} resize-none`} 
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-vercel-blue hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'Enviando correos...' : 'Enviar Correo Masivo (Campaña)'}
          </button>
        </form>
      </div>
    </div>
  );
}
