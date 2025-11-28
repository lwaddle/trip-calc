/**
 * PDF Export Utility
 * Generates PDF documents from estimate data using jsPDF
 */

import { jsPDF } from 'jspdf';
import { formatCurrency, formatNumber } from './formatters.js';

// Aviation logo SVG
const LOGO_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="b" width="2677.78" height="1278.16" viewBox="0 0 2677.78 1278.16">
  <g id="c">
    <g>
      <path d="m352.43,1275.09l-10.58-34.67h-135.24l-24.5,34.67h-71.17l149.58-204.62h96.74l65.88,204.62h-70.71Zm-23.42-79.46l-23.84-77.62h-12.42l-55,77.62h91.27Zm160.17-125.17h68.46l43.8,153.39h11.66l104.68-153.39h68l-140.84,204.62h-95.77l-60-204.62h0Zm374.34,0h65.34l-41.08,204.62h-65.34l41.08-204.62h0Zm342.3,204.62l-10.58-34.67h-135.24l-24.5,34.67h-71.17l149.58-204.62h96.74l65.88,204.62h-70.71Zm-23.42-79.46l-23.84-77.62h-12.42l-55,77.62h91.27Zm170.04-125.17h247.57l-10.47,52.15h-91.12l-30.61,152.47h-65.34l30.61-152.47h-91.12l10.47-52.15h0Zm329.24,0h65.34l-41.08,204.62h-65.34l41.08-204.62h0Zm298.19-2.76c44.12,0,74.28,1.07,90.41,3.27,23.23,3.22,35.58,14.58,37.09,34,.99,13.4-1.71,36-8.1,67.85-6.41,31.96-12.81,54.66-19.18,68.05-9.32,19.43-26.22,30.78-50.75,34-17.01,2.2-47.39,3.27-91.11,3.27s-74.9-1.07-91.02-3.27c-23.23-3.22-35.58-14.57-37.09-34-.99-13.39,1.8-36.45,8.38-69.23,6.25-31.14,12.56-53.38,18.91-66.67,9.32-19.43,26.22-30.78,50.75-34,16.9-2.2,47.49-3.27,91.72-3.27h0Zm-10.5,53.07c-33.08,0-53.15.87-60.18,2.55-8.07,2-14.04,6.49-17.84,13.45-3.8,6.95-7.75,20.76-11.91,41.47-2.52,12.53-3.67,21.58-3.51,27.15.41,10.43,6.74,16.36,19.06,17.9,9.02,1.17,26.94,1.79,53.74,1.79,25.05,0,41.87-.46,50.32-1.33,8.47-.92,15.01-2.92,19.62-6.03,4.19-2.81,7.42-6.9,9.85-12.37,2.38-5.47,4.83-14.37,7.32-26.79,2.96-14.73,4.61-25.51,5.02-32.41.36-6.9-.38-12.12-2.29-15.59-2.39-4.4-7.31-7.16-14.67-8.18-7.4-1.07-25.55-1.59-54.54-1.59h0Zm242.5-50.31h109.21l76.49,152.77h6.44l29.14-152.77h63.4l-41.08,204.62h-108.34l-76.91-152.77h-6.75l-29.29,152.77h-63.4l41.08-204.62Z" fill="#bc282e" fill-rule="evenodd"></path>
      <path d="m287.06,741.03C-283.18,506.16-5.34,211.1,1133.97,137.49,247.54,305.95-79.28,481.79,287.06,741.03Z" fill="#bc282e" fill-rule="evenodd"></path>
      <path d="m450.76,331.77l-69.31,345.23c-6.32,31.49-11.99,53.4-17.14,65.52-5.11,11.95-12.29,21.54-21.89,28.78-22.46,16.29-72.79,24.44-151.34,24.44l-37.71,187.85,16.1.04c101,0,175.33-5.07,222.98-15.21,47.43-9.96,85.93-28.6,114.95-55.93,22.71-21.18,40.58-47.97,53.53-80.01,12.98-32.22,26.35-82.54,40.05-150.78l84.64-421.55c-78.86,20.65-158.22,43.73-234.85,71.61Z" fill="#626365" fill-rule="evenodd"></path>
      <polygon points="804.6 248.37 659.16 972.78 1196.41 972.78 1164 788.15 927.57 788.15 1035.94 248.37 804.6 248.37" fill="#626365" fill-rule="evenodd"></polygon>
      <polygon points="1152.57 248.37 1279.73 972.78 1621.3 972.78 1871.4 442.05 1910.2 972.78 2250.68 972.78 2677.78 248.37 2443.91 248.37 2139.75 791.41 2098.3 791.41 2042.43 248.37 1776.16 248.37 1503.32 791.41 1462.41 791.41 1377.39 248.37 1152.57 248.37" fill="#626365" fill-rule="evenodd"></polygon>
      <path d="m1169.21,103.25c-12.36-17.24-25.37-56.87-60.33-50.95l23.99,73.26-4.72,13.05,177.22-18.34,32.19,35.03c56.46-26.02,64.74-35.75,99.61-42.58,28.02-5.49,55.96-6.82,84.16-11.92,24.61-4.44,50.21-11.44,70.61-24.28,22.98-14.47,18.41-15.72-.46-21.84-9.24-3-19.14-4.73-29.97-5.89-21.57-2.3-40.05-2.1-62.82.62-24.37,2.91-45.74,7.73-67.61,12.6-22.75,5.06-22.89,6.82-42.65,0-26.06-9-47.87-20.46-68.93-31.84-16.37-8.85-34.37-19.7-51.91-26.42-16.07-6.16-23.38-3.72-36.44.4l37.94,80.96-99.87,18.16Z" fill="#bc282e" fill-rule="evenodd"></path>
    </g>
  </g>
</svg>`;

/**
 * Check if the device is mobile
 */
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Load SVG as image data URL
 * @returns {Promise<string>} Image data URL
 */
function loadLogoImage() {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgBlob = new Blob([LOGO_SVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = function() {
      canvas.width = 400;
      canvas.height = (400 * 1278.16) / 2677.78;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL('image/png');
      URL.revokeObjectURL(url);
      resolve(imgData);
    };

    img.onerror = function() {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load logo'));
    };

    img.src = url;
  });
}

/**
 * Generate PDF from estimate data
 * @param {object} estimate - Estimate data from calculateEstimate()
 * @param {string} estimateName - Name of the estimate
 * @param {object} metadata - Optional metadata (createdAt, updatedAt, creatorEmail)
 * @returns {Promise<{doc: jsPDF, filename: string, blob: Blob}>}
 */
export async function generatePDF(estimate, estimateName = null, metadata = null) {
  const doc = new jsPDF();

  // PDF dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const bottomMargin = 20;
  let yPos = 20;

  // Load logo
  let logoData;
  try {
    logoData = await loadLogoImage();
  } catch (error) {
    console.warn('Failed to load logo:', error);
  }

  // Add logo if loaded
  if (logoData) {
    const logoWidth = 20;
    const logoHeight = (logoWidth * 1278.16) / 2677.78;
    doc.addImage(logoData, 'PNG', margin, yPos, logoWidth, logoHeight);
    yPos += logoHeight + 10;
  }

  // Prepare footer text
  let footerText = '';
  if (metadata && metadata.createdAt) {
    const createdAt = new Date(metadata.createdAt);
    const updatedAt = metadata.updatedAt ? new Date(metadata.updatedAt) : null;
    const hasBeenUpdated = updatedAt && updatedAt > createdAt;
    const displayDate = hasBeenUpdated ? updatedAt : createdAt;
    const label = hasBeenUpdated ? 'Last updated' : 'Created';

    const dateStr = displayDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' at ' + displayDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const creatorEmail = metadata.creatorEmail || 'Guest';
    footerText = `${label}: ${dateStr} - by ${creatorEmail}`;
  } else {
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' at ' + currentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const userEmail = metadata?.creatorEmail || 'Guest';
    footerText = `Created: ${dateStr} - by ${userEmail}`;
  }

  // Helper function to add footer
  const addFooter = () => {
    const footerY = pageHeight - 10;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    const footerWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - footerWidth) / 2, footerY);
  };

  // Helper function to check page break
  const checkPageBreak = (neededSpace) => {
    if (yPos + neededSpace > pageHeight - bottomMargin) {
      addFooter();
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const title = 'Trip Cost Estimate';
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  yPos += 10;

  // Estimate name
  if (estimateName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const nameWidth = doc.getTextWidth(estimateName);
    doc.text(estimateName, (pageWidth - nameWidth) / 2, yPos);
    yPos += 10;
  } else {
    yPos += 5;
  }

  // Flight Summary
  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Flight Summary', margin, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  if (!estimate.legsSummary || estimate.legsSummary.length === 0) {
    checkPageBreak(6);
    doc.text('No flight legs added', margin + 5, yPos);
    yPos += 6;
  } else {
    estimate.legsSummary.forEach(leg => {
      checkPageBreak(6);
      const legText = `Leg ${leg.index}: ${leg.from} - ${leg.to}`;
      const legDetails = `${leg.hours}h ${leg.minutes}m (${formatNumber(leg.gallons, 0)} gallons)`;
      doc.text(legText, margin + 5, yPos);
      doc.text(legDetails, pageWidth - margin - doc.getTextWidth(legDetails), yPos);
      yPos += 6;
    });

    yPos += 2;
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Flight Time: ${estimate.totalHours}h ${estimate.remainingMinutes}m`, margin + 5, yPos);
    yPos += 6;
    doc.text(`Total Fuel: ${formatNumber(estimate.totalFuelGallons, 0)} gallons`, margin + 5, yPos);
    yPos += 6;

    if (estimate.includeAPU && estimate.activeLegsCount > 0) {
      checkPageBreak(6);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      const apuGallons = estimate.totalAPUFuel / estimate.fuelDensity;
      doc.text(`(Includes ${formatNumber(apuGallons, 0)} gal. APU burn for ${estimate.activeLegsCount} active leg${estimate.activeLegsCount > 1 ? 's' : ''})`, margin + 10, yPos);
      yPos += 6;
    }
  }

  yPos += 5;

  // Cost Breakdown
  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Cost Breakdown', margin, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Crew Day Rates
  if (estimate.crewDetails && estimate.crewDetails.length > 0) {
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Crew Day Rates', margin + 5, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    estimate.crewDetails.forEach(crew => {
      checkPageBreak(5);
      const crewText = `${crew.role} - ${crew.days} day(s) @ $${formatCurrency(crew.rate)}`;
      const crewCost = `$${formatCurrency(crew.days * crew.rate)}`;
      doc.text(crewText, margin + 10, yPos);
      doc.text(crewCost, pageWidth - margin - doc.getTextWidth(crewCost), yPos);
      yPos += 5;
    });

    checkPageBreak(8);
    doc.setFont('helvetica', 'bold');
    const crewDayTotal = `$${formatCurrency(estimate.crewDayTotal)}`;
    doc.text('Crew Day Rate Subtotal:', margin + 10, yPos);
    doc.text(crewDayTotal, pageWidth - margin - doc.getTextWidth(crewDayTotal), yPos);
    yPos += 8;
  }

  // Crew Expenses
  if (estimate.crewExpensesTotal > 0) {
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Crew Expenses', margin + 5, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    if (estimate.hotelTotal > 0) {
      checkPageBreak(5);
      const hotelText = `Hotel (${estimate.crewCount} crew x ${estimate.hotelStays} night(s) x $${formatCurrency(estimate.hotelRate)})`;
      const hotelCost = `$${formatCurrency(estimate.hotelTotal)}`;
      doc.text(hotelText, margin + 10, yPos);
      doc.text(hotelCost, pageWidth - margin - doc.getTextWidth(hotelCost), yPos);
      yPos += 5;
    }
    if (estimate.mealsTotal > 0) {
      checkPageBreak(5);
      const mealsText = `Meals (${estimate.crewCount} crew x ${estimate.tripDays} day(s) x $${formatCurrency(estimate.mealsRate)})`;
      const mealsCost = `$${formatCurrency(estimate.mealsTotal)}`;
      doc.text(mealsText, margin + 10, yPos);
      doc.text(mealsCost, pageWidth - margin - doc.getTextWidth(mealsCost), yPos);
      yPos += 5;
    }

    // Add other crew expenses as needed (matching vanilla JS structure)

    checkPageBreak(8);
    doc.setFont('helvetica', 'bold');
    const crewSubtotal = `$${formatCurrency(estimate.crewSubtotal)}`;
    doc.text('Crew Subtotal:', margin + 10, yPos);
    doc.text(crewSubtotal, pageWidth - margin - doc.getTextWidth(crewSubtotal), yPos);
    yPos += 8;
  }

  // Hourly Programs
  if (estimate.hourlySubtotal > 0) {
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Hourly Programs & Reserves', margin + 5, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    if (estimate.maintenanceTotal > 0) {
      checkPageBreak(5);
      const maintText = `Maintenance Programs (${estimate.totalFlightHours.toFixed(2)} hrs @ $${formatCurrency(estimate.maintenanceRate)})`;
      const maintCost = `$${formatCurrency(estimate.maintenanceTotal)}`;
      doc.text(maintText, margin + 10, yPos);
      doc.text(maintCost, pageWidth - margin - doc.getTextWidth(maintCost), yPos);
      yPos += 5;
    }

    checkPageBreak(8);
    doc.setFont('helvetica', 'bold');
    const hourlySubtotal = `$${formatCurrency(estimate.hourlySubtotal)}`;
    doc.text('Hourly Subtotal:', margin + 10, yPos);
    doc.text(hourlySubtotal, pageWidth - margin - doc.getTextWidth(hourlySubtotal), yPos);
    yPos += 8;
  }

  // Fuel
  checkPageBreak(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Fuel', margin + 5, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  const fuelText = `${formatNumber(estimate.totalFuelGallons, 0)} gallons @ $${formatCurrency(estimate.fuelPrice)}`;
  const fuelCost = `$${formatCurrency(estimate.fuelSubtotal)}`;
  doc.text(fuelText, margin + 10, yPos);
  doc.text(fuelCost, pageWidth - margin - doc.getTextWidth(fuelCost), yPos);
  yPos += 8;

  // Total
  checkPageBreak(20);
  yPos += 5;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const totalLabel = 'Estimated Total:';
  const totalAmount = `$${formatCurrency(estimate.estimatedTotal)}`;
  doc.text(totalLabel, margin + 5, yPos);
  doc.text(totalAmount, pageWidth - margin - doc.getTextWidth(totalAmount), yPos);
  yPos += 10;

  // Trip Notes
  if (estimate.tripNotes) {
    checkPageBreak(15);
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Trip Notes', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const notesLines = doc.splitTextToSize(estimate.tripNotes, pageWidth - (margin * 2));
    const notesHeight = notesLines.length * 6;
    checkPageBreak(notesHeight);
    doc.text(notesLines, margin + 5, yPos);
  }

  // Add footer to last page
  addFooter();

  // Generate filename
  const now = new Date();
  const filename = `trip-estimate-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.pdf`;

  // Generate blob
  const blob = doc.output('blob');

  return { doc, filename, blob };
}

/**
 * Download PDF to device
 * @param {object} estimate - Estimate data
 * @param {string} estimateName - Name of estimate
 * @param {object} metadata - Optional metadata
 */
export async function downloadPDF(estimate, estimateName = null, metadata = null) {
  const { doc, filename } = await generatePDF(estimate, estimateName, metadata);
  doc.save(filename);
}

/**
 * Preview PDF in browser (for desktop)
 * @param {object} estimate - Estimate data
 * @param {string} estimateName - Name of estimate
 * @param {object} metadata - Optional metadata
 * @returns {Promise<{pdfUrl: string, filename: string}>}
 */
export async function previewPDF(estimate, estimateName = null, metadata = null) {
  const { blob, filename } = await generatePDF(estimate, estimateName, metadata);
  const pdfUrl = URL.createObjectURL(blob);
  return { pdfUrl, filename };
}

/**
 * Export PDF - smart function that downloads on mobile, previews on desktop
 * @param {object} estimate - Estimate data
 * @param {string} estimateName - Name of estimate
 * @param {object} metadata - Optional metadata
 * @returns {Promise<{mode: 'download' | 'preview', pdfUrl?: string, filename: string}>}
 */
export async function exportPDF(estimate, estimateName = null, metadata = null) {
  if (isMobileDevice()) {
    await downloadPDF(estimate, estimateName, metadata);
    return { mode: 'download', filename: '' };
  } else {
    const { pdfUrl, filename } = await previewPDF(estimate, estimateName, metadata);
    return { mode: 'preview', pdfUrl, filename };
  }
}
