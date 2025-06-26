import React, { useState, useEffect, useCallback } from 'react';
import { obtenerResumenCaja } from '../services/cajaDiariaService.js';
import { Loader, AlertTriangle, Calendar, TrendingUp, TrendingDown, ClipboardList, Hash, Fuel, ShoppingCart } from 'lucide-react';

// --- Componentes de UI y Helpers ---

const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);

const TarjetaResumenDia = ({ titulo, valor, icono }) => (
  <div className="bg-primario p-4 rounded-lg flex items-center gap-4 border border-borde">
    <div className="bg-purple-500/20 text-purple-400 p-2 rounded-md">{icono}</div>
    <div>
      <p className="text-sm text-texto-secundario">{titulo}</p>
      <p className="text-lg font-bold text-texto-principal">{valor}</p>
    </div>
  </div>
);

const SeccionDetalle = ({ titulo, icono, children, contador }) => (
  <div className="bg-primario p-6 rounded-lg border border-borde">
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            {React.cloneElement(icono, { className: 'text-texto-secundario' })}
            <h2 className="text-xl font-semibold text-texto-principal">{titulo}</h2>
        </div>
        <span className="text-sm bg-secundario text-texto-secundario px-2 py-1 rounded-md">{contador} {contador === 1 ? 'ítem' : 'ítems'}</span>
    </div>
    {children}
  </div>
);

