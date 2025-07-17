// src/components/ModalCajaDiaria.jsx

import React, { useState, useMemo, useEffect } from "react";
import { procesarCajaDiaria } from "../services/cajaDiariaService";
import { obtenerTodosLosEmpleados, crearNuevoEmpleado } from "../services/empleadoService"; 
import { obtenerDetallePorId } from "../services/cierreService";
import ModalNuevoEmpleado from './ModalNuevoEmpleado';
import {
  X, Loader, Users, Banknote, Landmark, PlusCircle, Trash2, ChevronDown, 
  FileText, ClipboardCheck, TrendingUp, UserPlus, AlertCircle, HandCoins, FileSignature
} from "lucide-react";

const formatearMoneda = (monto) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(monto || 0);

const TarjetaSeccion = ({ titulo, icono, children, accionesExtra }) => (
  <div className="bg-secundario border border-borde rounded-lg p-4 space-y-4 h-full flex flex-col">
    <div className="flex justify-between items-center border-b border-borde pb-3">
      <h3 className="text-lg font-semibold flex items-center gap-3 text-texto-principal">{React.createElement(icono, { className: "text-blue-400", size: 22 })} {titulo}</h3>
      {accionesExtra && <div>{accionesExtra}</div>}
    </div>
    <div className="pl-1 flex-grow">{children}</div>
  </div>
);

const OPCIONES_CREDITO = ["Ticket card", "Postnet 77", "Postnet 51", "Credito", "Vial", "A Favor","Ingreso de Efectivo","Cheques"];
const OpcionesInput = ({ valor, alCambiar }) => {
  const esOpcionPredefinida = OPCIONES_CREDITO.includes(valor);
  const [modoEdicion, setModoEdicion] = useState(!esOpcionPredefinida && valor !== "");
  const handleSelectChange = (e) => {
    const valorSeleccionado = e.target.value;
    if (valorSeleccionado === "OTRO") { setModoEdicion(true); alCambiar(""); } else { setModoEdicion(false); alCambiar(valorSeleccionado); }
  };
  if (modoEdicion) { return <input type="text" value={valor} onChange={(e) => alCambiar(e.target.value)} placeholder="Descripción personalizada..." className="w-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-texto-principal border border-borde" autoFocus />; }
  return (
    <select value={esOpcionPredefinida ? valor : ""} onChange={handleSelectChange} className="w-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-texto-principal border border-borde">
      <option value="" disabled>Seleccionar...</option>
      {OPCIONES_CREDITO.map((op) => (<option key={op} value={op}>{op}</option>))}
      <option value="OTRO" className="font-bold text-blue-400">Otro (especificar)</option>
    </select>
  );
};

const VisorCierreZ = ({ cierreId }) => {
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try { const data = await obtenerDetallePorId(cierreId); setDetalle(data); } 
      catch (err) { setError('Error al cargar detalle.'); } 
      finally { setCargando(false); }
    };
    cargarDatos();
  }, [cierreId]);

  const SeccionDatos = ({ titulo, items, claves }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-3">
        <h5 className="font-bold text-texto-secundario border-b border-borde/50 mb-1">{titulo}</h5>
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-xs hover:bg-borde/20 px-1 rounded">
            <span className="truncate pr-2">{claves.map(k => item[k]).slice(0, -1).join(' - ') || 'N/A'}</span>
            <span className="font-mono flex-shrink-0">{formatearMoneda(item[claves[claves.length - 1]])}</span>
          </div>
        ))}
      </div>
    );
  };
  if (cargando) return <div className="flex justify-center items-center h-full"><Loader className="animate-spin text-blue-400"/></div>;
  if (error) return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertCircle size={32} /><p className="mt-2">{error}</p></div>;
  if (!detalle) return null;

  return (
    <div className="space-y-3">
      {/* ================================================================ */}
      {/* ▼▼▼ SECCIONES VISUALIZADAS EN EL VISOR (VERIFICADAS) ▼▼▼ */}
      {/* ================================================================ */}
      <SeccionDatos titulo="Ventas por Producto (Shop)" items={detalle.ventasPorProducto} claves={['descripcion', 'importe']} />
      <SeccionDatos titulo="Cupones" items={detalle.cupones} claves={['descripcion', 'importe']} />
      <SeccionDatos titulo="Percepciones IIBB" items={detalle.percepcionesIIBB} claves={['descripcion', 'importe']} />
      <SeccionDatos titulo="Axion ON" items={detalle.axionOn} claves={['descripcion', 'importe']} />
      <SeccionDatos titulo="Tiradas" items={detalle.tiradas} claves={['descripcion', 'importe']} />
      <SeccionDatos titulo="Ingresos de Efectivo" items={detalle.ingresos} claves={['descripcion', 'importe']} />
      <SeccionDatos titulo="Remitos" items={detalle.remitos} claves={['cliente_nombre', 'importe']} />
      <SeccionDatos titulo="Gastos" items={detalle.gastos} claves={['descripcion', 'importe']} />
      <SeccionDatos titulo="MercadoPago" items={detalle.mercadoPago} claves={['descripcion', 'importe']} />
    </div>
  );
};

