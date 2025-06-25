import React from 'react';
import SubirCierre from '../components/SubirCierre';

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
        <p className="mt-2 text-gray-600">
          ¡Bienvenido! Desde aquí podrás gestionar toda la información de la estación.
        </p>
      </div>
      
      {/* Componente para subir el archivo */}
      <SubirCierre />

      {/* Aquí podríamos añadir otros componentes del dashboard */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Resumen del Día</h2>
        <p className="mt-2 text-gray-500">Próximamente: Gráficos y estadísticas.</p>
      </div>
    </div>
  );
};

export default Dashboard;

