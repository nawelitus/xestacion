// Contenido para: src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { obtenerDatosDashboard } from '../services/dashboardService';
import SubirCierre from '../components/SubirCierre';
import ActividadReciente from '../components/ActividadReciente'; 
import { Loader, AlertTriangle, ArrowUpRight, ArrowDownRight, Users, ShoppingCart, Smartphone, CalendarDays, AlertCircle } from 'lucide-react';

const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);

const TarjetaKPI = ({ titulo, valor, icono, color }) => (
    <div className={`bg-primario p-5 rounded-lg border border-borde flex items-start justify-between`}>
        <div>
            <p className="text-texto-secundario text-sm">{titulo}</p>
            <p className="text-2xl font-bold text-texto-principal mt-1">{valor}</p>
        </div>
        <div className={`p-2 rounded-md ${color}`}>
            {icono}
        </div>
    </div>
);

const Dashboard = () => {
    const { auth } = useAuth(); // Se cambia 'usuario' por 'auth' para consistencia
    const [datos, setDatos] = useState(null);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState(null);

    const cargarDatos = useCallback(async () => {
        try {
            // No es necesario comprobar 'datos' aquí, siempre recargamos al llamar
            setEstaCargando(true);
            const data = await obtenerDatosDashboard();
            setDatos(data);
        } catch (err) {
            setError("No se pudieron cargar los datos del dashboard.");
        } finally {
            setEstaCargando(false);
        }
    }, []); 

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    if (estaCargando) {
        return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>;
    }

    if (error || !datos) {
        return <div className="text-center py-10 bg-primario rounded-lg border border-borde"><AlertTriangle className="mx-auto text-red-400" size={48} /><h2 className="mt-4 text-xl font-semibold">{error || "No se pudieron cargar los datos."}</h2></div>;
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-texto-principal">¡Hola, {auth?.nombre}!</h1>
                <p className="text-texto-secundario mt-1">Bienvenido al panel de control de NaWeL.</p>
            </div>

            {/* --- CAMBIO: El grid ahora mostrará 8 tarjetas y se ajustará en pantallas extra grandes --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <TarjetaKPI 
                    titulo="Ventas (últimos 7 días)" 
                    valor={formatearMoneda(datos.kpis.ventas_semana)} 
                    icono={<ArrowUpRight />} 
                    color="bg-green-500/20 text-green-400"
                />
                <TarjetaKPI 
                    titulo="Adelantos (este mes)" 
                    valor={formatearMoneda(datos.kpis.retiros_mes_actual)} 
                    icono={<ArrowDownRight />}
                    color="bg-red-500/20 text-red-400"
                />
                 <TarjetaKPI 
                    titulo="Clientes Activos" 
                    valor={datos.kpis.total_clientes} 
                    icono={<Users />}
                    color="bg-blue-500/20 text-blue-400"
                />
                 <TarjetaKPI 
                    titulo="Deuda Total Clientes" 
                    valor={formatearMoneda(datos.kpis.deuda_total)} 
                    icono={<ArrowDownRight />}
                    color="bg-orange-500/20 text-orange-400"
                />
                {/* --- NUEVAS TARJETAS --- */}
                <TarjetaKPI 
                    titulo="Ventas de Ayer" 
                    valor={formatearMoneda(datos.kpis.ventas_ayer)} 
                    icono={<CalendarDays />} 
                    color="bg-purple-500/20 text-purple-400"
                />
                <TarjetaKPI 
                    titulo="MercadoPago (Hoy)" 
                    valor={formatearMoneda(datos.kpis.mercadopago_hoy)} 
                    icono={<Smartphone />}
                    color="bg-sky-500/20 text-sky-400"
                />
                <TarjetaKPI 
                    titulo="Ventas del Shop (Hoy)" 
                    valor={formatearMoneda(datos.kpis.shop_hoy)} 
                    icono={<ShoppingCart />}
                    color="bg-pink-500/20 text-pink-400"
                />
                <TarjetaKPI 
                    titulo="Faltante (Mes Actual)" 
                    valor={formatearMoneda(datos.kpis.faltante_mes)} 
                    icono={<AlertCircle />}
                    color="bg-amber-500/20 text-amber-400"
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-4">
                <div className="lg:col-span-3">
                    <ActividadReciente actividades={datos.actividadReciente} />
                </div>
                <div className="lg:col-span-2">
                    <SubirCierre onUploadSuccess={cargarDatos} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;