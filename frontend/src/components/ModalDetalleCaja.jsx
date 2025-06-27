import React from 'react';
import { X, Calendar, Hash, Banknote, Landmark, Users, ClipboardList } from 'lucide-react';

const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);
const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const SeccionDetalle = ({ titulo, icono, children }) => (
    <div className="bg-secundario p-4 rounded-lg">
        <h4 className="text-md font-semibold flex items-center gap-2 mb-2 text-texto-principal">
            {icono} {titulo}
        </h4>
        {children}
    </div>
);

const ModalDetalleCaja = ({ detalle, alCerrar }) => {
    if (!detalle) return null;
    
    const { cierre, billetera, creditos, retiros } = detalle;
    const diferenciaBilletera = (billetera?.entregado || 0) - (billetera?.recibido || 0);

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={alCerrar}>
            <div className="bg-primario rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-borde">
                    <h2 className="text-xl font-bold">Detalle de Caja Procesada - Z N° {cierre.cabecera.numero_z}</h2>
                    <button onClick={alCerrar} className="text-texto-secundario hover:text-white"><X /></button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="text-sm text-texto-secundario flex items-center gap-4">
                         <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatearFecha(cierre.cabecera.fecha_turno)}</span>
                         <span className="flex items-center gap-1.5"><Hash size={14} /> Total a Rendir (Z): {formatearMoneda(cierre.cabecera.total_a_rendir)}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SeccionDetalle titulo="Billetera Playero" icono={<Banknote size={18}/>}>
                           <p className="text-xs">Recibido: {formatearMoneda(billetera?.recibido)}</p>
                           <p className="text-xs">Entregado: {formatearMoneda(billetera?.entregado)}</p>
                           <p className="text-xs font-bold">Diferencia Neta: {formatearMoneda(diferenciaBilletera)}</p>
                        </SeccionDetalle>

                        <SeccionDetalle titulo="Retiros de Personal" icono={<Users size={18}/>}>
                            {retiros.length > 0 ? retiros.map(r => (
                                <div key={r.id} className="flex justify-between text-xs"><span>{r.nombre_empleado}</span><span>{formatearMoneda(r.monto)}</span></div>
                            )) : <p className="text-xs text-texto-secundario">Sin retiros</p>}
                        </SeccionDetalle>
                    </div>

                    <SeccionDetalle titulo="Créditos y Vales Declarados" icono={<Landmark size={18}/>}>
                       {creditos.length > 0 ? (
                           <table className="w-full text-xs"><tbody>
                           {creditos.map(c => (
                               <tr key={c.id}><td className="py-0.5">{c.item}</td><td className="text-right">{formatearMoneda(c.importe)}</td></tr>
                           ))}
                           </tbody></table>
                       ) : <p className="text-xs text-texto-secundario">Sin créditos declarados</p>}
                    </SeccionDetalle>
                </div>
                <div className="p-4 bg-secundario/50 mt-auto border-t border-borde text-center">
                    <button onClick={alCerrar} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalDetalleCaja;