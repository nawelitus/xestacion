import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Genera un PDF a partir de un elemento HTML.
 * @param {HTMLElement} inputElement - El elemento del DOM que se quiere exportar.
 * @param {string} fileName - El nombre del archivo PDF a generar.
 */
export const generarPdfDesdeElemento = (inputElement, fileName = 'informe-caja.pdf') => {
  if (!inputElement) {
    console.error("Error: El elemento para generar el PDF no fue encontrado.");
    return;
  }

  html2canvas(inputElement, {
    scale: 2, // Aumenta la escala para mejorar la resolución de la imagen
    useCORS: true,
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    
    // Dimensiones del PDF en A4 (210mm x 297mm)
    const pdfWidth = 210;
    const pdfHeight = 297;

    // Dimensiones de la imagen generada por html2canvas
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Calcular la relación de aspecto para que la imagen encaje en el ancho del PDF
    const ratio = imgWidth / pdfWidth;
    const calculatedImgHeight = imgHeight / ratio;

    const pdf = new jsPDF({
      orientation: 'portrait', // p de portrait
      unit: 'mm', // milímetros
      format: 'a4',
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, calculatedImgHeight);
    pdf.save(fileName);
  });
};