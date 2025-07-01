import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listarClientesConSaldos } from '../services/clienteService';
import { Loader, AlertTriangle, Users, ChevronsRight, Search } from 'lucide-react';

const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);
//--
const SaldoBadge = ({ saldo }) => {
  const saldoNumerico = Number(saldo) || 0;
  let claseColor = 'bg-gray-500/20 text-gray-300'; // Saldo Cero
  if (saldoNumerico > 0) claseColor = 'bg-red-500/20 text-red-400'; // Deuda
  if (saldoNumerico < 0) claseColor = 'bg-green-500/20 text-green-400'; // Saldo a favor

  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${claseColor}`}>
      {formatearMoneda(saldoNumerico)}
    </span>
  );
};

const CuentasCorrientes = () => {
  const [clientes, setClientes] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [estaCargando, setEstaCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        setEstaCargando(true);
        setError(null);
        const datos = await listarClientesConSaldos();
        setClientes(datos);
      } catch (err) {
        setError('No se pudieron cargar los clientes. Intente más tarde.');
      } finally {
        setEstaCargando(false);
      }
    };
    cargarClientes();
  }, []);

  const clientesFiltrados = clientes.filter(c => 
    c.cliente_nombre.toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  const renderContenido = () => {
    if (estaCargando) {
      return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>;
    }

    if (error) {
      return (
        <div className="text-center py-10 bg-primario rounded-lg border border-borde">
          <AlertTriangle className="mx-auto text-red-400" size={48} />
          <h2 className="mt-4 text-xl font-semibold text-texto-principal">Error</h2>
          <p className="text-texto-secundario">{error}</p>
        </div>
      );
    }
    
    if (clientesFiltrados.length === 0) {
        return (
             <div className="text-center py-10 bg-primario rounded-lg border border-borde">
                <Users className="mx-auto text-texto-secundario" size={48} />
                <h2 className="mt-4 text-xl font-semibold text-texto-principal">No se encontraron clientes</h2>
                <p className="text-texto-secundario">{terminoBusqueda ? "Prueba con otro término de búsqueda." : "Aún no hay clientes registrados."}</p>
            </div>
        )
    }

    return (
      <div className="bg-primario rounded-lg border border-borde overflow-hidden">
        <ul className="divide-y divide-borde">
          {clientesFiltrados.map(cliente => (
            <li key={cliente.cliente_id}>
             <Link to={`/cuentas-corrientes/${cliente.cliente_id}`} className="flex items-center justify-between p-4 hover:bg-secundario transition-colors">
                <span className="font-medium text-texto-principal">{cliente.cliente_nombre}</span>
                <div className="flex items-center gap-4">
                  <SaldoBadge saldo={cliente.saldo_actual} />
                  <ChevronsRight className="text-texto-secundario" size={20}/>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-texto-principal">Cuentas Corrientes de Clientes</h1>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-secundario" size={20} />
        <input 
          type="text"
          placeholder="Buscar cliente por nombre..."
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          className="w-full bg-primario border border-borde rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
        />
      </div>

      {renderContenido()}
    </div>
  );
};

export default CuentasCorrientes;