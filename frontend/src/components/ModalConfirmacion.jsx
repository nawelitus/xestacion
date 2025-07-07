// NUEVO ARCHIVO: frontend/src/components/ModalConfirmacion.jsx
// Componente reutilizable para confirmar acciones peligrosas.

import React from 'react';
import { X, Loader, AlertTriangle } from 'lucide-react';

const ModalConfirmacion = ({ titulo, mensaje, alCerrar, alConfirmar, enviando }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
      onClick={alCerrar}
    >
      <div
        className="bg-primario rounded-lg shadow-xl w-full max-w-md flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-borde">
          <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
            <AlertTriangle size={22} />
            {titulo}
          </h2>
          <button onClick={alCerrar} className="text-texto-secundario hover:text-white">
            <X />
          </button>
        </div>

        <div className="p-6">
          <p className="text-texto-secundario">{mensaje}</p>
        </div>

        <div className="p-4 bg-secundario/50 flex justify-end gap-4 border-t border-borde">
          <button
            type="button"
            onClick={alCerrar}
            disabled={enviando}
            className="bg-gray-600 hover:bg-gray-700 font-semibold px-4 py-2 rounded-md border border-borde"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={alConfirmar}
            disabled={enviando}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2"
          >
            {enviando ? <Loader className="animate-spin" /> : 'Confirmar y Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
