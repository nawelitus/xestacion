import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerDetalleCliente, registrarPagoCliente } from '../services/clienteService';
import { ArrowLeft, Loader, AlertTriangle, Calendar, User, Hash, ClipboardList, TrendingDown, TrendingUp, Send } from 'lucide-react';
import useAuth from '../hooks/useAuth';

// --- Helpers y Componentes de UI (reutilizados y nuevos) ---
const formatearFechaHora = (fechaISO) => new Date(fechaISO).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);

const TarjetaInfoCliente = ({ cliente }) => (
  <div className="bg-primario p-6 rounded-lg border border-borde">
    <div className="flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold text-texto-principal">{cliente.detalles.nombre}</h2>
            <p className="text-texto-secundario">CUIT: {cliente.detalles.cuit || 'No especificado'}</p>
        </div>
        <div className="text-right">
            <p className="text-sm text-texto-secundario">Saldo Actual</p>
            <p className={`text-2xl font-bold ${Number(cliente.detalles.saldo_actual) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {formatearMoneda(cliente.detalles.saldo_actual)}
            </p>
        </div>
    </div>
  </div>
);

const FormularioPago = ({ clienteId, onPagoExitoso }) => {
    const [monto, setMonto] = useState('');
    const [concepto, setConcepto] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!monto || !concepto || Number(monto) <= 0) {
            setError('Todos los campos son obligatorios y el monto debe ser mayor a cero.');
            return;
        }
        setError('');
        setEnviando(true);
        try {
            await registrarPagoCliente(clienteId, { monto: Number(monto), concepto });
            setMonto('');
            setConcepto('');
            onPagoExitoso(); // Llama a la función callback para recargar datos
        } catch (err) {
            setError('Error al registrar el pago. Intente de nuevo.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="bg-primario p-6 rounded-lg border border-borde">
             <h3 className="text-lg font-semibold text-texto-principal mb-4">Registrar Nuevo Pago</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="monto" className="block text-sm font-medium text-texto-secundario mb-1">Monto</label>
                    <input type="number" id="monto" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Ej: 50000" className="w-full bg-secundario border border-borde rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                 <div>
                    <label htmlFor="concepto" className="block text-sm font-medium text-texto-secundario mb-1">Concepto</label>
                    <input type="text" id="concepto" value={concepto} onChange={e => setConcepto(e.target.value)} placeholder="Ej: Pago parcial factura..." className="w-full bg-secundario border border-borde rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={enviando} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-md transition-colors">
                    {enviando ? <><Loader size={20} className="animate-spin" /> Procesando...</> : <><Send size={16} /> Registrar Pago</>}
                </button>
             </form>
        </div>
    );
};

const TablaMovimientos = ({ movimientos }) => (
    <div className="bg-primario p-6 rounded-lg border border-borde">
        <h3 className="text-lg font-semibold text-texto-principal mb-4">Historial de Movimientos</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="text-left text-texto-secundario uppercase">
                    <tr>
                        <th className="p-2">Fecha</th>
                        <th className="p-2">Concepto</th>
                        <th className="p-2 text-right">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    {movimientos.map(m => (
                        <tr key={m.id} className="border-t border-borde">
                            <td className="p-2 whitespace-nowrap">{formatearFechaHora(m.fecha)}</td>
                            <td className="p-2 flex items-center gap-2">
                                {m.tipo === 'DEBITO' ? <TrendingDown className="text-red-400" size={16} /> : <TrendingUp className="text-green-400" size={16} />}
                                <span>{m.concepto}</span>
                            </td>
                            <td className={`p-2 text-right font-medium ${m.tipo === 'DEBITO' ? 'text-red-400' : 'text-green-400'}`}>
                                {m.tipo === 'DEBITO' ? '+' : '-'} {formatearMoneda(m.monto)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {movimientos.length === 0 && <p className="text-center text-texto-secundario py-8">No hay movimientos para mostrar.</p>}
        </div>
    </div>
);


// --- Componente Principal ---
const ClienteDetalle = () => {
    const { id } = useParams();
    const [cliente, setCliente] = useState(null);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState(null);
    const { usuario } = useAuth(); // Para verificar roles si es necesario

    const cargarDetalleCliente = useCallback(async () => {
        try {
            setEstaCargando(true);
            const datos = await obtenerDetalleCliente(id);
            setCliente(datos);
        } catch (err) {
            setError('No se pudo cargar la información del cliente.');
        } finally {
            setEstaCargando(false);
        }
    }, [id]);

    useEffect(() => {
        cargarDetalleCliente();
    }, [cargarDetalleCliente]);

    if (estaCargando) {
        return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>;
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <AlertTriangle className="mx-auto text-red-400" size={48} />
                <h2 className="mt-4 text-xl font-semibold text-texto-principal">Error</h2>
                <p className="text-texto-secundario">{error}</p>
                <Link to="/dashboard/cuentas-corrientes" className="mt-6 inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                    <ArrowLeft size={16} /> Volver a Cuentas Corrientes
                </Link>
            </div>
        );
    }
    
    if (!cliente) return null;

    return (
        <div className="space-y-6">
            <Link to="/dashboard/cuentas-corrientes" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline">
                <ArrowLeft size={16} /> Volver a la lista de clientes
            </Link>
            
            <TarjetaInfoCliente cliente={cliente} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TablaMovimientos movimientos={cliente.movimientos} />
                </div>
                <div className="lg:col-span-1">
                    {/* Solo administradores y editores pueden registrar pagos */}
                    {(usuario.rol === 'administrador' || usuario.rol === 'editor') && (
                        <FormularioPago clienteId={id} onPagoExitoso={cargarDetalleCliente} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClienteDetalle;