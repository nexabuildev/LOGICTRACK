import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../../../api/config';

const COUNTRY_CODES = [
  { code: '+34', label: '🇪🇸 España (+34)' },
  { code: '+1', label: '🇺🇸 EE.UU. (+1)' },
  { code: '+52', label: '🇲🇽 México (+52)' },
  { code: '+54', label: '🇦🇷 Argentina (+54)' },
  { code: '+56', label: '🇨🇱 Chile (+56)' },
  { code: '+57', label: '🇨🇴 Colombia (+57)' },
  { code: '+51', label: '🇵🇪 Perú (+51)' },
  { code: '+58', label: '🇻🇪 Venezuela (+58)' }
];

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otpCode, setOtpCode] = useState('');
  
  // Developer modes
  const [skipOtp, setSkipOtp] = useState(true); // Saltarse el OTP por defecto en modo pruebas locales

  // Forgot password states
  const [countryCode, setCountryCode] = useState('+34');
  const [phoneInput, setPhoneInput] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [step, setStep] = useState('credentials'); // 'credentials', 'otp', 'forgot', 'reset'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skipOtp
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'PENDING_OTP') {
          setStep('otp');
          setMessage(data.message);
        } else {
          localStorage.setItem('user', JSON.stringify(data));
          navigate('/');
        }
      } else {
        const errorText = await res.text();
        alert(errorText || "Error en el inicio de sesión");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otpCode })
      });

      const data = await res.json();
      if (res.ok && data.status === 'SUCCESS') {
        localStorage.setItem('user', JSON.stringify(data));
        alert("¡Bienvenido a LogiTrack!");
        navigate('/');
      } else {
        alert(data.message || "Código incorrecto o expirado");
      }
    } catch (err) {
      console.error(err);
      alert("Error al verificar código OTP");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const fullPhoneNumber = countryCode + phoneInput.trim().replace(/\s+/g, '');
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhoneNumber })
      });

      if (res.ok) {
        setResetPhone(fullPhoneNumber);
        setStep('reset');
        alert("Código de recuperación enviado. Revisa la consola del backend para ver el SMS.");
      } else {
        const errText = await res.text();
        alert(errText);
      }
    } catch (err) {
      alert("Error de red.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: resetPhone,
          otpCode,
          newPassword
        })
      });

      if (res.ok) {
        alert("¡Contraseña restablecida con éxito! Ya puedes iniciar sesión.");
        setStep('credentials');
      } else {
        const errText = await res.text();
        alert(errText);
      }
    } catch (err) {
      alert("Error de red.");
    }
  };

  return (
    <div className="min-h-screen flex bg-light-base dark:bg-dark-base font-sans transition-colors duration-500 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 dark:opacity-10" style={{ background: 'radial-gradient(circle, #00E5FF, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-10 dark:opacity-8" style={{ background: 'radial-gradient(circle, #B026FF, transparent 70%)', filter: 'blur(100px)' }} />

      {/* Left Half: Immersive Canvas */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-dark-base">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 80% at 30% 50%, rgba(0,229,255,0.12), transparent), radial-gradient(ellipse 60% 60% at 70% 20%, rgba(176,38,255,0.15), transparent), radial-gradient(ellipse 50% 50% at 50% 80%, rgba(250,204,21,0.08), transparent)' }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 text-center space-y-8 max-w-sm px-10">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}>
            <svg className="w-8 h-8 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-display font-black text-ghost leading-tight tracking-tight">
              El Hardware de
              <span className="block" style={{ background: 'linear-gradient(135deg, #00E5FF, #B026FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Otro Nivel.
              </span>
            </h1>
            <p className="text-sm text-ghost/50 font-medium leading-relaxed">
              Tecnología reacondicionada revisada por expertos. Garantía total incluida.
            </p>
          </div>
          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: '450+', label: 'Productos' },
              { value: '2Y', label: 'Garantía' },
              { value: '24h', label: 'Envío' },
            ].map((stat, i) => (
              <div key={i} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-lg font-mono font-bold text-neon-cyan">{stat.value}</div>
                <div className="text-[10px] font-medium text-ghost/40 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Half: Immaculate Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-20 relative z-10">
        <div className="w-full max-w-md space-y-10">
          <div className="text-center lg:text-left">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
              <svg className="w-6 h-6 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="font-display font-bold text-xl tracking-tight text-ink dark:text-ghost">LogiTrack<span className="text-neon-cyan dark:text-neon-cyan text-vercel-blue">Shop</span></span>
            </Link>
            <h2 className="text-3xl font-display font-black text-ink dark:text-ghost tracking-tight">Acceso</h2>
            <p className="text-ink/50 dark:text-ghost/50 text-base mt-2 font-medium">Introduce tus credenciales para continuar</p>
          </div>

        {step === 'credentials' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[13px] font-semibold text-ink/50 dark:text-ghost/50 mb-2">Correo Electrónico</label>
              <input 
                className="w-full p-4 bg-light-surface dark:bg-white/5 border border-black/8 dark:border-white/8 focus:border-vercel-blue/50 dark:focus:border-neon-cyan/50 focus:bg-light-base dark:focus:bg-dark-elevated rounded-xl outline-none text-ink dark:text-ghost text-base transition-all shadow-sm focus:shadow-blue-glow dark:focus:shadow-neon-sm" 
                type="email" 
                placeholder="ejemplo@correo.com" 
                required
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[13px] font-semibold text-ink/50 dark:text-ghost/50">Contraseña</label>
                <button 
                  type="button" 
                  onClick={() => setStep('forgot')}
                  className="text-[13px] font-semibold text-vercel-blue dark:text-neon-cyan hover:opacity-80 transition-opacity cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <input 
                className="w-full p-4 bg-light-surface dark:bg-white/5 border border-black/8 dark:border-white/8 focus:border-vercel-blue/50 dark:focus:border-neon-cyan/50 rounded-xl outline-none text-ink dark:text-ghost text-base transition-all shadow-sm focus:shadow-blue-glow dark:focus:shadow-neon-sm" 
                type="password" 
                placeholder="••••••••" 
                required
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </div>

            {/* Dev Mode Toggle */}
            <div className="bg-light-surface dark:bg-white/5 p-4 rounded-xl flex items-center justify-between border border-black/5 dark:border-white/5">
              <label htmlFor="skipOtp" className="text-sm text-apple-gray font-medium cursor-pointer">Modo Dev: Saltar SMS 2FA</label>
              <input 
                type="checkbox" 
                id="skipOtp"
                checked={skipOtp}
                onChange={e => setSkipOtp(e.target.checked)}
                className="w-4 h-4 rounded text-vercel-blue focus:ring-vercel-blue"
              />
            </div>

            <button className="w-full bg-vercel-blue hover:bg-blue-600 text-white py-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-apple-hover hover:scale-[1.01] cursor-pointer text-base">
              Iniciar Sesión
            </button>
            
            <p className="text-center text-sm text-apple-gray mt-6 font-medium">
              ¿No tienes cuenta? <Link to="/register" className="text-vercel-blue hover:text-blue-600 font-semibold transition-colors">Regístrate</Link>
            </p>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-nord-text text-center">Verificación 2FA</h2>
            <div className="bg-nord-surface dark:bg-nord-accent/10 border border-nord-border dark:border-nord-border/40 p-4 rounded-2xl text-xs text-nord-accent-hover dark:text-nord-accent font-semibold text-center">
              {message}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-nord-text-muted uppercase tracking-wider mb-2 text-center">Código de 6 dígitos</label>
              <input 
                className="w-full p-4 bg-[#f5f5f7] dark:bg-nord-bg/40 border border-[#1d1d1f]/5 dark:border-nord-border rounded-2xl focus:ring-2 focus:ring-nord-accent outline-none text-center text-3xl tracking-[0.5em] font-mono text-slate-800 dark:text-nord-text font-bold transition-all" 
                type="text" 
                maxLength="6"
                placeholder="000000" 
                required
                onChange={e => setOtpCode(e.target.value)} 
              />
            </div>
            <button className="w-full bg-gradient-to-r from-nord-accent to-nord-mint hover:from-nord-accent-hover hover:to-nord-accent text-white py-4 rounded-full font-bold transition-all shadow-[0_4px_12px_rgba(129,161,193,0.3)] hover:shadow-[0_6px_16px_rgba(129,161,193,0.4)] cursor-pointer text-sm">
              Confirmar e Ingresar
            </button>
            <button 
              type="button"
              onClick={() => setStep('credentials')} 
              className="w-full bg-[#f5f5f7] dark:bg-nord-bg/40 hover:bg-nord-surface/5 dark:hover:bg-white/5 text-slate-500 dark:text-nord-text-muted py-4 rounded-full font-bold transition-all cursor-pointer text-sm border border-[#1d1d1f]/5 dark:border-nord-border"
            >
              Atrás
            </button>
          </form>
        )}

        {step === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-nord-text text-center">Recuperar Contraseña</h2>
            <p className="text-xs text-slate-500 dark:text-nord-text-muted font-medium text-center px-4">Introduce tu número de teléfono registrado para recibir un SMS con el código de recuperación.</p>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-nord-text-muted uppercase tracking-wider mb-2">Número de Teléfono</label>
              <div className="flex gap-2">
                <select 
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  className="bg-[#f5f5f7] dark:bg-nord-bg/40 border border-[#1d1d1f]/5 dark:border-nord-border rounded-2xl p-3.5 text-slate-500 dark:text-nord-text-muted focus:ring-2 focus:ring-nord-accent outline-none text-xs font-bold transition-all"
                >
                  {COUNTRY_CODES.map(cc => (
                    <option key={cc.code} value={cc.code}>{cc.label}</option>
                  ))}
                </select>
                <input 
                  className="w-full p-3.5 bg-[#f5f5f7] dark:bg-nord-bg/40 border border-[#1d1d1f]/5 dark:border-nord-border rounded-2xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-800 dark:text-nord-text text-sm font-semibold flex-1 transition-all" 
                  type="tel"
                  placeholder="600000000" 
                  required
                  onChange={e => setPhoneInput(e.target.value)} 
                />
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-nord-accent to-nord-mint hover:from-nord-accent-hover hover:to-nord-accent text-white py-4 rounded-full font-bold transition-all shadow-[0_4px_12px_rgba(129,161,193,0.3)] hover:shadow-[0_6px_16px_rgba(129,161,193,0.4)] cursor-pointer text-sm">
              Enviar Código
            </button>
            <button 
              type="button"
              onClick={() => setStep('credentials')} 
              className="w-full bg-[#f5f5f7] dark:bg-nord-bg/40 hover:bg-nord-surface/5 dark:hover:bg-white/5 text-slate-500 dark:text-nord-text-muted py-4 rounded-full font-bold transition-all cursor-pointer text-sm border border-[#1d1d1f]/5 dark:border-nord-border"
            >
              Cancelar
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-nord-text text-center">Restablecer Contraseña</h2>
            <p className="text-xs text-nord-accent-hover bg-nord-surface dark:bg-nord-accent/10 border border-nord-border dark:border-nord-border/40 p-4 rounded-2xl font-semibold text-center">
              Copia el código de recuperación del SMS simulado en los logs del backend.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-nord-text-muted uppercase tracking-wider mb-2 text-center">Código de 6 dígitos</label>
              <input 
                className="w-full p-4 bg-[#f5f5f7] dark:bg-nord-bg/40 border border-[#1d1d1f]/5 dark:border-nord-border rounded-2xl focus:ring-2 focus:ring-nord-accent outline-none text-center text-3xl tracking-[0.5em] font-mono text-slate-800 dark:text-nord-text font-bold transition-all" 
                type="text" 
                maxLength="6"
                placeholder="000000" 
                required
                onChange={e => setOtpCode(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-nord-text-muted uppercase tracking-wider mb-2">Nueva Contraseña</label>
              <input 
                className="w-full p-3.5 bg-[#f5f5f7] dark:bg-nord-bg/40 border border-[#1d1d1f]/5 dark:border-nord-border rounded-2xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-800 dark:text-nord-text text-sm font-semibold transition-all" 
                type="password"
                placeholder="••••••••" 
                required
                onChange={e => setNewPassword(e.target.value)} 
              />
            </div>
            <button className="w-full bg-gradient-to-r from-nord-accent to-nord-mint hover:from-nord-accent-hover hover:to-nord-accent text-white py-4 rounded-full font-bold transition-all shadow-[0_4px_12px_rgba(129,161,193,0.3)] hover:shadow-[0_6px_16px_rgba(129,161,193,0.4)] cursor-pointer text-sm">
              Guardar Contraseña
            </button>
            <button 
              type="button"
              onClick={() => setStep('forgot')} 
              className="w-full bg-[#f5f5f7] dark:bg-nord-bg/40 hover:bg-nord-surface/5 dark:hover:bg-white/5 text-slate-500 dark:text-nord-text-muted py-4 rounded-full font-bold transition-all cursor-pointer text-sm border border-[#1d1d1f]/5 dark:border-nord-border"
            >
              Atrás
            </button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}