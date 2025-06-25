
// ================================================================
// ARCHIVO: src/components/SubirCierre.jsx (NUEVO)
// Componente con la lógica y la UI para subir los archivos .txt.
// ================================================================
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';

const SubirCierre = () => {
  const [archivo, setArchivo] = useState(null);
  const [progreso, setProgreso] = useState(0);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [estaSubiendo, setEstaSubiendo] = useState(false);

  const onDrop = useCallback((archivosAceptados) => {
    setMensaje({ tipo: '', texto: '' });
    if (archivosAceptados.length > 0) {
      setArchivo(archivosAceptados[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
    },
    multiple: false,
  });

  const manejarSubida = async () => {
    if (!archivo) {
      setMensaje({ tipo: 'error', texto: 'Por favor, selecciona un archivo primero.' });
      return;
    }

    const formData = new FormData();
    formData.append('archivoCierre', archivo);
    setEstaSubiendo(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const respuesta = await api.post('/cierres/subir', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (eventoDeProgreso) => {
          const porcentaje = Math.round((eventoDeProgreso.loaded * 100) / eventoDeProgreso.total);
          setProgreso(porcentaje);
        },
      });

      setMensaje({ tipo: 'exito', texto: respuesta.data.mensaje });
      setArchivo(null); // Limpiar el archivo después de subirlo
    } catch (error) {
      const textoError = error.response?.data?.mensaje || 'Error al subir el archivo.';
      setMensaje({ tipo: 'error', texto: textoError });
      console.error(error);
    } finally {
      setEstaSubiendo(false);
      setProgreso(0);
    }
  };

  const quitarArchivo = () => {
    setArchivo(null);
    setMensaje({ tipo: '', texto: '' });
  };
  
  const IconoArchivo = () => (
    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Cargar Nuevo Cierre Z</h2>
      
      {/* Zona de Dropzone */}
      <div {...getRootProps()} className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-400'} ${isDragReject ? 'border-red-500 bg-red-50' : ''}`}>
        <input {...getInputProps()} />
        <div className="space-y-1 text-center">
          <IconoArchivo />
          <div className="flex text-sm text-gray-600">
            <p className="pl-1">
              {isDragActive ? 
                (isDragReject ? 'Archivo no válido' : '¡Soltá el archivo aquí!') : 
                'Arrastrá y soltá un archivo .txt, o hacé clic para seleccionarlo'
              }
            </p>
          </div>
          <p className="text-xs text-gray-500">Solo archivos .txt</p>
        </div>
      </div>

      {/* Vista previa del archivo y progreso */}
      {archivo && (
        <div className="mt-4">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                <span className="text-sm font-medium text-gray-700 truncate">{archivo.name}</span>
                <button onClick={quitarArchivo} className="ml-4 text-red-500 hover:text-red-700 transition-colors" disabled={estaSubiendo}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            {estaSubiendo && (
                 <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progreso}%` }}></div>
                 </div>
            )}
        </div>
      )}

      {/* Botón de subida y mensajes */}
      <div className="mt-6">
        <button
          onClick={manejarSubida}
          disabled={!archivo || estaSubiendo}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {estaSubiendo ? 'Subiendo...' : 'Procesar Cierre'}
        </button>
      </div>

      {mensaje.texto && (
        <div className={`mt-4 p-3 rounded-md text-sm ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
};

export default SubirCierre;