// --- Componente Principal del Modal ---
const ModalCajaDiaria = ({ cierre, alCerrar, alProcesarExito }) => {
  if (!cierre) return null;

  const [billetera, setBilletera] = useState({ recibido: "", entregado: "" });
  const [creditos, setCreditos] = useState([{ id: Date.now(), item: "", importe: "" }]);
  const [retiros, setRetiros] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [listaEmpleados, setListaEmpleados] = useState([]);
  const [modalEmpleadoAbierto, setModalEmpleadoAbierto] = useState(false);

  useEffect(() => { obtenerTodosLosEmpleados().then(setListaEmpleados).catch(() => console.error("No se pudo cargar la lista de empleados.")); }, []);
  const handleCreditoChange = (id, campo, valor) => setCreditos(creditos.map(c => c.id === id ? { ...c, [campo]: valor } : c));
  const agregarFilaCredito = () => setCreditos([...creditos, { id: Date.now(), item: "", importe: "" }]);
  const eliminarFilaCredito = (id) => setCreditos(creditos.filter(c => c.id !== id));
  const handleRetiroChange = (id, campo, valor) => setRetiros(retiros.map(r => r.id === id ? { ...r, [campo]: valor } : r));
  const agregarFilaRetiro = () => setRetiros([...retiros, { id: Date.now(), nombre: "", monto: "" }]);
  const eliminarFilaRetiro = (id) => setRetiros(retiros.filter(r => r.id !== id));
  const handleEmpleadoAgregado = (nuevoEmpleado) => { setListaEmpleados(prevLista => [...prevLista, nuevoEmpleado].sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo))); setModalEmpleadoAbierto(false); };
  
  const { totalDeclaradoFinal, diferenciaFinal, totalCreditos, diferenciaBilletera } = useMemo(() => {
    const totalARendir = Number(cierre.total_a_rendir) || 0;
    const tCreditos = creditos.reduce((acc, c) => acc + (Number(c.importe) || 0), 0);
    const dineroRecibido = Number(billetera.recibido) || 0;
    const dineroEntregado = Number(billetera.entregado) || 0;
    const difBilletera = dineroEntregado - dineroRecibido;
    const totalDeclarado = tCreditos + difBilletera;
    const diferencia = totalDeclarado - totalARendir;
    return { 
        totalDeclaradoFinal: totalDeclarado, 
        diferenciaFinal: diferencia, 
        totalCreditos: tCreditos, 
        diferenciaBilletera: difBilletera 
    };
  }, [creditos, billetera.recibido, billetera.entregado, cierre.total_a_rendir]);

  const handleSubmit = async () => {
    setError(""); setEnviando(true);
    const datosParaEnviar = {
      billetera: { recibido: Number(billetera.recibido) || 0, entregado: Number(billetera.entregado) || 0 },
      creditos: creditos.map(c => ({ ...c, importe: Number(c.importe) || 0 })).filter(c => c.item && c.importe > 0),
      retiros: retiros.map(r => ({ nombre_empleado: r.nombre, monto: Number(r.monto) || 0 })).filter(r => r.nombre_empleado && r.monto > 0),
    };
    try { await procesarCajaDiaria(cierre.id, datosParaEnviar); alProcesarExito(); }
    catch (err) { const mensajeError = err.response?.data?.detalle || "Error al procesar el cierre."; setError(mensajeError); }
    finally { setEnviando(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={alCerrar}>
        <div className="bg-primario rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-4 border-b border-borde">
            <h2 className="text-2xl font-bold text-texto-principal">Procesar Caja Diaria - Cierre Z N° {cierre.numero_z}</h2>
            <button onClick={alCerrar} className="text-texto-secundario hover:text-white transition-colors p-1 rounded-full"><X /></button>
          </div>
          <div className="flex-grow p-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-1">
                <TarjetaSeccion titulo="1. Ingreso de Valores" icono={HandCoins}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-semibold text-texto-principal mb-2 flex items-center gap-2"><Banknote size={18}/> Billetera Playero</h4>
                      <div className="grid grid-cols-2 gap-4 items-end">
                        <div><label className="text-sm font-medium text-texto-secundario">Recibido</label><input type="number" placeholder="0.00" value={billetera.recibido} onChange={e => setBilletera({ ...billetera, recibido: e.target.value })} className="w-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-texto-principal border border-borde mt-1" /></div>
                        <div><label className="text-sm font-medium text-texto-secundario">Entregado</label><input type="number" placeholder="0.00" value={billetera.entregado} onChange={e => setBilletera({ ...billetera, entregado: e.target.value })} className="w-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-texto-principal border border-borde mt-1" /></div>
                      </div>
                    </div>
                    <hr className="border-borde/50" />
                    <div>
                        <h4 className="text-base font-semibold text-texto-principal mb-2 flex items-center gap-2"><Landmark size={18}/> Créditos y Vales</h4>
                        <div className="space-y-2 pr-2 max-h-[40vh] overflow-y-auto">{creditos.map((credito) => (<div key={credito.id} className="flex items-center gap-2"><OpcionesInput valor={credito.item} alCambiar={(nuevoValor) => handleCreditoChange(credito.id, 'item', nuevoValor)} /><input type="number" value={credito.importe} onChange={e => handleCreditoChange(credito.id, 'importe', e.target.value)} placeholder="Importe" className="w-32 bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-texto-principal border border-borde"/><button onClick={() => eliminarFilaCredito(credito.id)} className="text-red-600 hover:text-red-400 p-2 rounded-md hover:bg-red-500/10 transition-colors"><Trash2 size={18} /></button></div>))}</div>
                        <button onClick={agregarFilaCredito} className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm font-semibold mt-2 pt-2 border-t border-borde w-full justify-center"><PlusCircle size={16} /> Añadir Fila de Crédito</button>
                    </div>
                  </div>
                </TarjetaSeccion>
              </div>

              <div className="lg:col-span-1">
                <TarjetaSeccion titulo="2. Adelantos y Cierre" icono={FileSignature}>
                  <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-base font-semibold text-texto-principal flex items-center gap-2"><Users size={18}/> Retiros de Personal</h4>
                            <button onClick={() => setModalEmpleadoAbierto(true)} className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"><UserPlus size={14}/> Nuevo</button>
                        </div>
                        <div className="space-y-2 pr-2 max-h-[25vh] overflow-y-auto">{retiros.map((retiro) => (<div key={retiro.id} className="flex items-center gap-2"><select value={retiro.nombre} onChange={e => handleRetiroChange(retiro.id, 'nombre', e.target.value)} className="w-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-texto-principal border border-borde"><option value="" disabled>Seleccionar...</option>{listaEmpleados.map(emp => <option key={emp.id} value={emp.nombre_completo}>{emp.nombre_completo}</option>)}</select><input type="number" value={retiro.monto} onChange={e => handleRetiroChange(retiro.id, 'monto', e.target.value)} placeholder="Monto" className="w-32 bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-texto-principal border border-borde"/><button onClick={() => eliminarFilaRetiro(retiro.id)} className="text-red-600 hover:text-red-400 p-2 rounded-md hover:bg-red-500/10 transition-colors"><Trash2 size={18} /></button></div>))}</div>
                        <button onClick={agregarFilaRetiro} className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm font-semibold mt-2 pt-2 border-t border-borde w-full justify-center"><PlusCircle size={16} /> Añadir Fila de Retiro</button>
                    </div>
                    <hr className="border-borde/50" />
                    <div>
                        <h4 className="text-base font-semibold text-texto-principal mb-2 flex items-center gap-2"><ClipboardCheck size={18}/> Resumen y Acción</h4>
                        <div className="bg-fondo border border-borde rounded-lg p-3 space-y-3 text-sm">
                            <div className="flex justify-between items-center"><span className="text-texto-secundario">Total a Rendir (Z)</span><span className="font-semibold text-lg">{formatearMoneda(cierre.total_a_rendir)}</span></div>
                            <div className="flex justify-between items-center border-t border-borde pt-2"><span className="text-texto-secundario flex items-center gap-1.5"><TrendingUp size={14} /> Total Créditos</span><span className="font-semibold">{formatearMoneda(totalCreditos)}</span></div>
                            <div className="flex justify-between items-center"><span className="text-texto-secundario flex items-center gap-1.5"><Banknote size={14} /> Neto Billetera</span><span className="font-semibold">{formatearMoneda(diferenciaBilletera)}</span></div>
                            <hr className="border-borde/50"/>
                            <div className="flex justify-between items-center text-base"><span className="text-texto-principal font-bold">Total Declarado</span><span className="font-bold text-lg text-blue-400">{formatearMoneda(totalDeclaradoFinal)}</span></div>
                            <div className="flex justify-between items-center text-base"><span className="text-texto-principal font-bold">Diferencia Final</span><p className={`font-bold text-lg ${diferenciaFinal < 0 ? "text-red-400" : "text-green-400"}`}>{formatearMoneda(diferenciaFinal)}</p></div>
                        </div>
                        {error && <p className="text-red-400 text-center text-sm py-2 mt-3 bg-red-500/10 rounded">{error}</p>}
                        <button onClick={handleSubmit} disabled={enviando} className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-md flex items-center justify-center gap-2 transition-colors">{enviando ? <Loader className="animate-spin" /> : "Confirmar y Procesar Caja"}</button>
                    </div>
                  </div>
                </TarjetaSeccion>
              </div>
              
              <div className="lg:col-span-1">
                <TarjetaSeccion titulo="3. Detalle Cierre Z Original" icono={FileText}>
                    <div className="bg-fondo border border-borde rounded-md p-3 h-full max-h-[75vh] overflow-y-auto">
                        <VisorCierreZ cierreId={cierre.id} />
                    </div>
                </TarjetaSeccion>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {modalEmpleadoAbierto && (<ModalNuevoEmpleado alCerrar={() => setModalEmpleadoAbierto(false)} enEmpleadoCreado={handleEmpleadoAgregado}/>)}
    </>
  );
};

export default ModalCajaDiaria;