import React, { useState, useEffect } from 'react';
import { crearUsuario, actualizarUsuario } from '../services/usuarioService';
import { X, Loader } from 'lucide-react';

// ================================================================
// ARCHIVO: src/components/ModalUsuario.jsx (NUEVO)
//
// DESCRIPCIÓN:
// Modal con el formulario para crear un nuevo usuario o editar
// los datos de uno existente.
// ================================================================

const ModalUsuario = ({ usuario, alCerrar, alExito }) => {
  const esEdicion = Boolean(usuario);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    dni: '',
    rol: 'visualizador',
    password: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (esEdicion) {
      setFormData({
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        dni: usuario.dni,
        rol: usuario.rol,
        password: '' // La contraseña no se carga por seguridad
      });
    }
  }, [usuario, esEdicion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    
    // Validaciones
    if (!formData.nombre_completo || !formData.email || !formData.dni || !formData.rol) {
        setError('Todos los campos excepto la contraseña son obligatorios.');
        setEnviando(false);
        return;
    }
    if (!esEdicion && !formData.password) {
        setError('La contraseña es obligatoria para nuevos usuarios.');
        setEnviando(false);
        return;
    }

    try {
      if (esEdicion) {
        await actualizarUsuario(usuario.id, {
            nombre_completo: formData.nombre_completo,
            email: formData.email,
            dni: formData.dni,
            rol: formData.rol
        });
      } else {
        await crearUsuario(formData);
      }
      alExito();
    } catch (err) {
      setError(err.mensaje || 'Ocurrió un error. Verifique los datos (DNI o email podrían estar repetidos).');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={alCerrar}>
      <div className="bg-primario rounded-lg shadow-xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-borde">
          <h2 className="text-xl font-bold">{esEdicion ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
          <button onClick={alCerrar} className="text-texto-secundario hover:text-white"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm text-texto-secundario">Nombre Completo</label>
            <input type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} className="w-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 border border-borde" required />
          </div>
           <div>
            <label className="text-sm text-texto-secundario">DNI</label>
            <input type="number" name="dni" value={formData.dni} onChange={handleChange} className="w-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 border border-borde" required />
          </div>
          <div>
            <label className="text-sm text-texto-secundario">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 border border-borde" required />
          </div>
          <div>
            <label className="text-sm text-texto-secundario">Rol</label>
            <select name="rol" value={formData.rol} onChange={handleChange} className="w-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 border border-borde appearance-none">
              <option value="visualizador">Visualizador</option>
              <option value="editor">Editor</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          {!esEdicion && (
            <div>
              <label className="text-sm text-texto-secundario">Contraseña</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 border border-borde" required />
            </div>
          )}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div className="pt-4 flex justify-end gap-4">
            <button type="button" onClick={alCerrar} className="bg-secundario hover:bg-secundario/80 font-semibold px-4 py-2 rounded-md border border-borde">Cancelar</button>
            <button type="submit" disabled={enviando} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2">
                {enviando ? <Loader className="animate-spin" /> : (esEdicion ? 'Guardar Cambios' : 'Crear Usuario')}
           </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUsuario;
