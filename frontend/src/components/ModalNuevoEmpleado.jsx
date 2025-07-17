// src/components/ModalNuevoEmpleado.jsx (Archivo Nuevo)

import React, { useState } from 'react';
import { crearNuevoEmpleado } from '../services/empleadoService';
import { X, UserPlus, Loader } from 'lucide-react';

const ModalNuevoEmpleado = ({ alCerrar, enEmpleadoCreado }) => {
  const [nombre, setNombre] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    setError('');
    setEnviando(true);

    try {
      const respuesta = await crearNuevoEmpleado(nombre);
      // Pasamos el nuevo empleado al componente padre
      enEmpleadoCreado(respuesta.empleado); 
      alCerrar(); // Cerramos este modal
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar el empleado.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={alCerrar}>
      <div className="bg-secundario rounded-lg shadow-2xl w-full max-w-md flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-borde">
          <h3 className="text-xl font-bold text-texto-principal flex items-center gap-2">
            <UserPlus size={22} className="text-blue-400" />
            Crear Nuevo Empleado
          </h3>
          <button onClick={alCerrar} className="text-texto-secundario hover:text-white p-1 rounded-full"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="nombre-empleado" className="block text-sm font-medium text-texto-secundario mb-1">
              Nombre Completo del Empleado
            </label>
            <input
              id="nombre-empleado"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full bg-fondo p-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-texto-principal border border-borde"
              autoFocus
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 text-white font-bold py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors"
          >
            {enviando ? <Loader className="animate-spin" /> : 'Guardar Empleado'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevoEmpleado;