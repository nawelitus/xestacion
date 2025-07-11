// Contenido para: src/components/ModalCajaDiaria.jsx

import React, { useState, useMemo, useEffect } from "react";
import { procesarCajaDiaria } from "../services/cajaDiariaService";
import { obtenerTodosLosEmpleados } from "../services/empleadoService";
import { obtenerDetallePorId } from "../services/cierreService"; // <-- IMPORTANTE: Nuevo servicio importado
import {
  X,
  Loader,
  Users,
  Banknote,
  Landmark,
  PlusCircle,
  Trash2,
  ChevronDown,
  FileText,
} from "lucide-react";

const formatearMoneda = (monto) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
    monto || 0
  );

// --- Componente FilaCredito (sin cambios) ---
const OPCIONES_CREDITO = [
  "TICKET CARD",
  "POSTNET INALAMBRICO 77",
  "POSTNET INALAMBRICO 51",
  "CREDITO PERSONAL",
];
const FilaCredito = ({ item, indice, actualizarCredito }) => {
  const [editandoItem, setEditandoItem] = useState(false);
  const esOpcionPredefinida = OPCIONES_CREDITO.includes(item.item);
  const handleSelectChange = (e) => {
    const valor = e.target.value;
    if (valor === "OTRO") {
      setEditandoItem(true);
      actualizarCredito(indice, "item", "");
    } else {
      setEditandoItem(false);
      actualizarCredito(indice, "item", valor);
    }
  };
  return (
    <tr className="hover:bg-secundario/50">
      <td className="p-1 border border-borde w-2/3">
        {editandoItem ? (
          <input
            type="text"
            value={item.item}
            onChange={(e) => actualizarCredito(indice, "item", e.target.value)}
            onBlur={() => {
              if (item.item) setEditandoItem(false);
            }}
            className="w-full bg-fondo p-1.5 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-texto-principal border border-borde"
            autoFocus
          />
        ) : (
          <select
            value={esOpcionPredefinida ? item.item : "OTRO"}
            onChange={handleSelectChange}
            className="w-full bg-fondo p-1.5 rounded-md text-texto-principal border border-borde focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
          >
            <option value="" disabled>
              Seleccionar...
            </option>
            {OPCIONES_CREDITO.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
            <option value="OTRO">
              {esOpcionPredefinida
                ? "Otro (especificar)"
                : item.item || "Otro (especificar)"}
            </option>
          </select>
        )}
      </td>
      <td className="p-1 border border-borde w-1/3">
        <input
          type="number"
          value={item.importe}
          onChange={(e) => actualizarCredito(indice, "importe", e.target.value)}
          placeholder="0.00"
          className="w-full bg-fondo p-1.5 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-right text-texto-principal border border-borde"
        />
      </td>
    </tr>
  );
};

// --- NUEVO: Componente Acordeón ---
const Acordion = ({ titulo, children }) => {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="border border-borde rounded-lg">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex justify-between items-center p-3 bg-secundario/30 hover:bg-secundario/60"
      >
        <span className="font-semibold text-texto-principal flex items-center gap-2">
          {titulo}
        </span>
        <ChevronDown
          size={20}
          className={`transition-transform duration-300 ${
            abierto ? "rotate-180" : ""
          }`}
        />
      </button>
      {abierto && <div className="p-4 border-t border-borde">{children}</div>}
    </div>
  );
};

// --- NUEVO: Componente para mostrar el detalle del Cierre Z ---
const VisorCierreZ = ({ cierreId }) => {
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cargarDetalle = async () => {
    setCargando(true);
    setError("");
    try {
      const data = await obtenerDetallePorId(cierreId);
      setDetalle(data);
    } catch (err) {
      setError("No se pudo cargar el detalle del Cierre Z.");
    } finally {
      setCargando(false);
    }
  };

  if (!detalle && !cargando && !error) {
    return (
      <button onClick={cargarDetalle} className="text-blue-500 hover:underline">
        Cargar y ver detalle del Cierre Z
      </button>
    );
  }
  if (cargando) return <Loader className="animate-spin" />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="text-xs space-y-3">
      {Object.entries(detalle.cabecera).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {String(value)}
        </div>
      ))}
      <h4 className="font-bold mt-2">Ventas Combustible:</h4>
      {detalle.ventasCombustible.map((v, i) => (
        <div key={i}>
          {v.producto_nombre}: {v.litros} Lts - {formatearMoneda(v.importe)}
        </div>
      ))}
      <h4 className="font-bold mt-2">Ventas Shop:</h4>
      {detalle.ventasShop.map((v, i) => (
        <div key={i}>
          {v.producto_nombre}: {v.cantidad} Un. - {formatearMoneda(v.importe)}
        </div>
      ))}
      <h4 className="font-bold mt-2">Movimientos Caja:</h4>
      {detalle.movimientosCaja.map((m, i) => (
        <div key={i}>
          {m.tipo} ({m.descripcion}): {formatearMoneda(m.monto)}
        </div>
      ))}
    </div>
  );
};

