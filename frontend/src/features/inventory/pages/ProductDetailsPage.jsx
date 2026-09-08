import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { API_URL } from '../../../api/config';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [reviews, setReviews] = useState([
    { id: 1, user: 'Alejandro M.', rating: 5, comment: 'Excelente rendimiento y acabados premium. Muy contento con la compra.', date: 'Hace 3 días' },
    { id: 2, user: 'Beatriz G.', rating: 4, comment: 'Calidad excelente, aunque la caja es un poco más grande de lo esperado.', date: 'Hace 1 semana' }
  ]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Usar el endpoint público para evitar errores de autenticación
        const res = await fetch(`${API_URL}/products/marketplace`);
        if (!res.ok) throw new Error("Error fetching products");
        const data = await res.json();
        const p = data.find(prod => prod.id === parseInt(id));
        setProduct(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const p = product;

  const getCategory = (p) => {
    if (!p) return 'Accesorios';
    const sku = (p.sku || '').toUpperCase();
    if (sku.startsWith('PCS')) return 'PC Sobremesa';
    if (sku.startsWith('LAP')) return 'Portátiles';
    if (sku.startsWith('MOB')) return 'Móviles';
    if (sku.startsWith('TAB')) return 'Tablets';
    if (sku.startsWith('WEA')) return 'Wearables';
    
    const text = (p.name + ' ' + (p.description || '')).toLowerCase();
    if (text.includes('sobremesa') || text.includes('pc') || text.includes('torre') || text.includes('desktop')) return 'PC Sobremesa';
    if (text.includes('reloj') || text.includes('watch') || text.includes('smartwatch')) return 'Wearables';
    if (text.includes('tablet') || text.includes('ipad') || text.includes(' tab ')) return 'Tablets';
    if (text.includes('móvil') || text.includes('movil') || text.includes('iphone') || text.includes('smartphone') || (text.includes('samsung') && !text.includes('watch') && !text.includes('tab'))) return 'Móviles';
    if (text.includes('portátil') || text.includes('portatil') || text.includes('macbook') || text.includes('laptop')) return 'Portátiles';
    return 'Accesorios';
  };

  const getImageForCategory = (category) => {
    switch(category) {
      case 'PC Sobremesa': return '/category_pc_1783879156973.png';
      case 'Portátiles': return '/category_laptop_1783879169664.png';
      case 'Móviles': return '/category_mobile_1783879177390.png';
      case 'Tablets': return '/category_tablet_1783879186080.png';
      case 'Wearables': return '/category_mobile_1783879177390.png';
      case 'Accesorios': 
      default: return '/category_acc_1783879194026.png';
    }
  };

  const handleAddToCart = () => {
    if (!p) return;
    addToCart(p, 1);
    setIsCartOpen(true);
    setToastMessage('✅ Producto añadido al carrito');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    const review = {
      id: Date.now(),
      user: user ? user.name : 'Invitado',
      rating: newReview.rating,
      comment: newReview.comment,
      date: 'Hoy mismo'
    };
    setReviews([review, ...reviews]);
    setNewReview({ rating: 5, comment: '' });
    setToastMessage('⭐ Valoración añadida con éxito');
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (!p) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nord-accent mb-4"></div>
        <p className="text-slate-500 font-semibold">Cargando producto...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-nord-text flex flex-col justify-between relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 px-6 py-3.5 rounded-2xl shadow-xl text-sm font-bold animate-bounce flex items-center gap-2">
          {toastMessage}
        </div>
      )}
      <div className="w-full mx-auto p-4 sm:p-6 lg:p-12 flex-1 flex flex-col justify-center">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-nord-accent dark:hover:text-white transition-colors self-start cursor-pointer"
        >
          <span>←</span> Volver al catálogo
        </button>

        {/* Responsive, compact product details card */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl overflow-hidden flex flex-col lg:flex-row border border-slate-100 dark:border-slate-800 min-h-[500px]">
          
          {/* LEFT: Image & SKU Badge */}
          <div className="w-full lg:w-[45%] bg-slate-950 flex flex-col justify-between relative p-6 min-h-[300px] lg:min-h-auto">
            <img 
              src={getImageForCategory(getCategory(p))} 
              alt={p.name} 
              className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            
            <div className="relative z-10 self-start flex flex-wrap gap-2">
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest text-white border border-white/20 uppercase">
                {p.sku}
              </span>
              {p.condition === 'REACONDICIONADO' && (
                <span className="inline-block px-3 py-1 bg-amber-500/90 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest text-white border border-amber-400 uppercase shadow-lg shadow-amber-500/20">
                  ♻️ Reacondicionado
                </span>
              )}
            </div>
            
            <div className="relative z-10 mt-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                {p.name}
              </h2>
              <p className="text-xs text-slate-300 font-medium line-clamp-2">
                {p.description}
              </p>
            </div>
          </div>
          
          {/* RIGHT: Price, Stock & Spec boxes */}
          <div className="w-full lg:w-[55%] p-6 sm:p-8 flex flex-col justify-between gap-6">
            
            {/* Top row: Price and stock status */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Precio</p>
                <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{p.price}€</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estado de Stock</p>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${p.stockQuantity > 0 ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-950/50 dark:text-emerald-400' : 'text-red-600 bg-red-50 dark:bg-red-955/50 dark:text-red-400'}`}>
                  {p.stockQuantity > 0 ? `${p.stockQuantity} disponibles` : 'Agotado'}
                </span>
              </div>
            </div>

            {/* Middle: Technical Specifications in grid boxes */}
            <div className="flex-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="text-nord-accent">⚡</span> Especificaciones Técnicas
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {/* Parse JSON features */}
                {(() => {
                  let parsedFeatures = {};
                  try {
                    if (p.features) {
                      if (p.features.startsWith('{')) {
                        parsedFeatures = JSON.parse(p.features);
                      } else {
                        p.features.split(/\\n|\n|<br\s*\/?>/gi).filter(Boolean).forEach(line => {
                          const [key, ...rest] = line.split(':');
                          if (rest.length > 0) parsedFeatures[key.trim()] = rest.join(':').trim();
                          else parsedFeatures[line.trim()] = '';
                        });
                      }
                    }
                  } catch(e) {}
                  
                  const entries = Object.entries(parsedFeatures);
                  if (entries.length === 0) {
                    return (
                      <div className="col-span-full py-8 text-center text-xs text-slate-400">
                        No hay especificaciones adicionales registradas.
                      </div>
                    );
                  }
                  return entries.map(([key, val], idx) => (
                    <div key={idx} className="bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 flex flex-col justify-center">
                      <span className="text-[9px] font-black text-nord-accent uppercase tracking-wider mb-0.5">{key}</span>
                      {val ? <span className="text-xs font-bold text-slate-850 dark:text-slate-200 line-clamp-1">{val}</span> : null}
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              {p.serialNumber && (
                <div className="text-left shrink-0">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">S/N Oficial</p>
                  <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">{p.serialNumber}</p>
                </div>
              )}
              
              <button 
                onClick={handleAddToCart}
                disabled={p.stockQuantity <= 0}
                className="flex-1 bg-nord-accent hover:bg-nord-accent-hover text-white disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 font-bold py-3.5 rounded-xl transition-all shadow-md text-sm flex justify-center items-center gap-2 group cursor-pointer"
              >
                <span>{p.stockQuantity <= 0 ? 'Agotado' : 'Añadir al carrito'}</span>
                <span className="text-lg group-hover:scale-125 transition-transform">+</span>
              </button>
            </div>

          </div>
          
        </div>

        {/* ── SECCIÓN: TENDENCIA HISTÓRICA DE PRECIOS (GRAFICO) ── */}
        <div className="mt-8 bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <span>📈</span> Tendencia de Precio (Últimos 6 meses)
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Historial del valor de mercado para este componente.</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-900/40">
              🎯 ¡Mejor precio garantizado en LogiTrack!
            </div>
          </div>
          
          {/* Simulated chart using SVG */}
          <div className="pt-4">
            <svg viewBox="0 0 500 150" className="w-full h-40 overflow-visible">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5e81ac" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#5e81ac" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#eee" strokeWidth="0.5" className="dark:stroke-slate-800" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#eee" strokeWidth="0.5" className="dark:stroke-slate-800" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#ccc" strokeWidth="1" className="dark:stroke-slate-700" />
              
              {/* Chart Line Path */}
              <path 
                d="M 10 110 Q 100 80, 200 120 T 400 60 L 490 90" 
                fill="none" 
                stroke="#5e81ac" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />
              <path 
                d="M 10 110 Q 100 80, 200 120 T 400 60 L 490 90 L 490 130 L 10 130 Z" 
                fill="url(#chartGrad)" 
              />
              
              {/* Dots on peak prices */}
              <circle cx="400" cy="60" r="4.5" fill="#81a1c1" />
              <circle cx="490" cy="90" r="4.5" fill="#5e81ac" />
              
              {/* Text labels */}
              <text x="10" y="145" fontSize="8" fill="#aaa" className="font-bold">Ene</text>
              <text x="100" y="145" fontSize="8" fill="#aaa" className="font-bold">Feb</text>
              <text x="200" y="145" fontSize="8" fill="#aaa" className="font-bold">Mar</text>
              <text x="300" y="145" fontSize="8" fill="#aaa" className="font-bold">Abr</text>
              <text x="400" y="145" fontSize="8" fill="#aaa" className="font-bold">May</text>
              <text x="475" y="145" fontSize="8" fill="#aaa" className="font-bold">Jun</text>
              
              <text x="385" y="50" fontSize="8" fill="#81a1c1" className="font-bold">${Math.round(p.price * 1.15)}€</text>
              <text x="475" y="80" fontSize="8" fill="#5e81ac" className="font-bold">${p.price}€</text>
            </svg>
          </div>
        </div>

        {/* ── SECCIÓN: OPINIONES Y VALORACIONES DE CLIENTES ── */}

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left panel: Leave a review form */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span>⭐</span> Escribir una opinión
            </h3>
            
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Puntuación</label>
                <div className="flex gap-1.5 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className={`cursor-pointer transition-colors ${newReview.rating >= star ? 'text-amber-400' : 'text-slate-200 dark:text-slate-800 hover:text-amber-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Tu comentario</label>
                <textarea
                  rows={3}
                  value={newReview.comment}
                  required
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="¿Qué te ha parecido este producto? Comparte tu experiencia..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-nord-accent outline-none text-slate-900 dark:text-nord-text font-semibold text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-nord-accent dark:hover:bg-nord-accent hover:text-white dark:hover:text-white text-white py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Enviar Valoración
              </button>
            </form>
          </div>

          {/* Right panel: List of reviews */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span>💬</span> Opiniones de clientes ({reviews.length})
            </h3>
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.user}</span>
                      <div className="flex gap-0.5 text-xs text-amber-400 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                  </div>
                  <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

