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
          (SELECT COALESCE(SUM(diferencia_final), 0) FROM cierres_z WHERE MONTH(fecha_turno) = MONTH(CURDATE()) AND YEAR(fecha_turno) = YEAR(CURDATE())) AS faltante_mes
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
,
  // ► NUEVO: últimos 3 cierres por numero_z con turno y faltante calculados
  async ultimosPorTurno() {
    const [rows] = await pool.query(`
      SELECT
        t.id,
        t.numero_z,
        t.fecha_turno,
        t.hora_inicio,
        t.total_bruto,
        t.caja_procesada,
        t.diferencia_final,
        t.total_faltante,
        CASE
          WHEN TIME(t.hora_inicio) BETWEEN '04:00:00' AND '10:00:00' THEN 'MAÑANA'
          WHEN TIME(t.hora_inicio) BETWEEN '12:00:00' AND '16:00:00' THEN 'TARDE'
          WHEN TIME(t.hora_inicio) BETWEEN '20:00:00' AND '23:00:00' THEN 'NOCHE'
          ELSE 'OTRO'
        END AS turno,
        CASE
          WHEN t.caja_procesada = 1 THEN t.diferencia_final
          ELSE t.total_faltante
        END AS faltante
      FROM (
        SELECT id, numero_z, fecha_turno, hora_inicio, total_bruto,
               caja_procesada, diferencia_final, total_faltante
        FROM cierres_z
        ORDER BY numero_z DESC
        LIMIT 3
      ) AS t
      ORDER BY t.numero_z DESC
    `);

    return rows; // array de 3 items
  },
};


export default DashboardModel;