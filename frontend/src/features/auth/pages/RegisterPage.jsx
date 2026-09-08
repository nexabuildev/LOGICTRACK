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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  
  const [countryCode, setCountryCode] = useState('+34');
  const [phoneInput, setPhoneInput] = useState('');

  // Developer modes
  const [autoEnable, setAutoEnable] = useState(true);
  const [devRole, setDevRole] = useState('USER');

  const [otpCode, setOtpCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [step, setStep] = useState('register');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const fullPhoneNumber = countryCode + phoneInput.trim().replace(/\s+/g, '');
      const payload = { ...formData, phoneNumber: fullPhoneNumber, autoEnable, devRole };

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'PENDING_VERIFICATION') {
          setRegisteredEmail(formData.email);
          setStep('verification');
          setMessage(data.message);
        } else {
          alert("¡Registro completado e iniciado con éxito! Ya puedes iniciar sesión.");
          navigate('/login');
        }
      } else {
        const errText = await res.text();
        alert(errText || "Error en el registro");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor");
    }
  };

  const handleVerifyRegistration = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/verify-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail, otpCode })
      });

      if (res.ok) {
        alert("¡Cuenta activada con éxito! Ya puedes iniciar sesión.");
        navigate('/login');
      } else {
        const errText = await res.text();
        alert(errText || "Código incorrecto o expirado");
      }
    } catch (err) {
      console.error(err);
      alert("Error al verificar código");
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-display font-black text-ghost leading-tight tracking-tight">
              Únete a la
              <span className="block" style={{ backgroundImage: 'linear-gradient(135deg, #00E5FF, #B026FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Revolución.
              </span>
            </h1>
            <p className="text-sm text-ghost/50 font-medium leading-relaxed">
              El marketplace definitivo para hardware de alto rendimiento.
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-20 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-10">
          <div className="text-center lg:text-left">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
              <svg className="w-6 h-6 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-display font-bold text-xl tracking-tight text-ink dark:text-ghost">LogiTrack<span className="text-neon-cyan dark:text-neon-cyan text-vercel-blue">Shop</span></span>
            </Link>
            <h2 className="text-3xl font-display font-black text-ink dark:text-ghost tracking-tight">Crear Cuenta</h2>
            <p className="text-ink/50 dark:text-ghost/50 text-base mt-2 font-medium">Únete para comprar y vender hardware tecnológico</p>
          </div>

          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              
              <div>
                <label className="block text-[13px] font-semibold text-ink/50 dark:text-ghost/50 mb-2">Nombre Completo</label>
                <input 
                  className="w-full p-4 bg-light-surface dark:bg-white/5 border border-black/8 dark:border-white/8 focus:border-vercel-blue/50 dark:focus:border-neon-cyan/50 focus:bg-light-base dark:focus:bg-dark-elevated rounded-xl outline-none text-ink dark:text-ghost text-base transition-all shadow-sm focus:shadow-blue-glow dark:focus:shadow-neon-sm" 
                  type="text" 
                  placeholder="Juan Pérez" 
                  required
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-ink/50 dark:text-ghost/50 mb-2">Correo Electrónico</label>
                <input 
                  className="w-full p-4 bg-light-surface dark:bg-white/5 border border-black/8 dark:border-white/8 focus:border-vercel-blue/50 dark:focus:border-neon-cyan/50 focus:bg-light-base dark:focus:bg-dark-elevated rounded-xl outline-none text-ink dark:text-ghost text-base transition-all shadow-sm focus:shadow-blue-glow dark:focus:shadow-neon-sm" 
                  type="email" 
                  placeholder="juan@ejemplo.com" 
                  required
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-ink/50 dark:text-ghost/50 mb-2">Teléfono Móvil (2FA)</label>
                <div className="flex gap-2">
                  <select 
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="bg-light-surface dark:bg-white/5 border border-black/8 dark:border-white/8 focus:border-vercel-blue/50 dark:focus:border-neon-cyan/50 rounded-xl p-4 text-ink dark:text-ghost outline-none text-base font-medium transition-all shadow-sm"
                  >
                    {COUNTRY_CODES.map(cc => (
                      <option key={cc.code} value={cc.code} className="text-ink bg-white dark:bg-dark-surface dark:text-ghost">{cc.label}</option>
                    ))}
                  </select>
                  <input 
                    className="w-full p-4 bg-light-surface dark:bg-white/5 border border-black/8 dark:border-white/8 focus:border-vercel-blue/50 dark:focus:border-neon-cyan/50 focus:bg-light-base dark:focus:bg-dark-elevated rounded-xl outline-none text-ink dark:text-ghost text-base flex-1 transition-all shadow-sm focus:shadow-blue-glow dark:focus:shadow-neon-sm" 
                    type="tel" 
                    placeholder="600000000" 
                    required
                    onChange={e => setPhoneInput(e.target.value)} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-ink/50 dark:text-ghost/50 mb-2">Contraseña</label>
                <input 
                  className="w-full p-4 bg-light-surface dark:bg-white/5 border border-black/8 dark:border-white/8 focus:border-vercel-blue/50 dark:focus:border-neon-cyan/50 focus:bg-light-base dark:focus:bg-dark-elevated rounded-xl outline-none text-ink dark:text-ghost text-base transition-all shadow-sm focus:shadow-blue-glow dark:focus:shadow-neon-sm" 
                  type="password" 
                  placeholder="••••••••" 
                  required
                  onChange={e => setFormData({ ...formData, password: e.target.value })} 
                />
              </div>

              {/* Panel de Pruebas */}
              <div className="bg-light-surface dark:bg-white/5 p-4 rounded-xl space-y-4 border border-black/5 dark:border-white/5">
                <p className="text-xs font-semibold text-ink/60 dark:text-ghost/60">🛠️ Modo Desarrollador</p>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="autoEnable"
                    checked={autoEnable}
                    onChange={e => setAutoEnable(e.target.checked)}
                    className="w-4 h-4 rounded text-vercel-blue focus:ring-vercel-blue"
                  />
                  <label htmlFor="autoEnable" className="text-[13px] text-ink dark:text-ghost font-medium cursor-pointer">Activar automáticamente (Saltar SMS)</label>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[13px] text-ink dark:text-ghost font-medium whitespace-nowrap">Rol inicial:</label>
                  <select 
                    value={devRole}
                    onChange={e => setDevRole(e.target.value)}
                    className="bg-light-base dark:bg-dark-elevated border border-black/8 dark:border-white/8 rounded-lg p-2 text-xs text-vercel-blue dark:text-neon-cyan font-bold outline-none flex-1 max-w-[200px]"
                  >
                    <option value="USER" className="text-ink bg-white dark:bg-dark-surface dark:text-ghost">👤 Cliente (USER)</option>
                    <option value="COMERCIAL" className="text-ink bg-white dark:bg-dark-surface dark:text-ghost">💼 Comercial</option>
                    <option value="GESTOR_TIENDA" className="text-ink bg-white dark:bg-dark-surface dark:text-ghost">🏪 Gestor Tienda</option>
                    <option value="TECNICO" className="text-ink bg-white dark:bg-dark-surface dark:text-ghost">🔧 Técnico</option>
                    <option value="ADMIN" className="text-ink bg-white dark:bg-dark-surface dark:text-ghost">👑 Administrador</option>
                  </select>
                </div>
              </div>

              <button className="w-full bg-vercel-blue hover:bg-blue-600 text-white py-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-apple-hover hover:scale-[1.01] cursor-pointer text-base mt-2">
                Registrarse
              </button>
              
              <p className="text-center text-sm text-apple-gray mt-6 font-medium">
                ¿Ya tienes cuenta? <Link to="/login" className="text-vercel-blue hover:text-blue-600 font-semibold transition-colors">Iniciar Sesión</Link>
              </p>
            </form>
          )}

          {step === 'verification' && (
            <form onSubmit={handleVerifyRegistration} className="space-y-6">
              <div className="bg-light-surface dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-xl text-[13px] text-vercel-blue dark:text-neon-cyan font-medium text-center">
                {message}
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-ink/50 dark:text-ghost/50 mb-2 text-center">Código de 6 dígitos</label>
                <input 
                  className="w-full p-4 bg-light-surface dark:bg-white/5 border border-black/8 dark:border-white/8 focus:border-vercel-blue/50 dark:focus:border-neon-cyan/50 focus:bg-light-base dark:focus:bg-dark-elevated rounded-xl outline-none text-center text-3xl tracking-[0.3em] font-mono text-ink dark:text-ghost font-bold transition-all shadow-sm focus:shadow-blue-glow dark:focus:shadow-neon-sm" 
                  type="text" 
                  maxLength="6"
                  placeholder="000000" 
                  required
                  onChange={e => setOtpCode(e.target.value)} 
                />
              </div>
              <button className="w-full bg-vercel-blue hover:bg-blue-600 text-white py-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-apple-hover hover:scale-[1.01] cursor-pointer text-base">
                Activar Cuenta
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}