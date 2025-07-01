import api from './api';

/**
 * @NUEVO
 * Sube un archivo de Cierre Z al backend para ser procesado.
 * @param {File} archivo - El objeto de archivo seleccionado por el usuario.
 * @returns {Promise<object>} La respuesta del servidor tras procesar el archivo.
 */
export const subirCierre = async (archivo) => {
  // Se debe usar FormData para enviar archivos
  const formData = new FormData();
  // 'archivoCierre' es el nombre del campo que Multer espera en el backend
  formData.append('archivoCierre', archivo);

  try {
    const { data } = await api.post('/cierres/subir', formData, {
      headers: {
        // Es importante especificar el tipo de contenido para la subida de archivos
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error("Error al subir el archivo de cierre:", error.response || error.message);
    throw error;
  }
};


/**
 * Realiza una petición GET para obtener los últimos cierres cargados.
 * @returns {Promise<Array>} Una promesa que resuelve a un array de objetos de cierre.
 */
export const obtenerCierresRecientes = async () => {
  try {
    const respuesta = await api.get('/cierres');
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener los cierres recientes:", error.response || error.message);
    throw error;
  }
};


/**
 * Realiza una petición GET a la API para obtener los detalles completos de un Cierre Z.
 * @param {string|number} id - El ID del cierre a obtener.
 * @returns {Promise<object>} Una promesa que resuelve a un objeto con todos los detalles del cierre.
 */
export const obtenerDetallePorId = async (id) => {
  try {
    const respuesta = await api.get(`/cierres/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error(`Error al obtener el detalle del cierre ${id}:`, error.response || error.message);
    throw error;
  }
};

export async function getCierres() {
  const response = await api.get('/cierres');
  return response.data;
};