// ================================================================
// ARCHIVO: src/utils/cierreParser.js (Versión Corregida)
//
// CAMBIOS REALIZADOS:
// 1. Se reemplazó la expresión regular frágil de 'VENTAS_SHOP' por
//    una lógica de análisis de texto más robusta para manejar
//    nombres de producto complejos.
// 2. Se corrigió un error en la sección 'MERCADOPAGO' que impedía
//    leer montos sin descripción.
// ================================================================

const parsearNumero = (str) => {
  if (typeof str !== 'string') return 0;
  // Elimina los separadores de miles (comas) antes de convertir a número
  const stringLimpio = str.replace(/,/g, '');
  return parseFloat(stringLimpio) || 0;
};

export const parsearCierreZ = (textoCrudo) => {
    const lineas = textoCrudo.split(/\r?\n/);
    const resultado = {
        cabecera: {},
        resumenCaja: {
            total_bruto: 0,
            total_remitos: 0,
            total_gastos: 0,
            total_a_rendir: 0,
            total_faltante: 0,
            total_cupones: 0,
            total_mercadopago: 0,
            total_tiradas: 0,
            total_axion_on: 0
        },
        empleados: [],
        ventasCombustible: [],
        ventasShop: [],
        remitos: [],
        percepcionesIIBB: [],
        movimientosCaja: [],
    };

    let seccionActual = '';
    let capturandoEmpleados = false;

    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i]; // No hacer trim aquí para preservar espacios
        const lineaTrimmed = linea.trim();

        if (lineaTrimmed.startsWith('Empleados:')) {
            capturandoEmpleados = true;
            continue;
        }

        if (capturandoEmpleados) {
            if (lineaTrimmed.startsWith('=====')) {
                capturandoEmpleados = false;
            } else if (lineaTrimmed) {
                resultado.empleados.push(lineaTrimmed);
            }
        }
        
        if (lineaTrimmed.match(/^TOTAL\s+[\d.,]+$/)) {
            const montoTotal = parsearNumero(lineaTrimmed.match(/[\d.,]+$/)[0]);
            switch (seccionActual) {
                case 'TARJETAS':
                    resultado.resumenCaja.total_cupones = montoTotal;
                    break;
                case 'MERCADOPAGO':
                    resultado.resumenCaja.total_mercadopago = montoTotal;
                    break;
                case 'TIRADAS':
                    resultado.resumenCaja.total_tiradas = montoTotal;
                    break;
                case 'AXION_ON':
                    resultado.resumenCaja.total_axion_on = montoTotal;
                    break;
            }
        }

        if (lineaTrimmed.startsWith('=====')) {
            if (lineaTrimmed.includes('TOTALES POR PRODUCTO')) seccionActual = 'VENTAS_COMBUSTIBLE';
            else if (lineaTrimmed.includes('VENTAS POR PRODUCTO')) seccionActual = 'VENTAS_SHOP';
            else if (lineaTrimmed.includes('DETALLE DE REMITOS')) seccionActual = 'REMITOS';
            else if (lineaTrimmed.includes('PERCEPCIONES DE IIBB')) seccionActual = 'PERCEPCIONES_IIBB';
            else if (lineaTrimmed.includes('DETALLE MERCADOPAGO')) seccionActual = 'MERCADOPAGO';
            else if (lineaTrimmed.includes('CUPONES')) seccionActual = 'TARJETAS';
            else if (lineaTrimmed.includes('DETALLE DE TIRADAS')) seccionActual = 'TIRADAS';
            else if (lineaTrimmed.includes('DETALLE DE GASTOS')) seccionActual = 'GASTOS';
            else if (lineaTrimmed.includes('AXION ON')) seccionActual = 'AXION_ON';
            else if (lineaTrimmed.includes('DETALLE DE INGRESOS')) seccionActual = 'INGRESOS'; // Reconocer sección de ingresos
            else seccionActual = '';
            continue;
        }
        
        if (seccionActual === '') {
            if (lineaTrimmed.startsWith('Numero:')) resultado.cabecera.numero_z = parseInt(lineaTrimmed.split(':')[1].trim(), 10);
            if (lineaTrimmed.startsWith('Desde:')) {
                const [, fecha, hora] = lineaTrimmed.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{2}:\d{2}:\d{2})/);
                resultado.cabecera.fecha_turno = fecha.split('/').reverse().join('-');
                resultado.cabecera.hora_inicio = hora;
            }
            if (lineaTrimmed.startsWith('Hasta:')) {
                const [, fecha, hora] = lineaTrimmed.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{2}:\d{2}:\d{2})/);
                resultado.cabecera.hora_fin = hora;
            }
            if (lineaTrimmed.startsWith('Cerrado por:')) resultado.cabecera.cerrado_por = lineaTrimmed.split(':')[1].trim();
            if (lineaTrimmed.startsWith('TOTAL BRUTO')) resultado.resumenCaja.total_bruto = parsearNumero(lineaTrimmed.match(/[\d.,]+$/)[0]);
            if (lineaTrimmed.startsWith('-REMITOS')) resultado.resumenCaja.total_remitos = parsearNumero(lineaTrimmed.match(/[\d.,]+$/)[0]);
            if (lineaTrimmed.startsWith('-GASTOS')) resultado.resumenCaja.total_gastos = parsearNumero(lineaTrimmed.match(/[\d.,]+$/)[0]);
            if (lineaTrimmed.startsWith('TOTAL A RENDIR')) resultado.resumenCaja.total_a_rendir = parsearNumero(lineaTrimmed.match(/[\d.,]+$/)[0]);
            if (lineaTrimmed.startsWith('FALTANTE')) resultado.resumenCaja.total_faltante = parsearNumero(lineaTrimmed.match(/[\d.,]+$/)[0]);
        }
        
        switch (seccionActual) {
            case 'VENTAS_COMBUSTIBLE':
                const matchComb = lineaTrimmed.match(/^(\S+)\s+([\d.,]+)\s+([\d.,]+)$/);
                if (matchComb) {
                    const productoNombre = matchComb[1];
                    if (productoNombre.toUpperCase() !== 'TOTAL') {
                        resultado.ventasCombustible.push({ producto: productoNombre, litros: parsearNumero(matchComb[2]), importe: parsearNumero(matchComb[3]) });
                    }
                }
                break;
            
            // ================================================================
            // LÓGICA CORREGIDA PARA VENTAS_SHOP
            // ================================================================
            case 'VENTAS_SHOP':
                // Excluir la línea "TOTAL" y líneas vacías
                if (lineaTrimmed && !lineaTrimmed.toUpperCase().startsWith('TOTAL') && !lineaTrimmed.startsWith('-')) {
                    const lastSpaceIndex = lineaTrimmed.lastIndexOf(' ');
                    if (lastSpaceIndex > -1) {
                        const importeStr = lineaTrimmed.substring(lastSpaceIndex + 1);
                        const importe = parsearNumero(importeStr);

                        if (!isNaN(importe)) {
                            const rest = lineaTrimmed.substring(0, lastSpaceIndex).trim();
                            const firstSpaceIndex = rest.indexOf(' ');

                            if (firstSpaceIndex > -1) {
                                const cantidadStr = rest.substring(0, firstSpaceIndex);
                                const cantidad = parseInt(cantidadStr, 10);
                                
                                if (!isNaN(cantidad)) {
                                    const productoNombre = rest.substring(firstSpaceIndex + 1).trim();
                                    resultado.ventasShop.push({ cantidad, producto: productoNombre, importe });
                                }
                            }
                        }
                    }
                }
                break;

            case 'REMITOS':
                 const matchRemito = lineaTrimmed.match(/^(\S+-\S+)\s+(.+?)\s{2,}([\d.,]+)$/);
                 if (matchRemito) {
                    resultado.remitos.push({ comprobante: matchRemito[1], cliente_nombre: matchRemito[2].trim(), monto: parsearNumero(matchRemito[3]) });
                }
                break;

            case 'GASTOS':
            case 'TIRADAS':
            case 'INGRESOS': // Añadido para procesar ingresos como un movimiento de caja
                const matchMov = lineaTrimmed.match(/^(\S+-\S+)\s+(.+?)\s{2,}([\d.,]+)$/);
                if (matchMov) {
                    let descripcion = matchMov[2].trim();
                    if (lineas[i + 1] && lineas[i + 1].trim().match(/^[A-Za-z\s]+$/)) {
                        descripcion += ` (${lineas[i + 1].trim()})`;
                        i++;
                    }
                    resultado.movimientosCaja.push({ tipo: seccionActual, comprobante: matchMov[1], descripcion, monto: parsearNumero(matchMov[3]) });
                }
                break;

            // ================================================================
            // LÓGICA CORREGIDA PARA PAGOS
            // ================================================================
            case 'MERCADOPAGO':
            case 'TARJETAS':
            case 'AXION_ON':
                const matchPago = lineaTrimmed.match(/(.*?)\s{2,}([\d.,]+)$/);
                if (matchPago && matchPago[1].trim().toUpperCase() !== 'TOTAL') {
                    resultado.movimientosCaja.push({ tipo: seccionActual, comprobante: null, descripcion: matchPago[1].trim() || 'Sin descripción', monto: parsearNumero(matchPago[2]) });
                } else if (lineaTrimmed.match(/^[\d.,]+$/)) { // Se usa lineaTrimmed
                    resultado.movimientosCaja.push({ tipo: seccionActual, comprobante: null, descripcion: 'Sin descripción', monto: parsearNumero(lineaTrimmed) });
                }
                break;
        }
    }
    return resultado;
};
