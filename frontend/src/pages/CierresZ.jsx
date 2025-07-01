import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCierres } from '../services/cierreService';
import { Calendar, Search, FileText } from 'lucide-react';

const formatearFecha = (fechaISO) => new Date(fechaISO).toLocaleDateString('es-AR');
const formatearMoneda = (valor) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);

const CierresZ = () => {
  const [cierres, setCierres] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const cargarCierres = async () => {
      try {
        const data = await getCierres();
        setCierres(data);
      } catch (error) {
        console.error('Error al cargar cierres:', error);
      }
    };
    cargarCierres();
  }, []);

  const cierresFiltrados = cierres.filter(c =>
    c.numero_z.toString().includes(busqueda) ||
    formatearFecha(c.fecha_turno).includes(busqueda)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 text-primario">
        <FileText size={28} /> Historial de Cierres Z
      </h1>

      <div className="bg-secundario p-4 rounded-lg shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <Search className="text-texto-secundario" />
          <input
            type="text"
            className="w-full p-2 rounded-md bg-primario border border-borde text-sm"
            placeholder="Buscar por Nº Z o fecha..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-primario border border-borde rounded-lg overflow-hidden shadow">
        <table className="w-full text-sm">
          <thead className="bg-secundario text-texto-secundario uppercase text-xs">
            <tr>
              <th className="p-3 text-left">Nº Z</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Total a Rendir</th>
              <th className="p-3 text-left">Cargado por</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {cierresFiltrados.length > 0 ? (
              cierresFiltrados.map(cierre => (
                <tr key={cierre.id} className="hover:bg-secundario/30">
                  <td className="p-3 font-medium text-texto-principal">{cierre.numero_z}</td>
                  <td className="p-3">{formatearFecha(cierre.fecha_turno)}</td>
                  <td className="p-3">{formatearMoneda(cierre.total_a_rendir)}</td>
                  <td className="p-3">{cierre.usuario_carga_nombre}</td>
                  <td className="p-3 text-center">
                    <Link
                      to={`/cierre/${cierre.id}`}
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Detalle
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-6 text-center text-texto-secundario">
                  No se encontraron cierres con ese criterio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CierresZ;
