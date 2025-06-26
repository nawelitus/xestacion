import CajaDiariaModel from '../models/cajaDiariaModel.js';

/**
 * Formatea un objeto Date a un string YYYY-MM-DD en la zona horaria de Argentina.
 * @param {Date} date - El objeto Date a formatear.
 * @returns {string} La fecha en formato YYYY-MM-DD.
 */
const formatearFechaA_YYYY_MM_DD = (date) => {
    // Usamos toLocaleString para obtener la fecha correcta en Argentina
    // y luego la reordenamos al formato estándar YYYY-MM-DD.
    const [dia, mes, anio] = date.toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).split('/');
    return `${anio}-${mes}-${dia}`;
}


const CajaDiariaController = {
  /**
   * Obtiene el resumen consolidado de la caja para una fecha dada.
   * Si no se provee fecha, utiliza la fecha actual de Argentina.
   */
  async obtenerCajaDelDia(req, res) {
    try {
      // Si el cliente envía una fecha en la query (?fecha=YYYY-MM-DD), la usamos.
      // Si no, usamos la fecha actual de Argentina como valor por defecto.
      const fecha = req.query.fecha || formatearFechaA_YYYY_MM_DD(new Date());

      const resumenDelDia = await CajaDiariaModel.obtenerResumenPorFecha(fecha);

      if (!resumenDelDia) {
        return res.status(200).json({ 
            mensaje: `No se encontraron cierres para la fecha ${fecha}.`,
            data: {
                fecha_consulta: fecha,
                resumen: {
                    cantidad_cierres: 0
                }
            }
         });
      }

      res.status(200).json({
          mensaje: `Resumen para la fecha ${fecha} obtenido exitosamente.`,
          data: resumenDelDia
      });

    } catch (error) {
      console.error('Error en el controlador de Caja Diaria:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor al obtener el resumen diario.', detalle: error.message });
    }
  }
};

export default CajaDiariaController;