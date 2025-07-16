// src/components/ModalDetalleCaja.jsx

import React from 'react';
// ================================================================
// ▼▼▼ LÍNEAS AÑADIDAS ▼▼▼
// ================================================================
import { exportarDetalleCierrePDF } from '../utils/pdfGenerator'; // Se importa la función de exportación
import { X, FileText, Calendar, User, Clock, AlertTriangle, CheckCircle, Wallet, ShoppingCart, UserMinus, Download } from 'lucide-react'; // Se añade el icono Download
// ================================================================

// --- Helpers de formato (sin cambios) ---
const formatearMoneda = (valor) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(valor || 0);
};

const formatearFecha = (fechaString) => {
  if (!fechaString) return 'N/A';
  const fecha = new Date(fechaString);
  const offset = fecha.getTimezoneOffset();
  const fechaCorregida = new Date(fecha.getTime() + offset * 60 * 1000);
  return fechaCorregida.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// --- Componente de Sección de Detalles (sin cambios) ---
const DetalleSeccion = ({ titulo, items, columnas }) => {
    if (!items || items.length === 0) {
        return null;
    }
    const tieneImporte = columnas.some(c => c.key === 'importe' || c.key === 'monto');
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-md font-semibold text-gray-800 mb-0 border-b pb-1">{titulo}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columnas.map((col) => (
                                <th key={col.key} scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                {columnas.map((col) => (
                                    <td key={`${index}-${col.key}`} className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                        {col.isCurrency ? formatearMoneda(item[col.key]) : item[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    {tieneImporte && (
                        <tfoot>
                            <tr>
                                <td colSpan={columnas.length - 1} className="px-3 py-2 text-right text-sm font-bold text-gray-800">TOTAL</td>
                                <td className="px-3 py-2 text-left text-sm font-bold text-gray-900">
                                    {formatearMoneda(items.reduce((acc, item) => acc + (parseFloat(item.importe) || parseFloat(item.monto) || 0), 0))}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

// --- Componente DetalleProcesadoCard (sin cambios) ---
const DetalleProcesadoCard = ({ cabecera, creditos, retiros }) => {
  const columnasCreditos = [ { header: 'Item', key: 'item' }, { header: 'Importe', key: 'importe', isCurrency: true } ];
  const columnasRetiros = [ { header: 'Empleado', key: 'nombre_empleado' }, { header: 'Monto', key: 'monto', isCurrency: true } ];
  const dineroRecibido = cabecera.declarado_billetera_recibido || 0;
  const dineroEntregado = cabecera.declarado_billetera_entregado || 0;
  const diferenciaBilletera = dineroEntregado - dineroRecibido;
  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-md mb-6">
        <h2 className="text-xl font-bold text-blue-900 mb-2 border-b border-blue-200 pb-1">
            Resumen del Procesamiento de Caja
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-6">
                {creditos && creditos.length > 0 && (
                    <DetalleSeccion titulo={<><ShoppingCart size={18}/> Créditos y Vales</>} items={creditos} columnas={columnasCreditos} />
                )}
            </div>
            <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                     <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2"><Wallet size={18}/> Billetera Playero</h3>
                     <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Dinero Recibido:</span> <span className="font-medium">{formatearMoneda(dineroRecibido)}</span></div>
                        <div className="flex justify-between"><span>Dinero Entregado:</span> <span className="font-medium">{formatearMoneda(dineroEntregado)}</span></div>
                        <div className="flex justify-between border-t pt-2 mt-2 font-bold"><span>Diferencia Neta:</span> <span>{formatearMoneda(diferenciaBilletera)}</span></div>
                     </div>
                </div>
                {retiros && retiros.length > 0 && (
                     <DetalleSeccion titulo={<><UserMinus size={18}/> Retiros de Personal</>} items={retiros} columnas={columnasRetiros} />
                )}
            </div>
        </div>
    </div>
  )
};

/**
 * Componente principal del modal que muestra el detalle completo de un cierre de caja.
 */
const ModalDetalleCaja = ({ detalle, alCerrar }) => {

  const renderContenido = () => {
    if (!detalle || !detalle.cabecera) {
      return (
        <div className="flex flex-col justify-center items-center h-full p-10 text-center">
            <AlertTriangle className="mx-auto text-red-500" size={48} />
            <h3 className="mt-4 text-xl font-bold text-gray-800">Error de Datos</h3>
            <p className="text-gray-600 mt-2 max-w-md">No se pudo cargar la información del detalle de caja. La respuesta del servidor no tiene el formato esperado.</p>
            <p className="text-sm text-gray-500 mt-4">Por favor, verifica la respuesta de la API en la ruta <code className="bg-gray-200 text-gray-800 p-1 rounded">/api/caja/detalle/:id</code> del backend.</p>
        </div>
      );
    }
    
    const { cabecera } = detalle;
    
    const columnasGenericas = [ { header: 'Descripción', key: 'descripcion' }, { header: 'Importe', key: 'importe', isCurrency: true } ];
    const columnasMovimientos = [ { header: 'Comprobante', key: 'comprobante_nro' }, { header: 'Descripción', key: 'descripcion' }, { header: 'Importe', key: 'importe', isCurrency: true } ];
    const columnasTanques = [ { header: 'N° Tanque', key: 'numero_tanque' }, { header: 'Producto', key: 'producto' }, { header: 'Despachado (Lts)', key: 'despachado' } ];
    const columnasRemitos = [ { header: 'Nº Remito', key: 'concepto' }, { header: 'Cliente', key: 'cliente_nombre' }, { header: 'Importe', key: 'importe', isCurrency: true } ];

    return (
        <div className="p-4 sm:p-4">
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <p className="text-sm text-gray-500 mt-1">Cargado por {cabecera.usuario_carga_nombre} el {new Date(cabecera.fecha_carga).toLocaleString('es-AR')}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-1 rounded-full text-xs font-medium ${cabecera.caja_procesada ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {cabecera.caja_procesada ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                        <span>{cabecera.caja_procesada ? 'Caja Procesada' : 'Pendiente de Procesar'}</span>
                    </div>
                </div>
                <div className="mt-1  border-t pt-2 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Calendar className="text-blue-500" size={18} /><div><p className="font-semibold text-gray-800">Fecha del Turno</p><p className="text-gray-600">{formatearFecha(cabecera.fecha_turno)}</p></div></div>
                    <div className="flex items-center gap-2"><Clock className="text-blue-500" size={18} /><div><p className="font-semibold text-gray-800">Horario</p><p className="text-gray-600">{cabecera.hora_inicio} - {cabecera.hora_fin}</p></div></div>
                    <div className="flex items-center gap-2"><User className="text-blue-500" size={18} /><div><p className="font-semibold text-gray-800">Cerrado por</p><p className="text-gray-600">{cabecera.cerrado_por}</p></div></div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-2 mb-2">
               <div className="bg-teal-50 p-1 rounded-xl shadow-sm"><h4 className="font-semibold text-teal-800 text-sm">Total Bruto</h4><p className="text-xl font-bold text-teal-900">{formatearMoneda(cabecera.total_bruto)}</p></div>
               <div className="bg-orange-50 p-1 rounded-xl shadow-sm"><h4 className="font-semibold text-orange-800 text-sm">Total Gastos</h4><p className="text-xl font-bold text-orange-900">{formatearMoneda(cabecera.total_gastos)}</p></div>
               <div className="bg-blue-50 p-1 rounded-xl shadow-sm"><h4 className="font-semibold text-blue-800 text-sm">Total a Rendir (Z)</h4><p className="text-xl font-bold text-blue-900">{formatearMoneda(cabecera.total_a_rendir)}</p></div>
               
               {cabecera.caja_procesada ? (
                <>
                  <div className="bg-purple-50 p-1 rounded-xl shadow-sm"><h4 className="font-semibold text-purple-800 text-sm">Declarado (Final)</h4><p className="text-xl font-bold text-purple-900">{formatearMoneda(cabecera.declarado_total_final)}</p></div>
                  <div className={`${cabecera.diferencia_final < 0 ? 'bg-red-50' : 'bg-green-50'} p-1 rounded-xl shadow-sm`}>
                    <h4 className={`font-semibold ${cabecera.diferencia_final < 0 ? 'text-red-800' : 'text-green-800'} text-sm`}>Diferencia (Final)</h4>
                    <p className={`text-xl font-bold ${cabecera.diferencia_final < 0 ? 'text-red-900' : 'text-green-900'}`}>{formatearMoneda(cabecera.diferencia_final)}</p>
                  </div>
                </>
               ) : (
                <>
                  <div className="bg-indigo-50 p-1 rounded-xl shadow-sm"><h4 className="font-semibold text-indigo-800 text-sm">Total Remitos</h4><p className="text-xl font-bold text-indigo-900">{formatearMoneda(cabecera.total_remitos)}</p></div>
                  <div className="bg-red-50 p-1 rounded-xl shadow-sm"><h4 className="font-semibold text-red-800 text-sm">Faltante (Z)</h4><p className="text-xl font-bold text-red-900">{formatearMoneda(cabecera.total_faltante)}</p></div>
                </>
               )}
            </div>

            {cabecera.caja_procesada === 1 && (
                <DetalleProcesadoCard 
                    cabecera={cabecera} 
                    creditos={detalle.creditos} 
                    retiros={detalle.retiros} 
                />
            )}
            
            <h2 className="text-xl font-bold text-gray-800 mb-2 mt-6 border-b pb-2">
                Detalle Original del Cierre Z
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <DetalleSeccion titulo="Ingresos de Efectivo" items={detalle.ingresos || []} columnas={columnasMovimientos} />
                    <DetalleSeccion titulo="Tiradas" items={detalle.tiradas || []} columnas={columnasGenericas} />
                    <DetalleSeccion titulo="Remitos" items={detalle.remitos || []} columnas={columnasRemitos} />
                    <DetalleSeccion titulo="Ventas por Producto (Shop)" items={detalle.ventasPorProducto || []} columnas={columnasGenericas} />
                    <DetalleSeccion titulo="Bajas por Producto" items={detalle.bajasPorProducto || []} columnas={columnasGenericas} />
                    <DetalleSeccion titulo="Detalle de Tanques" items={detalle.detalleTanques || []} columnas={columnasTanques} />
                </div>
                <div className="flex flex-col gap-2">
                    <DetalleSeccion titulo="Gastos" items={detalle.gastos || []} columnas={columnasMovimientos} />
                    <DetalleSeccion titulo="Percepciones IIBB" items={detalle.percepcionesIIBB || []} columnas={columnasGenericas} />
                    <DetalleSeccion titulo="Cupones (Tarjetas de Cierre Z)" items={detalle.cupones || []} columnas={columnasGenericas} />
                    <DetalleSeccion titulo="MercadoPago" items={detalle.mercadoPago || []} columnas={columnasGenericas} />
                    <DetalleSeccion titulo="Axion ON" items={detalle.axionOn || []} columnas={columnasGenericas} />
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* ================================================================ */}
        {/* ▼▼▼ CABECERA DEL MODAL MODIFICADA ▼▼▼ */}
        {/* ================================================================ */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-gray-100/80 backdrop-blur-sm rounded-t-2xl z-10">
          <div className='flex items-center gap-4'>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText size={22} />
                Detalle del Cierre Z N° {detalle?.cabecera?.numero_z || '...'}
              </h2>
              <button 
                onClick={() => exportarDetalleCierrePDF(detalle)}
                className="bg-gray-700 hover:bg-gray-900 text-white font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 text-sm"
              >
                  <Download size={16} />
                  Exportar a PDF
              </button>
          </div>
          <button onClick={alCerrar} className="p-2 rounded-full hover:bg-gray-300 transition-colors">
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        {/* ================================================================ */}
        
        <div className="flex-grow overflow-y-auto">
            {renderContenido()}
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleCaja;