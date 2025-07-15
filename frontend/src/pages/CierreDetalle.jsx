import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerDetallePorId } from '../services/cierreService';
import { ArrowLeft, FileText, Calendar, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

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

const DetalleSeccion = ({ titulo, items, columnas }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">{titulo}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columnas.map((col) => (
                <th key={col.key} scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columnas.map((col) => (
                  <td key={`${index}-${col.key}`} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {col.isCurrency ? formatearMoneda(item[col.key]) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
           <tfoot>
            <tr>
              <td colSpan={columnas.length - 1} className="px-4 py-2 text-right text-sm font-bold text-gray-800">TOTAL</td>
              <td className="px-4 py-2 text-left text-sm font-bold text-gray-900">
                {formatearMoneda(items.reduce((acc, item) => acc + (parseFloat(item.importe) || parseFloat(item.monto) || 0), 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const CierreDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cierre, setCierre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const obtenerDetalles = async () => {
      try {
        setLoading(true);
        const data = await obtenerDetallePorId(id);
        setCierre(data);
      } catch (err) {
        setError('No se pudieron cargar los detalles del cierre. Por favor, intente de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    obtenerDetalles();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Cargando detalles del cierre...</p></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (!cierre) {
    return <div className="text-center mt-10">No se encontraron datos para este cierre.</div>;
  }

  const { cabecera } = cierre;
  
  const columnasGenericas = [
    { header: 'Descripción', key: 'descripcion' },
    { header: 'Importe', key: 'importe', isCurrency: true },
  ];
  
  // --- DEFINICIÓN DE COLUMNAS CORREGIDA ---
  const columnasRemitos = [
    { header: 'Nº Remito', key: 'concepto' }, // 'concepto' ahora contiene el número de remito
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
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/cierres-z')}
          className="flex items-center gap-2 mb-4 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft size={18} />
          Volver a la lista de Cierres
        </button>

        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detalle del Cierre Z N° {cabecera.numero_z}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Cargado por {cabecera.usuario_carga_nombre} el {new Date(cabecera.fecha_carga).toLocaleString('es-AR')}
              </p>
            </div>
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${cabecera.caja_procesada ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {cabecera.caja_procesada ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              <span>{cabecera.caja_procesada ? 'Caja Procesada' : 'Pendiente de Procesar'}</span>
            </div>
          </div>
          <div className="mt-4 border-t pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-500" size={18} />
              <div>
                <p className="font-semibold text-gray-800">Fecha del Turno</p>
                <p className="text-gray-600">{formatearFecha(cabecera.fecha_turno)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-blue-500" size={18} />
              <div>
                <p className="font-semibold text-gray-800">Horario</p>
                <p className="text-gray-600">{cabecera.hora_inicio} - {cabecera.hora_fin}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="text-blue-500" size={18} />
              <div>
                <p className="font-semibold text-gray-800">Cerrado por</p>
                <p className="text-gray-600">{cabecera.cerrado_por}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-teal-100 p-4 rounded-xl shadow">
                <h4 className="font-semibold text-teal-800 text-sm">Total Bruto</h4>
                <p className="text-xl font-bold text-teal-900">{formatearMoneda(cabecera.total_bruto)}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-xl shadow">
                <h4 className="font-semibold text-blue-800 text-sm">Total a Rendir</h4>
                <p className="text-xl font-bold text-blue-900">{formatearMoneda(cabecera.total_a_rendir)}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-xl shadow">
                <h4 className="font-semibold text-red-800 text-sm">Faltante</h4>
                <p className="text-xl font-bold text-red-900">{formatearMoneda(cabecera.total_faltante)}</p>
            </div>
            <div className="bg-indigo-100 p-4 rounded-xl shadow">
                <h4 className="font-semibold text-indigo-800 text-sm">Total Remitos</h4>
                <p className="text-xl font-bold text-indigo-900">{formatearMoneda(cabecera.total_remitos)}</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-xl shadow">
                <h4 className="font-semibold text-orange-800 text-sm">Total Gastos</h4>
                <p className="text-xl font-bold text-orange-900">{formatearMoneda(cabecera.total_gastos)}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
                <DetalleSeccion titulo="Remitos" items={cierre.remitos} columnas={columnasRemitos} />
                <DetalleSeccion titulo="Gastos" items={cierre.gastos} columnas={columnasMovimientos} />
                <DetalleSeccion titulo="Ingresos" items={cierre.ingresos} columnas={columnasMovimientos} />
                <DetalleSeccion titulo="Ventas por Producto" items={cierre.ventasPorProducto} columnas={columnasGenericas} />
                <DetalleSeccion titulo="Bajas por Producto" items={cierre.bajasPorProducto} columnas={columnasGenericas} />
            </div>
            <div className="flex flex-col gap-6">
                <DetalleSeccion titulo="Cupones (Tarjetas)" items={cierre.cupones} columnas={columnasGenericas} />
                <DetalleSeccion titulo="MercadoPago" items={cierre.mercadoPago} columnas={columnasGenericas} />
                <DetalleSeccion titulo="Axion ON" items={cierre.axionOn} columnas={columnasGenericas} />
                <DetalleSeccion titulo="Tiradas" items={cierre.tiradas} columnas={columnasGenericas} />
                <DetalleSeccion titulo="Percepciones IIBB" items={cierre.percepcionesIIBB} columnas={columnasGenericas} />
                <DetalleSeccion titulo="Detalle de Tanques" items={cierre.detalleTanques} columnas={columnasTanques} />
            </div>
        </div>

      </div>
    </div>
  );
};

export default CierreDetalle;
