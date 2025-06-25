import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Layout = () => {
  const { usuario, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-blue-600">G-Station</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-4">Hola, {usuario?.nombre}</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
