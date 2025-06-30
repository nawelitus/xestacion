import React, { useRef } from 'react';
import { X, Calendar, Hash, Banknote, Landmark, Users, Printer, FileText, Fuel, ShoppingCart, Send, Sparkles, ArrowDownRight, CreditCard, ClipboardList } from 'lucide-react';

// --- Componentes de UI y Helpers ---
const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);
const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const BloqueInforme = ({ titulo, total, children, className = '' }) => (
    <div className={`bg-secundario rounded-lg p-3 print:bg-gray-50 print:border print:border-gray-300 ${className}`}>
        <div className="flex justify-between items-baseline border-b border-borde/50 pb-2 mb-2">
            <h4 className="text-sm font-bold text-texto-principal print:text-black">{titulo}</h4>
            {total !== undefined && <span className="text-sm font-bold text-acento-1">{formatearMoneda(total)}</span>}
        </div>
        <div className="space-y-1">{children}</div>
    </div>
);
const FilaDato = ({ etiqueta, valor, className = '' }) => (
    <div className={`flex justify-between text-xs text-texto-secundario print:text-gray-700 ${className}`}>
        <span>{etiqueta}</span>
        <span className="font-semibold text-texto-principal print:text-black">{valor}</span>
    </div>
);
const TablaSimple = ({ data, headers, renderRow, sinDatosMensaje = "Sin ítems" }) => (
    <table className="w-full text-xs mt-2">
        <thead><tr className="border-b border-borde/50">{headers.map(h => <th key={h} className="text-left font-semibold py-1 pr-2">{h}</th>)}</tr></thead>
        <tbody>
            {data.length > 0 ? data.map(renderRow) : (
                <tr><td colSpan={headers.length} className="text-center py-4 text-texto-secundario">{sinDatosMensaje}</td></tr>
            )}
        </tbody>
    </table>
);

