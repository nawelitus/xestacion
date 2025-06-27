import React, { useState, useMemo } from 'react';
import { procesarCajaDiaria } from '../services/cajaDiariaService';
import { X, Loader, Users, Banknote, Landmark, PlusCircle, Trash2 } from 'lucide-react';

const formatearMoneda = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);

const OPCIONES_CREDITO = ["TICKET CARD", "POSTNET INALAMBRICO 77", "POSTNET INALAMBRICO 51", "CREDITO PERSONAL"];

const FilaCredito = ({ item, indice, actualizarCredito }) => {
  const [editandoItem, setEditandoItem] = useState(false);
  const esOpcionPredefinida = OPCIONES_CREDITO.includes(item.item);

  const handleSelectChange = (e) => {
    const valor = e.target.value;
    if (valor === "OTRO") {
      setEditandoItem(true);
      actualizarCredito(indice, 'item', '');
    } else {
      setEditandoItem(false);
      actualizarCredito(indice, 'item', valor);
    }
  };

  return (
    <tr className="hover:bg-secundario/50">
      <td className="p-2 border border-borde">
        {editandoItem ? (
          <input
            type="text"
            value={item.item}
            onChange={(e) => actualizarCredito(indice, 'item', e.target.value)}
            onBlur={() => { if(item.item) setEditandoItem(false) }}
            className="w-full bg-fondo p-1 rounded-md outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <select value={esOpcionPredefinida ? item.item : 'OTRO'} onChange={handleSelectChange} className="w-full bg-secundario p-1 rounded-md">
            <option value="" disabled>Seleccionar...</option>
            {OPCIONES_CREDITO.map(op => <option key={op} value={op}>{op}</option>)}
            <option value="OTRO">{esOpcionPredefinida ? 'Otro (especificar)' : item.item || 'Otro (especificar)'}</option>
          </select>
        )}
      </td>
      <td className="p-2 border border-borde">
        <input
          type="number"
          value={item.importe}
          onChange={(e) => actualizarCredito(indice, 'importe', e.target.value)}
          placeholder="0.00"
          className="w-full bg-fondo p-1 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-right"
        />
      </td>
    </tr>
  );
};


