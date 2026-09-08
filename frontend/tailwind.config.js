/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // === DARK MODE — Inmersión Profunda ===
        'dark-base': '#0B0C10',
        'dark-surface': '#13151A',
        'dark-elevated': '#1A1D24',
        'neon-cyan': '#00E5FF',
        'neon-cyan-dim': '#00B8D9',
        'cyber-yellow': '#FACC15',
        'electric-purple': '#B026FF',
        'electric-purple-dim': '#8B1FCE',

        // === LIGHT MODE — Energía Pura ===
        'light-base': '#FFFFFF',
        'light-surface': '#F8F9FA',
        'light-elevated': '#F1F3F5',
        'vercel-blue': '#0070F3',
        'vercel-blue-dark': '#0057BD',
        'fire-orange': '#FF4500',
        'fuchsia-hot': '#FF007F',

        // === Shared Neutrals ===
        'ink': '#0A0A0A',
        'ink-secondary': '#3D3D3D',
        'ghost': '#F1F1F3',
        'ghost-secondary': '#9CA3AF',
      },
      boxShadow: {
        // Dark mode glows
        'neon': '0 0 20px rgba(0, 229, 255, 0.35), 0 0 60px rgba(0, 229, 255, 0.12)',
        'neon-sm': '0 0 10px rgba(0, 229, 255, 0.4)',
        'neon-lg': '0 0 40px rgba(0, 229, 255, 0.5), 0 0 100px rgba(0, 229, 255, 0.2)',
        'purple-glow': '0 0 20px rgba(176, 38, 255, 0.4)',
        'yellow-glow': '0 0 20px rgba(250, 204, 21, 0.4)',
        // Light mode shadows
        'fire': '0 0 20px rgba(255, 69, 0, 0.3)',
        'blue-glow': '0 0 20px rgba(0, 112, 243, 0.3)',
        'fuchsia-glow': '0 0 20px rgba(255, 0, 127, 0.3)',
        // Universal card elevations
        'card': '0 4px 24px -4px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.04)',
        'card-hover': '0 24px 48px -12px rgba(0,0,0,0.18), 0 8px 24px -4px rgba(0,0,0,0.08)',
        'glass': '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-soft': 'cubic-bezier(0.175, 0.885, 0.32, 1.175)',
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'ticker-fast': 'ticker 15s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-led': 'pulse-led 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'spring-in': 'spring-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'noise': 'noise 0.2s steps(8) infinite',
      },
      keyframes: {
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(1deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-0.5deg)' },
        },
        'pulse-led': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 6px currentColor' },
          '50%': { opacity: '0.4', boxShadow: '0 0 0px currentColor' },
        },
        'glow-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px currentColor)' },
          '50%': { filter: 'drop-shadow(0 0 20px currentColor)' },
        },
        'spring-in': {
          '0%': { transform: 'scale(0.8) translateY(20px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        'xs': '4px',
        '3xl': '40px',
        '4xl': '60px',
      },
    },
  },
  plugins: [],
}