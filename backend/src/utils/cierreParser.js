/**
 * Parsea el texto de un cierre de turno Z y lo convierte en un objeto JSON estructurado.
 * Esta es la versión completa del usuario con las correcciones de errores aplicadas.
 * @param {string} textoCierre - El contenido completo del archivo de cierre Z como un string.
 * @returns {object} Un objeto con todos los datos parseados y una sección de validación.
 */
export const parsearCierreZ = (textoCierre) => {
    // Objeto principal que contendrá toda la información estructurada.
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
        validaciones: {},
        errores: []
    };

    const lineas = textoCierre.split('\n').map(l => l.trim());
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
        if (linea === '') continue;

        if (encabezados[linea]) {
            seccionActual = encabezados[linea];
            continue;
        }

        const seccionesOmitidas = [
            '======== TOTALES POR PRODUCTO ==========', '====== DETALLE DE TOTALIZADORES ========',
            '=== TICK FACT Y REM DE COMBUSTIBLE =====', '========== VENTAS POR RUBRO ============',
            '========= CUPONES POR TARJETA ==========', '============= MEDICIONES ===============',
            '====== TICK Y FACT POR EMPLEADO ========', '=== FACTURACION POR MEDIO DE PAGO ======'
        ];
        if (seccionesOmitidas.includes(linea)) {
            seccionActual = 'OMITIR';
            continue;
        }

        if (linea.startsWith('-----------------')) {
            if (seccionActual !== 'RESUMEN') seccionActual = '';
            continue;
        }

        if (seccionActual !== 'RESUMEN' && linea.toUpperCase().startsWith('TOTAL')) {
            continue;
        }

        if (seccionActual === 'OMITIR') continue;

        switch (seccionActual) {
            case 'RESUMEN':
                if (linea.startsWith('Numero:')) {
                    datosCierre.encabezado.numero_z = parseInt(linea.split(':')[1]?.trim(), 10);
                } else if (linea.startsWith('Desde:')) {
                    const textoCompleto = linea.substring(linea.indexOf(':') + 1).trim();
                    const partes = textoCompleto.split(' ');
                    if (partes.length >= 2) {
                        datosCierre.encabezado.fecha_turno = partes[0];
                        datosCierre.encabezado.hora_inicio = partes[1];
                    }
                } else if (linea.startsWith('Hasta:')) {
                    const textoCompleto = linea.substring(linea.indexOf(':') + 1).trim();
                    const partes = textoCompleto.split(' ');
                    if (partes.length >= 2) {
                        datosCierre.encabezado.hora_fin = partes[1];
                    }
                } else if (linea.startsWith('Cerrado por:')) {
                    datosCierre.encabezado.cerrado_por = linea.split(':')[1]?.trim();
                } else {
                    datosCierre.resumen.push(linea);
                }
                break;

            // --- LÓGICA CORREGIDA Y ROBUSTA PARA REMITOS ---
            case 'REMITOS':
                {
                    // Expresión regular para capturar las tres partes:
                    // 1. El número del remito (ej: 00013-00010842)
                    // 2. El nombre del cliente (puede tener espacios)
                    // 3. El importe final
                    const match = linea.match(/^(\S+)\s+(.+?)\s+([\d.]+)$/);
                    if (match) {
                        const [, numero_remito, cliente_nombre, importe_texto] = match;
                        datosCierre.remitos.push({
                            numero_remito: numero_remito.trim(),
                            cliente_nombre: cliente_nombre.trim(),
                            importe: limpiarImporte(importe_texto)
                        });
                    }
                }
                break;

            case 'VENTAS_PRODUCTO':
                 datosCierre.ventasPorProducto.push({descripcion: linea.slice(0, linea.lastIndexOf(' ')).trim(), importe: limpiarImporte(linea.slice(linea.lastIndexOf(' '))) });
                 break;
            case 'BAJAS_PRODUCTO': datosCierre.bajasPorProducto.push({descripcion: linea.slice(0, linea.lastIndexOf(' ')).trim(), importe: limpiarImporte(linea.slice(linea.lastIndexOf(' '))) }); break;
            case 'PERCEPCIONES_IIBB': datosCierre.percepcionesIIBB.push({descripcion: linea.slice(0, linea.lastIndexOf(' ')).trim(), importe: limpiarImporte(linea.slice(linea.lastIndexOf(' '))) }); break;
            case 'CUPONES': datosCierre.cupones.push({descripcion: linea.slice(0, linea.lastIndexOf(' ')).trim(), importe: limpiarImporte(linea.slice(linea.lastIndexOf(' '))) }); break;
            case 'MERCADOPAGO': datosCierre.mercadoPago.push({descripcion: linea.slice(0, linea.lastIndexOf(' ')).trim(), importe: limpiarImporte(linea.slice(linea.lastIndexOf(' '))) }); break;
            case 'TIRADAS': datosCierre.tiradas.push({descripcion: linea.slice(0, linea.lastIndexOf(' ')).trim(), importe: limpiarImporte(linea.slice(linea.lastIndexOf(' '))) }); break;
            case 'AXION_ON': datosCierre.axionOn.push({descripcion: linea.slice(0, linea.lastIndexOf(' ')).trim(), importe: limpiarImporte(linea.slice(linea.lastIndexOf(' '))) }); break;
            
            case 'INGRESOS':
            case 'GASTOS':
                {
                    if (/^\d/.test(linea)) {
                        const partes = linea.split(/\s+/);
                        const comprobante = partes[0];
                        const importe = limpiarImporte(partes[partes.length - 1]);
                        const descripcion = partes.slice(1, -1).join(' ');
                        const item = { comprobante, descripcion, importe };
                        if (seccionActual === 'INGRESOS') datosCierre.ingresos.push(item);
                        else datosCierre.gastos.push(item);
                        i++;
                    }
                }
                break;

            case 'TANQUES':
                {
                    const columnas = linea.split(/\s{2,}/);
                    if (columnas.length >= 3 && !linea.toUpperCase().includes('KEROSENE')) {
                        datosCierre.detalleTanques.push({
                            numero: columnas[0],
                            producto: columnas[1],
                            despachado: limpiarImporte(columnas[columnas.length - 1])
                        });
                    }
                }
                break;
            case 'DECLARACION_EMPLEADO':
                {
                    const [clave, valor] = linea.split(':');
                    if (clave && valor) {
                        const claveNormalizada = clave.trim().toLowerCase().replace(/ /g, '_');
                        datosCierre.declaracionEmpleado[claveNormalizada] = limpiarImporte(valor);
                    }
                }
                break;
        }
    }

    const extraerTotalDelResumen = (textoABuscar) => {
        const lineaResumen = datosCierre.resumen.find(l => l.toUpperCase().includes(textoABuscar.toUpperCase()));
        if (!lineaResumen) return 0;
        const indiceSeparador = Math.max(lineaResumen.lastIndexOf(':'), lineaResumen.lastIndexOf(' '));
        if (indiceSeparador === -1) return 0;
        const valorTexto = lineaResumen.substring(indiceSeparador + 1);
        return limpiarImporte(valorTexto);
    };

    datosCierre.encabezado.total_bruto = extraerTotalDelResumen('TOTAL BRUTO');
    datosCierre.encabezado.total_remitos = extraerTotalDelResumen('-REMITOS');
    datosCierre.encabezado.total_gastos = extraerTotalDelResumen('-GASTOS');
    datosCierre.encabezado.total_a_rendir = extraerTotalDelResumen('TOTAL A RENDIR');
    datosCierre.encabezado.total_faltante = extraerTotalDelResumen('FALTANTE');
    datosCierre.encabezado.total_cupones = extraerTotalDelResumen('TOTAL CUPONES');
    datosCierre.encabezado.total_mercadopago = extraerTotalDelResumen('TOTAL MERCADOPAGO');
    datosCierre.encabezado.total_axion_on = extraerTotalDelResumen('TOTAL AXION ON');
    datosCierre.encabezado.total_tiradas = datosCierre.tiradas.reduce((sum, item) => sum + item.importe, 0);

    return datosCierre;
};
