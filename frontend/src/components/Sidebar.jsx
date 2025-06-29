import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
// Añadimos el icono de 'X' para el botón de cerrar
import { LayoutDashboard, Droplet, Users, CreditCard, LogOut, X } from 'lucide-react';

// Recibimos dos nuevas props: si está abierto y la función para cerrarlo
const Sidebar = ({ estaAbierto, alCerrar }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavItem = ({ to, icon, children }) => (
    <NavLink to={to} end onClick={alCerrar} /* Cierra el menú al hacer clic en un ítem en móvil */
      className={({ isActive }) =>
        `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-borde text-white'
            : 'text-texto-secundario hover:bg-borde/50 hover:text-white'
        }`
      }
    >
      {icon}
      <span className="ml-3">{children}</span>
    </NavLink>
  );

  return (
    // Clases condicionales para mostrar/ocultar en móvil
    <aside className={`
      w-64 bg-primario border-r border-borde flex flex-col
      fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0 
      ${estaAbierto ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-borde">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-acento-1 to-acento-2">
          NaWeL
        </h1>
        {/* Botón para cerrar el sidebar en móvil */}
        <button onClick={alCerrar} className="text-texto-secundario md:hidden">
            <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />}>Dashboard</NavItem>
        <NavItem to="/dashboard/caja" icon={<Droplet size={20} />}>Caja Diaria</NavItem>
        <NavItem to="/dashboard/cuentas-corrientes" icon={<CreditCard size={20} />}>Cuentas Corrientes</NavItem>
        <NavItem to="/dashboard/empleados" icon={<Users size={20} />}>Adelantos</NavItem>
      </nav>

      {/* Área de Usuario y Logout */}
      <div className="px-4 py-4 border-t border-borde">
         <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-acento-1 to-acento-2 flex items-center justify-center font-bold text-primario">
            {usuario?.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-texto-principal">{usuario?.nombre}</p>
            <p className="text-xs text-texto-secundario capitalize">{usuario?.rol}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-borde/50 text-texto-secundario hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} className="mr-2" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;