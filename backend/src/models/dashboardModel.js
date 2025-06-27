import pool from '../config/db.js';

const DashboardModel = {
  async obtenerDatosDashboard() {
    try {
      const [
        resumenSemanal,
        kpisGenerales,
        retirosMes,
        actividadReciente
      ] = await Promise.all([
        pool.query(`
          SELECT
            COALESCE(SUM(total_bruto), 0) AS ventas_semana,
            COUNT(id) AS cierres_semana
          FROM cierres_z
          WHERE fecha_turno >= CURDATE() - INTERVAL 7 DAY
        `),
        pool.query(`
          SELECT
            (SELECT COALESCE(SUM(saldo_actual), 0) FROM vista_saldos_cta_cte) AS deuda_total,
            (SELECT COUNT(id) FROM clientes) AS total_clientes
        `),
        pool.query(`
          SELECT COALESCE(SUM(monto), 0) AS retiros_mes_actual
          FROM retiros_personal
          WHERE MONTH(fecha_registro) = MONTH(CURDATE()) AND YEAR(fecha_registro) = YEAR(CURDATE())
        `),
        pool.query(`
          SELECT 
            cz.id, cz.numero_z, cz.fecha_turno, cz.total_a_rendir, u.nombre_completo AS usuario_carga_nombre
          FROM cierres_z cz
          JOIN usuarios u ON cz.usuario_carga_id = u.id
          ORDER BY cz.fecha_carga DESC
          LIMIT 5;
        `)
      ]);

      return {
        kpis: {
          ventas_semana: resumenSemanal[0][0].ventas_semana,
          cierres_semana: resumenSemanal[0][0].cierres_semana,
          deuda_total: kpisGenerales[0][0].deuda_total,
          total_clientes: kpisGenerales[0][0].total_clientes,
          retiros_mes_actual: retirosMes[0][0].retiros_mes_actual
        },
        actividadReciente: actividadReciente[0]
      };

    } catch (error) {
      console.error("Error al obtener los datos del dashboard:", error);
      throw new Error('Error al consultar los datos del dashboard en la base de datos.');
    }
  }
};

export default DashboardModel;