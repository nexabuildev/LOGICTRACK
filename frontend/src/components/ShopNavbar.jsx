import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_URL } from '../api/config';
export default function ShopNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [scrolled, setScrolled] = useState(false);

  // Live Search States
  const [navSearch, setNavSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen } = useCart();

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    const normalizeString = (str) => {
      return (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const delayDebounceFn = setTimeout(async () => {
      if (navSearch.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`${API_URL}/products/marketplace`);
          if (res.ok) {
            const data = await res.json();
            const query = normalizeString(navSearch);
            const filtered = data.filter(p => 
              normalizeString(p.name).includes(query) || 
              normalizeString(p.sku).includes(query) ||
              normalizeString(p.condition).includes(query)
            ).slice(0, 5); // Max 5 results
            setSearchResults(filtered);
          }
        } catch (error) {
          console.error("Search fetch error", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [navSearch]);

  const isDark = theme === 'dark';

  return (
    <>
      {/* ================================================================
          NAVBAR — Floating Crystalline Glassmorphism
          ================================================================ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? isDark
              ? 'bg-dark-base/80 backdrop-blur-3xl border-b border-white/5 shadow-glass'
              : 'bg-white/80 backdrop-blur-3xl border-b border-black/5 shadow-card'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full mx-auto px-6 lg:px-16 h-16 flex items-center justify-between gap-6">

          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
              isDark
                ? 'bg-neon-cyan/10 group-hover:bg-neon-cyan/20 shadow-neon-sm'
                : 'bg-vercel-blue/10 group-hover:bg-vercel-blue/20'
            }`}>
              <svg className={`w-4 h-4 ${isDark ? 'text-neon-cyan' : 'text-vercel-blue'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className={`font-display font-bold text-xl tracking-tight ${isDark ? 'text-ghost' : 'text-ink'}`}>
              LogiTrack<span className={isDark ? 'text-neon-cyan' : 'text-vercel-blue'}>Shop</span>
            </span>
          </Link>

          {/* Central Spotlight Search */}
          <div className="hidden md:flex flex-1 max-w-[520px] mx-auto relative">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const v = new FormData(e.target).get('q');
                if (v && v.trim()) {
                  setDropdownOpen(false);
                  navigate(`/?search=${encodeURIComponent(v.trim())}`);
                }
              }}
              className={`relative w-full group ${isDark ? 'glass-dark rounded-2xl' : 'glass-light rounded-2xl border border-black/10 shadow-card bg-white'}`}
            >
              <svg
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  isDark ? 'text-ghost/40 group-focus-within:text-neon-cyan' : 'text-ink/50 group-focus-within:text-vercel-blue'
                }`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="q"
                value={navSearch}
                onChange={(e) => {
                  setNavSearch(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Buscar hardware, SKU, categoría..."
                className={`w-full h-11 pl-11 pr-24 bg-transparent outline-none text-sm font-semibold transition-all ${
                  isDark
                    ? 'text-ghost placeholder:text-ghost/40 focus:placeholder:text-ghost/60'
                    : 'text-ink placeholder:text-ink/60 focus:placeholder:text-ink/80'
                }`}
                autoComplete="off"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 cursor-pointer">
                <kbd className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md ${
                  isDark ? 'bg-white/5 text-ghost/50 border border-white/8' : 'bg-black/5 text-ink/50 border border-black/10'
                }`}>↵ ENTER</kbd>
              </button>
            </form>

            {/* Live Search Dropdown */}
            {dropdownOpen && navSearch.trim().length > 1 && (
              <div className={`absolute top-full mt-2 left-0 right-0 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[400px] overflow-y-auto ${
                isDark ? 'glass-dark border border-white/10' : 'bg-white border border-black/10 shadow-card'
              }`}>
                {isSearching ? (
                  <div className="p-4 text-center text-xs font-mono font-bold text-ink/50 dark:text-ghost/50">// BUSCANDO...</div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col">
                    {searchResults.map(p => (
                      <Link
                        key={p.id}
                        to={`/producto/${p.id}`}
                        onClick={() => { setDropdownOpen(false); setNavSearch(''); }}
                        className={`flex items-center gap-4 p-3 border-b transition-colors cursor-pointer ${
                          isDark ? 'border-white/5 hover:bg-white/5' : 'border-black/5 hover:bg-black/5'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-dark-surface border border-white/10' : 'bg-light-base border border-black/5'}`}>
                          <span className="text-xl">📦</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold truncate ${isDark ? 'text-ghost' : 'text-ink'}`}>{p.name}</h4>
                          <p className={`text-[10px] font-mono font-semibold truncate ${isDark ? 'text-ghost/50' : 'text-ink/50'}`}>{p.sku} • {p.condition}</p>
                        </div>
                        <div className={`text-sm font-black font-mono whitespace-nowrap ${isDark ? 'text-neon-cyan' : 'text-vercel-blue'}`}>
                          {p.price.toLocaleString('es-ES')}€
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(`/?search=${encodeURIComponent(navSearch.trim())}`);
                      }}
                      className={`w-full p-3 text-xs font-bold text-center flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        isDark ? 'bg-white/5 text-neon-cyan hover:bg-white/10' : 'bg-black/5 text-vercel-blue hover:bg-black/10'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Buscar "{navSearch}" en el catálogo
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs font-mono font-bold text-ink/50 dark:text-ghost/50 text-red-500 flex flex-col items-center gap-2">
                    NO HAY RESULTADOS RÁPIDOS
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(`/?search=${encodeURIComponent(navSearch.trim())}`);
                      }}
                      className={`px-4 py-2 mt-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isDark ? 'bg-white/10 text-ghost hover:bg-white/20' : 'bg-black/10 text-ink hover:bg-black/20'
                      }`}
                    >
                      Buscar "{navSearch}" de todos modos
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4" ref={dropdownRef}>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
                isDark
                  ? 'bg-white/5 hover:bg-neon-cyan/10 text-ghost/60 hover:text-neon-cyan'
                  : 'bg-black/5 hover:bg-vercel-blue/10 text-ink/50 hover:text-vercel-blue'
              }`}
              title="Cambiar tema"
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
                isDark
                  ? 'bg-white/5 hover:bg-neon-cyan/10 text-ghost/60 hover:text-neon-cyan'
                  : 'bg-black/5 hover:bg-vercel-blue/10 text-ink/50 hover:text-vercel-blue'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-dark-base flex items-center justify-center ${
                  isDark ? 'bg-neon-cyan shadow-neon-sm' : 'bg-vercel-blue text-white'
                }`}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
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

                {isProfileOpen && (
                  <div className={`absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden animate-fade-in z-50 shadow-glass ${
                    isDark
                      ? 'bg-[#101b21] border border-white/10 shadow-neon-sm'
                      : 'bg-white border border-black/5 shadow-card-hover'
                  }`}>
                    <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-black/5'}`}>
                      <p className="text-xs font-black truncate uppercase bg-clip-text text-transparent bg-gradient-to-r from-vercel-blue to-neon-cyan">{user.name}</p>
                      <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-vercel-blue/10 text-vercel-blue'
                      }`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1.5">
                      <Link
                        to="/my-account"
                        onClick={() => setIsProfileOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                          isDark ? 'text-ghost/80 hover:text-ghost hover:bg-white/5' : 'text-ink/70 hover:text-ink hover:bg-black/5'
                        }`}
                      >
                        Mi Cuenta
                      </Link>

                      {(user.role === 'ADMIN' || user.role === 'TECNICO') && (
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
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`text-sm font-semibold transition-colors ${isDark ? 'text-ghost/70 hover:text-ghost' : 'text-ink/60 hover:text-ink'}`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-95 ${
                    isDark
                      ? 'bg-neon-cyan text-dark-base shadow-neon-sm hover:shadow-neon'
                      : 'bg-vercel-blue text-white shadow-sm hover:shadow-blue-glow'
                  }`}
                >
                  Crear Cuenta
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer ${
              isDark ? 'bg-white/5 text-ghost' : 'bg-black/5 text-ink'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className={`md:hidden px-6 py-4 space-y-3 border-t ${
            isDark ? 'bg-dark-surface/95 backdrop-blur-3xl border-white/5' : 'bg-white/95 backdrop-blur-3xl border-black/6'
          }`}>
            {/* Mobile search */}
            <input
              type="text"
              placeholder="Buscar hardware..."
              className={`w-full h-11 px-4 rounded-xl text-sm outline-none ${
                isDark ? 'bg-white/5 text-ghost placeholder:text-ghost/30 border border-white/8' : 'bg-black/5 text-ink placeholder:text-ink/30 border border-black/6'
              }`}
            />

            <button
              onClick={() => { setIsCartOpen(true); setIsOpen(false); }}
              className={`w-full flex items-center justify-between py-3 text-sm font-semibold ${isDark ? 'text-ghost' : 'text-ink'}`}
            >
              <span>Mi Carrito</span>
              {cartCount > 0 && <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-vercel-blue/10 text-vercel-blue'}`}>{cartCount}</span>}
            </button>

            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`w-full flex items-center justify-between py-3 text-sm font-semibold cursor-pointer ${isDark ? 'text-ghost' : 'text-ink'}`}
            >
              <span>{isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}</span>
            </button>

            {user ? (
              <>
                {(user.role === 'ADMIN' || user.role === 'TECNICO') && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className={`block py-3 text-sm font-semibold ${isDark ? 'text-neon-cyan' : 'text-vercel-blue'}`}>
                    Panel ERP
                  </Link>
                )}
                <Link to="/my-account" onClick={() => setIsOpen(false)} className={`block py-3 text-sm font-semibold ${isDark ? 'text-ghost' : 'text-ink'}`}>Mi Cuenta</Link>
                <button onClick={() => { setIsOpen(false); handleLogout(); }} className="w-full py-3 text-sm font-semibold text-red-500 text-left cursor-pointer">
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" onClick={() => setIsOpen(false)} className={`text-center py-3 rounded-xl text-sm font-semibold border ${isDark ? 'border-white/10 text-ghost' : 'border-black/10 text-ink'}`}>
                  Iniciar Sesión
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className={`text-center py-3 rounded-xl text-sm font-bold ${isDark ? 'bg-neon-cyan text-dark-base' : 'bg-vercel-blue text-white'}`}>
                  Crear Cuenta
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ================================================================
          CART DRAWER — Premium Side Panel
          ================================================================ */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer */}
          <div className={`relative w-full max-w-md h-full flex flex-col animate-fade-in ${
            isDark ? 'bg-dark-surface border-l border-white/6' : 'bg-white border-l border-black/6'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/6' : 'border-black/6'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-neon-cyan/10' : 'bg-vercel-blue/10'}`}>
                  <svg className={`w-4 h-4 ${isDark ? 'text-neon-cyan' : 'text-vercel-blue'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                </div>
                <div>
                  <h2 className={`text-base font-display font-bold ${isDark ? 'text-ghost' : 'text-ink'}`}>Tu Carrito</h2>
                  <p className={`text-xs font-mono ${isDark ? 'text-ghost/40' : 'text-ink/40'}`}>{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all cursor-pointer ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-ghost/60' : 'bg-black/5 hover:bg-black/10 text-ink/50'
                }`}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                    <svg className={`w-7 h-7 ${isDark ? 'text-ghost/30' : 'text-ink/25'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                  </div>
                  <p className={`text-sm font-medium ${isDark ? 'text-ghost/40' : 'text-ink/40'}`}>El carrito está vacío</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.product.id} className={`p-4 rounded-2xl border flex gap-4 ${isDark ? 'bg-dark-elevated border-white/5' : 'bg-light-surface border-black/5'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                      <svg className={`w-6 h-6 ${isDark ? 'text-neon-cyan' : 'text-vercel-blue'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-semibold line-clamp-1 ${isDark ? 'text-ghost' : 'text-ink'}`}>{item.product.name}</h4>
                      <p className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-ghost/40' : 'text-ink/40'}`}>SKU: {item.product.sku}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className={`flex items-center rounded-lg border overflow-hidden ${isDark ? 'border-white/8 bg-dark-base' : 'border-black/8 bg-white'}`}>
                          <button
                            className={`px-2.5 py-1.5 text-sm font-bold transition-colors cursor-pointer ${isDark ? 'text-ghost/60 hover:text-neon-cyan' : 'text-ink/50 hover:text-vercel-blue'}`}
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >−</button>
                          <span className={`px-2.5 text-xs font-mono font-bold ${isDark ? 'text-ghost' : 'text-ink'}`}>{item.quantity}</span>
                          <button
                            className={`px-2.5 py-1.5 text-sm font-bold transition-colors cursor-pointer ${isDark ? 'text-ghost/60 hover:text-neon-cyan' : 'text-ink/50 hover:text-vercel-blue'}`}
                            onClick={() => updateQuantity(item.product.id, Math.min(item.quantity + 1, item.product.stockQuantity))}
                          >+</button>
                        </div>
                        <span className={`text-sm font-mono font-bold ${isDark ? 'text-neon-cyan' : 'text-vercel-blue'}`}>{(item.product.price * item.quantity).toFixed(2)}€</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-400 hover:text-red-500 p-1 self-start shrink-0 cursor-pointer"
                    >✕</button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className={`p-6 border-t ${isDark ? 'border-white/6 bg-dark-elevated/60' : 'border-black/6 bg-light-surface/60'}`}>
                <div className="flex justify-between items-baseline mb-4">
                  <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isDark ? 'text-ghost/40' : 'text-ink/40'}`}>Total</span>
                  <span className={`text-2xl font-display font-bold font-mono ${isDark ? 'text-ghost' : 'text-ink'}`}>{cartTotal.toFixed(2)}<span className="text-base ml-1">€</span></span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      window.dispatchEvent(new CustomEvent('open-checkout'));
                    }}
                    className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${
                      isDark ? 'bg-neon-cyan text-dark-base shadow-neon-sm hover:shadow-neon font-bold' : 'bg-vercel-blue text-white shadow-sm hover:shadow-blue-glow'
                    }`}
                  >
                    Ir al Pago
                  </button>
                  <button
                    onClick={() => {
                      const w = window.open('', '_blank');
                      let itemsHtml = '';
                      cartItems.forEach(item => {
                        itemsHtml += `<tr><td style="padding:10px;border-bottom:1px solid #eee;">${item.product.name} (SKU: ${item.product.sku})</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${item.product.price}€</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${(item.product.price * item.quantity).toFixed(2)}€</td></tr>`;
                      });
                      w.document.write(`<html><head><title>Presupuesto LogiTrackShop</title><style>body{font-family:sans-serif;padding:40px;color:#333}.logo{font-size:22px;font-weight:900}table{width:100%;border-collapse:collapse;margin-top:30px}th{background:#f8f9fa;padding:12px;text-align:left}.total{font-size:18px;font-weight:bold;text-align:right;margin-top:20px}</style></head><body onload="window.print()"><div style="display:flex;justify-content:space-between;border-bottom:3px solid #0070F3;padding-bottom:20px"><div class="logo">LogiTrack<span style="color:#0070F3">Shop</span></div><div style="text-align:right"><h2>Presupuesto</h2><p style="font-size:12px">Fecha: ${new Date().toLocaleDateString()} · Validez: 15 días</p></div></div><table><thead><tr><th>Producto</th><th style="text-align:center">Cant.</th><th style="text-align:right">P.Unit.</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="total">Total: ${cartTotal.toFixed(2)}€</div></body></html>`);
                      w.document.close();
                    }}
                    className={`px-4 py-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isDark ? 'bg-white/5 hover:bg-white/10 text-ghost border border-white/8' : 'bg-black/5 hover:bg-black/8 text-ink border border-black/8'
                    }`}
                    title="Generar Presupuesto PDF"
                  >
                    📄 PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
