import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerDetallePorId } from '../services/cierreService';
import { ArrowLeft, Loader, AlertTriangle, Calendar, Clock, User, Hash, FileText, ShoppingCart, Fuel, ArrowDownRight, ClipboardList, CreditCard, Send, Users, Sparkles } from 'lucide-react';

const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);
const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const TarjetaResumen = ({ titulo, valor, icono }) => (
  <div className="bg-primario p-4 rounded-lg flex items-center gap-4 border border-borde">
    <div className="text-blue-400 p-2 rounded-md">{icono}</div>
    <div>
      <p className="text-sm text-texto-secundario">{titulo}</p>
      <p className="text-lg font-bold text-texto-principal">{valor}</p>
    </div>
  </div>
);

const SeccionContenedor = ({ titulo, icono, children, total }) => (
    <div className="bg-primario p-6 rounded-lg border border-borde flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
                {React.cloneElement(icono, { className: 'text-texto-secundario' })}
                <h2 className="text-xl font-semibold text-texto-principal">{titulo}</h2>
            </div>
            {total !== undefined && (
                <span className="text-lg font-bold text-acento-1">{formatearMoneda(total)}</span>
            )}
        </div>
        <div className="flex-grow overflow-y-auto max-h-96">{children}</div>
    </div>
);

const TablaGenerica = ({ headers, data, renderRow, sinDatosMensaje }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left">
      <thead className="bg-secundario text-xs text-texto-secundario uppercase sticky top-0">
        <tr>{headers.map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-borde">
        {data.length > 0 ? data.map(renderRow) : <tr><td colSpan={headers.length} className="text-center py-8 text-texto-secundario">{sinDatosMensaje}</td></tr>}
      </tbody>
    </table>
  </div>
);

const CierreDetalle = () => {
  const { id } = useParams();
  const [cierre, setCierre] = useState(null);
  const [estaCargando, setEstaCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        setEstaCargando(true); setError(null);
        const datos = await obtenerDetallePorId(id);
        setCierre(datos);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Cierre no encontrado.' : 'No se pudo cargar el detalle.');
      } finally {
        setEstaCargando(false);
      }
    };
    cargarDetalle();
  }, [id]);

  if (estaCargando) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>;
  if (error) return (
    <div className="text-center py-10"><AlertTriangle className="mx-auto text-red-400" size={48} /><h2 className="mt-4 text-xl font-semibold">{error}</h2></div>
  );
  if (!cierre) return null;

  const { cabecera, ventasCombustible, ventasShop, movimientosCaja, remitos } = cierre;
  const getMovimientosPorTipo = (tipo) => movimientosCaja.filter(m => m.tipo.toLowerCase() === tipo.toLowerCase());
  return (
    <div className="space-y-8">
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline mb-4"><ArrowLeft size={16} /> Volver</Link>
        <h1 className="text-3xl font-bold">Detalle del Cierre Z N° {cabecera.numero_z}</h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-texto-secundario text-sm">
          <span className="flex items-center gap-2"><Calendar size={14} /> {formatearFecha(cabecera.fecha_turno)}</span>
          <span className="flex items-center gap-2"><Clock size={14} /> {cabecera.hora_inicio} - {cabecera.hora_fin}</span>
          <span className="flex items-center gap-2"><User size={14} /> Cargado por: {cabecera.usuario_carga_nombre}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <TarjetaResumen titulo="Total Bruto" valor={formatearMoneda(cabecera.total_bruto)} icono={<FileText />} />
        <TarjetaResumen titulo="Total a Rendir" valor={formatearMoneda(cabecera.total_a_rendir)} icono={<Hash />} />
        <TarjetaResumen titulo="Total Remitos" valor={formatearMoneda(cabecera.total_remitos)} icono={<ClipboardList />} />
        <TarjetaResumen titulo="Total Gastos" valor={formatearMoneda(cabecera.total_gastos)} icono={<ArrowDownRight />} />
        <TarjetaResumen titulo="Total Cupones" valor={formatearMoneda(cabecera.total_cupones)} icono={<CreditCard />} />
        <TarjetaResumen titulo="Total MercadoPago" valor={formatearMoneda(cabecera.total_mercadopago)} icono={<Send />} />
        <TarjetaResumen titulo="Total Tiradas" valor={formatearMoneda(cabecera.total_tiradas)} icono={<Users />} />
        <TarjetaResumen titulo="Total Axion ON" valor={formatearMoneda(cabecera.total_axion_on)} icono={<Sparkles />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SeccionContenedor titulo="Ventas de Combustible" icono={<Fuel />} total={ventasCombustible.reduce((acc, item) => acc + Number(item.importe), 0)}>
            <TablaGenerica headers={['Producto', 'Litros', 'Importe']} data={ventasCombustible} sinDatosMensaje="Sin ventas de combustible."
              renderRow={(item) => (<tr key={item.id}><td className="px-4 py-2 font-medium">{item.producto_nombre}</td><td>{item.litros} Lts</td><td className="text-right">{formatearMoneda(item.importe)}</td></tr>)} />
          </SeccionContenedor>
          <SeccionContenedor titulo="Ventas del Shop" icono={<ShoppingCart />} total={ventasShop.reduce((acc, item) => acc + Number(item.importe), 0)}>
            <TablaGenerica headers={['Producto', 'Cant.', 'Importe']} data={ventasShop} sinDatosMensaje="Sin ventas en el Shop."
              renderRow={(item) => (<tr key={item.id}><td className="px-4 py-2 font-medium">{item.producto_nombre}</td><td>{item.cantidad}</td><td className="text-right">{formatearMoneda(item.importe)}</td></tr>)} />
          </SeccionContenedor>
          <SeccionContenedor titulo="Remitos" icono={<ClipboardList />} total={cabecera.total_remitos}>
            <TablaGenerica headers={['Cliente', 'Comprobante', 'Monto']} data={remitos} sinDatosMensaje="Sin remitos generados."
              renderRow={(item) => (<tr key={item.id}><td className="px-4 py-2 font-medium">{item.cliente_nombre}</td><td>{item.concepto}</td><td className="text-right">{formatearMoneda(item.monto)}</td></tr>)} />
          </SeccionContenedor>
          <SeccionContenedor titulo="Cupones (Tarjetas)" icono={<CreditCard />} total={cabecera.total_cupones}>
            <TablaGenerica headers={['Descripción', 'Monto']} data={getMovimientosPorTipo('TARJETAS')} sinDatosMensaje="Sin cupones registrados."
              renderRow={(item) => (<tr key={item.id}><td className="px-4 py-2 font-medium">{item.descripcion}</td><td className="text-right">{formatearMoneda(item.monto)}</td></tr>)} />
          </SeccionContenedor>
          <SeccionContenedor titulo="MercadoPago" icono={<Send />} total={cabecera.total_mercadopago}>
            <TablaGenerica headers={['Descripción', 'Monto']} data={getMovimientosPorTipo('MERCADOPAGO')} sinDatosMensaje="Sin movimientos de MercadoPago."
              renderRow={(item) => (<tr key={item.id}><td className="px-4 py-2 font-medium">{item.descripcion}</td><td className="text-right">{formatearMoneda(item.monto)}</td></tr>)} />
          </SeccionContenedor>
           <SeccionContenedor titulo="Tiradas (Retiros)" icono={<Users />} total={cabecera.total_tiradas}>
            <TablaGenerica headers={['Descripción', 'Comprobante', 'Monto']} data={getMovimientosPorTipo('TIRADAS')} sinDatosMensaje="Sin tiradas registradas."
              renderRow={(item) => (<tr key={item.id}><td className="px-4 py-2 font-medium">{item.descripcion}</td><td>{item.comprobante_nro}</td><td className="text-right">{formatearMoneda(item.monto)}</td></tr>)} />
          </SeccionContenedor>
           <SeccionContenedor titulo="Axion ON" icono={<Sparkles />} total={cabecera.total_axion_on}>
            <TablaGenerica headers={['Descripción', 'Monto']} data={getMovimientosPorTipo('AXION_ON')} sinDatosMensaje="Sin movimientos de Axion ON."
              renderRow={(item) => (<tr key={item.id}><td className="px-4 py-2 font-medium">{item.descripcion}</td><td className="text-right">{formatearMoneda(item.monto)}</td></tr>)} />
          </SeccionContenedor>
           <SeccionContenedor titulo="Gastos" icono={<ArrowDownRight />} total={cabecera.total_gastos}>
            <TablaGenerica headers={['Descripción', 'Comprobante', 'Monto']} data={getMovimientosPorTipo('GASTOS')} sinDatosMensaje="Sin gastos registrados."
              renderRow={(item) => (<tr key={item.id}><td className="px-4 py-2 font-medium">{item.descripcion}</td><td>{item.comprobante_nro}</td><td className="text-right">{formatearMoneda(item.monto)}</td></tr>)} />
          </SeccionContenedor>
      </div>
    </div>
  );
};

export default CierreDetalle;