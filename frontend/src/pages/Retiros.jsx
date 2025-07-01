import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { obtenerResumenDeRetiros, obtenerDetalleDeRetiros } from '../services/empleadoService.js';
import { Loader, AlertTriangle, Users, ChevronsRight, ArrowLeft, PiggyBank, FileText, Calendar } from 'lucide-react';

const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);
const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const VistaDetalleEmpleado = ({ empleado, alVolver }) => {
    const [detalle, setDetalle] = useState([]);
    const [cargandoDetalle, setCargandoDetalle] = useState(true);

    useEffect(() => {
        const cargarDetalle = async () => {
            setCargandoDetalle(true);
            const datos = await obtenerDetalleDeRetiros(empleado.nombre_completo);
            setDetalle(datos);
            setCargandoDetalle(false);
        };
        cargarDetalle();
    }, [empleado]);

    return (
        <div className="space-y-4">
            <button onClick={alVolver} className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline">
                <ArrowLeft size={16} /> Volver a la lista
            </button>
            <div className="bg-primario p-4 rounded-lg border border-borde">
                <h2 className="text-xl font-bold">{empleado.nombre_completo}</h2>
                <p className="text-texto-secundario">Total de Adelantos: <span className="font-semibold text-red-400">{formatearMoneda(empleado.total_retirado)}</span></p>
            </div>
            {cargandoDetalle ? (
                <div className="text-center p-8"><Loader className="animate-spin" /></div>
            ) : (
                <div className="bg-primario rounded-lg border border-borde overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="text-left text-texto-secundario uppercase">
                            <tr>
                                <th className="p-3">Fecha de Registro</th>
                                <th className="p-3">Concepto</th>
                                <th className="p-3 text-right">Monto</th>
                                <th className="p-3 text-center">Origen del Adelanto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-borde">
                            {detalle.map((item, index) => (
                                <tr key={index}>
                                    <td className="p-3 whitespace-nowrap">{formatearFecha(item.fecha)}</td>
                                    <td className="p-3 text-texto-secundario">{item.concepto}</td>
                                    <td className="p-3 text-right font-semibold">{formatearMoneda(item.monto)}</td>
                                    <td className="p-3 text-center">
                                       {/* --- ÚNICO CAMBIO AQUÍ --- */}
                                       <Link to={`/cierre/${item.cierre_z_id}`} className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1.5" title="Ver detalle del Cierre Z de origen">
                                            <FileText size={14}/> Ver Origen
                                       </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {detalle.length === 0 && (
                        <p className="text-center text-texto-secundario p-6">Este empleado no tiene adelantos registrados.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const Retiros = () => {
    const [resumen, setResumen] = useState([]);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState(null);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

    useEffect(() => {
        const cargarResumen = async () => {
            try {
                setEstaCargando(true);
                setError(null);
                const datos = await obtenerResumenDeRetiros();
                setResumen(datos);
            } catch (err) {
                setError('No se pudo cargar el resumen de retiros.');
            } finally {
                setEstaCargando(false);
            }
        };
        cargarResumen();
    }, []);
    
    if (empleadoSeleccionado) {
        return <VistaDetalleEmpleado empleado={empleadoSeleccionado} alVolver={() => setEmpleadoSeleccionado(null)} />;
    }

    const renderContenidoPrincipal = () => {
        if (estaCargando) return <div className="text-center p-8"><Loader className="animate-spin" /></div>;
        if (error) return <div className="text-center p-8 text-red-400"><AlertTriangle className="mx-auto mb-2"/>{error}</div>;
        if (resumen.length === 0) return <div className="text-center p-8"><Users className="mx-auto mb-2"/>No hay empleados con retiros registrados.</div>;

        return (
            <div className="bg-primario rounded-lg border border-borde overflow-hidden">
                <ul className="divide-y divide-borde">
                    {resumen.map(empleado => (
                        <li key={empleado.id} onClick={() => setEmpleadoSeleccionado(empleado)} className="flex items-center justify-between p-4 hover:bg-secundario cursor-pointer transition-colors">
                            <span className="font-medium text-texto-principal">{empleado.nombre_completo}</span>
                            <div className="flex items-center gap-4">
                                <span className="text-red-400 font-semibold">{formatearMoneda(empleado.total_retirado)}</span>
                                <ChevronsRight className="text-texto-secundario" size={20}/>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-texto-principal">Adelantos de Personal</h1>
            {renderContenidoPrincipal()}
        </div>
    );
};

export default Retiros;