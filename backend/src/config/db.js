// ================================================================
// ARCHIVO: src/config/db.js
// Responsable de la conexión con la base de datos MySQL.
// ================================================================
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno según el ambiente
const envFile = process.env.NODE_ENV === 'production' ? '.env.produccion' : '.env.desarrollo';
//dotenv.config({ path: `./${envFile}` });
dotenv.config();


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('✅ Pool de conexiones a MySQL creado.');

// Función para probar la conexión al arrancar el servidor
export const probarConexion = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('🚀 Conexión exitosa a la base de datos MySQL.');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1); // Terminar el proceso si no se puede conectar a la BD
  }
};

export default pool; // Exportar el pool para que los modelos lo usen