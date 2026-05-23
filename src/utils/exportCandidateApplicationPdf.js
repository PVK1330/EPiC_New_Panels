import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  applyInlineComputedStyles,
  stripStylesheetsFromClone,
} from "./canvasExportUtils";

/** A4 printable width at 96 CSS px/in (~210mm). */
const PRINT_WIDTH_PX = 794;
const PDF_MARGIN_MM = 12;
const PDF_PAGE_W_MM = 210;
const PDF_PAGE_H_MM = 297;
const PDF_CONTENT_W_MM = PDF_PAGE_W_MM - PDF_MARGIN_MM * 2;
const PDF_CONTENT_H_MM = PDF_PAGE_H_MM - PDF_MARGIN_MM * 2;

function waitForPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

/** Force two-column field layout at full print width (Tailwind breakpoints are absent on clone). */
function applyPrintLayout(root) {
  if (!root) return;
  root.querySelectorAll("dl").forEach((dl) => {
    dl.style.display = "grid";
    dl.style.gridTemplateColumns = "1fr 1fr";
    dl.style.columnGap = "24px";
    dl.style.rowGap = "12px";
  });
  root.querySelectorAll("div.grid").forEach((grid) => {
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "1fr 1fr";
    grid.style.gap = "16px";
  });
  root.querySelectorAll("dd").forEach((dd) => {
    dd.style.wordBreak = "break-word";
    dd.style.overflowWrap = "break-word";
    dd.style.maxWidth = "100%";
  });
}

/**
 * Capture application content at a fixed print width (not modal width) so nothing is clipped.
 */
async function capturePrintableCanvas(sourceEl) {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = [
    "position:fixed",
    "left:-12000px",
    "top:0",
    `width:${PRINT_WIDTH_PX}px`,
    "max-width:none",
    "background:#ffffff",
    "z-index:-1",
    "pointer-events:none",
    "overflow:visible",
  ].join(";");

  const clone = sourceEl.cloneNode(true);
  applyInlineComputedStyles(sourceEl, clone);

  clone.style.width = `${PRINT_WIDTH_PX}px`;
  clone.style.maxWidth = `${PRINT_WIDTH_PX}px`;
  clone.style.minWidth = `${PRINT_WIDTH_PX}px`;
  clone.style.boxSizing = "border-box";
  clone.style.padding = "20px 24px";
  clone.style.margin = "0";
  clone.style.overflow = "visible";
  clone.style.background = "#ffffff";
  applyPrintLayout(clone);

  host.appendChild(clone);
  document.body.appendChild(host);
  await waitForPaint();

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: PRINT_WIDTH_PX,
      windowWidth: PRINT_WIDTH_PX,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        stripStylesheetsFromClone(clonedDoc);
        const cloneRoot =
          (sourceEl.id && clonedDoc.getElementById(sourceEl.id)) ||
          clonedDoc.body?.querySelector(".candidate-application-print-root") ||
          clonedDoc.body?.firstElementChild;
        if (cloneRoot) {
          cloneRoot.style.width = `${PRINT_WIDTH_PX}px`;
          cloneRoot.style.maxWidth = `${PRINT_WIDTH_PX}px`;
          cloneRoot.style.minWidth = `${PRINT_WIDTH_PX}px`;
          cloneRoot.style.boxSizing = "border-box";
          cloneRoot.style.padding = "20px 24px";
          cloneRoot.style.overflow = "visible";
          cloneRoot.style.background = "#ffffff";
          applyInlineComputedStyles(sourceEl, cloneRoot);
          applyPrintLayout(cloneRoot);
        }
      },
    });
    return canvas;
  } finally {
    host.remove();
  }
}

/**
 * Export the candidate application print root as a multi-page PDF with margins.
 */
export async function downloadCandidateApplicationPdf(
  elementId = "candidate-application-print",
  filename = "client-application.pdf",
) {
  const el = document.getElementById(elementId);
  if (!el) {
    throw new Error("Application content not found. Open the application view first.");
  }

  const canvas = await capturePrintableCanvas(el);
  const imgData = canvas.toDataURL("image/png", 1.0);

  const pdf = new jsPDF("p", "mm", "a4");

  // Fit image inside printable area (width-constrained; height follows aspect ratio)
  const imgWidthMm = PDF_CONTENT_W_MM;
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

  let heightLeft = imgHeightMm;
  let y = PDF_MARGIN_MM;

  pdf.addImage(imgData, "PNG", PDF_MARGIN_MM, y, imgWidthMm, imgHeightMm);
  heightLeft -= PDF_CONTENT_H_MM;

  while (heightLeft > 0) {
    y = PDF_MARGIN_MM - (imgHeightMm - heightLeft);
    pdf.addPage();
    pdf.addImage(imgData, "PNG", PDF_MARGIN_MM, y, imgWidthMm, imgHeightMm);
    heightLeft -= PDF_CONTENT_H_MM;
  }

  pdf.save(filename);
}