const ModalCajaDiaria = ({ cierre, alCerrar, alProcesarExito }) => {
  if (!cierre) return null;

  const [billetera, setBilletera] = useState({ recibido: "", entregado: "" });
  const [creditos, setCreditos] = useState(() =>
    Array(10).fill({ item: "", importe: "" })
  );
  const [retiros, setRetiros] = useState([]);
  const [nuevoRetiro, setNuevoRetiro] = useState({ nombre: "", monto: "" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [listaEmpleados, setListaEmpleados] = useState([]);

  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const empleados = await obtenerTodosLosEmpleados();
        setListaEmpleados(empleados);
      } catch (error) {
        console.error("No se pudo cargar la lista de empleados para el modal.");
      }
    };
    cargarEmpleados();
  }, []);

  const actualizarCredito = (indice, campo, valor) => {
    const nuevosCreditos = [...creditos];
    nuevosCreditos[indice] = { ...nuevosCreditos[indice], [campo]: valor };
    setCreditos(nuevosCreditos);
  };

  const agregarRetiro = () => {
    if (nuevoRetiro.nombre && nuevoRetiro.monto) {
      setRetiros([...retiros, nuevoRetiro]);
      setNuevoRetiro({ nombre: "", monto: "" });
    }
  };

  const eliminarRetiro = (indice) => {
    setRetiros(retiros.filter((_, i) => i !== indice));
  };

  const { totalDeclaradoFinal, diferenciaFinal } = useMemo(() => {
    const totalARendir = Number(cierre.total_a_rendir) || 0;
    const totalCreditos = creditos.reduce(
      (acc, c) => acc + (Number(c.importe) || 0),
      0
    );
    const dineroRecibido = Number(billetera.recibido) || 0;
    const dineroEntregado = Number(billetera.entregado) || 0;

    const diferenciaBilletera = dineroEntregado - dineroRecibido;
    const totalDeclarado = totalCreditos + diferenciaBilletera;
    const diferencia = totalDeclarado - totalARendir;

    return {
      totalDeclaradoFinal: totalDeclarado,
      diferenciaFinal: diferencia,
    };
  }, [
    creditos,
    billetera.recibido,
    billetera.entregado,
    cierre.total_a_rendir,
  ]);

  const handleSubmit = async () => {
    setError("");
    setEnviando(true);
    const datosParaEnviar = {
      billetera: {
        recibido: Number(billetera.recibido) || 0,
        entregado: Number(billetera.entregado) || 0,
      },
      creditos: creditos
        .map((c) => ({ ...c, importe: Number(c.importe) || 0 }))
        .filter((c) => c.item && c.importe > 0),
      retiros: retiros
        .map((r) => ({ ...r, monto: Number(r.monto) || 0 }))
        .filter((r) => r.nombre && r.monto > 0),
    };
    try {
      await procesarCajaDiaria(cierre.id, datosParaEnviar);
      alProcesarExito();
    } catch (err) {
      setError(
        "Error al procesar el cierre. Verifique los datos e intente de nuevo."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
      onClick={alCerrar}
    >
      <div
        className="bg-primario rounded-lg shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 border-b border-borde">
          <h2 className="text-xl font-bold">
            Procesar Caja Diaria - Cierre Z N° {cierre.numero_z}  
          </h2>
          <button
            onClick={alCerrar}
            className="text-texto-secundario hover:text-white"
          >
            <X />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-7">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 ">
            <div className="md:col-span-2 space-y-2 ">
              <h3 className="text-lg font-semibold flex  text-blue-200 items-center gap-4">
                <Landmark size={20} /> Créditos y Vales
              </h3>
              <table className=" w-full max-w-md text-sm mx-auto">
                <thead>
                  <tr>
                    <th className="text-left p-1 w-2/3">Item</th>
                    <th className="text-left p-1 w-1/3">Importe</th>
                  </tr>
                </thead>

                <tbody className="bg-gray-700 rounded-md ">
                  {creditos.map((c, i) => (
                    <FilaCredito
                      key={i}
                      item={c}
                      indice={i}
                      actualizarCredito={actualizarCredito}
                    />
                  ))} 
                </tbody>
              </table>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Banknote size={20} /> Billetera Playero
                </h3>
                <div className="space-y-2 mt-2">
                  <div>
                    <label className="text-blue-300 text-xs text-texto-secundario">
                      Dinero Recibido
                    </label>
                    <input
                      type="number"
                      value={billetera.recibido}
                      onChange={(e) =>
                        setBilletera({ ...billetera, recibido: e.target.value })
                      }
                      className="-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-texto-principal border border-borde"
                    />
                  </div>
                  <div>
                    <label className="text-red-300 text-xs text-texto-secundario">
                      Dinero Entregado
                    </label>
                    <input
                      type="number"
                      value={billetera.entregado}
                      onChange={(e) =>
                        setBilletera({
                          ...billetera,
                          entregado: e.target.value,
                        })
                      }
                      className="-full bg-fondo p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-texto-principal border border-borde"
                    />
                  </div>
                  <div className="text-orange-200 pt-1 text-texto-secundario">
                    Diferencia Neta:{" "}
                    {formatearMoneda(
                      (Number(billetera.entregado) || 0) -
                        (Number(billetera.recibido) || 0)
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users size={20} /> Retiros de Personal
                </h3>
                <div className="space-y-2 mt-2">
                  {retiros.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs bg-secundario p-1 rounded"
                    >
                      <span className="flex-1 text-texto-principal">
                        {r.nombre}
                      </span>
                      <span className="font-semibold text-texto-principal">
                        {formatearMoneda(r.monto)}
                      </span>
                      <button
                        onClick={() => eliminarRetiro(i)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-1 pt">
                    <select
                      value={nuevoRetiro.nombre}
                      onChange={(e) =>
                        setNuevoRetiro({
                          ...nuevoRetiro,
                          nombre: e.target.value,
                        })
                      }
                      className="w-full bg-fondo  text-xs  p-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-texto-principal border border-borde"
                    >
                      <option value="" disabled>
                        empleado...
                      </option>
                      {listaEmpleados.map((emp) => (
                        <option key={emp.id} value={emp.nombre_completo}>
                          {emp.nombre_completo}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Monto"
                      value={nuevoRetiro.monto}
                      onChange={(e) =>
                        setNuevoRetiro({
                          ...nuevoRetiro,
                          monto: e.target.value,
                        })
                      }
                      className="w-20 bg-fondo p-1.5   text-xs rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-texto-principal border border-borde"
                    />
                    <button
                      onClick={agregarRetiro}
                      className="bg-blue-600 p-2 rounded disabled:bg-orange-600"
                      disabled={!nuevoRetiro.nombre || !nuevoRetiro.monto}
                    >
                      <PlusCircle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* --- INTEGRACIÓN DEL ACORDEÓN --- */}
          <Acordion
            titulo={
              <>
                <FileText size={16} /> Ver Detalle del Cierre Z Original
              </>
            }
          >
            <VisorCierreZ cierreId={cierre.id} />
          </Acordion>
        </div>

        <div className="p-2 bg-secundario/50 mt-auto border-t border-borde">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-texto-secundario">
                Total a Rendir (Z)
              </p>
              <p className="font-bold text-lg">
                {formatearMoneda(cierre.total_a_rendir)}
              </p>
            </div>
            <div>
              <p className="text-xs text-texto-secundario">
                Total Declarado (Final)
              </p>
              <p className="font-bold text-lg">
                {formatearMoneda(totalDeclaradoFinal)}
              </p>
            </div>
            <div>
              <p className="text-xs text-texto-secundario">Diferencia</p>
              <p
                className={`font-bold text-lg ${
                  diferenciaFinal < 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                {formatearMoneda(diferenciaFinal)}
              </p>
            </div>
            {error && (
              <p className="text-red-500 text-center text-sm mt-2">{error}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={enviando}
              className="w-full mt-1 bg-blue-500 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-1 rounded-md flex items-center justify-center gap-4"
            >
              {enviando ? <Loader className="animate-spin" /> : "Procesar Caja"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCajaDiaria;
