import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogiBot({ products, isCartOpen, isCheckoutOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '¡Hola! Soy LogiBot, tu asistente inteligente de LogiTrack. ¿En qué te puedo ayudar hoy? Puedes preguntarme sobre stock, plazos de entrega, o pedirme recomendaciones de componentes.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      processBotResponse(userText);
    }, 1000);
  };

  const processBotResponse = (text) => {
    const cleanText = text.toLowerCase().trim();
    let reply = '';
    let matchedProducts = [];

    const searchStock = (keywords) => {
      return products.filter(p => {
        const matchName = keywords.some(k => p.name.toLowerCase().includes(k));
        const matchDesc = p.description ? keywords.some(k => p.description.toLowerCase().includes(k)) : false;
        return (matchName || matchDesc) && p.stockQuantity > 0;
      }).slice(0, 3);
    };

    if (cleanText.includes('hola') || cleanText.includes('buenos dias') || cleanText.includes('buenas')) {
      reply = '¡Hola! Qué gusto saludarte. ¿Estás buscando algún componente informático o tienes dudas sobre tus envíos?';
    } 
    else if (cleanText.includes('grafica') || cleanText.includes('rtx') || cleanText.includes('gpu') || cleanText.includes('nvidia')) {
      matchedProducts = searchStock(['rtx', 'gpu', 'geforce', 'radeon', 'nvidia']);
      if (matchedProducts.length > 0) {
        reply = 'He encontrado estas tarjetas gráficas disponibles con stock inmediato en nuestro inventario:';
      } else {
        reply = 'Lo siento, actualmente no nos quedan tarjetas gráficas en stock. ¿Quieres buscar otro componente?';
      }
    } 
    else if (cleanText.includes('procesador') || cleanText.includes('cpu') || cleanText.includes('intel') || cleanText.includes('ryzen')) {
      matchedProducts = searchStock(['core', 'ryzen', 'cpu', 'intel', 'amd']);
      if (matchedProducts.length > 0) {
        reply = 'Aquí tienes los mejores procesadores disponibles en stock:';
      } else {
        reply = 'Actualmente no disponemos de procesadores en stock. Prueba buscando memorias o periféricos.';
      }
    } 
    else if (cleanText.includes('movil') || cleanText.includes('iphone') || cleanText.includes('móvil') || cleanText.includes('samsung')) {
      matchedProducts = searchStock(['iphone', 'galaxy', 'pixel', 'xiaomi', 'oneplus']);
      if (matchedProducts.length > 0) {
        reply = 'Estos son los smartphones disponibles actualmente en el catálogo:';
      } else {
        reply = 'No hay móviles disponibles con stock en este momento.';
      }
    }
    else if (cleanText.includes('tablet') || cleanText.includes('ipad')) {
      matchedProducts = searchStock(['ipad', 'tab', 'lenovo tab', 'surface']);
      if (matchedProducts.length > 0) {
        reply = 'Tengo estas tablets disponibles ahora mismo:';
      } else {
        reply = 'No hay tablets disponibles en stock ahora.';
      }
    }
    else if (cleanText.includes('reloj') || cleanText.includes('watch') || cleanText.includes('wearable') || cleanText.includes('smartwatch')) {
      matchedProducts = searchStock(['watch', 'fitbit', 'gtr']);
      if (matchedProducts.length > 0) {
        reply = 'Mira estos relojes inteligentes en stock:';
      } else {
        reply = 'No nos quedan relojes disponibles en almacén.';
      }
    }
    else if (cleanText.includes('stock') || cleanText.includes('inventario') || cleanText.includes('disponible')) {
      matchedProducts = products.filter(p => p.stockQuantity > 0).slice(0, 3);
      reply = 'Claro, aquí tienes algunos productos destacados con stock disponible para entrega inmediata:';
    } 
    else if (cleanText.includes('envio') || cleanText.includes('entrega') || cleanText.includes('plazo') || cleanText.includes('24h')) {
      reply = 'En LogiTrack Shop enviamos todos los pedidos mediante mensajería urgente. La entrega es garantizada en 24 horas laborables en toda la península.';
    } 
    else if (cleanText.includes('factura') || cleanText.includes('pdf') || cleanText.includes('pago') || cleanText.includes('tarjeta')) {
      reply = 'Aceptamos pagos seguros con tarjeta bancaria. Al finalizar tu pedido, podrás descargar la factura en formato PDF directamente desde la sección "Mis Compras" en tu cuenta.';
    } 
    else {
      reply = 'No he entendido del todo tu solicitud. Puedes preguntarme cosas como "¿Tienes tarjetas gráficas?", "¿Cómo funciona el envío?" o pedirme que busque "procesadores".';
    }

    setIsTyping(false);
    setMessages(prev => [
      ...prev, 
      { id: Date.now(), sender: 'bot', text: reply, products: matchedProducts }
    ]);
  };

  if (isCartOpen || isCheckoutOpen) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 font-sans text-slate-800 dark:text-slate-200">
      
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 hover:bg-nord-accent text-white rounded-full w-12 h-12 shadow-2xl flex items-center justify-center hover:scale-110 transition-all cursor-pointer border border-white/10"
          aria-label="Abrir asistente de IA"
        >
          <span className="text-xl">💬</span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="w-[360px] h-[480px] bg-white dark:bg-nord-surface rounded-3xl shadow-2xl border border-gray-100 dark:border-[#333336] flex flex-col overflow-hidden animate-[slideIn_0.2s_ease-out]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-nord-surface dark:to-nord-bg p-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-nord-accent flex items-center justify-center text-white font-bold text-sm shadow-md">🤖</div>
              <div>
                <h4 className="text-xs font-black text-white">LogiBot</h4>
                <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">En línea · Soporte IA</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-nord-bg/20 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-nord-accent text-white rounded-tr-none' 
                    : 'bg-white dark:bg-nord-surface text-slate-800 dark:text-nord-text border border-gray-100 dark:border-[#333336] rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>

                {/* Inline product recommendations */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full space-y-2 mt-2">
                    {msg.products.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/producto/' + p.id);
                        }}
                        className="bg-white dark:bg-nord-surface p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-nord-accent/50 dark:hover:border-nord-accent flex items-center justify-between gap-3 cursor-pointer shadow-sm hover:shadow transition-all group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-mono text-nord-accent font-bold uppercase">{p.sku}</p>
                          <p className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate leading-tight mt-0.5">{p.name}</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-350 mt-1">{p.price}€</p>
                        </div>
                        <span className="text-xs text-slate-400 group-hover:text-nord-accent transition-colors shrink-0">Ver →</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-nord-surface rounded-xl border border-gray-100 dark:border-slate-800 w-16">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-nord-surface border-t border-gray-100 dark:border-slate-800 flex gap-2 shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-slate-50 dark:bg-nord-bg border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-nord-accent outline-none text-slate-900 dark:text-nord-text font-semibold"
            />
            <button 
              type="submit"
              className="bg-nord-accent hover:bg-nord-accent-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
            >
              Enviar
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
