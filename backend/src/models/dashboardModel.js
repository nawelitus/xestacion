// Contenido para: src/models/dashboardModel.js

import pool from '../config/db.js';

const DashboardModel = {
  async obtenerDatosDashboard() {
    try {
      // --- CAMBIO: Unificamos todas las consultas de KPIs en una sola para mayor eficiencia ---
      const queryKpis = `
        SELECT
          -- KPIs existentes
          (SELECT COALESCE(SUM(total_bruto), 0) FROM cierres_z WHERE fecha_turno >= CURDATE() - INTERVAL 7 DAY) AS ventas_semana,
          (SELECT COUNT(id) FROM clientes) AS total_clientes,
          (SELECT COALESCE(SUM(saldo_actual), 0) FROM vista_saldos_cta_cte) AS deuda_total,
          (SELECT COALESCE(SUM(monto), 0) FROM retiros_personal WHERE MONTH(fecha_registro) = MONTH(CURDATE()) AND YEAR(fecha_registro) = YEAR(CURDATE())) AS retiros_mes_actual,
          
          -- KPIs NUEVOS
          (SELECT COALESCE(SUM(total_bruto), 0) FROM cierres_z WHERE fecha_turno = CURDATE() - INTERVAL 1 DAY) AS ventas_ayer,
          (SELECT COALESCE(SUM(total_mercadopago), 0) FROM cierres_z WHERE fecha_turno = CURDATE()) AS mercadopago_hoy,
          (SELECT COALESCE(SUM(vs.importe), 0) FROM ventas_shop_z vs JOIN cierres_z cz ON vs.cierre_z_id = cz.id WHERE cz.fecha_turno = CURDATE()) AS shop_hoy,
          (SELECT COALESCE(SUM(total_faltante), 0) FROM cierres_z WHERE MONTH(fecha_turno) = MONTH(CURDATE()) AND YEAR(fecha_turno) = YEAR(CURDATE())) AS faltante_mes
      `;

      const [
        kpisResult,
        actividadReciente
      ] = await Promise.all([
        pool.query(queryKpis),
        pool.query(`
          SELECT 
            cz.id, cz.numero_z, cz.fecha_turno, cz.total_a_rendir, u.nombre_completo AS usuario_carga_nombre
          FROM cierres_z cz
          JOIN usuarios u ON cz.usuario_carga_id = u.id
          ORDER BY cz.fecha_carga DESC
          LIMIT 5;
        `)
      ]);

      // Devolvemos un solo objeto con todos los KPIs
      return {
        kpis: kpisResult[0][0],
        actividadReciente: actividadReciente[0]
      };

    } catch (error) {
      console.error("Error al obtener los datos del dashboard:", error);
      throw new Error('Error al consultar los datos del dashboard en la base de datos.');
    }
  }
};

export default DashboardModel;