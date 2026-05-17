import { useCallback, useState } from "react";
import {
  downloadFilledApplicationPdf as fetchFilledPdf,
  downloadCaseSummaryPdf as fetchCasePdf,
  downloadSupportingDocumentsZip as fetchZip,
  triggerBlobDownload,
} from "../services/downloadApi";

async function messageFromDownloadError(error) {
  const raw = error?.response?.data;
  if (raw instanceof Blob) {
    try {
      const text = await raw.text();
      const j = JSON.parse(text);
      if (typeof j.message === "string") return j.message;
    } catch {
      return error?.message || "Download failed";
    }
  }
  const d = error?.response?.data;
  const m = d?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m) && m.length) return m[0];
  return error?.message || "Something went wrong";
}

export default function useDownloads() {
  const [busy, setBusy] = useState({
    filledPdf: false,
    casePdf: false,
    zip: false,
  });

  const downloadFilledApplicationPdf = useCallback(async () => {
    setBusy((s) => ({ ...s, filledPdf: true }));
    try {
      const { blob, filename } = await fetchFilledPdf();
      triggerBlobDownload(blob, filename);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e, message: await messageFromDownloadError(e) };
    } finally {
      setBusy((s) => ({ ...s, filledPdf: false }));
    }
  }, []);

  const downloadCaseSummaryPdf = useCallback(async () => {
    setBusy((s) => ({ ...s, casePdf: true }));
    try {
      const { blob, filename } = await fetchCasePdf();
      triggerBlobDownload(blob, filename);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e, message: await messageFromDownloadError(e) };
    } finally {
      setBusy((s) => ({ ...s, casePdf: false }));
    }
  }, []);

  const downloadSupportingDocumentsZip = useCallback(async () => {
    setBusy((s) => ({ ...s, zip: true }));
    try {
      const { blob, filename } = await fetchZip();
      triggerBlobDownload(blob, filename);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e, message: await messageFromDownloadError(e) };
    } finally {
      setBusy((s) => ({ ...s, zip: false }));
    }
  }, []);

  return {
    busy,
    downloadFilledApplicationPdf,
    downloadCaseSummaryPdf,
    downloadSupportingDocumentsZip,
  };
}
