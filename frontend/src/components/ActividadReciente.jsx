import React from 'react';
import { Link } from 'react-router-dom';

const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const ActividadReciente = ({ actividades }) => {
  if (!actividades || actividades.length === 0) {
    return (
      <div className="bg-primario p-6 rounded-lg border border-borde h-full flex items-center justify-center">
        <p className="text-texto-secundario">No hay actividad reciente para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="bg-primario rounded-lg border border-borde">
        <h3 className="text-lg font-semibold p-4 border-b border-borde">Cierres Z Procesados Recientemente</h3>
        <ul className="divide-y divide-borde">
            {actividades.map(act => (
                <li key={act.id} className="p-4 flex justify-between items-center hover:bg-secundario/30">
                    <div>
                        <p className="font-semibold text-texto-principal">Cierre Z N° {act.numero_z}</p>
                        <p className="text-sm text-texto-secundario">
                            {formatearFecha(act.fecha_turno)} - Cargado por {act.usuario_carga_nombre}
                        </p>
                    </div>
<Link to={`/cierre/${act.id}`} className="text-blue-400 hover:underline text-sm font-semibold">
                        Ver Detalle
                    </Link>
                </li>
            ))}
        </ul>
    </div>
  );
};

export default ActividadReciente;