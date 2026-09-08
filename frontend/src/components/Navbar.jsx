import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const isDark = theme === 'dark';

  const getLinkClasses = (path) => {
    return location.pathname === path
      ? 'text-sm font-bold text-neon-cyan dark:text-neon-cyan text-vercel-blue transition-colors'
      : 'text-sm font-semibold text-ink/60 dark:text-ghost/60 hover:text-neon-cyan dark:hover:text-neon-cyan hover:text-vercel-blue transition-colors';
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    alert("Sesión cerrada");
    setIsProfileOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-light-base/80 dark:bg-dark-base/80 backdrop-blur-3xl border-b border-black/5 dark:border-white/5 sticky top-0 z-50 transition-colors duration-300">
      <div className="w-full mx-auto px-6 lg:px-12 h-16 flex justify-between items-center">
        
        {/* Brand Logo */}
        <Link to="/" className="font-display font-bold text-lg md:text-xl tracking-tight text-ink dark:text-ghost flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-neon-cyan/10' : 'bg-vercel-blue/10'}`}>
            <svg className={`w-3.5 h-3.5 ${isDark ? 'text-neon-cyan' : 'text-vercel-blue'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span>LogiTrack<span className={isDark ? 'text-neon-cyan' : 'text-vercel-blue'}>Shop</span></span>
        </Link>
        
        {/* Spotlight Search (Mock) */}
        {!['/admin', '/products', '/stores', '/users', '/logs'].includes(location.pathname) && (
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              className="w-full bg-apple-ice dark:bg-white/5 border border-transparent focus:border-vercel-blue/50 focus:bg-apple-white dark:focus:bg-apple-graphite rounded-xl px-10 py-2 text-sm text-apple-graphite dark:text-apple-white outline-none transition-all shadow-sm focus:shadow-[0_0_0_3px_rgba(0,112,243,0.1)]"
            />
            <svg className="w-4 h-4 text-apple-gray absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="absolute right-3 top-2 flex items-center gap-1">
              <kbd className="hidden sm:inline-block border border-apple-border dark:border-white/20 rounded-md px-1.5 text-[10px] font-medium text-apple-gray bg-apple-white dark:bg-apple-graphite shadow-sm">⌘</kbd>
              <kbd className="hidden sm:inline-block border border-apple-border dark:border-white/20 rounded-md px-1.5 text-[10px] font-medium text-apple-gray bg-apple-white dark:bg-apple-graphite shadow-sm">K</kbd>
            </div>
          </div>
        )}
        
        {/* Main Links (Hidden when inside Panel ERP/management views) */}
        {!['/admin', '/products', '/stores', '/users', '/logs'].includes(location.pathname) && (
          <div className="hidden md:flex items-center gap-6">
            {location.pathname !== '/' && <Link to="/" className={getLinkClasses('/')}>Marketplace</Link>}
            {user && ['ADMIN', 'TECNICO', 'COMERCIAL'].includes(user.role) && (
              <Link to="/admin" className={getLinkClasses('/admin')}>Panel ERP</Link>
            )}
            {user && ['ADMIN', 'TECNICO', 'GESTOR_TIENDA'].includes(user.role) && (
              <Link to="/stores" className={getLinkClasses('/stores')}>Tiendas</Link>
            )}
            {user && ['ADMIN', 'TECNICO'].includes(user.role) && (
              <Link to="/users" className={getLinkClasses('/users')}>Usuarios</Link>
            )}
          </div>
        )}


        {/* Desktop User Section */}
        <div className="hidden md:flex items-center gap-4 relative">
          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    setIsProfileOpen(false);
                  }}
                  className={`p-2 rounded-xl transition-all relative ${
                    isDark ? 'bg-white/5 hover:bg-white/10 text-ghost border border-white/5' : 'bg-black/5 hover:bg-black/10 text-ink border border-black/5'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {hasUnread && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0C121A]"></span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className={`absolute right-0 mt-3 w-80 rounded-2xl overflow-hidden animate-fade-in z-50 shadow-glass ${
                    isDark ? 'bg-[#101b21] border border-white/10 shadow-neon-sm' : 'bg-white border border-black/5 shadow-card-hover'
                  }`}>
                    <div className={`px-4 py-3 border-b flex justify-between items-center ${isDark ? 'border-white/6' : 'border-black/6'}`}>
                      <h3 className={`text-sm font-bold ${isDark ? 'text-ghost' : 'text-ink'}`}>Notificaciones</h3>
                      <button onClick={() => setHasUnread(false)} className="text-[10px] text-vercel-blue dark:text-neon-cyan hover:underline font-bold cursor-pointer">Marcar todo como leído</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {/* Fake Notifications */}
                      <div className={`p-4 border-b transition-colors cursor-pointer ${isDark ? 'border-white/5 hover:bg-white/5 bg-white/5' : 'border-black/5 hover:bg-black/5 bg-blue-50/50'}`}>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-1.5 rounded-full bg-red-500/10 text-red-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold ${isDark ? 'text-ghost' : 'text-ink'}`}>Stock Crítico</h4>
                            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-ghost/70' : 'text-ink/70'}`}>El producto "MacBook Pro M3" tiene solo 2 unidades restantes.</p>
                            <span className="text-[9px] font-bold text-ink/40 dark:text-ghost/40 mt-1 block">Hace 5 min</span>
                          </div>
                        </div>
                      </div>
                      <div className={`p-4 border-b transition-colors cursor-pointer ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-black/5 hover:bg-black/5'}`}>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-1.5 rounded-full bg-emerald-500/10 text-emerald-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold ${isDark ? 'text-ghost' : 'text-ink'}`}>Nueva Tienda</h4>
                            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-ghost/70' : 'text-ink/70'}`}>Se ha registrado "TechStore Madrid".</p>
                            <span className="text-[9px] font-bold text-ink/40 dark:text-ghost/40 mt-1 block">Hace 2 horas</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotifOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/8 text-ghost border border-white/6'
                      : 'bg-black/5 hover:bg-black/8 text-ink border border-black/6'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    isDark ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-vercel-blue/10 text-vercel-blue'
                  }`}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[80px] truncate">{user.name}</span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

              {/* User Dropdown Card */}
              {isProfileOpen && (
                <div className={`absolute right-0 mt-3 w-52 rounded-2xl overflow-hidden animate-fade-in z-50 shadow-glass ${
                  isDark
                    ? 'bg-[#101b21] border border-white/10 shadow-neon-sm'
                    : 'bg-white border border-black/5 shadow-card-hover'
                }`}>
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-white/6' : 'border-black/6'}`}>
                    <p className={`text-[10px] font-mono font-semibold uppercase tracking-widest mb-0.5 ${isDark ? 'text-ghost/40' : 'text-ink/40'}`}>Sesión Activa</p>
                    <p className={`text-sm font-semibold truncate ${isDark ? 'text-ghost' : 'text-ink'}`}>{user.name}</p>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block ${
                      isDark ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-vercel-blue/10 text-vercel-blue'
                    }`}>{user.role}</span>
                  </div>

                  <div className="py-1.5">
                    <button 
                      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                      className={`w-full text-left flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                        isDark ? 'text-ghost/80 hover:text-ghost hover:bg-white/5' : 'text-ink/70 hover:text-ink hover:bg-black/5'
                      }`}
                    >
                      <span>Cambiar Tema</span>
                      <span className={`text-[10px] font-bold ${isDark ? 'text-ghost/50' : 'text-ink/50'}`}>{theme === 'light' ? 'Oscuro' : 'Claro'}</span>
                    </button>

                    <Link
                      to="/my-account"
                      onClick={() => setIsProfileOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                        isDark ? 'text-ghost/80 hover:text-ghost hover:bg-white/5' : 'text-ink/70 hover:text-ink hover:bg-black/5'
                      }`}
                    >
                      Mi Cuenta
                    </Link>

                    {['ADMIN', 'TECNICO', 'COMERCIAL'].includes(user.role) && (
                      <>
                        <div className={`mx-4 my-1 h-px ${isDark ? 'bg-white/6' : 'bg-black/6'}`} />
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                            isDark ? 'text-neon-cyan/80 hover:text-neon-cyan hover:bg-neon-cyan/5' : 'text-vercel-blue/80 hover:text-vercel-blue hover:bg-vercel-blue/5'
                          }`}
                        >
                          Panel ERP
                        </Link>
                      </>
                    )}

                    <div className={`mx-4 my-1 h-px ${isDark ? 'bg-white/6' : 'bg-black/6'}`} />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-apple-graphite dark:text-apple-white hover:text-vercel-blue transition-colors">Sign In</Link>
              <Link to="/register" className="text-sm font-medium bg-vercel-blue text-white px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-apple-hover hover:scale-[1.02]">Create Account</Link>
            </div>
          )}
        </div>

        {/* Hamburger Menu Toggle Button (Mobile only) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
          aria-label="Toggle Menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 space-y-4 absolute top-16 left-0 right-0 shadow-2xl flex flex-col transition-all">
          {location.pathname !== '/' && (
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className={getLinkClasses('/')}
            >
              Marketplace
            </Link>
          )}

          {/* Theme Toggle Mobile */}
          {user && (
            <button
              onClick={() => {
                setTheme(theme === 'light' ? 'dark' : 'light');
                setIsOpen(false);
              }}
              className="w-full text-left py-2 text-sm font-semibold text-slate-600 dark:text-slate-355 hover:text-nord-accent dark:hover:text-white transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>🌓 Cambiar Tema</span>
              <span>{theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}</span>
            </button>
          )}
          
          {user ? (
            <>
              {(user.role === 'ADMIN' || user.role === 'TECNICO') && (
                <>
                  <Link 
                    to="/admin" 
                    onClick={() => setIsOpen(false)}
                    className={getLinkClasses('/admin')}
                  >
                    Panel ERP
                  </Link>
                </>
              )}



              <Link 
                to="/my-account" 
                onClick={() => setIsOpen(false)}
                className={getLinkClasses('/my-account')}
              >
                Mi Cuenta
              </Link>
              
              <div className="border-t border-gray-100 dark:border-slate-800 pt-3 flex flex-col gap-3">
                <div className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl font-bold text-center">
                  {user.name} ({user.role})
                </div>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }} 
                  className="w-full bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950 border border-red-200 dark:border-red-900 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-gray-100 dark:border-slate-800 pt-3 flex flex-col gap-2">
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="text-sm text-center font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsOpen(false)}
                className="text-sm text-center font-bold bg-nord-accent hover:bg-nord-accent-hover text-white py-2.5 rounded-xl transition-all shadow-md block"
              >
                Registro
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};