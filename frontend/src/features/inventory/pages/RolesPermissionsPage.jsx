import { useState } from 'react';

export default function RolesPermissionsPage({ user }) {
  const rolesList = ['ADMIN', 'TECNICO', 'GESTOR_TIENDA', 'COMERCIAL'];
  
  // Custom mock configuration of permissions matrix for ERP
  const [matrix, setMatrix] = useState({
    'ADMIN': { read: true, write: true, delete: true, pos: true, settings: true },
    'TECNICO': { read: true, write: true, delete: false, pos: false, settings: false },
    'GESTOR_TIENDA': { read: true, write: true, delete: false, pos: true, settings: false },
    'COMERCIAL': { read: true, write: false, delete: false, pos: true, settings: false },
  });

  const togglePermission = (role, permission) => {
    if (role === 'ADMIN') return; // Admin always has full access
    setMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !prev[role][permission]
      }
    }));
  };

  const permissions = [
    { key: 'read', label: 'Ver Inventario', desc: 'Ver catálogo de productos y stock' },
    { key: 'write', label: 'Modificar Catálogo', desc: 'Crear, editar o deshabilitar productos' },
    { key: 'delete', label: 'Eliminación', desc: 'Eliminar productos y categorías permanentemente' },
    { key: 'pos', label: 'Acceso a TPV', desc: 'Vender y procesar cobros en el terminal' },
    { key: 'settings', label: 'Configuración', desc: 'Modificar datos de empresa y reglas' },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-ink dark:text-ghost">
      <div>
        <h2 className="text-2xl font-display font-black uppercase tracking-widest text-vercel-blue dark:text-neon-cyan">Roles y Permisos</h2>
        <p className="text-sm font-medium text-ink/50 dark:text-ghost/50">Configura los privilegios de los usuarios del sistema.</p>
      </div>

      <div className="bg-light-elevated dark:bg-dark-elevated rounded-2xl border border-black/5 dark:border-white/10 shadow-glass overflow-hidden">
        <div className="p-6 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest">// MATRIZ DE PERMISOS</h3>
        </div>

        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
              <tr>
                <th className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest w-[250px]">Funcionalidad</th>
                {rolesList.map(r => (
                  <th key={r} className="py-3.5 px-6 font-mono font-bold text-[10px] uppercase tracking-widest text-center">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {permissions.map(p => (
                <tr key={p.key} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold">{p.label}</p>
                    <p className="text-[10px] text-ink/40 dark:text-ghost/40 mt-0.5">{p.desc}</p>
                  </td>
                  {rolesList.map(role => {
                    const allowed = matrix[role][p.key];
                    return (
                      <td key={role} className="py-4 px-6 text-center">
                        <button 
                          onClick={() => togglePermission(role, p.key)}
                          disabled={role === 'ADMIN'}
                          className={`w-8 h-8 rounded-lg inline-flex items-center justify-center border transition-all cursor-pointer ${
                            allowed 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20' 
                              : 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20'
                          } disabled:opacity-80 disabled:cursor-not-allowed`}
                        >
                          {allowed ? '✓' : '✕'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex justify-between items-center">
          <p className="text-xs text-ink/40 dark:text-ghost/40 font-medium">Nota: El rol ADMIN tiene todos los permisos habilitados por defecto y no pueden revocarse.</p>
          <button 
            onClick={() => alert("Permisos guardados con éxito")}
            className="bg-vercel-blue hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer text-sm"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
