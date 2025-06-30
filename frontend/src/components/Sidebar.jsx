import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { LayoutDashboard, Box, Users, CreditCard, LogOut, X, UserCog, HandCoins } from 'lucide-react';

// ================================================================
// ARCHIVO: src/components/Sidebar.jsx (Versión Final Unificada)
//
// DESCRIPCIÓN:
// Combina el diseño responsivo del archivo del usuario con la lógica
// de roles para mostrar el enlace a "Gestión de Usuarios".
//
// CAMBIOS:
// 1.  Se usa la estructura y estilos del `Sidebar.jsx` proporcionado
//     por el usuario, que incluye la lógica para mostrarse/ocultarse
//     en dispositivos móviles (`estaAbierto`, `alCerrar`).
// 2.  Se reincorporan los iconos y nombres de G-Station.
// 3.  Se añade el enlace a "Gestión de Usuarios" (`/usuarios`),
//     protegido para que solo sea visible si `auth.rol` es 'administrador'.
// 4.  Se ajusta el `useAuth` para que coincida con la lógica de la app.
// ================================================================


const Sidebar = ({ estaAbierto, alCerrar }) => {
  // Se usa 'auth' y 'cerrarSesion' que son los nombres correctos en tu AuthContext.
  const { auth, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate('/'); // Opcional, ya que el contexto debería redirigir.
  };

  // Componente interno para los items de navegación, para mantener el código limpio.
  const NavItem = ({ to, icon, children }) => (
    <NavLink 
      to={to} 
      end 
      onClick={alCerrar}
      className={({ isActive }) =>
        `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-gray-800 text-white'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`
      }
    >
      {icon}
      <span className="ml-3">{children}</span>
    </NavLink>
  );

  return (
    <aside className={`
      w-64 bg-gray-900 border-r border-gray-700 flex flex-col
      fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0 
      ${estaAbierto ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">
          G-Station
        </h1>
        <button onClick={alCerrar} className="text-gray-400 md:hidden">
            <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />}>Dashboard</NavItem>
        <NavItem to="/caja-diaria" icon={<Box size={20} />}>Caja Diaria</NavItem>
        <NavItem to="/cuentas-corrientes" icon={<CreditCard size={20} />}>Cuentas Corrientes</NavItem>
        <NavItem to="/adelantos" icon={<HandCoins size={20} />}>Adelantos</NavItem>

        {/* ENLACE NUEVO - SOLO PARA ADMINISTRADORES */}
        {auth.rol === 'administrador' && (
          <>
            <div className="my-2 border-t border-gray-700"></div>
            <NavItem to="/usuarios" icon={<UserCog size={20} />}>Gestión Usuarios</NavItem>
          </>
        )}
      </nav>

      {/* Área de Usuario y Logout */}
      <div className="px-4 py-4 border-t border-gray-700">
         <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-blue-400">
            {auth.nombre ? auth.nombre.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{auth.nombre}</p>
            <p className="text-xs text-gray-400 capitalize">{auth.rol}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} className="mr-2" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
