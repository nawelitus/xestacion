// ================================================================
// ARCHIVO: src/utils/cierreParser.js (VERSIÓN CORREGIDA FINAL)
// Se asegura de capturar la lista de empleados del Cierre Z.
// ================================================================

const parsearNumero = (str) => {
  if (typeof str !== 'string') return 0;
  const stringLimpio = str.replace(/,/g, '');
  return parseFloat(stringLimpio) || 0;
};

export const parsearCierreZ = (textoCrudo) => {
    const lineas = textoCrudo.split(/\r?\n/);
    const resultado = {
        cabecera: {},
        resumenCaja: {
            total_cupones: 0,
            total_mercadopago: 0,
            total_tiradas: 0,
            total_axion_on: 0
        },
        empleados: [], // Array para almacenar los nombres de los empleados
        ventasCombustible: [],
        ventasShop: [],
        remitos: [],
        percepcionesIIBB: [],
        movimientosCaja: [],
    };

    let seccionActual = '';
    let capturandoEmpleados = false; // Flag para saber si estamos en la sección de empleados

    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i].trim();

        // ======================= LÓGICA PARA CAPTURAR EMPLEADOS =======================
        // Detecta la línea "Empleados:" y activa el modo de captura.
        if (linea.startsWith('Empleados:')) {
            capturandoEmpleados = true;
            continue; // Salta a la siguiente línea para no procesar "Empleados:"
        }

        // Si el modo de captura está activo, procesa las líneas.
        if (capturandoEmpleados) {
            // Si encuentra la línea de separación, desactiva el modo de captura.
            if (linea.startsWith('=====')) {
                capturandoEmpleados = false;
            } else if (linea) { // Si la línea no está vacía, la añade al array.
                resultado.empleados.push(linea);
            }
        }
        // ===================== FIN DE LA LÓGICA DE EMPLEADOS ======================

        if (linea.match(/^TOTAL\s+[\d.,]+$/)) {
            const montoTotal = parsearNumero(linea.match(/[\d.,]+$/)[0]);
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

        if (linea.startsWith('=====')) {
            if (linea.includes('TOTALES POR PRODUCTO')) seccionActual = 'VENTAS_COMBUSTIBLE';
            else if (linea.includes('VENTAS POR PRODUCTO')) seccionActual = 'VENTAS_SHOP';
            else if (linea.includes('DETALLE DE REMITOS')) seccionActual = 'REMITOS';
            else if (linea.includes('PERCEPCIONES DE IIBB')) seccionActual = 'PERCEPCIONES_IIBB';
            else if (linea.includes('DETALLE MERCADOPAGO')) seccionActual = 'MERCADOPAGO';
            else if (linea.includes('CUPONES')) seccionActual = 'TARJETAS';
            else if (linea.includes('DETALLE DE TIRADAS')) seccionActual = 'TIRADAS';
            else if (linea.includes('DETALLE DE GASTOS')) seccionActual = 'GASTOS';
            else if (linea.includes('AXION ON')) seccionActual = 'AXION_ON';
            else seccionActual = '';
            continue;
        }
        
        if (seccionActual === '') {
            if (linea.startsWith('Numero:')) resultado.cabecera.numero_z = parseInt(linea.split(':')[1].trim(), 10);
            if (linea.startsWith('Desde:')) {
                const [, fecha, hora] = linea.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{2}:\d{2}:\d{2})/);
                resultado.cabecera.fecha_turno = fecha.split('/').reverse().join('-');
                resultado.cabecera.hora_inicio = hora;
            }
            if (linea.startsWith('Hasta:')) {
                const [, fecha, hora] = linea.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{2}:\d{2}:\d{2})/);
                resultado.cabecera.hora_fin = hora;
            }
            if (linea.startsWith('Cerrado por:')) resultado.cabecera.cerrado_por = linea.split(':')[1].trim();
            if (linea.startsWith('TOTAL BRUTO')) resultado.resumenCaja.total_bruto = parsearNumero(linea.match(/[\d.,]+$/)[0]);
            if (linea.startsWith('-REMITOS')) resultado.resumenCaja.total_remitos = parsearNumero(linea.match(/[\d.,]+$/)[0]);
            if (linea.startsWith('-GASTOS')) resultado.resumenCaja.total_gastos = parsearNumero(linea.match(/[\d.,]+$/)[0]);
            if (linea.startsWith('TOTAL A RENDIR')) resultado.resumenCaja.total_a_rendir = parsearNumero(linea.match(/[\d.,]+$/)[0]);
            if (linea.startsWith('FALTANTE')) resultado.resumenCaja.total_faltante = parsearNumero(linea.match(/[\d.,]+$/)[0]);
        }
        
        switch (seccionActual) {
            case 'VENTAS_COMBUSTIBLE':
                const matchComb = linea.match(/^(\S+)\s+([\d.,]+)\s+([\d.,]+)$/);
                if (matchComb) {
                    const productoNombre = matchComb[1];
                    if (productoNombre.toUpperCase() !== 'TOTAL') {
                        resultado.ventasCombustible.push({ producto: productoNombre, litros: parsearNumero(matchComb[2]), importe: parsearNumero(matchComb[3]) });
                    }
                }
                break;
            case 'VENTAS_SHOP':
                const matchShop = linea.match(/^\s*(\d+)\s+(.+?)\s{2,}([\d.,]+)$/);
                 if (matchShop) {
                    const productoNombre = matchShop[2].trim();
                    if (productoNombre.toUpperCase() !== 'TOTAL') {
                        resultado.ventasShop.push({ cantidad: parseInt(matchShop[1], 10), producto: productoNombre, importe: parsearNumero(matchShop[3]) });
                    }
                }
                break;
            case 'REMITOS':
                 const matchRemito = linea.match(/^(\S+-\S+)\s+(.+?)\s{2,}([\d.,]+)$/);
                 if (matchRemito) {
                    resultado.remitos.push({ comprobante: matchRemito[1], cliente_nombre: matchRemito[2].trim(), monto: parsearNumero(matchRemito[3]) });
                }
                break;
            case 'GASTOS':
            case 'TIRADAS':
                const matchMov = linea.match(/^(\S+-\S+)\s+(.+?)\s{2,}([\d.,]+)$/);
                if (matchMov) {
                    let descripcion = matchMov[2].trim();
                    if (lineas[i + 1] && lineas[i + 1].trim().match(/^[A-Za-z\s]+$/)) {
                        descripcion += ` (${lineas[i + 1].trim()})`;
                        i++;
                    }
                    resultado.movimientosCaja.push({ tipo: seccionActual, comprobante: matchMov[1], descripcion, monto: parsearNumero(matchMov[3]) });
                }
                break;
            case 'MERCADOPAGO':
            case 'TARJETAS':
            case 'AXION_ON':
                const matchPago = linea.match(/(.*?)\s{2,}([\d.,]+)$/);
                if (matchPago) {
                    if (matchPago[1].trim().toUpperCase() !== 'TOTAL') {
                        resultado.movimientosCaja.push({ tipo: seccionActual, comprobante: null, descripcion: matchPago[1].trim() || 'Sin descripción', monto: parsearNumero(matchPago[2]) });
                    }
                } else if (linea.match(/^[\d.,]+$/)) {
                    resultado.movimientosCaja.push({ tipo: seccionActual, comprobante: null, descripcion: 'Sin descripción', monto: parsearNumero(linea) });
                }
                break;
        }
    }
    return resultado;
};