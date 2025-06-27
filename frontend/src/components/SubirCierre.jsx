import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { subirCierre } from '../services/cierreService';
import { UploadCloud, Loader, CheckCircle, AlertTriangle } from 'lucide-react';

const SubirCierre = ({ onUploadSuccess }) => {
  const [archivo, setArchivo] = useState(null);
  const [estadoCarga, setEstadoCarga] = useState('inicial'); // 'inicial', 'cargando', 'exito', 'error'
  const [mensaje, setMensaje] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setArchivo(acceptedFiles[0]);
      setEstadoCarga('inicial'); // Resetea el estado si se selecciona un nuevo archivo
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    maxFiles: 1
  });

  const handleSubir = async () => {
    if (!archivo) return;
    setEstadoCarga('cargando');
    setMensaje('');

    try {
      const respuesta = await subirCierre(archivo);
      setEstadoCarga('exito');
      setMensaje(respuesta.mensaje || 'Archivo procesado exitosamente.');
      onUploadSuccess(); // Notifica al Dashboard para que refresque los datos
    } catch (error) {
      setEstadoCarga('error');
      setMensaje(error.response?.data?.mensaje || 'Ocurrió un error al subir el archivo.');
    } finally {
      setArchivo(null); // Limpia el archivo seleccionado después del intento
    }
  };

  return (
    <div className="bg-primario p-6 rounded-lg border border-borde h-full flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold mb-4">Procesar Nuevo Cierre Z</h3>
        <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-borde hover:border-blue-500'}`}>
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto text-texto-secundario mb-2" size={40} />
          {archivo ? (
            <p>Archivo: <span className="font-semibold text-blue-400">{archivo.name}</span></p>
          ) : (
            <p className="text-texto-secundario">Arrastra un archivo .txt aquí, o haz clic para seleccionarlo.</p>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        {estadoCarga === 'cargando' && (
          <div className="text-center flex items-center justify-center gap-2 text-blue-400"><Loader className="animate-spin" /> Procesando...</div>
        )}
        {estadoCarga === 'exito' && (
           <div className="text-center flex items-center justify-center gap-2 text-green-400"><CheckCircle /> {mensaje}</div>
        )}
         {estadoCarga === 'error' && (
           <div className="text-center flex items-center justify-center gap-2 text-red-400"><AlertTriangle /> {mensaje}</div>
        )}

        <button 
          onClick={handleSubir} 
          disabled={!archivo || estadoCarga === 'cargando'} 
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          Procesar Archivo
        </button>
      </div>
    </div>
  );
};

export default SubirCierre;