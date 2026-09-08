import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../../api/config';
import ShopNavbar from '../../../components/ShopNavbar';
import FloatingBackground from '../../../components/FloatingBackground';
import { useCart } from '../../../context/CartContext';
import LogiBot from '../../../components/LogiBot';

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({ email: '', subject: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Filters state
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedFeatures, setSelectedFeatures] = useState({});
  const [expandedFilterGroups, setExpandedFilterGroups] = useState({});

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
      const el = document.getElementById('catalog-products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchParams]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('RELEVANCE');
  const [viewMode, setViewMode] = useState('COLLECTION');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [toastMessage, setToastMessage] = useState('');
  const [activeMission, setActiveMission] = useState(null);

  // States for second-hand sales
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellError, setSellError] = useState(null);
  const [tempFeaturesMarket, setTempFeaturesMarket] = useState([{k:'', v:''}]);
  const [sellForm, setSellForm] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    minStockAlert: '5',
    serialNumber: '',
    condition: 'REACONDICIONADO',
    features: '{}'
  });

  // Cart integration
  const { cartItems, cartTotal, addToCart, clearCart, isCartOpen, setIsCartOpen } = useCart();

  // States for Stripe Checkout Modal
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [stripeForm, setStripeForm] = useState({
    cardName: '',
    cardNumber: '4242 4242 4242 4242',
    cardExpiry: '12/28',
    cardCvc: '123'
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const fetchMarketplaceProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products/marketplace`);
      if (!res.ok) throw new Error("Error al cargar el catálogo de productos");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceProducts();
    
    // Listen to custom event from Drawer
    const handleOpenCheckout = () => {
      if (!user) {
        alert("Inicia sesión para poder realizar compras.");
        navigate('/login');
        return;
      }
      setIsCheckoutModalOpen(true);
      setStripeForm({
        cardName: user.name || '',
        cardNumber: '4242 4242 4242 4242',
        cardExpiry: '12/28',
        cardCvc: '123'
      });
      setPaymentSuccess(false);
      setIsProcessingPayment(false);
      setCheckoutError(null);
    };

    window.addEventListener('open-checkout', handleOpenCheckout);

    // Scroll to top button
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('open-checkout', handleOpenCheckout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [userJson, navigate]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, selectedCategory, minPrice, maxPrice, inStockOnly, sortBy]);

  // Block body scroll when checkout is open
  useEffect(() => {
    if (isCheckoutModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCheckoutModalOpen]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setIsCartOpen(true);
    setToastMessage('✅ ' + product.name + ' añadido al carrito');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleProcessStripePayment = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    setIsProcessingPayment(true);
    setCheckoutError(null);

    // Simular retraso de procesamiento de Stripe
    setTimeout(async () => {
      try {
        const payload = {
          items: cartItems.map(item => ({ productId: item.product.id, quantity: item.quantity }))
        };

        const res = await fetch(`${API_URL}/purchases/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          setPaymentSuccess(true);
          clearCart();
          fetchMarketplaceProducts();
        } else {
          const errMsg = await res.text();
          setCheckoutError("Error en pasarela Stripe: " + errMsg);
        }
      } catch (err) {
        console.error(err);
        setCheckoutError("Error al procesar el pago seguro con Stripe.");
      } finally {
        setIsProcessingPayment(false);
      }
    }, 2000); // 2 segundos de simulación elegante de procesamiento bancario
  };

  const handlePublishSale = async (e) => {
    e.preventDefault();
    setSellError(null);
    try {
      const featuresObj = {};
      tempFeaturesMarket.forEach(f => { if(f.k.trim() && f.v.trim()) featuresObj[f.k.trim()] = f.v.trim(); });
      
      const payload = {
        ...sellForm,
        price: parseFloat(sellForm.price),
        stockQuantity: parseInt(sellForm.stockQuantity),
        minStockAlert: parseInt(sellForm.minStockAlert),
        userEmail: user.email,
        features: JSON.stringify(featuresObj)
      };

      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("¡Producto publicado correctamente para la venta!");
        setIsSellModalOpen(false);
        setSellForm({
          sku: '',
          name: '',
          description: '',
          price: '',
          stockQuantity: '',
          minStockAlert: '5'
        });
        fetchMarketplaceProducts();
      } else {
        const errorText = await res.text();
        let displayError = errorText;
        try {
          const parsed = JSON.parse(errorText);
          if (typeof parsed === 'object' && parsed !== null) {
            displayError = Object.values(parsed).join(', ');
          }
        } catch (e) {
          // No es JSON
        }
        setSellError(displayError);
      }
    } catch (err) {
      console.error(err);
      setSellError("Error de conexión al guardar el producto");
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactSuccess(false);
    try {
      const res = await fetch(`${API_URL}/tickets/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: contactForm.email,
          subject: `Contacto Web: ${contactForm.subject}`,
          description: contactForm.message
        })
      });
      if (res.ok) {
        setContactSuccess(true);
        setContactForm({ email: '', subject: '', message: '' });
        setTimeout(() => setContactSuccess(false), 5000);
      } else {
        alert("Error al enviar la consulta.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red al conectar con soporte.");
    } finally {
      setContactLoading(false);
    }
  };

  const getCategory = (p) => {
    const sku = (p.sku || '').toUpperCase();
    if (sku.startsWith('PCS')) return 'Ordenadores';
    if (sku.startsWith('LAP')) return 'Ordenadores';
    if (sku.startsWith('MOB')) return 'Móviles y tablets';
    if (sku.startsWith('TAB')) return 'Móviles y tablets';
    if (sku.startsWith('WEA')) return 'Smartwatches y wearables';
    if (sku.startsWith('GPU') || sku.startsWith('CPU') || sku.startsWith('STO')) return 'Componentes';
    if (sku.startsWith('PER')) return 'Periféricos';
    if (sku.startsWith('MON') || sku.startsWith('TV')) return 'Televisores';
    if (sku.startsWith('NET')) return 'Domótica y smarthome';
    if (sku.startsWith('CON')) return 'Consolas y videojuegos';
    if (sku.startsWith('PHO')) return 'Fotografía';
    if (sku.startsWith('SND')) return 'Sonido';
    if (sku.startsWith('HOM')) return 'Electrodomésticos';
    if (sku.startsWith('MOV')) return 'Movilidad urbana';
    if (sku.startsWith('TOY')) return 'Juguetes y juegos';
    if (sku.startsWith('REC')) return 'Productos Reacondicionados';

    // Fallback por nombre/descripción
    const text = (p.name + ' ' + (p.description || '')).toLowerCase();
    if (text.includes('sobremesa') || text.includes('torre') || text.includes('desktop') || text.includes('portátil') || text.includes('portatil') || text.includes('macbook') || text.includes('laptop')) return 'Ordenadores';
    if (text.includes('reloj') || text.includes('watch') || text.includes('smartwatch')) return 'Smartwatches y wearables';
    if (text.includes('tablet') || text.includes('ipad') || text.includes(' tab ') || text.includes('móvil') || text.includes('movil') || text.includes('iphone') || text.includes('smartphone')) return 'Móviles y tablets';
    if (text.includes('tarjeta gráfica') || text.includes('procesador') || text.includes('placa base') || text.includes('memoria ram') || text.includes('ssd') || text.includes('hdd') || text.includes('nvme')) return 'Componentes';
    if (text.includes('ratón') || text.includes('teclado') || text.includes('auricular') || text.includes('headset') || text.includes('mouse') || text.includes('keyboard')) return 'Periféricos';
    if (text.includes('monitor') || text.includes('televisor') || text.includes(' tv ')) return 'Televisores';
    if (text.includes('router') || text.includes('wi-fi') || text.includes('wifi') || text.includes('domótica') || text.includes('smart home')) return 'Domótica y smarthome';
    if (text.includes('consola') || text.includes('playstation') || text.includes('xbox') || text.includes('nintendo')) return 'Consolas y videojuegos';
    if (text.includes('cámara') || text.includes('camara') || text.includes('fotografía')) return 'Fotografía';
    if (text.includes('sonido') || text.includes('altavoz') || text.includes('speaker') || text.includes('barra de sonido')) return 'Sonido';
    if (text.includes('electrodoméstico') || text.includes('lavadora') || text.includes('frigorífico') || text.includes('microondas')) return 'Electrodomésticos';
    if (text.includes('patinete') || text.includes('scooter') || text.includes('bicicleta eléctrica')) return 'Movilidad urbana';
    if (text.includes('juguete') || text.includes('juego') || text.includes('drone') || text.includes('lego')) return 'Juguetes y juegos';
    if (text.includes('reacondicionado') || text.includes('refurbished') || text.includes('segunda mano')) return 'Productos Reacondicionados';
    return 'Periféricos';
  };

  const getIconForCategory = (category) => {
    const iconClass = "w-16 h-16 text-vercel-blue group-hover/card:scale-110 transition-transform duration-500 ease-spring";
    switch(category) {
      case 'Ordenadores': return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      case 'Móviles y tablets': return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H7.5a2.25 2.25 0 00-2.25 2.25v15a2.25 2.25 0 002.25 2.25z" /></svg>;
      case 'Componentes': return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'Periféricos': return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>;
      case 'Smartwatches y wearables': return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'Consolas y videojuegos': return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'Televisores': return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
      default: return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
    }
  };


  const normalizeString = (str) => {
    return (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Extraer filtros dinámicos basados en los features de los productos
  const filterGroups = useMemo(() => {
    const groups = {};
    products.forEach(p => {
      // Opcional: Solo extraer de la categoría seleccionada (lo haremos global para que vean todas las opciones)
      if (p.features) {
        try {
          const featuresObj = typeof p.features === 'string' ? JSON.parse(p.features) : p.features;
          Object.entries(featuresObj).forEach(([key, value]) => {
            const groupName = key.trim();
            const valName = String(value).trim();
            if (!groupName || !valName) return;
            
            // Ocultamos algunas propiedades que no son filtros típicos
            if (groupName.toLowerCase() === 'condición' || groupName.toLowerCase() === 'estado') return;

            if (!groups[groupName]) groups[groupName] = {};
            if (!groups[groupName][valName]) groups[groupName][valName] = 0;
            groups[groupName][valName]++;
          });
        } catch (e) {
          // invalid json, ignore
        }
      }
    });
    return groups;
  }, [products]);

  let processedProducts = products.filter(p => {
    const query = normalizeString(searchQuery);
    const matchesSearch = normalizeString(p.name).includes(query) || 
                          normalizeString(p.description).includes(query) ||
                          normalizeString(p.sku).includes(query);
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    const matchesStock = inStockOnly ? p.stockQuantity > 0 : true;
    const matchesCategory = selectedCategory === 'ALL' ? true : getCategory(p) === selectedCategory;
    
    const matchesAdvancedFilters = Object.entries(selectedFeatures).every(([groupName, selectedVals]) => {
      if (!selectedVals || selectedVals.length === 0) return true;
      let pFeatures = {};
      try { 
        pFeatures = p.features ? (typeof p.features === 'string' ? JSON.parse(p.features) : p.features) : {}; 
      } catch (e) {}
      
      const pVal = pFeatures[groupName];
      return pVal && selectedVals.includes(String(pVal).trim());
    });
    
    return matchesSearch && matchesPrice && matchesStock && matchesCategory && matchesAdvancedFilters;
  });

  if (sortBy === 'PRICE_ASC') processedProducts.sort((a,b) => a.price - b.price);
  if (sortBy === 'PRICE_DESC') processedProducts.sort((a,b) => b.price - a.price);

  // Reset visible count when filters change
  const totalProducts = processedProducts.length;
  const visibleProducts = processedProducts.slice(0, visibleCount);

  const newArrivals = [...products].sort((a,b) => b.id - a.id).slice(0, 5);

  return (
    <div className="min-h-screen bg-light-base dark:bg-dark-base text-ink dark:text-ghost font-sans antialiased transition-colors duration-500 relative">
      <FloatingBackground isDark={document.documentElement.classList.contains('dark')} />
      <ShopNavbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 px-6 py-3.5 rounded-2xl shadow-xl text-sm font-bold animate-bounce flex items-center gap-2 border border-white/10">
          {toastMessage}
        </div>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-8 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-neon dark:shadow-neon"
          style={{ background: 'linear-gradient(135deg, #00E5FF, #B026FF)' }}
          aria-label="Volver arriba"
        >
          <svg className="w-5 h-5 text-dark-base" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
        </button>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-500 ease-out ${isFilterDrawerOpen ? 'lg:pl-[30%] sm:pl-[400px]' : 'pl-0'}`}>
        <main className="relative z-10 w-full mx-auto px-6 md:px-10 lg:px-16 space-y-0">
        
        {/* ============================================================
            HERO SECTION — Gamified Mission Selector
            ============================================================ */}
        {!isFilterDrawerOpen && (
          <section className="pt-32 pb-20 relative overflow-hidden">
          {/* Dynamic ambient glow that changes with mission */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-1000"
            style={{
              background: activeMission === 'gaming'
                ? 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(176,38,255,0.12) 0%, transparent 70%)'
                : activeMission === 'content'
                ? 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(250,204,21,0.10) 0%, transparent 70%)'
                : 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,229,255,0.10) 0%, transparent 70%)'
            }}
          />

          <div className="relative z-10 text-center space-y-10">
            {/* Main Headline */}
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-neon-cyan dark:text-neon-cyan">
                  &gt; SISTEMA ACTIVO
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse-led" />
              </div>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black leading-[0.95] tracking-tight flex flex-col items-center">
                <span className="text-ink dark:text-ghost">Potencia</span>
                <span
                  className="bg-clip-text text-transparent mt-2"
                  style={{
                    backgroundImage: activeMission === 'gaming'
                      ? 'linear-gradient(135deg, #B026FF 0%, #00E5FF 100%)'
                      : activeMission === 'content'
                      ? 'linear-gradient(135deg, #FACC15 0%, #FF4500 100%)'
                      : 'linear-gradient(135deg, #00E5FF 0%, #0070F3 100%)'
                  }}
                >
                  Extrema.
                </span>
              </h1>
              <p className="text-lg font-medium text-ink/50 dark:text-ghost/50 max-w-lg mx-auto">
                Tecnología reacondicionada revisada milímetro a milímetro.
              </p>
            </div>

            {/* GAMIFIED MISSION SELECTOR */}
            <div className="space-y-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-ink/30 dark:text-ghost/30">
                ¿Qué misión tienes hoy?
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[
                  {
                    id: 'gaming',
                    label: 'Jugar a Tope',
                    icon: '⚡',
                    desc: 'GPUs, Periféricos, Consolas',
                  },
                  {
                    id: 'content',
                    label: 'Crear Contenido',
                    icon: '🎨',
                    desc: 'Portátiles, Monitores, Cámaras',
                  },
                  {
                    id: 'work',
                    label: 'Trabajar Fluido',
                    icon: '🚀',
                    desc: 'Workstations, Monitores, Mouses',
                  },
                ].map((mission) => (
                  <button
                    key={mission.id}
                    onClick={() => setActiveMission(mission.id === activeMission ? null : mission.id)}
                    className={`group relative flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border text-sm font-semibold transition-all duration-300 hover:scale-[1.04] active:scale-95 cursor-pointer min-w-[160px] overflow-hidden ${
                      activeMission === mission.id
                        ? 'border-transparent shadow-neon'
                        : 'bg-light-elevated dark:bg-white/5 border-black/8 dark:border-white/8 hover:border-neon-cyan/30 dark:hover:border-neon-cyan/30'
                    }`}
                  >
                    <span className="text-2xl relative z-10">{mission.icon}</span>
                    <span className={`font-display font-bold text-sm ${
                      activeMission === mission.id ? 'text-white' : 'text-ink dark:text-ghost'
                    }`}>{mission.label}</span>
                    <span className={`text-[10px] font-mono ${activeMission === mission.id ? 'text-white/70' : 'text-ink/40 dark:text-ghost/40'}`}>
                      {mission.desc}
                    </span>
                    {/* Active glow overlay */}
                    {activeMission === mission.id && (
                      <div
                        className="absolute inset-0 rounded-2xl opacity-80 -z-10"
                        style={{
                          background: mission.id === 'gaming'
                            ? 'linear-gradient(135deg, #B026FF, #00E5FF)'
                            : mission.id === 'content'
                            ? 'linear-gradient(135deg, #FACC15, #FF4500)'
                            : 'linear-gradient(135deg, #00E5FF, #0070F3)',
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={() => {
                  const el = document.getElementById('catalog-products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative px-8 py-4 rounded-2xl font-display font-bold text-base transition-all hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #00E5FF, #0070F3)' }}
              >
                <span className="relative z-10 text-dark-base">Ver Catálogo</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #0070F3, #B026FF)' }} />
              </button>
              <button
                onClick={() => setIsSellModalOpen(true)}
                className="px-8 py-4 rounded-2xl font-display font-semibold text-base border transition-all hover:scale-[1.02] active:scale-95 cursor-pointer bg-ink text-white dark:bg-white/5 dark:glass-dark dark:text-ghost border-black/10 dark:border-white/10 hover:border-vercel-blue/40 dark:hover:border-neon-cyan/40"
              >
                Vender Equipo
              </button>
            </div>
          </div>
        </section>
        )}

        {/* ============================================================
            TICKER — Animated System Notice
            ============================================================ */}
        {!isFilterDrawerOpen && (
        <div className="py-2">
          <div className="ticker-wrapper overflow-hidden py-4 border-y border-white/5 dark:border-white/5 border-black/5 relative">
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-light-base dark:from-dark-base to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-light-base dark:from-dark-base to-transparent" />
            <div className="ticker-track flex items-center gap-0" style={{ animation: 'ticker 35s linear infinite' }}>
              {[
                '✓ GARANTÍA 2 AÑOS',
                '⚡ ENVÍO EXPRÉS 24H',
                '🔒 PIEZAS ORIGINALES CERTIFICADAS',
                '🛡 REVISADO POR INGENIEROS',
                '♻️ REACONDICIONADO PREMIUM',
                '📦 DEVOLUCIÓN GRATUITA 30 DÍAS',
                '✓ GARANTÍA 2 AÑOS',
                '⚡ ENVÍO EXPRÉS 24H',
                '🔒 PIEZAS ORIGINALES CERTIFICADAS',
                '🛡 REVISADO POR INGENIEROS',
                '♻️ REACONDICIONADO PREMIUM',
                '📦 DEVOLUCIÓN GRATUITA 30 DÍAS',
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-8 pl-8">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-[0.15em] whitespace-nowrap text-neon-cyan dark:text-neon-cyan text-vercel-blue">
                    {item}
                  </span>
                  <span className="text-neon-cyan/30 dark:text-neon-cyan/30 text-vercel-blue/30">—</span>
                </span>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* ============================================================
            FILTER BAR — Vibrant Category Selector
            ============================================================ */}
        <section id="catalog-products" className={`py-8 space-y-6 ${isFilterDrawerOpen ? 'pt-32' : ''}`}>
          <div className="w-full">
            {/* Search Input */}
            <div className="relative w-full">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30 dark:text-ghost/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl border text-sm font-semibold outline-none transition-all bg-white dark:bg-dark-surface border-black/10 dark:border-white/8 text-ink dark:text-ghost placeholder:text-ink/60 dark:placeholder:text-ghost/40 focus:border-vercel-blue/50 dark:focus:border-neon-cyan/50 focus:shadow-blue-glow dark:focus:shadow-neon-sm"
              />
            </div>
          </div>
        </section>

        {/* ============================================================
            TRUST SIGNALS BANNER — Compact horizontal strip
            ============================================================ */}

        {/* Separator anchor */}
        <div id="catalog-products" className="pt-4" />

        {error && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-semibold mb-8">
            ⚠️ {error}
          </div>
        )}

        {/* ============================================================
            PRODUCT CATALOG — Immersive Live Cards with Tilt 3D
            ============================================================ */}
        {loading ? (
          <div className="text-center py-24 text-ink/30 dark:text-ghost/30 font-mono text-sm">// CARGANDO COMPONENTES...</div>
        ) : (
          <div className="space-y-12 pb-20">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {visibleProducts.map((p, idx) => {
                const iconEl = getIconForCategory(getCategory(p));
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate('/producto/' + p.id)}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - rect.left) / rect.width - 0.5;
                      const y = (e.clientY - rect.top) / rect.height - 0.5;
                      e.currentTarget.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px) scale(1.01)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
                    }}
                    style={{ transition: 'transform 0.1s ease-out', animationDelay: `${idx * 0.05}s` }}
                    className="tilt-card bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/6 p-5 flex flex-col justify-between min-h-[340px] relative group/card cursor-pointer animate-spring-in"
                  >
                    {/* Icon zone */}
                    <div className="w-full h-32 rounded-xl flex items-center justify-center relative overflow-hidden mb-4 border border-black/4 dark:border-white/4" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.04), rgba(176,38,255,0.04))' }}>
                      <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,229,255,0.08), transparent 70%)' }} />
                      {iconEl}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-2">
                      {newArrivals.some(n => n.id === p.id) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(176,38,255,0.15))', color: '#00E5FF' }}>
                          ✦ NUEVO
                        </span>
                      )}
                      <h3 className="font-display font-semibold text-ink dark:text-ghost text-[14px] leading-snug line-clamp-2 group-hover/card:text-neon-cyan dark:group-hover/card:text-neon-cyan transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-ink/40 dark:text-ghost/40 line-clamp-2">{p.description || 'Componente verificado con garantía.'}</p>
                    </div>

                    {/* Price + Status + Add */}
                    <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-lg font-mono font-bold text-ink dark:text-ghost tracking-tight">
                          {p.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-xs ml-0.5 text-ink/40 dark:text-ghost/40">€</span>
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`led-dot ${p.stockQuantity > 0 ? 'led-dot-green' : 'led-dot-red'}`} />
                          <span className={`text-[10px] font-mono font-bold ${p.stockQuantity > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {p.stockQuantity > 0 ? 'EN STOCK' : 'AGOTADO'}
                          </span>
                        </div>
                      </div>

                      {/* Hover-reveal "Añadir a la Misión" button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }}
                        disabled={p.stockQuantity <= 0}
                        className="group/btn shrink-0 flex items-center justify-center gap-1.5 w-9 h-9 lg:w-auto lg:h-auto lg:px-4 lg:py-2 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed opacity-100 lg:opacity-0 group-hover/card:opacity-100 scale-100 lg:scale-95 group-hover/card:scale-100 duration-200"
                        style={{ background: 'linear-gradient(135deg, #00E5FF, #0070F3)', color: '#0B0C10' }}
                        title="Equipar"
                      >
                        <span className="text-xl lg:text-sm lg:leading-none mb-0.5 lg:mb-0 font-black">+</span>
                        <span className="hidden lg:inline text-xs">Equipar</span>
                      </button>
                    </div>
                  </div>
                );
              })}


              {processedProducts.length === 0 && (
                <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-light-surface/40 dark:bg-dark-surface/40 backdrop-blur-md rounded-3xl border border-black/5 dark:border-white/5 shadow-glass">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-vercel-blue/20 dark:bg-neon-cyan/20 blur-2xl rounded-full" />
                    <svg className="w-20 h-20 text-vercel-blue dark:text-neon-cyan relative drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-ink to-ink/60 dark:from-white dark:to-ghost/60 mb-3">
                    Búsqueda sin resultados
                  </h3>
                  <p className="text-sm font-medium text-ink/50 dark:text-ghost/50 max-w-sm mb-8">
                    No hemos encontrado productos que coincidan con tu búsqueda. Prueba a ajustar los filtros o el rango de precio.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('ALL');
                      setMinPrice(0);
                      setMaxPrice(5000);
                      setInStockOnly(false);
                      setSelectedFeatures({});
                    }}
                    className="px-8 py-3 rounded-xl text-sm font-bold shadow-neon-sm transition-all hover:scale-105 active:scale-95 cursor-pointer text-dark-base"
                    style={{ background: 'linear-gradient(135deg, #00E5FF, #0070F3)' }}
                  >
                    Restablecer Filtros
                  </button>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {visibleCount < totalProducts && (
              <div className="flex flex-col items-center pt-4">
                <button
                  onClick={() => setVisibleCount(v => v + 8)}
                  className="px-8 py-3 rounded-xl text-sm font-semibold border transition-all hover:scale-[1.02] cursor-pointer bg-light-elevated dark:bg-dark-elevated border-black/8 dark:border-white/8 text-ink dark:text-ghost hover:border-neon-cyan/40"
                >
                  Cargar más
                </button>
              </div>
            )}
          </div>
        )}

            {/* Filter Drawer Toggle */}
            {!isFilterDrawerOpen && (
              <button 
                onClick={() => setIsFilterDrawerOpen(true)}
                className="fixed left-0 top-1/2 -translate-y-1/2 z-40 text-dark-base p-4 rounded-r-2xl shadow-neon-sm hover:pr-6 transition-all flex items-center justify-center cursor-pointer font-black text-xl"
                style={{ background: 'linear-gradient(135deg, #00E5FF, #0070F3)' }}
                title="Abrir Filtros"
              >
                »
              </button>
            )}

            {/* Overlay removed to allow interacting with products */}

            {/* Left Sidebar Drawer */}
            <aside 
              className={`fixed left-0 top-0 h-full w-full sm:w-[400px] lg:w-[30%] bg-light-base/95 dark:bg-dark-surface/95 backdrop-blur-3xl shadow-glass z-40 pt-16 transform transition-transform duration-500 ease-out flex flex-col border-r border-black/5 dark:border-white/5 ${isFilterDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
              <div className="flex justify-between items-center p-5 border-b border-black/5 dark:border-white/5">
                <h2 className="text-base font-display font-bold text-ink dark:text-ghost">Filtros</h2>
                <button 
                  onClick={() => setIsFilterDrawerOpen(false)} 
                  className="text-2xl text-ink/30 hover:text-neon-cyan dark:hover:text-neon-cyan transition-colors cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6 hide-scrollbar">
                <div>
                  <h3 className="text-[10px] font-mono font-bold text-ink/50 dark:text-ghost/50 uppercase tracking-[0.2em] mb-3">// BUSCAR</h3>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 dark:text-ghost/30">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Producto, SKU..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-light-surface dark:bg-dark-base border border-black/8 dark:border-white/8 text-ink dark:text-ghost rounded-xl py-3 pl-11 pr-4 text-sm focus:border-vercel-blue/50 dark:focus:border-neon-cyan/50 focus:shadow-blue-glow dark:focus:shadow-neon-sm outline-none transition-all placeholder:text-ink/30 dark:placeholder:text-ghost/30 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-mono font-bold text-ink/50 dark:text-ghost/50 uppercase tracking-[0.2em] mb-3">// CATEGORÍAS</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'ALL','Componentes','Ordenadores','Periféricos','Consolas y videojuegos',
                      'Móviles y tablets','Televisores','Electrodomésticos','Domótica y smarthome',
                      'Hogar','Belleza y salud','Sonido','Smartwatches y wearables',
                      'Fotografía','Movilidad urbana','Juguetes y juegos','Productos Reacondicionados',
                    ].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`text-center text-xs font-semibold px-2 py-2.5 rounded-xl transition-all border ${
                          selectedCategory === cat 
                            ? 'bg-light-base dark:bg-dark-base border-vercel-blue dark:border-neon-cyan text-vercel-blue dark:text-neon-cyan shadow-blue-glow dark:shadow-neon-sm' 
                            : 'bg-light-surface dark:bg-dark-surface border-black/5 dark:border-white/5 text-ink/60 dark:text-ghost/60 hover:border-vercel-blue/40 dark:hover:border-neon-cyan/40'
                        }`}
                        style={selectedCategory === cat ? { background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(0,112,243,0.1))' } : {}}
                      >
                        {cat === 'ALL' ? 'Todos' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-mono font-bold text-ink/50 dark:text-ghost/50 uppercase tracking-[0.2em]">// RANGO DE PRECIO</h3>
                    <span className="text-xs font-mono font-bold bg-black/5 dark:bg-white/5 text-vercel-blue dark:text-neon-cyan px-2 py-1 rounded-md">{minPrice}€ – {maxPrice}€</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono text-ink/50 dark:text-ghost/50 font-bold uppercase tracking-wide mb-2 block">Desde: {minPrice}€</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="5000" 
                        step="50"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 50))}
                        className="w-full accent-vercel-blue dark:accent-neon-cyan"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-ink/50 dark:text-ghost/50 font-bold uppercase tracking-wide mb-2 block">Hasta: {maxPrice}€</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="5000" 
                        step="50"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 50))}
                        className="w-full accent-vercel-blue dark:accent-neon-cyan"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group p-4 bg-light-surface dark:bg-dark-surface border border-black/5 dark:border-white/5 rounded-2xl transition-colors hover:border-vercel-blue/40 dark:hover:border-neon-cyan/40">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="appearance-none w-6 h-6 border-2 border-black/10 dark:border-white/10 rounded-md checked:bg-vercel-blue dark:checked:bg-neon-cyan checked:border-vercel-blue dark:checked:border-neon-cyan transition-colors cursor-pointer"
                    />
                    {inStockOnly && <span className="absolute text-white text-[12px] pointer-events-none">✓</span>}
                  </div>
                  <span className="text-sm font-semibold text-ink dark:text-ghost group-hover:text-vercel-blue dark:group-hover:text-neon-cyan transition-colors">Mostrar solo en stock</span>
                </label>

                {/* ADVANCED FILTERS (ACCORDION) */}
                {Object.keys(filterGroups).length > 0 && (
                  <div className="mt-8 space-y-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[10px] font-mono font-bold text-ink/50 dark:text-ghost/50 uppercase tracking-[0.2em]">// FILTROS AVANZADOS</h3>
                      {Object.keys(selectedFeatures).some(k => selectedFeatures[k]?.length > 0) && (
                        <button 
                          onClick={() => setSelectedFeatures({})} 
                          className="text-[10px] font-bold text-vercel-blue dark:text-neon-cyan hover:underline cursor-pointer"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    {Object.entries(filterGroups).map(([groupName, valuesObj]) => {
                      const isExpanded = expandedFilterGroups[groupName];
                      return (
                        <div key={groupName} className="border-b border-black/5 dark:border-white/5 pb-1">
                          <button 
                            onClick={() => setExpandedFilterGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }))}
                            className="flex justify-between items-center w-full py-3 text-left cursor-pointer group outline-none"
                          >
                            <span className="text-xs font-bold text-ink dark:text-ghost group-hover:text-vercel-blue dark:group-hover:text-neon-cyan transition-colors">{groupName}</span>
                            <span className="text-ink/40 dark:text-ghost/40 text-[10px] transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                              ▼
                            </span>
                          </button>
                          
                          {isExpanded && (
                            <div className="pb-4 space-y-3 pt-1 max-h-[300px] overflow-y-auto hide-scrollbar">
                              {Object.entries(valuesObj).sort((a,b) => b[1] - a[1]).map(([valName, count]) => {
                                const isChecked = selectedFeatures[groupName]?.includes(valName);
                                return (
                                  <label key={valName} className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                                      <input 
                                        type="checkbox"
                                        checked={isChecked || false}
                                        onChange={() => {
                                          setSelectedFeatures(prev => {
                                            const prevSelected = prev[groupName] || [];
                                            const isCurrentlySelected = prevSelected.includes(valName);
                                            let newSelected;
                                            if (isCurrentlySelected) {
                                              newSelected = prevSelected.filter(v => v !== valName);
                                            } else {
                                              newSelected = [...prevSelected, valName];
                                            }
                                            return { ...prev, [groupName]: newSelected };
                                          });
                                        }}
                                        className="appearance-none w-4 h-4 border border-black/20 dark:border-white/20 rounded-[4px] checked:bg-vercel-blue dark:checked:bg-neon-cyan checked:border-vercel-blue dark:checked:border-neon-cyan transition-colors cursor-pointer group-hover:border-vercel-blue/50 dark:group-hover:border-neon-cyan/50"
                                      />
                                      {isChecked && <span className="absolute text-white dark:text-dark-base text-[10px] pointer-events-none font-black">✓</span>}
                                    </div>
                                    <span className="text-xs text-ink/70 dark:text-ghost/70 group-hover:text-ink dark:group-hover:text-ghost transition-colors leading-tight">
                                      {valName} <span className="text-ink/40 dark:text-ghost/40 ml-1">({count})</span>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>
                {/* Modal: Checkout de Stripe */}
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 text-slate-950 dark:text-nord-text rounded-3xl w-full max-w-lg p-8 shadow-2xl space-y-6 border border-gray-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
              
              <button 
                onClick={() => setIsCheckoutModalOpen(false)}
                className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>

              {paymentSuccess ? (
                // Pantalla de Éxito de Compra
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                    ✓
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-nord-text">¡Pago Procesado con Éxito!</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                    Tu pago seguro simulado a través de Stripe se ha verificado. 
                    Se ha enviado la factura de tu pedido a tu correo electrónico registrado.
                  </p>
                  <div className="border border-slate-150 dark:border-slate-800 rounded-2xl p-4 bg-slate-55 dark:bg-slate-950 text-left max-w-sm mx-auto">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Pasarela:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Stripe Simulado v3</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-nord-text">Total</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-450">{cartTotal.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all cursor-pointer text-sm shadow-md mt-4"
                  >
                    Entendido
                  </button>
                </div>
              ) : (
                // Formulario de Pago de Stripe
                <form onSubmit={handleProcessStripePayment} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-nord-text tracking-tight">Checkout de Compra</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Completa tu pedido de forma segura mediante Stripe.</p>
                  </div>

                  {checkoutError && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold">
                      ⚠️ {checkoutError}
                    </div>
                  )}

                  {/* Detalles del Carrito */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Resumen de Compra</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{cartItems.length} componentes en el carrito</p>
                    </div>
                  </div>

                  {/* Formulario Tarjeta Stripe */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Información de Pago (Stripe)</p>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Titular de la tarjeta</label>
                      <input 
                        type="text"
                        required
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-900 dark:text-nord-text text-sm font-semibold"
                        placeholder="Titular de la Tarjeta"
                        value={stripeForm.cardName}
                        onChange={(e) => setStripeForm({ ...stripeForm, cardName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Número de tarjeta</label>
                      <div className="relative">
                        <input 
                          type="text"
                          required
                          maxLength="19"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-900 dark:text-nord-text text-sm font-semibold pl-10"
                          placeholder="4242 4242 4242 4242"
                          value={stripeForm.cardNumber}
                          onChange={(e) => setStripeForm({ ...stripeForm, cardNumber: e.target.value })}
                        />
                        <span className="absolute left-3 top-2.5 text-slate-400 text-sm">💳</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Expiración</label>
                        <input 
                          type="text"
                          required
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-900 dark:text-nord-text text-sm font-semibold text-center"
                          value={stripeForm.cardExpiry}
                          onChange={(e) => setStripeForm({ ...stripeForm, cardExpiry: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">CVC</label>
                        <input 
                          type="text"
                          required
                          placeholder="123"
                          maxLength="3"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-900 dark:text-nord-text text-sm font-semibold text-center"
                          value={stripeForm.cardCvc}
                          onChange={(e) => setStripeForm({ ...stripeForm, cardCvc: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resumen Total y Botón */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                      <span className="font-bold text-slate-600 dark:text-slate-300">Total a Pagar:</span>
                      <p className="text-3xl font-black text-slate-950 dark:text-nord-text">{cartTotal.toFixed(2)}€</p>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={isProcessingPayment}
                      className="bg-nord-accent hover:bg-nord-accent-hover disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-650 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Procesando...
                        </>
                      ) : (
                        'Pagar con Stripe'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal: Publicar Segunda Mano */}
        {isSellModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 text-slate-950 dark:text-nord-text rounded-3xl w-full max-w-md p-8 shadow-2xl space-y-6 border border-gray-100 dark:border-slate-800 transition-colors duration-350">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-nord-text tracking-tight">
                  Publicar Artículo Usado
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sube tu producto de segunda mano al inventario.</p>
              </div>

              {sellError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold">
                  ⚠️ {sellError}
                </div>
              )}
              
              <form onSubmit={handlePublishSale} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">SKU identificador</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-900 dark:text-nord-text text-sm font-semibold"
                    placeholder="Ejem: SKU-RTX-3080"
                    value={sellForm.sku}
                    required
                    onChange={(e) => setSellForm({...sellForm, sku: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Nombre del artículo</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-900 dark:text-nord-text text-sm font-semibold"
                    placeholder="Ejem: NVIDIA RTX 3080 Asus"
                    value={sellForm.name}
                    required
                    onChange={(e) => setSellForm({...sellForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Descripción / Estado</label>
                  <textarea 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-900 dark:text-nord-text text-sm font-semibold min-h-[80px]"
                    placeholder="Ej: En caja original, muy bien cuidado."
                    value={sellForm.description}
                    onChange={(e) => setSellForm({...sellForm, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Nº Serie (Opcional)</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-900 dark:text-nord-text text-sm font-semibold"
                      placeholder="S/N..."
                      value={sellForm.serialNumber}
                      onChange={(e) => setSellForm({...sellForm, serialNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Estado</label>
                    <select 
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-900 dark:text-nord-text text-sm font-semibold"
                      value={sellForm.condition}
                      onChange={(e) => setSellForm({...sellForm, condition: e.target.value})}
                    >
                      <option value="REACONDICIONADO">♻️ Reacondicionado / Usado</option>
                      <option value="NUEVO">✨ Nuevo a estrenar</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Características Específicas</label>
                  {tempFeaturesMarket.map((feat, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input type="text" placeholder="Ej. Memoria RAM" className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-nord-text text-xs" value={feat.k} onChange={e => { const nw=[...tempFeaturesMarket]; nw[i].k=e.target.value; setTempFeaturesMarket(nw); }} />
                      <input type="text" placeholder="Ej. 16GB" className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-nord-text text-xs" value={feat.v} onChange={e => { const nw=[...tempFeaturesMarket]; nw[i].v=e.target.value; setTempFeaturesMarket(nw); }} />
                      {tempFeaturesMarket.length > 1 && (
                        <button type="button" onClick={() => setTempFeaturesMarket(tempFeaturesMarket.filter((_, idx)=>idx!==i))} className="text-red-400 hover:text-red-500 font-bold px-2">✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setTempFeaturesMarket([...tempFeaturesMarket, {k:'', v:''}])} className="text-xs text-nord-accent font-bold hover:underline mt-1">+ Añadir especificación</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Precio (€)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-900 dark:text-nord-text text-sm font-semibold"
                      value={sellForm.price}
                      required
                      onChange={(e) => setSellForm({...sellForm, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Stock inicial</label>
                    <input 
                      type="number" 
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-900 dark:text-nord-text text-sm font-semibold"
                      value={sellForm.stockQuantity}
                      required
                      onChange={(e) => setSellForm({...sellForm, stockQuantity: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsSellModalOpen(false)}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold transition-all cursor-pointer text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="w-full bg-nord-accent hover:bg-nord-accent-hover text-white py-3 rounded-xl font-bold transition-all cursor-pointer text-sm shadow-md"
                  >
                    Publicar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* LogiBot Assistant */}
        <LogiBot products={products} isCartOpen={isCartOpen} isCheckoutOpen={isCheckoutModalOpen} />
      </main>

      {/* Premium Footer */}
      <footer className="w-full bg-light-elevated dark:bg-dark-surface border-t border-black/5 dark:border-white/10 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-black tracking-tight text-ink dark:text-ghost">LOGITRACK</h3>
            <p className="text-xs text-ink/60 dark:text-ghost/60 leading-relaxed">
              Tu solución integral de gestión ERP y tienda de componentes tecnológicos de alto rendimiento.
            </p>
            <p className="text-xs text-ink/40 dark:text-ghost/40">
              © {new Date().getFullYear()} LogicTrack S.L. Todos los derechos reservados.
            </p>
          </div>

          {/* Col 2: Tiendas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-ink/40 dark:text-ghost/40 uppercase tracking-widest">Nuestras Tiendas</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li className="text-ink/75 dark:text-ghost/75">📍 Central: Av. de la Constitución, 15, Madrid</li>
              <li className="text-ink/75 dark:text-ghost/75">📍 Barcelona: Carrer de Mallorca, 272</li>
              <li className="text-ink/75 dark:text-ghost/75">📍 Valencia: Carrer de Colón, 12</li>
            </ul>
          </div>

          {/* Col 3: Enlaces */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-ink/40 dark:text-ghost/40 uppercase tracking-widest">Legal</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="#" className="text-ink/60 dark:text-ghost/60 hover:text-vercel-blue transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="text-ink/60 dark:text-ghost/60 hover:text-vercel-blue transition-colors">Términos de Servicio</a></li>
              <li><a href="#" className="text-ink/60 dark:text-ghost/60 hover:text-vercel-blue transition-colors">Uso de Cookies</a></li>
            </ul>
          </div>

          {/* Col 4: Contacto */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-ink/40 dark:text-ghost/40 uppercase tracking-widest">Soporte y Contacto</h4>
            {contactSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-bold">
                ¡Mensaje enviado con éxito! Se ha generado tu ticket de soporte.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-2">
                <input 
                  type="email" 
                  required 
                  placeholder="Tu Email" 
                  className="w-full bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-ink dark:text-ghost focus:outline-none focus:border-vercel-blue"
                  value={contactForm.email}
                  onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                />
                <input 
                  type="text" 
                  required 
                  placeholder="Asunto" 
                  className="w-full bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-ink dark:text-ghost focus:outline-none focus:border-vercel-blue"
                  value={contactForm.subject}
                  onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                />
                <textarea 
                  required 
                  placeholder="Mensaje o Consulta" 
                  rows="3"
                  className="w-full bg-light-surface dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-ink dark:text-ghost focus:outline-none focus:border-vercel-blue resize-none"
                  value={contactForm.message}
                  onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                />
                <button 
                  type="submit" 
                  disabled={contactLoading}
                  className="w-full bg-vercel-blue hover:bg-blue-600 text-white font-bold py-2 rounded-lg text-xs transition-colors"
                >
                  {contactLoading ? 'Enviando...' : 'Enviar Consulta'}
                </button>
              </form>
            )}
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
