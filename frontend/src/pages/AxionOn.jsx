// @MODIFICADO: src/pages/AxionOn.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { obtenerResumenAxionOn, obtenerDetalleAxionOn } from '../services/axionOnService.js';
import { Loader, AlertTriangle, Search, ArrowLeft, Fuel, Calendar } from 'lucide-react';

const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);
const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

// --- VISTA DE DETALLE (Sin cambios) ---
const VistaDetalle = ({ cierre, alVolver }) => {
    const [detalle, setDetalle] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDetalle = async () => {
            setCargando(true);
            const datos = await obtenerDetalleAxionOn(cierre.cierre_z_id);
            setDetalle(datos);
            setCargando(false);
        };
        cargarDetalle();
    }, [cierre]);

    return (
        <div className="space-y-4">
            <button onClick={alVolver} className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline">
                <ArrowLeft size={16} /> Volver al resumen
            </button>
            <div className="bg-primario p-4 rounded-lg border border-borde">
                <h2 className="text-xl font-bold">Detalle Axion ON - Cierre Z N° {cierre.numero_z}</h2>
                <p className="text-texto-secundario">
                    <Calendar size={14} className="inline mr-1" /> {formatearFecha(cierre.fecha_turno)} - 
                    <span className="font-semibold text-acento-1 ml-2">{formatearMoneda(cierre.total_axion_on)}</span>
                </p>
            </div>
            {cargando ? (
                <div className="text-center p-8"><Loader className="animate-spin" /></div>
            ) : (
                <div className="bg-primario rounded-lg border border-borde overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="text-left text-texto-secundario uppercase">
                            <tr><th className="p-3">Descripción</th><th className="p-3 text-right">Monto</th></tr>
                        </thead>
                        <tbody className="divide-y divide-borde">
                            {detalle.map((item) => (
                                <tr key={item.id}><td className="p-3">{item.descripcion}</td><td className="p-3 text-right font-semibold">{formatearMoneda(item.monto)}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};


// --- VISTA PRINCIPAL (MAESTRO) ---
const AxionOn = () => {
    const [resumen, setResumen] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [cierreSeleccionado, setCierreSeleccionado] = useState(null);

    // CAMBIO 1: 'filtros' guarda la selección del usuario en los inputs.
    const [filtros, setFiltros] = useState({ fechaDesde: '', fechaHasta: '' });
    // CAMBIO 2: 'filtrosAplicados' guarda los filtros que se usarán para la búsqueda.
    const [filtrosAplicados, setFiltrosAplicados] = useState({ fechaDesde: '', fechaHasta: '' });

    // CAMBIO 3: La función de carga ya no necesita useCallback y se define fuera del useEffect.
    const cargarResumen = async () => {
        try {
            setCargando(true);
            setError(null);
            // La búsqueda siempre usa los 'filtrosAplicados'.
            const datos = await obtenerResumenAxionOn(filtrosAplicados);
            setResumen(datos);
        } catch (err) {
            setError('No se pudo cargar el resumen de Axion ON.');
        } finally {
            setCargando(false);
        }
    };
    
    // CAMBIO 4: useEffect ahora depende de 'filtrosAplicados'. Se ejecuta al inicio y cada vez que se aplica un nuevo filtro.
    useEffect(() => {
        cargarResumen();
    }, [filtrosAplicados]);

    // CAMBIO 5: El botón de filtrar ahora actualiza los 'filtrosAplicados', lo que dispara el useEffect.
    const handleFiltrar = (e) => {
        e.preventDefault();
        setFiltrosAplicados(filtros);
    };

    if (cierreSeleccionado) {
        return <VistaDetalle cierre={cierreSeleccionado} alVolver={() => setCierreSeleccionado(null)} />;
    }

    const renderContenidoPrincipal = () => {
        if (cargando) return <div className="text-center p-8"><Loader className="animate-spin" /></div>;
        if (error) return <div className="text-center p-8 text-red-400"><AlertTriangle className="mx-auto mb-2"/>{error}</div>;
        if (resumen.length === 0) return <div className="text-center p-8 bg-primario rounded-lg border border-borde"><Fuel className="mx-auto mb-2"/>No hay registros de Axion ON para el período seleccionado.</div>;

        return (
            <div className="bg-primario rounded-lg border border-borde overflow-hidden">
                <ul className="divide-y divide-borde">
                    {resumen.map(item => (
                        <li key={item.cierre_z_id} onClick={() => setCierreSeleccionado(item)} className="flex items-center justify-between p-4 hover:bg-secundario cursor-pointer transition-colors">
                            <div>
                                <p className="font-bold text-texto-principal">Cierre Z N° {item.numero_z}</p>
                                <p className="text-sm text-texto-secundario"><Calendar size={14} className="inline mr-1" /> {formatearFecha(item.fecha_turno)}</p>
                            </div>
                            <span className="text-acento-1 font-semibold text-lg">{formatearMoneda(item.total_axion_on)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-texto-principal">Movimientos Axion ON</h1>
            
            <form onSubmit={handleFiltrar} className="flex flex-col md:flex-row items-center gap-4 bg-primario p-4 rounded-lg border border-borde">
                <div className="flex-1 w-full">
                    <label className="text-sm font-medium text-texto-secundario" htmlFor="fechaDesde">Desde</label>
                    <input type="date" id="fechaDesde" value={filtros.fechaDesde} onChange={e => setFiltros({...filtros, fechaDesde: e.target.value})} className="w-full bg-secundario border border-borde rounded-lg p-2 mt-1"/>
                </div>
                <div className="flex-1 w-full">
                    <label className="text-sm font-medium text-texto-secundario" htmlFor="fechaHasta">Hasta</label>
                    <input type="date" id="fechaHasta" value={filtros.fechaHasta} onChange={e => setFiltros({...filtros, fechaHasta: e.target.value})} className="w-full bg-secundario border border-borde rounded-lg p-2 mt-1"/>
                </div>
                <button type="submit" className="w-full md:w-auto self-end bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg flex items-center justify-center gap-2">
                    <Search size={16} /> Buscar
                </button>
            </form>

            {renderContenidoPrincipal()}
        </div>
    );
};

export default AxionOn;