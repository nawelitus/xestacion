import React from 'react';
import SubirCierre from '../components/SubirCierre';
import { TrendingUp, Fuel, ShoppingCart } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-primario p-6 rounded-lg border border-borde">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-texto-secundario">{title}</p>
                <p className="text-2xl font-bold text-texto-principal mt-1">{value}</p>
            </div>
            <div className={`p-2 rounded-md ${color}`}>
                {icon}
            </div>
        </div>
    </div>
);


const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-texto-principal">Dashboard</h1>
        <p className="mt-1 text-texto-secundario">
          Resumen general de la operatoria de la estación.
        </p>
      </div>
      
      {/* Sección de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Ventas Totales Hoy" value="$1.250.340" icon={<TrendingUp />} color="bg-green-500/20 text-green-400" />
        <StatCard title="Litros Despachados" value="5,890 Lts" icon={<Fuel />} color="bg-blue-500/20 text-blue-400" />
        <StatCard title="Ventas del Shop" value="$125.800" icon={<ShoppingCart />} color="bg-purple-500/20 text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Columna principal con la subida de archivos */}
        <div className="lg:col-span-3">
            <SubirCierre />
        </div>
        
        {/* Columna secundaria con otra información */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-primario p-6 rounded-lg border border-borde">
                <h3 className="font-semibold text-texto-principal">Actividad Reciente</h3>
                <p className="text-sm text-texto-secundario mt-2">Próximamente: Últimos cierres cargados.</p>
            </div>
            <div className="bg-primario p-6 rounded-lg border border-borde">
                <h3 className="font-semibold text-texto-principal">Alertas del Sistema</h3>
                <p className="text-sm text-texto-secundario mt-2">Próximamente: Notificaciones importantes.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;