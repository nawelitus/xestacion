/**
 * ================================================================
 * ARCHIVO: src/pages/CierreDetalle.jsx (NUEVO)
 * DESCRIPCIÓN: Página que muestra la información completa y detallada
 * de un único Cierre Z.
 * ================================================================
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerDetallePorId } from '../services/cierreService';
import { ArrowLeft, Loader, AlertTriangle, Calendar, Clock, User, Hash, FileText, ShoppingCart, Fuel, ArrowDownRight, ArrowUpLeft, ClipboardList } from 'lucide-react';

// --- Helper Functions de Formato ---
const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

// --- Componentes de UI Pequeños y Reutilizables ---

const TarjetaResumen = ({ titulo, valor, icono }) => (
  <div className="bg-secundario p-4 rounded-lg flex items-center gap-4 border border-borde">
    <div className="bg-blue-500/20 text-blue-400 p-2 rounded-md">{icono}</div>
    <div>
      <p className="text-sm text-texto-secundario">{titulo}</p>
      <p className="text-lg font-bold text-texto-principal">{valor}</p>
    </div>
  </div>
);

const SeccionContenedor = ({ titulo, icono, children }) => (
  <div className="bg-primario p-6 rounded-lg border border-borde">
    <div className="flex items-center gap-3 mb-4">
      {React.cloneElement(icono, { className: 'text-texto-secundario' })}
      <h2 className="text-xl font-semibold text-texto-principal">{titulo}</h2>
    </div>
    {children}
  </div>
);

const TablaGenerica = ({ headers, data, renderRow }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left">
      <thead className="bg-secundario text-xs text-texto-secundario uppercase">
        <tr>
          {headers.map(h => <th key={h} className="px-4 py-3">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map(renderRow)
        ) : (
          <tr><td colSpan={headers.length} className="text-center py-4 text-texto-secundario">No hay datos en esta sección.</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

// --- Componente Principal de la Página ---

const CierreDetalle = () => {

  const { id } = useParams(); // Hook para obtener el 'id' de la URL (/cierres/:id)
  const [cierre, setCierre] = useState(null);
  const [estaCargando, setEstaCargando] = useState(true);
  const [error, setError] = useState(null);

    

  useEffect(() => {

    const cargarDetalle = async () => {
      try {
        setEstaCargando(true);
        setError(null);
        const datos = await obtenerDetallePorId(id);
        setCierre(datos);
      } catch (err) {
        const mensajeError = err.response?.status === 404
          ? 'Cierre no encontrado.'
          : 'No se pudo cargar el detalle. Intente más tarde.';
        setError(mensajeError);
      } finally {
        setEstaCargando(false);
      }
    };
    cargarDetalle();
  }, [id]); // Se ejecuta cada vez que el 'id' de la URL cambie

  if (estaCargando) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto text-red-400" size={48} />
        <h2 className="mt-4 text-xl font-semibold text-texto-principal">Error</h2>
        <p className="text-texto-secundario">{error}</p>
        <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
      </div>
    );
  }

  if (!cierre) return null; // No renderizar nada si no hay datos

  const { cabecera, ventasCombustible, ventasShop, movimientosCaja, remitos } = cierre;

  // Filtramos los movimientos de caja para separar gastos de otros movimientos
  const gastos = movimientosCaja.filter(m => m.tipo.toLowerCase() === 'gastos');

  return (
    <div className="space-y-8">
      {/* --- Cabecera de la Página --- */}
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline mb-4">
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-texto-principal">Detalle del Cierre Z N° {cabecera.numero_z}</h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-texto-secundario text-sm">
          <span className="flex items-center gap-2"><Calendar size={14} /> {formatearFecha(cabecera.fecha_turno)}</span>
          <span className="flex items-center gap-2"><Clock size={14} /> {cabecera.hora_inicio} - {cabecera.hora_fin}</span>
          <span className="flex items-center gap-2"><User size={14} /> Cargado por: {cabecera.usuario_carga_nombre}</span>
        </div>
      </div>

      {/* --- Grilla de Resumen --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TarjetaResumen titulo="Total Bruto" valor={formatearMoneda(cabecera.total_bruto)} icono={<ArrowUpLeft />} />
        <TarjetaResumen titulo="Total Gastos" valor={formatearMoneda(cabecera.total_gastos)} icono={<ArrowDownRight />} />
        <TarjetaResumen titulo="Total Remitos" valor={formatearMoneda(cabecera.total_remitos)} icono={<ClipboardList />} />
        <TarjetaResumen titulo="Total a Rendir" valor={formatearMoneda(cabecera.total_a_rendir)} icono={<Hash />} />
      </div>

      {/* --- Secciones Detalladas --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <SeccionContenedor titulo="Ventas de Combustible" icono={<Fuel />}>
            <TablaGenerica
              headers={['Producto', 'Litros', 'Importe']}
              data={ventasCombustible}
              renderRow={(item) => (
                <tr key={item.id} className="border-b border-borde hover:bg-secundario">
                  <td className="px-4 py-3 font-medium text-texto-principal">{item.producto_nombre}</td>
                  <td className="px-4 py-3">{item.litros} Lts</td>
                  <td className="px-4 py-3">{formatearMoneda(item.importe)}</td>
                </tr>
              )}
            />
          </SeccionContenedor>

          <SeccionContenedor titulo="Ventas del Shop" icono={<ShoppingCart />}>
            <TablaGenerica
              headers={['Producto', 'Cantidad', 'Importe']}
              data={ventasShop}
              renderRow={(item) => (
                <tr key={item.id} className="border-b border-borde hover:bg-secundario">
                  <td className="px-4 py-3 font-medium text-texto-principal">{item.producto_nombre}</td>
                  <td className="px-4 py-3">{item.cantidad}</td>
                  <td className="px-4 py-3">{formatearMoneda(item.importe)}</td>
                </tr>
              )}
            />
          </SeccionContenedor>
        </div>

        <div className="space-y-8">
          <SeccionContenedor titulo="Remitos (Cuentas Corrientes)" icono={<ClipboardList />}>
             <TablaGenerica
              headers={['Cliente', 'Concepto', 'Monto']}
              data={remitos}
              renderRow={(item) => (
                <tr key={item.id} className="border-b border-borde hover:bg-secundario">
                  <td className="px-4 py-3 font-medium text-texto-principal">{item.cliente_nombre}</td>
                  <td className="px-4 py-3 text-texto-secundario">{item.concepto}</td>
                  <td className="px-4 py-3">{formatearMoneda(item.monto)}</td>
                </tr>
              )}
            />
          </SeccionContenedor>

          <SeccionContenedor titulo="Gastos" icono={<ArrowDownRight />}>
             <TablaGenerica
              headers={['Descripción', 'Comprobante', 'Monto']}
              data={gastos}
              renderRow={(item) => (
                <tr key={item.id} className="border-b border-borde hover:bg-secundario">
                  <td className="px-4 py-3 font-medium text-texto-principal">{item.descripcion}</td>
                  <td className="px-4 py-3 text-texto-secundario">{item.comprobante_nro}</td>
                  <td className="px-4 py-3">{formatearMoneda(item.monto)}</td>
                </tr>
              )}
            />
          </SeccionContenedor>
        </div>
      </div>
    </div>
  );
};

export default CierreDetalle;