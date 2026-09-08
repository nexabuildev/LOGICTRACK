/**
 * FloatingBackground.jsx
 * Subtle floating particles / icons on the background canvas.
 * Supports dark mode (neon particles) and light mode (soft gradient orbs).
 */

import { useEffect, useRef } from 'react';

const DARK_ICONS = ['▲', '◆', '○', '▸', '✦', '⬡', '⊕', '◈'];
const LIGHT_ICONS = ['▲', '◆', '○', '▸', '✦', '⬡', '⊕', '◈'];

function createParticle(isDark) {
  const icon = isDark 
    ? DARK_ICONS[Math.floor(Math.random() * DARK_ICONS.length)]
    : LIGHT_ICONS[Math.floor(Math.random() * LIGHT_ICONS.length)];

  const colors = isDark
    ? ['#00E5FF', '#B026FF', '#FACC15', '#00B8D9']
    : ['#0070F3', '#FF007F', '#FF4500', '#0057BD'];
  
  const color = colors[Math.floor(Math.random() * colors.length)];

  return {
    icon,
    color,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 8 + Math.random() * 14,
    opacity: 0.04 + Math.random() * 0.06,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 6,
    rotate: Math.random() * 360,
  };
}

export default function FloatingBackground({ isDark = false, particleCount = 18 }) {
  const particles = Array.from({ length: particleCount }, () => createParticle(isDark));

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* Ambient gradient orbs */}
      {isDark ? (
        <>
          <div 
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ 
              background: 'radial-gradient(circle, #00E5FF 0%, transparent 70%)',
              filter: 'blur(60px)'
            }} 
          />
          <div 
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-8"
            style={{ 
              background: 'radial-gradient(circle, #B026FF 0%, transparent 70%)',
              filter: 'blur(80px)'
            }} 
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-5"
            style={{ 
              background: 'radial-gradient(circle, #FACC15 0%, transparent 70%)',
              filter: 'blur(100px)'
            }} 
          />
        </>
      ) : (
        <>
          <div 
            className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.04]"
            style={{ 
              background: 'radial-gradient(circle, #0070F3 0%, transparent 70%)',
              filter: 'blur(80px)'
            }} 
          />
          <div 
            className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full opacity-[0.03]"
            style={{ 
              background: 'radial-gradient(circle, #FF007F 0%, transparent 70%)',
              filter: 'blur(100px)'
            }} 
          />
        </>
      )}

      {/* Floating geometric particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            color: p.color,
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            transform: `rotate(${p.rotate}deg)`,
            fontFamily: 'monospace',
            lineHeight: 1,
          }}
        >
          {p.icon}
        </div>
      ))}
    </div>
  );
}
