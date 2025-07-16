// src/utils/pdfGenerator.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Función para formatear moneda (sin cambios)
const formatearMoneda = (valor) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor || 0);
};

// Función para añadir un pie de página con el número de página (sin cambios)
const agregarPieDePagina = (doc) => {
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${totalPaginas}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }
};

export const exportarDetalleCierrePDF = (detalle) => {
  if (!detalle || !detalle.cabecera) {
    alert("No hay datos para exportar.");
    return;
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const { cabecera, creditos, retiros, ...secciones } = detalle;
  let cursorY = 15;

  // ================================================================
  // ▼▼▼ FUNCIÓN DE AYUDA MOVIDA AQUÍ ARRIBA ▼▼▼
  // ================================================================
  // Al definir la función aquí, está disponible para toda la función exportarDetalleCierrePDF.
  const dibujarTablaConTotal = (titulo, datos, columnas, claves) => {
      if (!datos || datos.length === 0) return;

      // Dibujar el título de la tabla manualmente
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(titulo, 14, cursorY);
      cursorY += 6;

      const body = datos.map(item => claves.map(clave => clave.includes('monto') || clave.includes('importe') ? formatearMoneda(item[clave]) : item[clave]));
      
      // Calcular y añadir la fila de total en el 'foot'
      const total = datos.reduce((sum, item) => sum + (Number(item.importe) || Number(item.monto) || 0), 0);
      const pieDeTabla = [
          [{ content: 'TOTAL', colSpan: claves.length - 1, styles: { halign: 'right', fontStyle: 'bold' } }, { content: formatearMoneda(total), styles: { fontStyle: 'bold' } }]
      ];

      autoTable(doc, {
          startY: cursorY,
          head: [columnas],
          body: body,
          foot: pieDeTabla,
          theme: 'striped',
          headStyles: { fillColor: '#4a5568' }, // Gris oscuro
          footStyles: { fillColor: '#868c94ff' }, // Gris claro
      });
      cursorY = doc.lastAutoTable.finalY + 10;
  };
  // ================================================================

  // --- TÍTULO ---
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(`Detalle del Cierre Z N° ${cabecera.numero_z}`, 14, cursorY);
  cursorY += 10;

  // --- CABECERA ---
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Fecha del Turno: ${new Date(cabecera.fecha_turno).toLocaleDateString('es-AR')}`, 14, cursorY);
  doc.text(`Horario: ${cabecera.hora_inicio} - ${cabecera.hora_fin}`, 80, cursorY);
  doc.text(`Cerrado por: ${cabecera.cerrado_por}`, 140, cursorY);
  cursorY += 8;
  
  // --- SECCIÓN DE RESUMEN DEL PROCESAMIENTO (si aplica) ---
  if (cabecera.caja_procesada) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Resumen del Procesamiento de Caja', 14, cursorY);
    cursorY += 6;

    // Tabla para la Billetera del Playero
    autoTable(doc, {
        startY: cursorY,
        body: [
            ['Dinero Recibido', formatearMoneda(cabecera.declarado_billetera_recibido)],
            ['Dinero Entregado', formatearMoneda(cabecera.declarado_billetera_entregado)],
            [{ content: 'Diferencia Final', styles: { fontStyle: 'bold' } }, { content: formatearMoneda(cabecera.declarado_billetera_recibido - cabecera.declarado_billetera_entregado), styles: { fontStyle: 'bold' } }],
        ],
        theme: 'grid'
    });
    cursorY = doc.lastAutoTable.finalY + 10;

    // Ahora estas llamadas funcionan porque la función está en el ámbito correcto
    dibujarTablaConTotal('Créditos y Vales', creditos, ['Item', 'Importe'], ['item', 'importe']);
    dibujarTablaConTotal('Retiros de Personal', retiros, ['Empleado', 'Monto'], ['nombre_empleado', 'monto']);
  }

  // --- TÍTULO DETALLE ORIGINAL ---
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Detalle Original del Cierre Z', 14, cursorY);
  cursorY += 8;

  // --- SECCIONES CIERRE Z ORIGINAL ---
  const mapeoSecciones = [
      { titulo: 'Remitos', datos: secciones.remitos, columnas: ['Nº Remito', 'Cliente', 'Importe'], claves: ['concepto', 'cliente_nombre', 'importe'] },
      { titulo: 'Gastos', datos: secciones.gastos, columnas: ['Comprobante', 'Descripción', 'Importe'], claves: ['comprobante_nro', 'descripcion', 'importe'] },
      { titulo: 'Ingresos de Efectivo', datos: secciones.ingresos, columnas: ['Comprobante', 'Descripción', 'Importe'], claves: ['comprobante_nro', 'descripcion', 'importe'] },
      { titulo: 'MercadoPago', datos: secciones.mercadoPago, columnas: ['Descripción', 'Importe'], claves: ['descripcion', 'importe'] },
      { titulo: 'Cupones (Tarjetas)', datos: secciones.cupones, columnas: ['Descripción', 'Importe'], claves: ['descripcion', 'importe'] },
      { titulo: 'Tiradas', datos: secciones.tiradas, columnas: ['Descripción', 'Importe'], claves: ['descripcion', 'importe'] },
      { titulo: 'Ventas por Producto (Shop)', datos: secciones.ventasPorProducto, columnas: ['Descripción', 'Importe'], claves: ['descripcion', 'importe'] },
  ];
  
  // Esta llamada ahora también funciona correctamente
  mapeoSecciones.forEach(seccion => {
      dibujarTablaConTotal(seccion.titulo, seccion.datos, seccion.columnas, seccion.claves);
  });

  // --- AÑADIR PIE DE PÁGINA ---
  agregarPieDePagina(doc);

  // --- GUARDAR DOCUMENTO ---
  doc.save(`Detalle_Cierre_Z_${cabecera.numero_z}.pdf`);
};