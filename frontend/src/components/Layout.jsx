import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header'; 

const Layout = () => {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <div className="relative min-h-screen md:flex bg-fondo text-texto-principal">
      {sidebarAbierto && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden" 
            onClick={() => setSidebarAbierto(false)}
        ></div>
      )}

      <Sidebar 
        estaAbierto={sidebarAbierto} 
        alCerrar={() => setSidebarAbierto(false)} 
      />

      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarAbierto(true)} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;