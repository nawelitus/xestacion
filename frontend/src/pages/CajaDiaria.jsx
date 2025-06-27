import React, { useState, useEffect, useCallback } from 'react';
import { listarCierresPendientes } from '../services/cajaDiariaService.js';
import ModalCajaDiaria from '../components/ModalCajaDiaria';
import { Loader, AlertTriangle, Inbox, Calendar, Hash } from 'lucide-react';

const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);
const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const CajaDiaria = () => {
  const [cierresPendientes, setCierresPendientes] = useState([]);
  const [estaCargando, setEstaCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados para manejar el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cierreSeleccionado, setCierreSeleccionado] = useState(null);

  const cargarPendientes = useCallback(async () => {
    try {
      setEstaCargando(true);
      setError(null);
      const datos = await listarCierresPendientes();
      setCierresPendientes(datos);
    } catch (err) {
      setError('No se pudieron cargar los cierres pendientes.');
    } finally {
      setEstaCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPendientes();
  }, [cargarPendientes]);

  const abrirModal = (cierre) => {
    setCierreSeleccionado(cierre);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCierreSeleccionado(null);
  };

  const handleProcesoExitoso = () => {
    cerrarModal();
    // Recargamos la lista de pendientes para que el cierre procesado desaparezca.
    cargarPendientes(); 
  };
  
  const renderContenido = () => {
      if (estaCargando) {
        return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>;
      }
      if (error) {
        return <div className="text-center py-10 bg-primario rounded-lg border border-borde"><AlertTriangle className="mx-auto text-red-400" size={48} /><h2 className="mt-4 text-xl font-semibold">{error}</h2></div>;
      }
      if (cierresPendientes.length === 0) {
        return <div className="text-center py-16 bg-primario rounded-lg border border-borde"><Inbox className="mx-auto text-texto-secundario" size={48} /><h2 className="mt-4 text-xl font-semibold">¡Todo al día!</h2><p className="text-texto-secundario">No hay Cierres Z pendientes de procesar.</p></div>;
      }

      return (
        <div className="bg-primario rounded-lg border border-borde overflow-hidden">
            <ul className="divide-y divide-borde">
                {cierresPendientes.map(cierre => (
                    <li key={cierre.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p className="font-bold text-texto-principal">Cierre Z N° {cierre.numero_z}</p>
                            <div className="flex items-center gap-4 text-sm text-texto-secundario mt-1">
                                <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatearFecha(cierre.fecha_turno)}</span>
                                <span className="flex items-center gap-1.5"><Hash size={14} /> A rendir: {formatearMoneda(cierre.total_a_rendir)}</span>
                            </div>
                        </div>
                        <button onClick={() => abrirModal(cierre)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-colors self-start md:self-center">
                            Procesar Caja
                        </button>
                    </li>
                ))}
            </ul>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-texto-principal">Caja Diaria</h1>
        <p className="mt-1 text-texto-secundario">Selecciona un Cierre Z para procesar y conciliar la caja.</p>
      </div>
      {renderContenido()}
      {modalAbierto && <ModalCajaDiaria cierre={cierreSeleccionado} alCerrar={cerrarModal} alProcesarExito={handleProcesoExitoso} />}
    </div>
  );
};

export default CajaDiaria;