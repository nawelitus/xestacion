import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import { UploadCloud, FileText, X, LoaderCircle } from 'lucide-react';

const SubirCierre = () => {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [estaSubiendo, setEstaSubiendo] = useState(false);

  const onDrop = useCallback((archivosAceptados) => {
    setMensaje({ tipo: '', texto: '' });
    if (archivosAceptados.length > 0) {
      setArchivo(archivosAceptados[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    multiple: false,
  });

  const manejarSubida = async () => {
    if (!archivo) return;
    setEstaSubiendo(true);
    setMensaje({ tipo: '', texto: '' });
    const formData = new FormData();
    formData.append('archivoCierre', archivo);

    try {
      const respuesta = await api.post('/cierres/subir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMensaje({ tipo: 'exito', texto: respuesta.data.mensaje });
      setArchivo(null);
    } catch (error) {
      const textoError = error.response?.data?.mensaje || 'Error al subir el archivo.';
      setMensaje({ tipo: 'error', texto: textoError });
    } finally {
      setEstaSubiendo(false);
    }
  };
  
  return (
    <div className="bg-primario p-6 rounded-lg border border-borde">
      <h2 className="text-xl font-semibold text-texto-principal mb-4">Cargar Nuevo Cierre Z</h2>
      
      <div {...getRootProps()} className={`relative flex flex-col items-center justify-center w-full py-10 border-2 border-borde border-dashed rounded-lg cursor-pointer transition-all duration-300 ${isDragActive ? 'border-acento-1 bg-acento-1/10' : 'hover:border-acento-1/50'}`}>
        <input {...getInputProps()} />
        <div className="text-center">
            <UploadCloud className={`mx-auto h-12 w-12 ${isDragActive ? 'text-acento-1' : 'text-texto-secundario'}`} />
            <p className="mt-2 text-sm text-texto-secundario">
              <span className="font-semibold text-acento-1">Hacé clic</span> o arrastrá un archivo .txt
            </p>
        </div>
      </div>

      {archivo && (
        <div className="mt-4 bg-borde/30 p-3 rounded-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-texto-secundario" />
            <span className="text-sm font-medium text-texto-principal truncate">{archivo.name}</span>
          </div>
          <button onClick={() => setArchivo(null)} className="text-texto-secundario hover:text-white" disabled={estaSubiendo}>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={manejarSubida}
          disabled={!archivo || estaSubiendo}
          className="w-full flex justify-center items-center py-2.5 px-4 rounded-md shadow-sm font-medium text-white bg-gradient-to-r from-acento-1 to-acento-2 hover:from-acento-1/90 hover:to-acento-2/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {estaSubiendo ? <LoaderCircle className="animate-spin h-5 w-5" /> : 'Procesar Cierre'}
        </button>
      </div>

      {mensaje.texto && (
        <div className={`mt-4 p-3 rounded-md text-sm font-medium animate-fade-in ${mensaje.tipo === 'exito' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
};

export default SubirCierre;
