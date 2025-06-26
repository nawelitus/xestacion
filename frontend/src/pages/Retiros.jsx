import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { obtenerRetiros } from '../services/retiroService.js';
import { Loader, AlertTriangle, Users, Calendar, FilterX, FileText } from 'lucide-react';

// --- Componente de UI y Helper ---
const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);
const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

// --- Componente Principal ---
const Retiros = () => {
  const [retiros, setRetiros] = useState([]);
  const [estaCargando, setEstaCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para los filtros de fecha
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: ''
  });

  const cargarRetiros = useCallback(async () => {
    try {
      setEstaCargando(true);
      setError(null);
      const datos = await obtenerRetiros(filtros);
      setRetiros(datos);
    } catch (err) {
      setError('No se pudieron cargar los retiros. Por favor, intente más tarde.');
    } finally {
      setEstaCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarRetiros();
  }, [cargarRetiros]);

  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  const limpiarFiltros = () => {
    setFiltros({ fechaDesde: '', fechaHasta: '' });
  };
  
  const totalRetiros = retiros.reduce((sum, retiro) => sum + Number(retiro.monto), 0);

  const renderTabla = () => {
    if (estaCargando) {
      return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>;
    }
    if (error) {
      return (
        <div className="text-center py-10">
          <AlertTriangle className="mx-auto text-red-400" size={48} />
          <h2 className="mt-4 text-xl font-semibold">Error de Carga</h2>
          <p className="text-texto-secundario">{error}</p>
        </div>
      );
    }
    if (retiros.length === 0) {
        return (
            <div className="text-center py-16 bg-primario rounded-lg border border-borde">
                <Users className="mx-auto text-texto-secundario" size={48} />
                <h2 className="mt-4 text-xl font-semibold">No se encontraron retiros</h2>
                <p className="text-texto-secundario">Prueba a cambiar o limpiar los filtros de fecha.</p>
            </div>
        )
    }

    return (
      <div className="overflow-x-auto bg-primario rounded-lg border border-borde">
        <table className="w-full text-sm">
          <thead className="text-left text-texto-secundario uppercase">
            <tr>
              <th className="p-4">Fecha Turno</th>
              <th className="p-4">Descripción (Empleado)</th>
              <th className="p-4">Comprobante</th>
              <th className="p-4 text-right">Monto</th>
              <th className="p-4 text-center">Cierre Z</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {retiros.map(retiro => (
              <tr key={retiro.id}>
                <td className="p-4 whitespace-nowrap">{formatearFecha(retiro.fecha_turno)}</td>
                <td className="p-4 font-medium text-texto-principal">{retiro.descripcion}</td>
                <td className="p-4 text-texto-secundario">{retiro.comprobante_nro}</td>
                <td className="p-4 text-right font-semibold">{formatearMoneda(retiro.monto)}</td>
                <td className="p-4 text-center">
                   <Link to={`/dashboard/cierres/${retiro.cierre_z_id}`} className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1">
                      Ver <FileText size={14} />
                   </Link>
                </td>
              </tr>
            ))}
          </tbody>
           <tfoot className="bg-secundario">
                <tr>
                    <td colSpan="3" className="p-4 text-right font-bold uppercase text-texto-secundario">Total General:</td>
                    <td className="p-4 text-right font-bold text-lg text-texto-principal">{formatearMoneda(totalRetiros)}</td>
                    <td></td>
                </tr>
           </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-texto-principal">Retiros de Empleados</h1>
      
      {/* Barra de Filtros */}
      <div className="bg-primario p-4 rounded-lg border border-borde flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
            <Calendar className="text-texto-secundario" size={20}/>
            <label htmlFor="fechaDesde" className="text-sm font-medium text-texto-secundario">Desde:</label>
            <input type="date" name="fechaDesde" id="fechaDesde" value={filtros.fechaDesde} onChange={handleFiltroChange} className="bg-secundario border border-borde rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
         <div className="flex items-center gap-2">
            <label htmlFor="fechaHasta" className="text-sm font-medium text-texto-secundario">Hasta:</label>
            <input type="date" name="fechaHasta" id="fechaHasta" value={filtros.fechaHasta} onChange={handleFiltroChange} className="bg-secundario border border-borde rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <button onClick={limpiarFiltros} className="flex items-center gap-2 text-sm bg-secundario hover:bg-borde text-texto-secundario px-3 py-1.5 rounded-md transition-colors">
            <FilterX size={16} />
            Limpiar Filtros
        </button>
      </div>

      {renderTabla()}
    </div>
  );
};

export default Retiros;