// --- Componente Principal ---
const ModalDetalleCaja = ({ detalle, alCerrar }) => {
    const areaImprimibleRef = useRef(null);

    const handleImprimir = () => {
        window.print();
    };

    if (!detalle) return null;
    
    // Los datos ahora vienen directamente del objeto 'cierre.cabecera'
    const { cierre, creditos, retiros } = detalle;
    const { cabecera } = cierre;
    
    // Ya no necesitamos 'useMemo' para recalcular. Leemos directamente de 'cabecera'.
    
    const getMovimientosPorTipo = (tipo) => cierre.movimientosCaja.filter(m => m.tipo.toLowerCase() === tipo.toLowerCase());

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 print-container" onClick={alCerrar}>
            <div className="bg-primario rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col printable-modal" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-borde no-print">
                    <h2 className="text-xl font-bold">Informe de Caja y Cierre Z N° {cabecera.numero_z}</h2>
                    <button onClick={alCerrar} className="text-texto-secundario hover:text-white"><X /></button>
                </div>
                
                <div ref={areaImprimibleRef} className="p-6 overflow-y-auto bg-primario print:bg-white">
                    <div className="space-y-4">
                        <div className="text-center pb-4 border-b-2 border-borde">
                            <h2 className="text-2xl font-bold text-texto-principal">Informe de Operatoria de Turno</h2>
                            <p className="text-texto-secundario">Cierre Z N°: <span className="font-semibold text-texto-principal">{cabecera.numero_z}</span></p>
                            <p className="text-sm text-texto-secundario">
                                Fecha: <span className="font-semibold text-texto-principal">{formatearFecha(cabecera.fecha_turno)}</span> | 
                                Horario: <span className="font-semibold text-texto-principal">{cabecera.hora_inicio} a {cabecera.hora_fin}</span>
                            </p>
                            <p className="text-sm text-texto-secundario">Responsable del Cierre: <span className="font-semibold text-texto-principal">{cabecera.cerrado_por || 'No especificado'}</span></p>
                        </div>

                        {/* --- Resumen de Conciliación (AHORA LEE DATOS GUARDADOS) --- */}
                        <fieldset className="border border-borde p-4 rounded-lg"><legend className="px-2 font-semibold text-acento-1">Resumen de Conciliación</legend>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div><p className="text-xs text-texto-secundario">Total a Rendir (Z)</p><p className="font-bold text-lg">{formatearMoneda(cabecera.total_a_rendir)}</p></div>
                                <div><p className="text-xs text-texto-secundario">Total Declarado</p><p className="font-bold text-lg">{formatearMoneda(cabecera.declarado_total_final)}</p></div>
                                <div><p className="text-xs text-texto-secundario">Diferencia</p><p className={`font-bold text-lg ${cabecera.diferencia_final < 0 ? 'text-red-400' : 'text-green-400'}`}>{formatearMoneda(cabecera.diferencia_final)}</p></div>
                            </div>
                        </fieldset>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-4">
                                <BloqueInforme titulo="Conciliación Manual">
                                    <FilaDato etiqueta="Dinero Recibido (Billetera)" valor={formatearMoneda(cabecera.declarado_billetera_recibido)} />
                                    <FilaDato etiqueta="Dinero Entregado (Billetera)" valor={formatearMoneda(cabecera.declarado_billetera_entregado)} />
                                    <FilaDato etiqueta="Total Créditos Manuales" valor={formatearMoneda(creditos.reduce((acc, c) => acc + Number(c.importe), 0))} />
                                </BloqueInforme>
                                 <BloqueInforme titulo="Adelantos de Personal (Manuales)">
                                    <TablaSimple headers={['Nombre', 'Monto']} data={retiros} renderRow={r => (<tr key={r.id}><td>{r.nombre_empleado}</td><td className="text-right">{formatearMoneda(r.monto)}</td></tr>)} />
                                </BloqueInforme>
                            </div>
                             <div className="space-y-4">
                               <BloqueInforme titulo="Resumen del Cierre Z">
                                    <FilaDato etiqueta="Venta Bruta" valor={formatearMoneda(cabecera.total_bruto)} />
                                    <FilaDato etiqueta="Total Remitos" valor={formatearMoneda(cabecera.total_remitos)} />
                                    <FilaDato etiqueta="Total Cupones" valor={formatearMoneda(cabecera.total_cupones)} />
                                    <FilaDato etiqueta="Total MercadoPago" valor={formatearMoneda(cabecera.total_mercadopago)} />
                                    <FilaDato etiqueta="Total Tiradas" valor={formatearMoneda(cabecera.total_tiradas)} />
                                    <FilaDato etiqueta="Total Gastos" valor={formatearMoneda(cabecera.total_gastos)} />
                                </BloqueInforme>
                            </div>
                        </div>

                        <fieldset className="border border-borde p-4 rounded-lg"><legend className="px-2 font-semibold text-acento-1">Detalle Completo del Cierre Z</legend>
                            <div className="space-y-4">
                                <BloqueInforme titulo="Ventas de Combustible" total={cierre.ventasCombustible.reduce((acc, item) => acc + Number(item.importe), 0)}><TablaSimple headers={['Producto', 'Litros', 'Importe']} data={cierre.ventasCombustible} renderRow={item => (<tr key={item.id}><td>{item.producto_nombre}</td><td>{item.litros} L</td><td className="text-right">{formatearMoneda(item.importe)}</td></tr>)}/></BloqueInforme>
                                <BloqueInforme titulo="Ventas del Shop" total={cierre.ventasShop.reduce((acc, item) => acc + Number(item.importe), 0)}><TablaSimple headers={['Producto', 'Cant.', 'Importe']} data={cierre.ventasShop} renderRow={item => (<tr key={item.id}><td>{item.producto_nombre}</td><td>{item.cantidad}</td><td className="text-right">{formatearMoneda(item.importe)}</td></tr>)}/></BloqueInforme>
                                <BloqueInforme titulo="Remitos" total={cabecera.total_remitos}><TablaSimple headers={['Cliente', 'Monto']} data={cierre.remitos} renderRow={item => (<tr key={item.id}><td>{item.cliente_nombre}</td><td className="text-right">{formatearMoneda(item.monto)}</td></tr>)}/></BloqueInforme>
                                <BloqueInforme titulo="Cupones (Tarjetas)" total={cabecera.total_cupones}><TablaSimple headers={['Descripción', 'Monto']} data={getMovimientosPorTipo('TARJETAS')} renderRow={item => (<tr key={item.id}><td>{item.descripcion}</td><td className="text-right">{formatearMoneda(item.monto)}</td></tr>)}/></BloqueInforme>
                                <BloqueInforme titulo="MercadoPago" total={cabecera.total_mercadopago}><TablaSimple headers={['Descripción', 'Monto']} data={getMovimientosPorTipo('MERCADOPAGO')} renderRow={item => (<tr key={item.id}><td>{item.descripcion}</td><td className="text-right">{formatearMoneda(item.monto)}</td></tr>)}/></BloqueInforme>
                                <BloqueInforme titulo="Tiradas" total={cabecera.total_tiradas}><TablaSimple headers={['Descripción', 'Comprobante', 'Monto']} data={getMovimientosPorTipo('TIRADAS')} renderRow={item => (<tr key={item.id}><td>{item.descripcion}</td><td>{item.comprobante_nro}</td><td className="text-right">{formatearMoneda(item.monto)}</td></tr>)}/></BloqueInforme>
                                <BloqueInforme titulo="Gastos" total={cabecera.total_gastos}><TablaSimple headers={['Descripción', 'Comprobante', 'Monto']} data={getMovimientosPorTipo('GASTOS')} renderRow={item => (<tr key={item.id}><td>{item.descripcion}</td><td>{item.comprobante_nro}</td><td className="text-right">{formatearMoneda(item.monto)}</td></tr>)}/></BloqueInforme>
                            </div>
                        </fieldset>
                    </div>
                </div>

                <div className="p-4 bg-secundario/50 mt-auto border-t border-borde text-right space-x-4 no-print">
                    <button onClick={handleImprimir} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md inline-flex items-center gap-2">
                        <Printer size={16}/> Imprimir / Guardar PDF
                    </button>
                    <button onClick={alCerrar} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-md">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalDetalleCaja;