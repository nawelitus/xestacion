// src/components/ModalDetalleCaja.jsx
import React, { useRef } from 'react';
import { X, Printer, User, Hash } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);
const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const ModalDetalleCaja = ({ detalle, alCerrar }) => {
  const ref = useRef(null);

  const exportarPDF = () => {
    const input = ref.current;
    if (!input) return;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    pdf.html(input, {
      callback: function (doc) {
        doc.save(`Informe_Caja_Z${detalle?.cierre?.cabecera?.numero_z}.pdf`);
      },
      margin: [10, 10, 10, 10],
      width: 190,
      windowWidth: input.scrollWidth
    });
  };

  if (!detalle) return null;
  const { cierre, creditos, retiros } = detalle;
  const { cabecera } = cierre;
  const getMovimientosPorTipo = (tipo) => cierre.movimientosCaja.filter(m => m.tipo.toLowerCase() === tipo.toLowerCase());

  const Bloque = ({ titulo, children, total }) => (
    <div className="border border-gray-300 rounded-lg p-3 bg-white shadow-sm w-full h-full flex flex-col">
      <div className="flex justify-between items-center border-b pb-2 mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{titulo}</h3>
        {total !== undefined && <span className="text-sm font-semibold text-gray-800">{formatearMoneda(total)}</span>}
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );

  const Tabla = ({ headers, data, renderRow }) => (
    <table className="w-full text-xs">
      <thead><tr className="bg-gray-100">{headers.map(h => <th key={h} className="text-left p-1.5 font-semibold text-gray-600">{h}</th>)}</tr></thead>
      <tbody>{data.map(renderRow)}</tbody>
    </table>
  );

  const FilaResumen = ({ etiqueta, valor, color = 'text-gray-800' }) => (
    <div className="flex justify-between py-1 border-b border-gray-200">
      <span className="text-gray-600">{etiqueta}</span>
      <span className={`font-semibold ${color}`}>{formatearMoneda(valor)}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={alCerrar}>
      <div className="bg-white rounded-md shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-3 border-b bg-gray-50">
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2 text-gray-700'>
              <Hash size={18} />
              <h2 className="text-lg font-bold">Cierre Z N° {cabecera.numero_z}</h2>
            </div>
            <div className='flex items-center gap-2 text-gray-600'>
              <User size={18} />
              <span className='font-semibold'>Cerrado por: {cabecera.cerrado_por || 'No especificado'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportarPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm rounded flex items-center gap-2">
              <Printer size={16} /> Exportar
            </button>
            <button onClick={alCerrar} className="text-gray-500 hover:text-black"><X /></button>
          </div>
        </div>

        <div className="overflow-y-auto">
          <div ref={ref} className="p-4 bg-white text-black text-sm space-y-3">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-2">
                <div className="p-2 bg-gray-50 rounded-lg border">
                    <p className="text-gray-600 text-xs">Fecha</p>
                    <p className="text-base font-semibold text-gray-800">{formatearFecha(cabecera.fecha_turno)}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg border">
                    <p className="text-gray-600 text-xs">Horario</p>
                    <p className="text-base font-semibold text-gray-800">{cabecera.hora_inicio} - {cabecera.hora_fin}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg border">
                    <p className="text-gray-600 text-xs">Cargado por</p>
                    <p className="text-base font-semibold text-gray-800">{cabecera.usuario_carga_nombre}</p>
                </div>
                 <div className="p-2 bg-gray-50 rounded-lg border">
                    <p className="text-gray-600 text-xs">Cerrado por</p>
                    <p className="text-base font-semibold text-gray-800">{cabecera.cerrado_por}</p>
                </div>
            </div>
            
            <div className="flex justify-around items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div><p className="text-gray-600 text-xs">Total a Rendir (Z)</p><p className="text-xl font-bold text-blue-700">{formatearMoneda(cabecera.total_a_rendir)}</p></div>
              <div><p className="text-gray-600 text-xs">Total Declarado</p><p className="text-xl font-bold text-green-600">{formatearMoneda(cabecera.declarado_total_final)}</p></div>
              <div><p className="text-gray-600 text-xs">Diferencia</p><p className={`text-xl font-bold ${cabecera.diferencia_final < 0 ? 'text-red-500' : 'text-green-500'}`}>{formatearMoneda(cabecera.diferencia_final)}</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Bloque titulo="Conciliación Manual">
                <div className="space-y-1.1">
                  <FilaResumen etiqueta="Dinero Recibido por playero" valor={cabecera.declarado_billetera_recibido} />
                  <FilaResumen etiqueta="Dinero Entregado por playero" valor={cabecera.declarado_billetera_entregado} />
                  <FilaResumen etiqueta="Dif. Billetera" valor={cabecera.declarado_billetera_entregado - cabecera.declarado_billetera_recibido} />
               {creditos && creditos.length > 0 ? (
                        creditos.map((credito, index) => (

                  <FilaResumen etiqueta={credito.item}valor={(credito.importe)} />

     ))
                    ) : (
                        <p className="text-xs text-gray-500 text-center italic mt-1">No se registraron créditos manuales.</p>
                    )}
             
                </div>
                
           
                {/* --- FIN: Detalle de Créditos Manuales --- */}
              </Bloque>

              <Bloque titulo="Resumen del Cierre Z">
                  <div className="space-y-1.5">
                      <FilaResumen etiqueta="Venta Bruta" valor={cabecera.total_bruto} color="text-blue-600" />
                      <FilaResumen etiqueta="Total Remitos" valor={cabecera.total_remitos} />
                      <FilaResumen etiqueta="Total Cupones" valor={cabecera.total_cupones} />
                      <FilaResumen etiqueta="Total MercadoPago" valor={cabecera.total_mercadopago} />
                      <FilaResumen etiqueta="Total Tiradas" valor={cabecera.total_tiradas} />
                      <FilaResumen etiqueta="Total Gastos" valor={cabecera.total_gastos} />
                      <FilaResumen etiqueta="Total Axion ON" valor={cabecera.total_axion_on} />
                  </div>
              </Bloque>

              <Bloque titulo="Retiros de Personal" total={retiros.reduce((acc, r) => acc + Number(r.monto), 0)}>
                <Tabla headers={["Empleado", "Monto"]} data={retiros} renderRow={(r, i) => (<tr key={i}><td className="p-1.5">{r.nombre_empleado}</td><td className="p-1.5 text-right">{formatearMoneda(r.monto)}</td></tr>)}/>
              </Bloque>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Bloque titulo="Ventas de Combustible" total={cierre.ventasCombustible.reduce((acc, item) => acc + Number(item.importe), 0)}>
                 <Tabla headers={["Producto", "Litros", "Importe"]} data={cierre.ventasCombustible} renderRow={(v, i) => (<tr key={i}><td className="p-1.5">{v.producto_nombre}</td><td className="p-1.5">{(Number(v.litros) || 0).toFixed(2)}</td><td className="p-1.5 text-right">{formatearMoneda(v.importe)}</td></tr>)}/>
              </Bloque>
              <Bloque titulo="Ventas Shop" total={cierre.ventasShop.reduce((acc, item) => acc + Number(item.importe), 0)}>
                 <Tabla headers={["Producto", "Cant.", "Importe"]} data={cierre.ventasShop} renderRow={(v, i) => (<tr key={i}><td className="p-1.5">{v.producto_nombre}</td><td className="p-1.5">{v.cantidad}</td><td className="p-1.5 text-right">{formatearMoneda(v.importe)}</td></tr>)}/>
              </Bloque>
              <Bloque titulo="Remitos" total={cabecera.total_remitos}>
                 <Tabla headers={["Cliente", "Monto"]} data={cierre.remitos} renderRow={(r, i) => (<tr key={i}><td className="p-1.5">{r.cliente_nombre}</td><td className="p-1.5 text-right">{formatearMoneda(r.monto)}</td></tr>)}/>
              </Bloque>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Bloque titulo="Cupones (Tarjetas)" total={cabecera.total_cupones}>
                 <Tabla headers={["Descripción", "Monto"]} data={getMovimientosPorTipo('TARJETAS')} renderRow={(m, i) => (<tr key={i}><td className="p-1.5">{m.descripcion}</td><td className="p-1.5 text-right">{formatearMoneda(m.monto)}</td></tr>)}/>
              </Bloque>
              <Bloque titulo="MercadoPago" total={cabecera.total_mercadopago}>
                 <Tabla headers={["Descripción", "Monto"]} data={getMovimientosPorTipo('MERCADOPAGO')} renderRow={(m, i) => (<tr key={i}><td className="p-1.5">{m.descripcion}</td><td className="p-1.5 text-right">{formatearMoneda(m.monto)}</td></tr>)}/>
              </Bloque>
               <Bloque titulo="AXION ON" total={cabecera.total_axion_on}>
                 <Tabla headers={["Descripción", "Monto"]} data={getMovimientosPorTipo('AXION_ON')} renderRow={(m, i) => (<tr key={i}><td className="p-1.5">{m.descripcion}</td><td className="p-1.5 text-right">{formatearMoneda(m.monto)}</td></tr>)}/>
              </Bloque>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Bloque titulo="Gastos" total={cabecera.total_gastos}>
                 <Tabla headers={["Descripción", "Monto"]} data={getMovimientosPorTipo('GASTOS')} renderRow={(m, i) => (<tr key={i}><td className="p-1.5">{m.descripcion}</td><td className="p-1.5 text-right">{formatearMoneda(m.monto)}</td></tr>)}/>
              </Bloque>
              <Bloque titulo="Tiradas" total={cabecera.total_tiradas}>
                 <Tabla headers={["Descripción", "Monto"]} data={getMovimientosPorTipo('TIRADAS')} renderRow={(m, i) => (<tr key={i}><td className="p-1.5">{m.descripcion}</td><td className="p-1.5 text-right">{formatearMoneda(m.monto)}</td></tr>)}/>
              </Bloque>
              <Bloque titulo="Percepciones IIBB" total={cierre.movimientosCaja.filter(m => m.tipo === 'PERCEPCIONES_IIBB').reduce((acc, m) => acc + Number(m.monto), 0)}>
                 <Tabla headers={["Descripción", "Monto"]} data={getMovimientosPorTipo('PERCEPCIONES_IIBB')} renderRow={(m, i) => (<tr key={i}><td className="p-1.5">{m.descripcion}</td><td className="p-1.5 text-right">{formatearMoneda(m.monto)}</td></tr>)}/>
              </Bloque>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleCaja;