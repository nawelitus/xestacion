import React, { useState, useEffect, useCallback } from 'react';
import { listarUsuarios, cambiarEstadoUsuario } from '../services/usuarioService';
import { Loader, AlertTriangle, UserPlus, Edit, KeyRound, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import ModalUsuario from '../components/ModalUsuario';
import ModalPassword from '../components/ModalPassword';
// ================================================================
// Página principal para la administración de usuarios. Muestra una
// tabla con todos los usuarios y permite realizar acciones como
// crear, editar, cambiar contraseña y habilitar/deshabilitar.
// ================================================================

const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR', {
  day: '2-digit', month: '2-digit', year: 'numeric'
});

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [estaCargando, setEstaCargando] = useState(true);
  const [error, setError] = useState(null);
  const [refrescar, setRefrescar] = useState(false);
  const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false);
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const cargarUsuarios = useCallback(async () => {
    try {
      setEstaCargando(true);
      setError(null);
      const data = await listarUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios. Asegúrate de tener permisos de administrador.');
    } finally {
      setEstaCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [refrescar, cargarUsuarios]);

  const abrirModalCrear = () => {
    setUsuarioSeleccionado(null);
    setModalUsuarioAbierto(true);
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalUsuarioAbierto(true);
  };

  const abrirModalPassword = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalPasswordAbierto(true);
  };

  const cerrarModales = () => {
    setModalUsuarioAbierto(false);
    setModalPasswordAbierto(false);
    setUsuarioSeleccionado(null);
  };

  const handleExito = () => {
    cerrarModales();
    setRefrescar(prev => !prev); 
  };

  const handleCambiarEstado = async (usuario) => {
    const nuevoEstado = usuario.activo ? 0 : 1;
    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres ${nuevoEstado === 1 ? 'habilitar' : 'deshabilitar'} al usuario ${usuario.nombre_completo}?`
    );

    if (confirmacion) {
      try {
        await cambiarEstadoUsuario(usuario.id, nuevoEstado);
        handleExito();
      } catch (err) {
        alert('Error al cambiar el estado del usuario.');
      }
    }
  };

  const RolBadge = ({ rol }) => {
    const colores = {
      administrador: 'bg-red-500/80 text-white',
      editor: 'bg-blue-500/80 text-white',
      visualizador: 'bg-gray-500/80 text-white',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colores[rol] || 'bg-gray-400'}`}>{rol}</span>;
  };

  const renderContenido = () => {
    if (estaCargando) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-500" size={48} /></div>;
    if (error) return <div className="text-center py-10 bg-primario rounded-lg border border-borde"><AlertTriangle className="mx-auto text-red-400" size={48} /><h2 className="mt-4 text-xl font-semibold">{error}</h2></div>;
    return (
      <div className="overflow-x-auto bg-primario rounded-lg border border-borde">
        <table className="w-full text-sm">
          <thead className="bg-secundario">
            <tr>
              <th className="p-3 text-left">Nombre Completo</th>
              <th className="p-3 text-left">DNI</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Rol</th>
              <th className="p-3 text-center">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {usuarios.map(usuario => (
              <tr key={usuario.id} className="hover:bg-secundario/50">
                <td className="p-3">{usuario.nombre_completo}</td>
                <td className="p-3">{usuario.dni}</td>
                <td className="p-3">{usuario.email}</td>
                <td className="p-3 text-center"><RolBadge rol={usuario.rol} /></td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${usuario.activo ? 'bg-green-500/80 text-white' : 'bg-gray-600 text-gray-200'}`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button onClick={() => abrirModalEditar(usuario)} className="text-blue-400 hover:text-blue-300" title="Editar Datos"><Edit size={16} /></button>
                    <button onClick={() => abrirModalPassword(usuario)} className="text-yellow-400 hover:text-yellow-300" title="Cambiar Contraseña"><KeyRound size={16} /></button>
                    <button onClick={() => handleCambiarEstado(usuario)} className={usuario.activo ? 'text-red-500 hover:text-red-400' : 'text-green-500 hover:text-green-400'} title={usuario.activo ? 'Deshabilitar' : 'Habilitar'}>
                      {usuario.activo ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-texto-principal">Gestión de Usuarios</h1>
          <p className="mt-1 text-texto-secundario">Crea, modifica y administra los usuarios del sistema.</p>
        </div>
        <div>
          <button onClick={() => setRefrescar(p => !p)} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold p-2 rounded-md mr-4" title="Refrescar Lista">
            <RefreshCw size={20} className={estaCargando ? 'animate-spin' : ''} />
          </button>
          <button onClick={abrirModalCrear} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md inline-flex items-center gap-2">
            <UserPlus size={16} /> Nuevo Usuario
          </button>
        </div>
      </div>
      
      {renderContenido()}
      
      {modalUsuarioAbierto && <ModalUsuario usuario={usuarioSeleccionado} alCerrar={cerrarModales} alExito={handleExito} />}
      {modalPasswordAbierto && <ModalPassword usuario={usuarioSeleccionado} alCerrar={cerrarModales} alExito={handleExito} />}
    </div>
  );
};

export default GestionUsuarios;
