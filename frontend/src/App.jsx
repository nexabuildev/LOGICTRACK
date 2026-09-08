import { useState } from 'react';
import { useProducts } from './features/inventory/hooks/useProducts';
import { ProductCard } from './features/inventory/components/ProductCard';
import { ProductModal } from './features/inventory/components/ProductModal';
import { Navbar } from './components/Navbar';

function App() {
  const { products, error, refreshProducts } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      
      <main className="w-full mx-auto px-6 lg:px-12 py-8">
        {/* Cabecera del Dashboard */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard de Inventario</h1>
          <p className="text-slate-500">Gestiona tus existencias de forma eficiente</p>
        </div>

        {/* Manejo de errores */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
            <strong>Error de conexión:</strong> {error}
          </div>
        )}

        {/* Estado: Inventario Vacío vs Con Productos */}
        {products.length === 0 && !error ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <h3 className="text-xl font-bold text-slate-400">Inventario vacío</h3>
            <p className="text-slate-400 mb-6">Aún no hay productos registrados en el sistema.</p>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-500 transition-all"
            >
              Añadir primer producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      {/* Modal de creación de productos */}
      {isModalOpen && (
        <ProductModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            refreshProducts();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default App;