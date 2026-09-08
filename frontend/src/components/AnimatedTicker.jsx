/**
 * AnimatedTicker.jsx
 * Infinite horizontal scrolling ticker for guarantees, system notices, etc.
 * Usage: <AnimatedTicker items={['✓ Garantía 2 años', '⚡ Envío 24h']} speed="normal" />
 */

export default function AnimatedTicker({ 
  items = [], 
  speed = 'normal', 
  className = '',
  separator = '—',
  dark = false
}) {
  const animClass = speed === 'fast' ? 'animate-ticker-fast' : 'animate-ticker';
  
  // Duplicate items so the ticker loops seamlessly
  const doubled = [...items, ...items];

  return (
    <div className={`ticker-wrapper overflow-hidden py-3 relative ${className}`}>
      {/* Fade masks on edges */}
      <div className={`absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none ${
        dark 
          ? 'bg-gradient-to-r from-dark-base to-transparent' 
          : 'bg-gradient-to-r from-light-surface to-transparent'
      }`} />
      <div className={`absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none ${
        dark 
          ? 'bg-gradient-to-l from-dark-base to-transparent' 
          : 'bg-gradient-to-l from-light-surface to-transparent'
      }`} />

      <div className={`ticker-track ${animClass} flex items-center gap-0`}>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-6 pl-6">
            <span className={`text-xs font-mono font-bold uppercase tracking-[0.15em] whitespace-nowrap ${
              dark ? 'text-neon-cyan' : 'text-vercel-blue'
            }`}>
              {item}
            </span>
            <span className={`text-xs opacity-30 ${dark ? 'text-neon-cyan' : 'text-vercel-blue'}`}>
              {separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
