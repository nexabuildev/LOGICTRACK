import { ProductForm } from './ProductForm';

export const ProductModal = ({ onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Nuevo Producto</h2>
        
        {/* Aquí integramos el formulario real */}
        <ProductForm onClose={onClose} onSuccess={onSuccess} />

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};