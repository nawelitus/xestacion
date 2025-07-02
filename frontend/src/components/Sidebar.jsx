// Contenido para: src/components/Sidebar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import {
  LayoutDashboard, Box, Users, CreditCard, LogOut, X,
  UserCog, HandCoins, FileText, Fuel
} from 'lucide-react';

const Sidebar = ({ estaAbierto, alCerrar }) => {
  const { auth, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  // --- CAMBIO: La función ahora es asíncrona para esperar el logout ---
  const handleLogout = async () => {
    await cerrarSesion(); // Espera a que la sesión se cierre en el backend
    navigate('/');      // Redirige al login solo después de que se completó
  };

  const NavItem = ({ to, icon, children }) => (
    <NavLink
      to={to}
      end
      onClick={alCerrar}
      className={({ isActive }) =>
        `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-secundario text-texto-principal'
            : 'text-texto-secundario hover:bg-secundario/50 hover:text-texto-principal'
        }`
      }
    >
      {icon}
      <span className="ml-3">{children}</span>
    </NavLink>
  );

  return (
    <aside className={
      `w-64 bg-primario border-r border-borde
      flex flex-col fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0 ${estaAbierto ? 'translate-x-0' : '-translate-x-full'}`
    }>
      <div className="h-16 flex items-center justify-between px-4 border-b border-borde">
        <h1 className="text-xl font-bold text-texto-principal tracking-wide">
          G-Station
        </h1>
        <button onClick={alCerrar} className="text-texto-secundario md:hidden">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />}>Dashboard</NavItem>
        <NavItem to="/caja-diaria" icon={<Box size={20} />}>Caja Diaria</NavItem>
        <NavItem to="/cuentas-corrientes" icon={<CreditCard size={20} />}>Cuentas Corrientes</NavItem>
        <NavItem to="/adelantos" icon={<HandCoins size={20} />}>Adelantos</NavItem>
        <NavItem to="/axion-on" icon={<Fuel size={20} />}>Axion ON</NavItem> 
        <NavItem to="/cierres" icon={<FileText size={20} />}>Cierres Z</NavItem>

        {auth?.rol === 'administrador' && (
          <>
            <div className="my-2 border-t border-borde"></div>
            <NavItem to="/usuarios" icon={<UserCog size={20} />}>Gestión Usuarios</NavItem>
          </>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-borde">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-secundario flex items-center justify-center font-bold text-texto-principal">
            {auth?.nombre ? auth.nombre.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-texto-principal">{auth?.nombre}</p>
            <p className="text-xs text-texto-secundario capitalize">{auth?.rol}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-primario text-texto-secundario hover:bg-red-500/20 hover:text-red-400 transition-colors border border-borde hover:border-red-500/30"
        >
          <LogOut size={16} className="mr-2" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;