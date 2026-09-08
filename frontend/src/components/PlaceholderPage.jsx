import React from 'react';

export default function PlaceholderPage({ title, description, icon }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-light-elevated dark:bg-dark-elevated rounded-3xl border border-black/5 dark:border-white/10 shadow-glass p-8 text-center animate-fade-in">
      <div className="text-6xl mb-6">{icon}</div>
      <h1 className="text-3xl font-display font-black text-ink dark:text-ghost mb-2 uppercase tracking-tight">
        {title}
      </h1>
      <p className="text-ink/60 dark:text-ghost/60 max-w-md mx-auto mb-8 font-medium">
        {description}
      </p>
      
      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-vercel-blue animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-vercel-blue animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-vercel-blue animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-sm font-mono font-bold uppercase tracking-widest text-vercel-blue">En Construcción</span>
      </div>
    </div>
  );
}
