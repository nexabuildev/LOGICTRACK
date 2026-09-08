import { useState } from 'react';

export const ProductForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
    stock: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Datos enviados al backend:", formData);
    
    // Aquí es donde realizarás el fetch cuando conectes el backend
    // onSuccess(); // Se llamará cuando el fetch responda 200 OK
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">SKU</label>
        <input 
          type="text" 
          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          value={formData.sku}
          onChange={(e) => setFormData({...formData, sku: e.target.value})}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Nombre</label>
        <input 
          type="text" 
          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Precio</label>
          <input 
            type="number" 
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Stock</label>
          <input 
            type="number" 
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: e.target.value})}
          />
        </div>
      </div>
      
      <div className="flex gap-3 pt-2">
        <button 
          type="button" 
          onClick={onClose} // <-- AQUÍ SE USA onClose, el aviso desaparecerá
          className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-500 transition-colors"
        >
          Guardar Producto
        </button>
      </div>
    </form>
  );
};