const TablaGenerica = ({ headers, data, renderRow, sinDatosMensaje }) => (
    <div className="overflow-x-auto max-h-96">
      <table className="w-full text-sm text-left">
        <thead className="bg-secundario text-xs text-texto-secundario uppercase sticky top-0">
          <tr>
            {headers.map(h => <th key={h} className="px-4 py-3">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-borde">
          {data.length > 0 ? (
            data.map(renderRow)
          ) : (
            <tr><td colSpan={headers.length} className="text-center py-8 text-texto-secundario">{sinDatosMensaje}</td></tr>
          )}
        </tbody>
      </table>
    </div>
);


// --- Componente Principal de la Página ---

const CajaDiaria = () => {
  // Estado para la fecha, por defecto la fecha actual en formato YYYY-MM-DD
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().slice(0, 10));
  const [datosCaja, setDatosCaja] = useState(null);
  const [estaCargando, setEstaCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarResumen = useCallback(async () => {
    try {
      setEstaCargando(true);
      setError(null);
      const respuesta = await obtenerResumenCaja(fechaSeleccionada);
      setDatosCaja(respuesta.data);
    } catch (err) {
      setError('No se pudo cargar el resumen del día. Intente recargar la página.');
    } finally {
      setEstaCargando(false);
    }
  }, [fechaSeleccionada]);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  const renderContenido = () => {
    if (estaCargando) {
      return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>;
    }

    if (error) {
      return (
        <div className="text-center py-10 bg-primario rounded-lg border border-borde">
          <AlertTriangle className="mx-auto text-red-400" size={48} />
          <h2 className="mt-4 text-xl font-semibold">Error de Carga</h2>
          <p className="text-texto-secundario">{error}</p>
        </div>
      );
    }
    
    if (!datosCaja || datosCaja.resumen.cantidad_cierres === 0) {
        return (
             <div className="text-center py-10 bg-primario rounded-lg border border-borde">
                <Calendar className="mx-auto text-texto-secundario" size={48} />
                <h2 className="mt-4 text-xl font-semibold">Sin Actividad</h2>
                <p className="text-texto-secundario">No se encontraron cierres para la fecha seleccionada.</p>
            </div>
        )
    }

    const { resumen, ventasCombustible, ventasShop, movimientosCaja, remitos } = datosCaja;
    const gastos = movimientosCaja.filter(m => m.tipo.toLowerCase() === 'gastos');

    return (
        <div className="space-y-8">
             {/* --- Grilla de Resumen --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <TarjetaResumenDia titulo="Venta Bruta Total" valor={formatearMoneda(resumen.total_bruto_dia)} icono={<TrendingUp />} />
                <TarjetaResumenDia titulo="Gastos Totales" valor={formatearMoneda(resumen.total_gastos_dia)} icono={<TrendingDown />} />
                <TarjetaResumenDia titulo="Remitos Totales" valor={formatearMoneda(resumen.total_remitos_dia)} icono={<ClipboardList />} />
                <TarjetaResumenDia titulo="Total a Rendir" valor={formatearMoneda(resumen.total_a_rendir_dia)} icono={<Hash />} />
            </div>

             {/* --- Secciones Detalladas --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <SeccionDetalle titulo="Ventas de Combustible" icono={<Fuel />} contador={ventasCombustible.length}>
                       <TablaGenerica 
                          headers={['Producto', 'Litros', 'Importe']}
                          data={ventasCombustible}
                          sinDatosMensaje="Sin ventas de combustible."
                          renderRow={(item) => (
                              <tr key={item.id}>
                                  <td className="px-4 py-2 font-medium">{item.producto_nombre}</td>
                                  <td className="px-4 py-2">{item.litros} Lts</td>
                                  <td className="px-4 py-2 text-right">{formatearMoneda(item.importe)}</td>
                              </tr>
                          )}
                       />
                    </SeccionDetalle>
                    <SeccionDetalle titulo="Gastos del Día" icono={<TrendingDown />} contador={gastos.length}>
                        <TablaGenerica 
                          headers={['Descripción', 'Comprobante', 'Monto']}
                          data={gastos}
                          sinDatosMensaje="Sin gastos registrados."
                          renderRow={(item) => (
                              <tr key={item.id}>
                                  <td className="px-4 py-2 font-medium">{item.descripcion}</td>
                                  <td className="px-4 py-2 text-texto-secundario">{item.comprobante_nro}</td>
                                  <td className="px-4 py-2 text-right">{formatearMoneda(item.monto)}</td>
                              </tr>
                          )}
                       />
                    </SeccionDetalle>
                </div>
                 <div className="space-y-8">
                    <SeccionDetalle titulo="Ventas del Shop" icono={<ShoppingCart />} contador={ventasShop.length}>
                       <TablaGenerica 
                          headers={['Producto', 'Cantidad', 'Importe']}
                          data={ventasShop}
                          sinDatosMensaje="Sin ventas en el Shop."
                          renderRow={(item) => (
                              <tr key={item.id}>
                                  <td className="px-4 py-2 font-medium">{item.producto_nombre}</td>
                                  <td className="px-4 py-2 text-center">{item.cantidad}</td>
                                  <td className="px-4 py-2 text-right">{formatearMoneda(item.importe)}</td>
                              </tr>
                          )}
                       />
                    </SeccionDetalle>
                     <SeccionDetalle titulo="Remitos del Día" icono={<ClipboardList />} contador={remitos.length}>
                        <TablaGenerica 
                          headers={['Cliente', 'Concepto', 'Monto']}
                          data={remitos}
                          sinDatosMensaje="Sin remitos generados."
                          renderRow={(item) => (
                              <tr key={item.id}>
                                  <td className="px-4 py-2 font-medium">{item.cliente_nombre}</td>
                                  <td className="px-4 py-2 text-texto-secundario">{item.concepto}</td>
                                  <td className="px-4 py-2 text-right">{formatearMoneda(item.monto)}</td>
                              </tr>
                          )}
                       />
                    </SeccionDetalle>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-texto-principal">Caja Diaria</h1>
            <p className="mt-1 text-texto-secundario">Resumen consolidado de la operatoria por fecha.</p>
        </div>
        <div className="relative">
            <input 
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="bg-primario border border-borde rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
        </div>
      </div>
      {renderContenido()}
    </div>
  );
};

export default CajaDiaria;