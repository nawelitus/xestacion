import React, { useState } from 'react';
import { actualizarPasswordUsuario } from '../services/usuarioService';
import { X, Loader } from 'lucide-react';


const ModalPassword = ({ usuario, alCerrar, alExito }) => {
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    setEnviando(true);
    try {
      await actualizarPasswordUsuario(usuario.id, nuevaPassword);
      alExito();
    } catch (err) {
      setError(err.mensaje || 'Ocurrió un error al cambiar la contraseña.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={alCerrar}>
      <div className="bg-primario rounded-lg shadow-xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-borde">
          <h2 className="text-xl font-bold">Cambiar Contraseña</h2>
          <button onClick={alCerrar} className="text-texto-secundario hover:text-white"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-texto-secundario">
            Cambiando contraseña para: <span className="font-bold text-texto-principal">{usuario.nombre_completo}</span>
          </p>
          <div>
            <label className="text-sm text-texto-secundario">Nueva Contraseña</label>
            <input type="password" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} className="w-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 border border-borde" required />
          </div>
          <div>
            <label className="text-sm text-texto-secundario">Confirmar Nueva Contraseña</label>
            <input type="password" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} className="w-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 border border-borde" required />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div className="pt-4 flex justify-end gap-4">
            <button type="button" onClick={alCerrar} className="bg-secundario hover:bg-secundario/80 font-semibold px-4 py-2 rounded-md border border-borde">Cancelar</button>
            <button type="submit" disabled={enviando} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2">
                {enviando ? <Loader className="animate-spin" /> : 'Guardar Contraseña'}
           </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPassword;
