/**
 * ================================================================
 * ARCHIVO: src/components/ActividadReciente.jsx (NUEVO)
 * DESCRIPCIÓN: Componente que busca y muestra una lista con los
 * últimos Cierres Z cargados en el sistema.
 * ================================================================
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { obtenerCierresRecientes } from '../services/cierreService';
import { FileText, Calendar, User, AlertTriangle } from 'lucide-react';

// Componente para una fila individual de la lista de actividad
const ActividadItem = ({ cierre }) => {
  
  // Función para formatear la fecha a DD/MM/YYYY
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Función para formatear el monto a un formato de moneda local
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(monto);
  };

  return (
  <Link to={`/dashboard/cierres/${cierre.id}`}>
      <li className="flex items-center justify-between p-3 hover:bg-secundario rounded-md transition-colors duration-200 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500/20 text-blue-400 p-2 rounded-md">
            <FileText size={20} />
          </div>
          <div>
            <p className="font-semibold text-texto-principal">
              Cierre Z N° {cierre.numero_z}
            </p>
            <p className="text-sm text-texto-secundario">
              {formatearMoneda(cierre.total_a_rendir)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-sm text-texto-secundario">
            <Calendar size={14} />
            <span>{formatearFecha(cierre.fecha_turno)}</span>
          </div>
          <div className="flex items-center justify-end gap-2 text-sm text-texto-secundario mt-1">
            <User size={14} />
            <span>{cierre.usuario_carga_nombre}</span>
          </div>
        </div>
      </li>
    </Link>
  );
};


const ActividadReciente = () => {
  // Estado para almacenar la lista de cierres
  const [cierres, setCierres] = useState([]);
  // Estado para gestionar la pantalla de carga
  const [estaCargando, setEstaCargando] = useState(true);
  // Estado para gestionar los errores de la API
  const [error, setError] = useState(null);

  // useEffect se ejecuta cuando el componente se monta por primera vez
  useEffect(() => {
    const cargarCierres = async () => {
      try {
        // Ponemos el estado de error en null al iniciar una nueva carga
        setError(null);
        // Activamos el estado de carga
        setEstaCargando(true);
        // Llamamos a nuestro servicio para obtener los datos
        const datos = await obtenerCierresRecientes();
        // Guardamos los datos en el estado
        setCierres(datos);
      } catch (err) {
        // Si hay un error, lo guardamos en el estado de error
        setError('No se pudieron cargar las actividades recientes. Intente más tarde.');
        console.error(err);
      } finally {
        // Se ejecuta siempre, al finalizar el try o el catch
        // Desactivamos el estado de carga
        setEstaCargando(false);
      }
    };

    cargarCierres();
  }, []); // El array vacío asegura que esto se ejecute solo una vez

  // --- RENDERIZADO CONDICIONAL ---

  // 1. Muestra un spinner o mensaje mientras se cargan los datos
  if (estaCargando) {
    return (
        <div className="bg-primario p-6 rounded-lg border border-borde h-full flex items-center justify-center">
             <p className="text-texto-secundario">Cargando actividad...</p>
        </div>
    );
  }

  // 2. Muestra un mensaje de error si la petición a la API falló
  if (error) {
    return (
       <div className="bg-primario p-6 rounded-lg border border-borde h-full flex flex-col items-center justify-center text-red-400">
            <AlertTriangle size={32} className="mb-2" />
            <h3 className="font-semibold text-texto-principal">Error</h3>
            <p className="text-sm text-red-400/80">{error}</p>
       </div>
    );
  }

  // 3. Renderizado principal cuando los datos se han cargado correctamente
  return (
    <div className="bg-primario p-6 rounded-lg border border-borde">
      <h3 className="font-semibold text-texto-principal mb-4">Actividad Reciente</h3>
      {cierres.length > 0 ? (
        <ul className="space-y-2">
          {cierres.map((cierre) => (
            <ActividadItem key={cierre.id} cierre={cierre} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-texto-secundario mt-2 text-center py-8">
            No hay cierres cargados recientemente.
        </p>
      )}
    </div>
  );
};

export default ActividadReciente;