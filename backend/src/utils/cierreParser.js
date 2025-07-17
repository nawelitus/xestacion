// src/utils/cierreParser.js

/**
 * Parsea el texto de un cierre de turno Z y lo convierte en un objeto JSON estructurado.
 * @param {string} textoCierre - El contenido completo del archivo de cierre Z como un string.
 * @returns {object} Un objeto con todos los datos parseados.
 */
export const parsearCierreZ = (textoCierre) => {
    const datosCierre = {
        encabezado: {
            numero_z: null,
            fecha_turno: '1970-01-01',
            hora_inicio: '00:00:00',
            hora_fin: '00:00:00',
            cerrado_por: 'No especificado'
        },
        resumen: [],
        ventasPorProducto: [],
        remitos: [],
        bajasPorProducto: [],
        percepcionesIIBB: [],
        cupones: [],
        mercadoPago: [],
        tiradas: [],
        ingresos: [],
        axionOn: [],
        gastos: [],
        detalleTanques: [],
        declaracionEmpleado: {},
        errores: []
    };

    const lineas = textoCierre.split('\n');
    let seccionActual = '';

    const limpiarImporte = (textoImporte) => {
        if (!textoImporte) return 0;
        const textoLimpio = textoImporte.replace(/\$/g, '').replace(/,/g, '').trim();
        const valor = parseFloat(textoLimpio);
        return isNaN(valor) ? 0 : valor;
    };

    const encabezados = {
        '<<<<< CIERRE DE TURNO >>>>>': 'RESUMEN',
        '========= VENTAS POR PRODUCTO ==========': 'VENTAS_PRODUCTO',
        '========= DETALLE DE REMITOS ===========': 'REMITOS',
        '========= BAJAS POR PRODUCTO ===========': 'BAJAS_PRODUCTO',
        '======== PERCEPCIONES DE IIBB ==========': 'PERCEPCIONES_IIBB',
        '=============== CUPONES ================': 'CUPONES',
        '========= DETALLE MERCADOPAGO ==========': 'MERCADOPAGO',
        '========= DETALLE DE TIRADAS ===========': 'TIRADAS',
        '========= DETALLE DE INGRESOS ==========': 'INGRESOS',
        '============== AXION ON ================': 'AXION_ON',
        '========= DETALLE DE GASTOS ============': 'GASTOS',
        '========= DETALLE DE TANQUES ===========': 'TANQUES',
        '====== DECLARACION DEL EMPLEADO ========': 'DECLARACION_EMPLEADO'
    };

    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];
        const lineaTrim = linea.trim();
        if (lineaTrim === '') continue;

        if (encabezados[lineaTrim]) {
            seccionActual = encabezados[lineaTrim];
            continue;
        }

        const seccionesOmitidas = [
            '======== TOTALES POR PRODUCTO ==========', '====== DETALLE DE TOTALIZADORES ========',
            '=== TICK FACT Y REM DE COMBUSTIBLE =====', '========== VENTAS POR RUBRO ============',
            '========= CUPONES POR TARJETA ==========', '============= MEDICIONES ===============',
            '====== TICK Y FACT POR EMPLEADO ========', '=== FACTURACION POR MEDIO DE PAGO ======'
        ];
        if (seccionesOmitidas.includes(lineaTrim)) {
            seccionActual = 'OMITIR';
            continue;
        }

        if (lineaTrim.startsWith('-----------------')) {
            if (seccionActual !== 'RESUMEN') seccionActual = '';
            continue;
        }

        if (seccionActual !== 'RESUMEN' && lineaTrim.toUpperCase().startsWith('TOTAL')) {
            continue;
        }

        if (seccionActual === 'OMITIR') continue;

        switch (seccionActual) {
            case 'RESUMEN':
                if (lineaTrim.startsWith('Numero:')) {
                    datosCierre.encabezado.numero_z = parseInt(lineaTrim.split(':')[1]?.trim(), 10);
                } else if (lineaTrim.startsWith('Desde:')) {
                    const textoCompleto = lineaTrim.substring(lineaTrim.indexOf(':') + 1).trim();
                    const partes = textoCompleto.split(' ');
                    if (partes.length >= 2) {
                        datosCierre.encabezado.fecha_turno = partes[0];
                        datosCierre.encabezado.hora_inicio = partes[1];
                    }
                } else if (lineaTrim.startsWith('Hasta:')) {
                    const textoCompleto = lineaTrim.substring(lineaTrim.indexOf(':') + 1).trim();
                    const partes = textoCompleto.split(' ');
                    if (partes.length >= 2) {
                        datosCierre.encabezado.hora_fin = partes[1];
                    }
                } else if (lineaTrim.startsWith('Cerrado por:')) {
                    datosCierre.encabezado.cerrado_por = lineaTrim.split(':')[1]?.trim();
                } else {
                    datosCierre.resumen.push(lineaTrim);
                }
                break;
            
            case 'MERCADOPAGO': {
                const partes = lineaTrim.split(/\s+/);
                const importeStr = partes.pop();
                const importe = limpiarImporte(importeStr);
                const desc = partes.join(' ');
                const descripcion = desc === '' ? 'Sin Detalle' : desc;
                datosCierre.mercadoPago.push({ descripcion, importe });
                break;
            }
            
            // ================================================================
            // ▼▼▼ CORRECCIÓN: SEPARAR EL CASE DE PERCEPCIONES_IIBB ▼▼▼
            // ================================================================
            case 'PERCEPCIONES_IIBB': {
                const partes = lineaTrim.split(/\s{2,}/);
                if (partes.length > 1) {
                    const importe = limpiarImporte(partes.pop());
                    const descripcion = partes.join(' ');
                    // Se apunta directamente a la propiedad correcta 'percepcionesIIBB'
                    datosCierre.percepcionesIIBB.push({ descripcion, importe });
                }
                break;
            }
            // ================================================================

            // El resto de las secciones genéricas permanecen agrupadas
            case 'VENTAS_PRODUCTO':
            case 'BAJAS_PRODUCTO':
            // case 'PERCEPCIONES_IIBB': // Se quita de este grupo
            case 'CUPONES':
            case 'TIRADAS':
            case 'AXION_ON': {
                const partes = lineaTrim.split(/\s{2,}/);
                if (partes.length > 1) {
                    const importe = limpiarImporte(partes.pop());
                    const descripcion = partes.join(' ');
                    const seccionCamelCase = seccionActual.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());
                    if(datosCierre[seccionCamelCase]) {
                        datosCierre[seccionCamelCase].push({ descripcion, importe });
                    }
                }
                break;
            }
            
            case 'REMITOS': {
                const match = lineaTrim.match(/^(\S+)\s+(.+?)\s+([\d.]+)$/);
                if (match) {
                    const [, numero_remito, cliente_nombre, importe_texto] = match;
                    datosCierre.remitos.push({ numero_remito: numero_remito.trim(), cliente_nombre: cliente_nombre.trim(), importe: limpiarImporte(importe_texto) });
                }
                break;
            }
            case 'INGRESOS':
            case 'GASTOS': {
                if (/^\d/.test(lineaTrim)) {
                    const partes = lineaTrim.split(/\s+/);
                    const comprobante = partes[0];
                    const importe = limpiarImporte(partes[partes.length - 1]);
                    const descripcion = partes.slice(1, -1).join(' ');
                    const item = { comprobante, descripcion, importe };
                    if (seccionActual === 'INGRESOS') datosCierre.ingresos.push(item);
                    else datosCierre.gastos.push(item);
                    i++;
                }
                break;
            }
            case 'TANQUES': {
                const columnas = lineaTrim.split(/\s{2,}/);
                if (columnas.length >= 3 && !lineaTrim.toUpperCase().includes('KEROSENE')) {
                    datosCierre.detalleTanques.push({
                        numero: columnas[0],
                        producto: columnas[1],
                        despachado: limpiarImporte(columnas[columnas.length - 1])
                    });
                }
                break;
            }
            case 'DECLARACION_EMPLEADO': {
                const [clave, valor] = lineaTrim.split(':');
                if (clave && valor) {
                    const claveNormalizada = clave.trim().toLowerCase().replace(/ /g, '_');
                    datosCierre.declaracionEmpleado[claveNormalizada] = limpiarImporte(valor);
                }
                break;
            }
        }
    }

    const extraerTotalDelResumen = (textoABuscar) => {
        const lineaResumen = datosCierre.resumen.find(l => l.toUpperCase().includes(textoABuscar.toUpperCase()));
        if (!lineaResumen) return 0;
        const partes = lineaResumen.split(/\s+/);
        const valorTexto = partes[partes.length -1];
        return limpiarImporte(valorTexto);
    };

    datosCierre.encabezado.total_bruto = extraerTotalDelResumen('TOTAL BRUTO');
    datosCierre.encabezado.total_remitos = extraerTotalDelResumen('-REMITOS');
    datosCierre.encabezado.total_gastos = extraerTotalDelResumen('-GASTOS');
    datosCierre.encabezado.total_a_rendir = extraerTotalDelResumen('TOTAL A RENDIR');
    datosCierre.encabezado.total_faltante = extraerTotalDelResumen('FALTANTE');
    datosCierre.encabezado.total_mercadopago = extraerTotalDelResumen('-MERCADOPAGO');
    datosCierre.encabezado.total_axion_on = extraerTotalDelResumen('-AXION ON');
    datosCierre.encabezado.total_cupones = extraerTotalDelResumen('-COBRADO EN TARJETAS'); 
    datosCierre.encabezado.total_tiradas = extraerTotalDelResumen('-TIRADAS');

    return datosCierre;
};