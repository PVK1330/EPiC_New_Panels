import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const downloadInvoicePdf = async ({
  caseId,
  amount,
  date,
  description = "Visa Application Fees",
  candidateName = "Client",
  isReceipt = true,
  logoUrl,
  platformName = "EPiC Immigration Services",
}) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const margin = 20;
  let y = margin;

  if (logoUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = logoUrl;
      await new Promise((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); 
      });
      if (img.width && img.height) {
        const maxWidth = 50;
        const ratio = img.width / img.height;
        const h = maxWidth / ratio;
        pdf.addImage(img, "PNG", margin, y, maxWidth, h);
        y += h + 10;
      }
    } catch (e) {
      console.warn("Logo failed to load", e);
    }
  }

  // Header
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(33, 33, 33);
  pdf.text(platformName, margin, y);

  // Document Title
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(100, 100, 100);
  const docTitle = isReceipt ? "PAYMENT RECEIPT" : "INVOICE";
  const titleWidth = pdf.getStringUnitWidth(docTitle) * 16 / pdf.internal.scaleFactor;
  pdf.text(docTitle, 210 - margin - titleWidth, y);

  y += 10;
  
  // Company Info
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(80, 80, 80);
  pdf.text("123 Legal Avenue, London, UK, W1D 3QU", margin, y);
  y += 5;
  pdf.text("Company Reg No: 12345678", margin, y);
  y += 5;
  pdf.text("Email: billing@epicimmigration.co.uk", margin, y);

  y += 15;

  // Invoice Details
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(33, 33, 33);
  const invoiceNo = `INV-${caseId.replace(/[^A-Za-z0-9]/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
  pdf.text(`Receipt/Invoice No: ${invoiceNo}`, 210 - margin - 80, y - 10);
  pdf.text(`Date: ${date}`, 210 - margin - 80, y - 5);

  // Billed To
  pdf.text("Billed To:", margin, y);
  y += 5;
  pdf.setFont("helvetica", "normal");
  pdf.text(candidateName, margin, y);
  y += 5;
  pdf.text(`Case Reference: ${caseId}`, margin, y);

  y += 15;

  // Table
  const tableData = [
    [description, "1", `£${Number(amount).toFixed(2)}`, `£${Number(amount).toFixed(2)}`]
  ];

  autoTable(pdf, {
    startY: y,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
  });

  y = pdf.lastAutoTable.finalY + 15;

  // Totals
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  const totalAmountStr = `£${Number(amount).toFixed(2)}`;
  pdf.text(`Subtotal: ${totalAmountStr}`, 210 - margin - 50, y);
  y += 6;
  pdf.text("VAT (0%): £0.00", 210 - margin - 50, y);
  y += 8;
  pdf.setFontSize(14);
  pdf.text(`Total Paid: ${totalAmountStr}`, 210 - margin - 50, y);

  // Footer / Notes
  y += 30;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(100, 100, 100);
  pdf.text("Thank you for your payment.", margin, y);
  y += 5;
  pdf.text("This receipt is generated electronically and requires no signature.", margin, y);

  pdf.save(`Receipt_${caseId}.pdf`);
};
