import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { subirCierre } from '../services/cierreService';
import { UploadCloud, Loader, CheckCircle, AlertTriangle, FileUp, ClipboardPaste } from 'lucide-react';

const SubirCierre = ({ onUploadSuccess }) => {
  // Estado para el modo de subida: 'archivo' o 'texto'
  const [modo, setModo] = useState('archivo'); 
  
  // Estados para manejar el archivo o el texto pegado
  const [archivo, setArchivo] = useState(null);
  const [textoPegado, setTextoPegado] = useState('');

  // Estados para la retroalimentación al usuario
  const [estadoCarga, setEstadoCarga] = useState('inicial'); // 'inicial', 'cargando', 'exito', 'error'
  const [mensaje, setMensaje] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setArchivo(acceptedFiles[0]);
      setEstadoCarga('inicial');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    maxFiles: 1,
    noClick: modo !== 'archivo', // Desactiva el clic si no estamos en modo archivo
    noDrag: modo !== 'archivo',
  });

  const handleProcesar = async () => {
    let archivoParaSubir = null;

    if (modo === 'archivo') {
      if (!archivo) {
        setMensaje('Por favor, selecciona un archivo primero.');
        setEstadoCarga('error');
        return;
      }
      archivoParaSubir = archivo;
    } else if (modo === 'texto') {
      if (!textoPegado.trim()) {
        setMensaje('Por favor, pega el contenido del cierre.');
        setEstadoCarga('error');
        return;
      }
      // Creamos un archivo "virtual" a partir del texto pegado
      const blob = new Blob([textoPegado], { type: 'text/plain' });
      archivoParaSubir = new File([blob], 'cierre-pegado.txt', { type: 'text/plain' });
    }

    if (!archivoParaSubir) return;

    setEstadoCarga('cargando');
    setMensaje('');

    try {
      const respuesta = await subirCierre(archivoParaSubir);
      setEstadoCarga('exito');
      setMensaje(respuesta.mensaje || 'Procesado exitosamente.');
      onUploadSuccess(); // Notifica al Dashboard para que refresque
    } catch (error) {
      setEstadoCarga('error');
      setMensaje(error.response?.data?.mensaje || 'Ocurrió un error al procesar.');
    } finally {
      // Limpiamos los inputs después del intento
      setArchivo(null);
      setTextoPegado('');
    }
  };
  
  const TabButton = ({ modoActivo, modoBtn, setModo, icono, texto }) => (
    <button 
      onClick={() => setModo(modoBtn)}
      className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-semibold border-b-2 transition-colors ${
        modoActivo === modoBtn 
          ? 'border-blue-500 text-blue-500' 
          : 'border-transparent text-texto-secundario hover:text-texto-principal'
      }`}
    >
      {icono} {texto}
    </button>
  );

  return (
    <div className="bg-primario p-6 rounded-lg border border-borde h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-2">Procesar Nuevo Cierre Z</h3>
      
      {/* Pestañas para seleccionar el modo */}
      <div className="flex border-b border-borde mb-4">
        <TabButton modoActivo={modo} modoBtn="archivo" setModo={setModo} icono={<FileUp size={16}/>} texto="Subir Archivo"/>
        <TabButton modoActivo={modo} modoBtn="texto" setModo={setModo} icono={<ClipboardPaste size={16}/>} texto="Pegar Texto"/>
      </div>
      
      <div className="flex-grow">
        {modo === 'archivo' && (
          <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors h-full flex flex-col justify-center ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-borde hover:border-blue-500'}`}>
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto text-texto-secundario mb-2" size={40} />
            {archivo ? (
              <p>Archivo: <span className="font-semibold text-blue-400">{archivo.name}</span></p>
            ) : (
              <p className="text-texto-secundario">Arrastra un archivo .txt aquí, o haz clic.</p>
            )}
          </div>
        )}

        {modo === 'texto' && (
          <textarea
            value={textoPegado}
            onChange={(e) => setTextoPegado(e.target.value)}
            placeholder="Pega aquí el contenido completo del archivo de Cierre Z..."
            className="w-full h-full min-h-[150px] p-3 bg-secundario border border-borde rounded-md text-texto-principal outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        )}
      </div>
      
      <div className="mt-4">
        {estadoCarga === 'cargando' && <div className="text-center flex items-center justify-center gap-2 text-blue-400"><Loader className="animate-spin" /> Procesando...</div>}
        {estadoCarga === 'exito' && <div className="text-center flex items-center justify-center gap-2 text-green-400"><CheckCircle /> {mensaje}</div>}
        {estadoCarga === 'error' && <div className="text-center flex items-center justify-center gap-2 text-red-400"><AlertTriangle /> {mensaje}</div>}

        <button 
          onClick={handleProcesar} 
          disabled={estadoCarga === 'cargando'}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          Procesar
        </button>
      </div>
    </div>
  );
};

export default SubirCierre;