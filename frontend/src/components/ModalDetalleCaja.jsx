import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS'
}).format(monto || 0);

const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const BloqueInforme = ({ titulo, total, children, className = '' }) => (
  <div className={`bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-sm ${className}`}>
    <div className="flex justify-between items-baseline border-b border-slate-300 pb-2 mb-3">
      <h4 className="text-base font-bold text-gray-800">{titulo}</h4>
      {total !== undefined && <span className="text-base font-bold text-gray-900">{formatearMoneda(total)}</span>}
    </div>
    <div className="space-y-1">{children}</div>
  </div>
);

const FilaDato = ({ etiqueta, valor, valorClassName = '' }) => (
  <div className="flex justify-between text-sm text-gray-600">
    <span>{etiqueta}</span>
    <span className={`font-semibold text-gray-800 ${valorClassName}`}>{valor}</span>
  </div>
);

const TablaSimple = ({ data, headers, renderRow, sinDatosMensaje = "Sin ítems" }) => (
  <table className="w-full text-sm mt-2">
    <thead>
      <tr className="border-b border-slate-300">
        {headers.map((h, index) => (
          <th key={h} className={`text-left font-semibold py-1 pr-2 text-gray-600 ${index === headers.length - 1 ? 'text-right' : ''}`}>{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.length > 0 ? (
        data.map(renderRow)
      ) : (
        <tr>
          <td colSpan={headers.length} className="text-center py-4 text-gray-500">{sinDatosMensaje}</td>
        </tr>
      )}
    </tbody>
  </table>
);

const ModalDetalleCaja = ({ detalle, alCerrar }) => {
  const areaImprimibleRef = useRef(null);

  const handleImprimirConJsPDF = () => {
    const elementoParaImprimir = areaImprimibleRef.current;
    if (!elementoParaImprimir) return;

    const estilosOriginales = {
        maxHeight: elementoParaImprimir.style.maxHeight,
        overflowY: elementoParaImprimir.style.overflowY
    };

    elementoParaImprimir.style.maxHeight = 'none';
    elementoParaImprimir.style.overflowY = 'visible';
    
    html2canvas(elementoParaImprimir, {
        scale: 2,
        useCORS: true,
    }).then(canvas => {
        elementoParaImprimir.style.maxHeight = estilosOriginales.maxHeight;
        elementoParaImprimir.style.overflowY = estilosOriginales.overflowY;

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasHeight / canvasWidth;
        const imgWidth = pdfWidth - 20; 
        const imgHeight = imgWidth * ratio;

        let alturaRestante = imgHeight;
        let posicion = 10; 

        pdf.addImage(imgData, 'PNG', 10, posicion, imgWidth, imgHeight);
        alturaRestante -= (pdf.internal.pageSize.getHeight() - 20);

        while (alturaRestante > 0) {
            posicion -= (pdf.internal.pageSize.getHeight() - 20); 
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, posicion, imgWidth, imgHeight);
            alturaRestante -= (pdf.internal.pageSize.getHeight() - 20);
        }
        
        pdf.save(`Informe_Caja_Z${detalle.cierre.cabecera.numero_z}.pdf`);
    });
  };

  if (!detalle) return null;

  const { cierre, creditos, retiros } = detalle;
  const { cabecera } = cierre;
  const getMovimientosPorTipo = (tipo) =>
    cierre.movimientosCaja.filter((m) => m.tipo.toLowerCase() === tipo.toLowerCase());

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={alCerrar}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border border-gray-200" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Informe de Caja y Cierre Z N° {cabecera.numero_z}</h2>
          <div className="flex items-center gap-4">
             <button
              onClick={handleImprimirConJsPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md inline-flex items-center gap-2 transition-colors duration-200"
            >
              <Printer size={16} /> Imprimir / Guardar PDF
            </button>
            <button onClick={alCerrar} className="text-gray-500 hover:text-gray-900">
              <X />
            </button>
          </div>
        </div>

        <div ref={areaImprimibleRef} className="p-6 overflow-y-auto bg-white text-gray-800" style={{maxHeight: 'calc(95vh - 140px)'}}>
          <div className="space-y-6">
            
            <div className="text-center pb-4 border-b-2 border-gray-300">
              <h2 className="text-2xl font-bold text-gray-900">Informe de Operatoria de Turno</h2>
              <p className="text-gray-700">Cierre Z N°: <span className="font-semibold text-blue-600">{cabecera.numero_z}</span></p>
              <p className="text-sm text-gray-600">
                Fecha: <span className="font-semibold text-gray-800">{formatearFecha(cabecera.fecha_turno)}</span> | 
                Horario: <span className="font-semibold text-gray-800">{cabecera.hora_inicio} a {cabecera.hora_fin}</span>
              </p>
              <p className="text-sm text-gray-600">
                Responsable del Cierre: <span className="font-semibold text-gray-800">{cabecera.cerrado_por || 'No especificado'}</span>
              </p>
            </div>

            <fieldset className="border border-gray-300 p-4 rounded-lg">
              <legend className="px-2 font-semibold text-blue-600">Resumen de Conciliación</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div><p className="text-sm text-gray-500">Total a Rendir (Z)</p><p className="font-bold text-xl text-gray-800">{formatearMoneda(cabecera.total_a_rendir)}</p></div>
                <div><p className="text-sm text-gray-500">Total Declarado</p><p className="font-bold text-xl text-gray-800">{formatearMoneda(cabecera.declarado_total_final)}</p></div>
                <div>
                    <p className="text-sm text-gray-500">Diferencia</p>
                    <p className={`font-bold text-xl ${cabecera.diferencia_final < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {formatearMoneda(cabecera.diferencia_final)}
                    </p>
                </div>
              </div>
            </fieldset>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <BloqueInforme titulo="Conciliación Manual">
                  <FilaDato etiqueta="Dinero Recibido (Billetera)" valor={formatearMoneda(cabecera.declarado_billetera_recibido)} />
                  <FilaDato etiqueta="Dinero Entregado (Billetera)" valor={formatearMoneda(cabecera.declarado_billetera_entregado)} />
                  <FilaDato etiqueta="Total Créditos Manuales" valor={formatearMoneda(creditos.reduce((acc, c) => acc + Number(c.importe), 0))} />
                </BloqueInforme>
                <BloqueInforme titulo="Adelantos de Personal (Manuales)">
                  <TablaSimple headers={['Nombre', 'Monto']} data={retiros} renderRow={r => (
                    <tr key={r.id} className="border-b border-gray-200 last:border-none">
                      <td className="py-1.5">{r.nombre_empleado}</td>
                      <td className="text-right font-mono">{formatearMoneda(r.monto)}</td>
                    </tr>
                  )} />
                </BloqueInforme>
              </div>

              <div className="space-y-6">
                <BloqueInforme titulo="Resumen del Cierre Z">
                  <FilaDato etiqueta="Venta Bruta" valor={formatearMoneda(cabecera.total_bruto)} />
                  <FilaDato etiqueta="Total Remitos" valor={formatearMoneda(cabecera.total_remitos)} />
                  <FilaDato etiqueta="Total Cupones (Tarjetas)" valor={formatearMoneda(cabecera.total_cupones)} />
                  <FilaDato etiqueta="Total MercadoPago" valor={formatearMoneda(cabecera.total_mercadopago)} />
                  <FilaDato etiqueta="Total Tiradas" valor={formatearMoneda(cabecera.total_tiradas)} />
                  <FilaDato etiqueta="Total Gastos" valor={formatearMoneda(cabecera.total_gastos)} />
                </BloqueInforme>
              </div>
            </div>

            <fieldset className="border border-gray-300 p-4 rounded-lg">
              <legend className="px-2 font-semibold text-blue-600">Detalle Completo del Cierre Z</legend>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
                <BloqueInforme titulo="Ventas de Combustible" total={cierre.ventasCombustible.reduce((acc, item) => acc + Number(item.importe), 0)}>
                  <TablaSimple headers={['Producto', 'Litros', 'Importe']} data={cierre.ventasCombustible} renderRow={item => (
                    <tr key={item.id} className="border-b border-gray-200 last:border-none"><td className="py-1.5">{item.producto_nombre}</td><td className="font-mono">{item.litros} L</td><td className="text-right font-mono">{formatearMoneda(item.importe)}</td></tr>
                  )} />
                </BloqueInforme>
                <BloqueInforme titulo="Ventas del Shop" total={cierre.ventasShop.reduce((acc, item) => acc + Number(item.importe), 0)}>
                   <TablaSimple headers={['Producto', 'Cant.', 'Importe']} data={cierre.ventasShop} renderRow={item => (
                    <tr key={item.id} className="border-b border-gray-200 last:border-none"><td className="py-1.5">{item.producto_nombre}</td><td className="font-mono">{item.cantidad}</td><td className="text-right font-mono">{formatearMoneda(item.importe)}</td></tr>
                  )} />
                </BloqueInforme>
                <BloqueInforme titulo="Remitos" total={cabecera.total_remitos}>
                  <TablaSimple headers={['Cliente', 'Monto']} data={cierre.remitos} renderRow={item => (
                    <tr key={item.id} className="border-b border-gray-200 last:border-none"><td className="py-1.5">{item.cliente_nombre}</td><td className="text-right font-mono">{formatearMoneda(item.monto)}</td></tr>
                  )} />
                </BloqueInforme>
                <BloqueInforme titulo="Cupones (Tarjetas)" total={cabecera.total_cupones}>
                  <TablaSimple headers={['Descripción', 'Monto']} data={getMovimientosPorTipo('TARJETAS')} renderRow={item => (
                    <tr key={item.id} className="border-b border-gray-200 last:border-none"><td className="py-1.5">{item.descripcion}</td><td className="text-right font-mono">{formatearMoneda(item.monto)}</td></tr>
                  )} />
                </BloqueInforme>
                <BloqueInforme titulo="MercadoPago" total={cabecera.total_mercadopago}>
                  <TablaSimple headers={['Descripción', 'Monto']} data={getMovimientosPorTipo('MERCADOPAGO')} renderRow={item => (
                    <tr key={item.id} className="border-b border-gray-200 last:border-none"><td className="py-1.5">{item.descripcion}</td><td className="text-right font-mono">{formatearMoneda(item.monto)}</td></tr>
                  )} />
                </BloqueInforme>
                 <BloqueInforme titulo="Tiradas" total={cabecera.total_tiradas}>
                   <TablaSimple headers={['Descripción', 'Comprobante', 'Monto']} data={getMovimientosPorTipo('TIRADAS')} renderRow={item => (
                    <tr key={item.id} className="border-b border-gray-200 last:border-none"><td className="py-1.5">{item.descripcion}</td><td>{item.comprobante_nro}</td><td className="text-right font-mono">{formatearMoneda(item.monto)}</td></tr>
                  )} />
                </BloqueInforme>
                 <BloqueInforme titulo="Gastos" total={cabecera.total_gastos}>
                   <TablaSimple headers={['Descripción', 'Comprobante', 'Monto']} data={getMovimientosPorTipo('GASTOS')} renderRow={item => (
                     <tr key={item.id} className="border-b border-gray-200 last:border-none"><td className="py-1.5">{item.descripcion}</td><td>{item.comprobante_nro}</td><td className="text-right font-mono">{formatearMoneda(item.monto)}</td></tr>
                  )} />
                </BloqueInforme>
              </div>
            </fieldset>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-200 mt-auto flex justify-end items-center gap-4">
           <button
            onClick={alCerrar}
            className="bg-white hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleCaja;

