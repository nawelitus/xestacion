import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { obtenerResumenDeRetiros, obtenerDetalleDeRetiros } from '../services/empleadoService.js';
import { cancelarAdelanto } from '../services/retiroService.js';
import { Loader, AlertTriangle, Users, ChevronsRight, ArrowLeft, Trash2, FileText, Calendar } from 'lucide-react';

const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);
const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const VistaDetalleEmpleado = ({ empleado, alVolver }) => {
    const { auth } = useAuth(); // 1. OBTENER DATOS DE AUTENTICACIÓN
    const [detalle, setDetalle] = useState([]);
    const [cargandoDetalle, setCargandoDetalle] = useState(true);

    // Se envuelve en useCallback para poder llamarla desde el handler de cancelar
    const cargarDetalle = useCallback(async () => {
        if (!cargandoDetalle) setCargandoDetalle(true); // Mostrar loader al recargar
        try {
            const datos = await obtenerDetalleDeRetiros(empleado.nombre_completo);
            setDetalle(datos);
        } catch (error) {
            console.error("Error al cargar detalles de retiros", error);
            alert("No se pudieron recargar los detalles.");
        } finally {
            setCargandoDetalle(false);
        }
    }, [empleado.nombre_completo, cargandoDetalle]);

    useEffect(() => {
        cargarDetalle();
    }, [empleado.nombre_completo]); // Se ejecuta solo cuando cambia el empleado

    // 2. FUNCIÓN PARA MANEJAR LA CANCELACIÓN
    const handleCancelar = async (adelantoId) => {
        if (window.confirm('¿Estás seguro de que quieres cancelar este adelanto? Esta acción cambia su estado a "inactivo".')) {
            try {
                await cancelarAdelanto(adelantoId);
                alert('Adelanto cancelado con éxito.');
                cargarDetalle(); // Recargar la lista para reflejar el cambio
            } catch (error) {
                alert('Error al cancelar el adelanto. Inténtalo de nuevo.');
            }
        }
    };

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
                                <th className="p-3">Fecha</th>
                                <th className="p-3 text-right">Monto</th>
                                <th className="p-3 text-center">Estado</th>
                                <th className="p-3 text-center">Origen</th>
                                {/* 3. COLUMNA EXTRA PARA ADMINISTRADORES */}
                                {auth.rol === 'administrador' && <th className="p-3 text-center">Acción</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-borde">
                            {detalle.map((item) => (
                                <tr key={item.id} className={`${item.estado === 'inactivo' ? 'bg-red-900/20 opacity-50' : 'hover:bg-secundario/30'}`}>
                                    <td className="p-3 whitespace-nowrap">{formatearFecha(item.fecha)}</td>
                                    <td className="p-3 text-right font-semibold">{formatearMoneda(item.monto)}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.estado === 'activo' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {item.estado}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                       <Link to={`/cierre/${item.cierre_z_id}`} className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1.5" title="Ver Cierre Z de origen">
                                            <FileText size={14}/> Ver Origen
                                       </Link>
                                    </td>
                                    {/* 4. BOTÓN DE CANCELAR CONDICIONAL */}
                                    {auth.rol === 'administrador' && (
                                        <td className="p-3 text-center">
                                            {item.estado === 'activo' && (
                                                <button onClick={() => handleCancelar(item.id)} className="text-red-400 hover:text-red-300" title="Cancelar Adelanto">
                                                    <Trash2 size={16}/>
                                                </button>
                                            )}
                                        </td>
                                    )}
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