const ModalCajaDiaria = ({ cierre, alCerrar, alProcesarExito }) => {
  if (!cierre) return null;

  const [billetera, setBilletera] = useState({ recibido: '', entregado: '' });
  const [creditos, setCreditos] = useState(() => Array(10).fill({ item: '', importe: '' }));
  const [retiros, setRetiros] = useState([]);
  const [nuevoRetiro, setNuevoRetiro] = useState({ nombre: '', monto: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const actualizarCredito = (indice, campo, valor) => {
    const nuevosCreditos = [...creditos];
    nuevosCreditos[indice] = { ...nuevosCreditos[indice], [campo]: valor };
    setCreditos(nuevosCreditos);
  };

  const agregarRetiro = () => {
    if (nuevoRetiro.nombre && nuevoRetiro.monto) {
      setRetiros([...retiros, nuevoRetiro]);
      setNuevoRetiro({ nombre: '', monto: '' });
    }
  };

  const eliminarRetiro = (indice) => {
    setRetiros(retiros.filter((_, i) => i !== indice));
  };

  // ======================= LÓGICA DE CÁLCULO CORREGIDA =======================
  const { totalDeclarado, diferencia } = useMemo(() => {
    const totalCreditos = creditos.reduce((acc, c) => acc + (Number(c.importe) || 0), 0);
    
    const dineroRecibido = Number(billetera.recibido) || 0;
    const dineroEntregado = Number(billetera.entregado) || 0;
    // La diferencia de la billetera es el efectivo neto que se generó durante el turno.
    const diferenciaBilletera =   dineroRecibido - dineroEntregado;
    
    if (diferenciaBilletera < 0) {
          difereciaBilletera = diferenciaBilletera * -1;} // Aseguramos que la diferencia sea positiva



    // El total declarado es la suma de los créditos más el efectivo neto generado.
    const totalDeclaradoCalc = (Number(totalCreditos + diferenciaBilletera));
    
    // La diferencia final es lo que se debe rendir (del Z) vs lo que se declara.
    const diferenciaCalc = totalDeclaradoCalc - (Number(cierre.total_a_rendir) || 0) ;

    return { totalDeclarado: totalDeclaradoCalc, diferencia: diferenciaCalc };
  }, [creditos, billetera.recibido, billetera.entregado, cierre.total_a_rendir]);
  // ===================== FIN DE LA CORRECCIÓN ======================
  
  const handleSubmit = async () => {
      setError('');
      setEnviando(true);
      const datosParaEnviar = {
          billetera: {
              recibido: Number(billetera.recibido) || 0,
              entregado: Number(billetera.entregado) || 0,
          },
          creditos: creditos.map(c => ({...c, importe: Number(c.importe) || 0})).filter(c => c.item && c.importe > 0),
          retiros: retiros.map(r => ({...r, monto: Number(r.monto) || 0})).filter(r => r.nombre && r.monto > 0),
      };

      try {
          await procesarCajaDiaria(cierre.id, datosParaEnviar);
          alProcesarExito();
      } catch (err) {
          setError('Error al procesar el cierre. Verifique los datos e intente de nuevo.');
      } finally {
          setEnviando(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={alCerrar}>
      <div className="bg-primario rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-borde">
          <h2 className="text-xl font-bold">Procesar Caja Diaria - Cierre Z N° {cierre.numero_z}</h2>
          <button onClick={alCerrar} className="text-texto-secundario hover:text-white"><X /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Landmark size={20} /> Créditos y Vales</h3>
              <table className="w-full text-sm">
                <thead><tr><th className="text-left p-2">Item</th><th className="text-left p-2">Importe</th></tr></thead>
                <tbody>{creditos.map((c, i) => <FilaCredito key={i} item={c} indice={i} actualizarCredito={actualizarCredito} />)}</tbody>
              </table>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><Banknote size={20} /> Billetera Playero</h3>
                    <div className="space-y-2 mt-2">
                        <div>
                            <label className="text-xs">Dinero Recibido</label>
                            <input type="number" value={billetera.recibido} onChange={e => setBilletera({...billetera, recibido: e.target.value})} className="w-full bg-secundario p-1.5 rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-xs">Dinero Entregado</label>
                            <input type="number" value={billetera.entregado} onChange={e => setBilletera({...billetera, entregado: e.target.value})} className="w-full bg-secundario p-1.5 rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div className="text-xs pt-1">Diferencia Neta: {formatearMoneda((Number(billetera.entregado) || 0) - (Number(billetera.recibido) || 0))}</div>
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><Users size={20} /> Retiros de Personal</h3>
                    <div className="space-y-2 mt-2">
                        {retiros.map((r, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs bg-secundario p-1 rounded">
                                <span className="flex-1">{r.nombre}</span>
                                <span className="font-semibold">{formatearMoneda(r.monto)}</span>
                                <button onClick={() => eliminarRetiro(i)} className="text-red-500 hover:text-red-400"><Trash2 size={14} /></button>
                            </div>
                        ))}
                         <div className="flex items-center gap-2 pt-2">
                            <input type="text" placeholder="Nombre" value={nuevoRetiro.nombre} onChange={e => setNuevoRetiro({...nuevoRetiro, nombre: e.target.value})} className="w-full bg-fondo p-1.5 rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
                            <input type="number" placeholder="Monto" value={nuevoRetiro.monto} onChange={e => setNuevoRetiro({...nuevoRetiro, monto: e.target.value})} className="w-24 bg-fondo p-1.5 rounded-md outline-none focus:ring-1 focus:ring-blue-500" />
                            <button onClick={agregarRetiro} className="bg-blue-600 p-1.5 rounded"><PlusCircle size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-secundario/50 mt-auto border-t border-borde">
           <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-xs text-texto-secundario">Total a Rendir (Z)</p><p className="font-bold text-lg">{formatearMoneda(cierre.total_a_rendir)}</p></div>
                <div><p className="text-xs text-texto-secundario">Total Declarado</p><p className="font-bold text-lg">{formatearMoneda(totalDeclarado)}</p></div>
                <div><p className="text-xs text-texto-secundario">Diferencia</p><p className={`font-bold text-lg ${diferencia.toFixed(2) !== '0.00' ? 'text-red-400' : 'text-green-400'}`}>{formatearMoneda(diferencia)}</p></div>
           </div>
           {error && <p className="text-red-500 text-center text-sm mt-2">{error}</p>}
           <button onClick={handleSubmit} disabled={enviando} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-2 rounded-md flex items-center justify-center gap-2">
                {enviando ? <Loader className="animate-spin" /> : 'Procesar Caja'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCajaDiaria;