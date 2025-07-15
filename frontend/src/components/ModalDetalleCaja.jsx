import React from 'react';
import { X, FileText, Calendar, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

// --- Helpers de formato (se pueden mover a un archivo utils si se usan en más lugares) ---
const formatearMoneda = (valor) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(valor || 0);
};

const formatearFecha = (fechaString) => {
  if (!fechaString) return 'N/A';
  const fecha = new Date(fechaString);
  fecha.setDate(fecha.getDate() + 1);
  return fecha.toLocaleDateString('es-AR', {
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
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">{titulo}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columnas.map((col) => (
                <th key={col.key} scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
           <tfoot>
            <tr>
              <td colSpan={columnas.length - 1} className="px-3 py-2 text-right text-sm font-bold text-gray-800">TOTAL</td>
              <td className="px-3 py-2 text-left text-sm font-bold text-gray-900">
                {formatearMoneda(items.reduce((acc, item) => acc + (parseFloat(item.importe) || parseFloat(item.monto) || 0), 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// --- Componente Principal del Modal ---
const ModalDetalleCaja = ({ detalle, onClose }) => {
  // Si no hay detalle o cabecera, no se muestra nada para evitar errores.
  if (!detalle || !detalle.cabecera) {
    return null;
  }

  const { cabecera } = detalle;

  // Definición de columnas
  const columnasGenericas = [
    { header: 'Descripción', key: 'descripcion' },
    { header: 'Importe', key: 'importe', isCurrency: true },
  ];
  const columnasRemitos = [
    { header: 'Nº Remito', key: 'concepto' },
    { header: 'Cliente', key: 'cliente_nombre' },
    { header: 'Importe', key: 'importe', isCurrency: true },
  ];
  const columnasMovimientos = [
    { header: 'Comprobante', key: 'comprobante_nro' },
    { header: 'Descripción', key: 'descripcion' },
    { header: 'Importe', key: 'importe', isCurrency: true },
  ];
  const columnasTanques = [
    { header: 'N° Tanque', key: 'numero_tanque' },
    { header: 'Producto', key: 'producto' },
    { header: 'Despachado (Lts)', key: 'despachado' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Cabecera del Modal */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-gray-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={22} />
            Detalle del Cierre Z N° {cabecera.numero_z}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Contenido del Modal con Scroll */}
        <div className="p-4 overflow-y-auto">
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <p className="text-sm text-gray-500">
                        Cargado por {cabecera.usuario_carga_nombre} el {new Date(cabecera.fecha_carga).toLocaleString('es-AR')}
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${cabecera.caja_procesada ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {cabecera.caja_procesada ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                    <span>{cabecera.caja_procesada ? 'Caja Procesada' : 'Pendiente de Procesar'}</span>
                </div>
            </div>
            <div className="mt-3 border-t pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2"><Calendar className="text-blue-500" size={18} /><div><p className="font-semibold">Fecha</p><p>{formatearFecha(cabecera.fecha_turno)}</p></div></div>
              <div className="flex items-center gap-2"><Clock className="text-blue-500" size={18} /><div><p className="font-semibold">Horario</p><p>{cabecera.hora_inicio} - {cabecera.hora_fin}</p></div></div>
              <div className="flex items-center gap-2"><User className="text-blue-500" size={18} /><div><p className="font-semibold">Cerrado por</p><p>{cabecera.cerrado_por}</p></div></div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <div className="bg-teal-100 p-3 rounded-xl"><h4 className="font-semibold text-teal-800 text-xs">Total Bruto</h4><p className="text-lg font-bold text-teal-900">{formatearMoneda(cabecera.total_bruto)}</p></div>
            <div className="bg-blue-100 p-3 rounded-xl"><h4 className="font-semibold text-blue-800 text-xs">Total a Rendir</h4><p className="text-lg font-bold text-blue-900">{formatearMoneda(cabecera.total_a_rendir)}</p></div>
            <div className="bg-red-100 p-3 rounded-xl"><h4 className="font-semibold text-red-800 text-xs">Faltante</h4><p className="text-lg font-bold text-red-900">{formatearMoneda(cabecera.total_faltante)}</p></div>
            <div className="bg-indigo-100 p-3 rounded-xl"><h4 className="font-semibold text-indigo-800 text-xs">Total Remitos</h4><p className="text-lg font-bold text-indigo-900">{formatearMoneda(cabecera.total_remitos)}</p></div>
            <div className="bg-orange-100 p-3 rounded-xl"><h4 className="font-semibold text-orange-800 text-xs">Total Gastos</h4><p className="text-lg font-bold text-orange-900">{formatearMoneda(cabecera.total_gastos)}</p></div>
          </div>

          {/* --- CORRECCIÓN CLAVE: Se añade '|| []' a cada array --- */}
          {/* Esto asegura que si un array es undefined, se use un array vacío, evitando el error. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
                <DetalleSeccion titulo="Remitos" items={detalle.remitos || []} columnas={columnasRemitos} />
                <DetalleSeccion titulo="Gastos" items={detalle.gastos || []} columnas={columnasMovimientos} />
                <DetalleSeccion titulo="Ingresos" items={detalle.ingresos || []} columnas={columnasMovimientos} />
                <DetalleSeccion titulo="Ventas por Producto" items={detalle.ventasPorProducto || []} columnas={columnasGenericas} />
                <DetalleSeccion titulo="Bajas por Producto" items={detalle.bajasPorProducto || []} columnas={columnasGenericas} />
            </div>
            <div className="flex flex-col gap-4">
                <DetalleSeccion titulo="Cupones (Tarjetas)" items={detalle.cupones || []} columnas={columnasGenericas} />
                <DetalleSeccion titulo="MercadoPago" items={detalle.mercadoPago || []} columnas={columnasGenericas} />
                <DetalleSeccion titulo="Axion ON" items={detalle.axionOn || []} columnas={columnasGenericas} />
                <DetalleSeccion titulo="Tiradas" items={detalle.tiradas || []} columnas={columnasGenericas} />
                <DetalleSeccion titulo="Percepciones IIBB" items={detalle.percepcionesIIBB || []} columnas={columnasGenericas} />
                <DetalleSeccion titulo="Detalle de Tanques" items={detalle.detalleTanques || []} columnas={columnasTanques} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleCaja;
