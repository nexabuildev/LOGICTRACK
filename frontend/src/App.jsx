import { useEffect, useState } from 'react'

function App() {
  // Estados para el listado
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)

  // Estado para controlar si el Modal está abierto o cerrado
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    stockQuantity: ''
  })

  // Estado para capturar los errores de validación que envíe el Backend
  const [formErrors, setFormErrors] = useState({})

  // Función para traer los productos (la separamos para poder reutilizarla)
  const fetchProducts = () => {
    fetch('http://localhost:8080/api/products')
      .then(response => {
        if (!response.ok) throw new Error('Error al conectar con el servidor')
        return response.json()
      })
      .then(data => {
        setProducts(data)
        setError(null)
      })
      .catch(err => setError(err.message))
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Manejar el cambio de texto en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    // Limpiar el error del campo conforme el usuario va escribiendo
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null })
    }
  }

  // Enviar el formulario al Backend
  const handleSubmit = (e) => {
    e.preventDefault()
    setFormErrors({}) // Resetear errores previos

    fetch('http://localhost:8080/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : null
      })
    })
    .then(async response => {
      const data = await response.json()
      
      if (!response.ok) {
        // Si el backend responde con 400 Bad Request, mapeamos los errores del GlobalExceptionHandler
        if (typeof data === 'object') {
          setFormErrors(data)
        } else {
          alert(data || "Error inesperado")
        }
        throw new Error("Validación fallida en el servidor")
      }
      
      return data
    })
    .then(() => {
      // ÉXITO: Recargamos los productos, cerramos el modal y limpiamos el formulario
      fetchProducts()
      setIsModalOpen(false)
      setFormData({ sku: '', name: '', description: '', price: '', stockQuantity: '' })
    })
    .catch(err => console.log("Petición detenida:", err.message))
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. Barra de Navegación */}
      <nav className="bg-slate-900 text-white shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 p-1.5 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              </div>
              <span className="font-bold text-xl tracking-wide">LogiTrack ERP</span>
            </div>
            <div>
              {/* Al hacer clic, abrimos el modal */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Nuevo Producto
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800">Inventario</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona tu catálogo y existencias en tiempo real.</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-md mb-6 shadow-sm">
            <p className="font-bold">Error de conexión</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {products.length === 0 && !error ? (
          <div className="flex justify-center items-center h-40 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-400 font-medium animate-pulse">No hay productos en el inventario o cargando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group flex flex-col">
                <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-200 border-b border-slate-100 flex items-center justify-center relative">
                  <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-600 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded shadow-sm border border-slate-200">
                    {product.sku}
                  </span>
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{product.name}</h2>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-slate-100 mt-auto">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Precio</p>
                      <span className="text-xl font-black text-slate-800">{product.price} €</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${product.stockQuantity > 10 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${product.stockQuantity > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {product.stockQuantity} uds
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 3. CAPA VENTANA MODAL (Sólo visible si isModalOpen === true) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden transform transition-all">
            
            {/* Cabecera del Modal */}
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Añadir Nuevo Producto</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Campo SKU */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">SKU *</label>
                <input 
                  type="text" name="sku" value={formData.sku} onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.sku || formErrors.error ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'}`}
                  placeholder="Ej: CPU-INTEL-13900"
                />
                {formErrors.sku && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.sku}</p>}
                {formErrors.error && formErrors.error.includes("SKU") && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.error}</p>}
              </div>

              {/* Campo Nombre */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre del Producto *</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.name ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'}`}
                  placeholder="Ej: Intel Core i9-13900K"
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.name}</p>}
              </div>

              {/* Campo Descripción */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Descripción</label>
                <textarea 
                  name="description" value={formData.description} onChange={handleInputChange} rows="2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                  placeholder="Detalles del componente de hardware..."
                />
              </div>

              {/* Fila Doble: Precio y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Precio (€) *</label>
                  <input 
                    type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.price ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'}`}
                    placeholder="0.00"
                  />
                  {formErrors.price && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Stock Inicial *</label>
                  <input 
                    type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${formErrors.stockQuantity ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'}`}
                    placeholder="0"
                  />
                  {formErrors.stockQuantity && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.stockQuantity}</p>}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                >
                  Guardar Producto
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default App