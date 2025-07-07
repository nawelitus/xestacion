// Contenido ACTUALIZADO para: src/pages/CajaDiaria.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { listarCierresParaCaja, obtenerDetalleCajaProcesada, deshacerProcesoCaja } from '../services/cajaDiariaService.js';
// NUEVA FUNCIONALIDAD: Importar el servicio de eliminación
import { eliminarCierrePorId } from '../services/cierreService.js';
import useAuth from '../hooks/useAuth.js';
import ModalCajaDiaria from '../components/ModalCajaDiaria';
import ModalDetalleCaja from '../components/ModalDetalleCaja';
// NUEVA FUNCIONALIDAD: Importar el modal de confirmación
import ModalConfirmacion from '../components/ModalConfirmacion';
import { Loader, AlertTriangle, Inbox, Calendar, Hash, CheckCircle, Eye, Undo, Trash2 } from 'lucide-react';

const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);
const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

// NUEVA FUNCIONALIDAD: El componente FilaCierre ahora recibe 'onEliminar'
const FilaCierre = ({ cierre, onProcesar, onVerDetalle, onDeshacer, onEliminar, esAdmin }) => (
    <li className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
            <div className="flex items-center gap-2">
                {cierre.caja_procesada ? 
                    <CheckCircle size={18} className="text-green-500" /> : 
                    <div className="w-[18px] h-[18px] border-2 border-yellow-500 rounded-full animate-pulse"></div>
                }
                <p className="font-bold text-texto-principal">Cierre Z N° {cierre.numero_z}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-texto-secundario mt-1 pl-6">
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatearFecha(cierre.fecha_turno)}</span>
                <span className="flex items-center gap-1.5"><Hash size={14} /> A rendir: {formatearMoneda(cierre.total_a_rendir)}</span>
            </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
            {cierre.caja_procesada ? (
                <button onClick={onVerDetalle} className="bg-gray-700 hover:bg-gray-900 text-white font-semibold px-2 py-1 rounded-md transition-colors flex items-center gap-1">
                    <Eye size={16}/> Detalle
                </button>
            ) : (
                <div className="flex items-center gap-2">
                    <button onClick={onProcesar} className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-2 py-1 rounded-md transition-colors">
                        Procesar Caja
                    </button>
                    {/* NUEVA FUNCIONALIDAD: Botón de eliminar, solo visible para admin y en cierres no procesados */}
                    {esAdmin && (
                        <button onClick={onEliminar} title="Eliminar Cierre Z" className="bg-red-900 hover:bg-red-700 text-white font-semibold px-2 py-1 rounded-md transition-colors flex items-center gap-1">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )}
            {cierre.caja_procesada && esAdmin && (
              <button onClick={onDeshacer} title="Deshacer Proceso" className="bg-orange-800 hover:bg-orange-700 text-white font-semibold px-2 py-1 rounded-md transition-colors flex items-center gap-1">
                <Undo size={16} /> Deshacer
              </button>
            )}
        </div>
    </li>
);

const CajaDiaria = () => {
  const { auth } = useAuth();
  const [todosLosCierres, setTodosLosCierres] = useState([]);
  const [estaCargando, setEstaCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalProcesarAbierto, setModalProcesarAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [cierreSeleccionado, setCierreSeleccionado] = useState(null);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  // NUEVA FUNCIONALIDAD: Estados para el modal de confirmación de eliminación
  const [modalConfirmarAbierto, setModalConfirmarAbierto] = useState(false);
  const [cierreParaEliminar, setCierreParaEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);


  const cargarCierres = useCallback(async () => {
    try {
      setEstaCargando(true); setError(null);
      const datos = await listarCierresParaCaja();
      setTodosLosCierres(datos);
    } catch (err) {
      setError('No se pudieron cargar los cierres.');
    } finally {
      setEstaCargando(false);
    }
  }, []);

  useEffect(() => { cargarCierres(); }, [cargarCierres]);

  const handleDeshacer = async (cierreId, numeroZ) => {
    // Se mantiene el confirm nativo para esta acción
    if (window.confirm(`¿Estás seguro de que quieres deshacer el proceso del Cierre Z N° ${numeroZ}? Esta acción es irreversible y borrará los datos de conciliación asociados.`)) {
      try {
        await deshacerProcesoCaja(cierreId);
        alert('El proceso se ha deshecho correctamente.');
        cargarCierres();
      } catch (err) {
        alert('Error al intentar deshacer el proceso. Por favor, intenta de nuevo.');
      }
    }
  };

  // --- NUEVA FUNCIONALIDAD: Lógica para manejar la eliminación ---
  const handleAbrirConfirmacion = (cierre) => {
    setCierreParaEliminar(cierre);
    setModalConfirmarAbierto(true);
  };

  const handleCerrarConfirmacion = () => {
    setModalConfirmarAbierto(false);
    setCierreParaEliminar(null);
  };

  const handleConfirmarEliminar = async () => {
    if (!cierreParaEliminar) return;
    setEliminando(true);
    try {
      await eliminarCierrePorId(cierreParaEliminar.id);
      alert(`El Cierre Z N° ${cierreParaEliminar.numero_z} ha sido eliminado.`);
      handleCerrarConfirmacion();
      cargarCierres(); // Recargar la lista
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al eliminar el cierre.');
    } finally {
      setEliminando(false);
    }
  };
  
  const abrirModalProcesar = (cierre) => {
    setCierreSeleccionado(cierre);
    setModalProcesarAbierto(true);
  };
  
  const abrirModalDetalle = async (cierreId) => {
    try {
      const detalle = await obtenerDetalleCajaProcesada(cierreId);
      setDetalleSeleccionado(detalle);
      setModalDetalleAbierto(true);
    } catch (error) {
        alert("Error al cargar el detalle de la caja procesada.");
    }
  };

  const cerrarModales = () => {
    setModalProcesarAbierto(false);
    setModalDetalleAbierto(false);
    setCierreSeleccionado(null);
    setDetalleSeleccionado(null);
  };

  const handleProcesoExitoso = () => {
    cerrarModales();
    cargarCierres(); 
  };
  
  const renderContenido = () => {
      if (estaCargando) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>;
      if (error) return <div className="text-center py-10 bg-primario rounded-lg border border-borde"><AlertTriangle className="mx-auto text-red-400" size={48} /><h2 className="mt-4 text-xl font-semibold">{error}</h2></div>;
      
      const pendientes = todosLosCierres.filter(c => !c.caja_procesada);
      const procesados = todosLosCierres.filter(c => c.caja_procesada);

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h2 className="text-xl font-semibold mb-4 text-yellow-400">Pendientes de Procesar ({pendientes.length})</h2>
                {pendientes.length > 0 ? (
                    <div className="bg-primario rounded-lg border border-borde overflow-hidden"><ul className="divide-y divide-borde">
                        {pendientes.map(c => 
                          <FilaCierre 
                            key={c.id} 
                            cierre={c} 
                            onProcesar={() => abrirModalProcesar(c)} 
                            onEliminar={() => handleAbrirConfirmacion(c)} // NUEVA FUNCIONALIDAD
                            esAdmin={auth.rol === 'administrador'}
                          />
                        )}
                    </ul></div>
                ) : <p className="text-texto-secundario text-center p-8 bg-primario rounded-lg border border-borde">¡Nada pendiente!</p>}
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-4 text-green-500">Ya Procesados ({procesados.length})</h2>
                 {procesados.length > 0 ? (
                    <div className="bg-primario rounded-lg border border-borde max-h-[60vh] overflow-y-auto"><ul className="divide-y divide-borde">
                        {procesados.map(c => (
                          <FilaCierre 
                            key={c.id} 
                            cierre={c} 
                            onVerDetalle={() => abrirModalDetalle(c.id)} 
                            onDeshacer={() => handleDeshacer(c.id, c.numero_z)}
                            esAdmin={auth.rol === 'administrador'}
                          />
                        ))}
                    </ul></div>
                ) : <p className="text-texto-secundario text-center p-8 bg-primario rounded-lg border border-borde">Aún no hay cajas procesadas.</p>}
            </div>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-texto-principal">Caja Diaria</h1>
        <p className="mt-1 text-texto-secundario">Procesa los cierres pendientes y consulta el historial de los ya procesados.</p>
      </div>
      {renderContenido()}
      {modalProcesarAbierto && <ModalCajaDiaria cierre={cierreSeleccionado} alCerrar={cerrarModales} alProcesarExito={handleProcesoExitoso} />}
      {modalDetalleAbierto && <ModalDetalleCaja detalle={detalleSeleccionado} alCerrar={cerrarModales} />}
      
      {/* NUEVA FUNCIONALIDAD: Renderizar el modal de confirmación */}
      {modalConfirmarAbierto && (
        <ModalConfirmacion
          titulo="Confirmar Eliminación"
          mensaje={`¿Estás seguro de que quieres eliminar permanentemente el Cierre Z N° ${cierreParaEliminar?.numero_z}? Esta acción no se puede deshacer y borrará todos los datos asociados (ventas, remitos, etc.).`}
          alCerrar={handleCerrarConfirmacion}
          alConfirmar={handleConfirmarEliminar}
          enviando={eliminando}
        />
      )}
    </div>
  );
};

export default CajaDiaria;
