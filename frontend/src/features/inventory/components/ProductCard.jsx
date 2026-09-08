export const ProductCard = ({ product }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all flex flex-col">
    <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
      {/* Icono... */}
      <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 bg-white/90 rounded border">{product.sku}</span>
    </div>
    <div className="p-5">
      <h2 className="text-lg font-bold">{product.name}</h2>
      <p className="text-sm text-slate-500">{product.description}</p>
    </div>
  </div>
);