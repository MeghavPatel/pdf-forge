import { PDFDocument } from "pdf-lib";

export async function loadPdf(file: File): Promise<PDFDocument> {
  const buffer = await file.arrayBuffer();
  return PDFDocument.load(buffer);
}

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const doc = await loadPdf(file);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return merged.save();
}

export async function splitPdf(
  file: File,
  ranges: { start: number; end: number }[]
): Promise<Uint8Array[]> {
  const source = await loadPdf(file);
  const results: Uint8Array[] = [];

  for (const range of ranges) {
    const newDoc = await PDFDocument.create();
    const indices = [];
    for (let i = range.start - 1; i < range.end && i < source.getPageCount(); i++) {
      indices.push(i);
    }
    const pages = await newDoc.copyPages(source, indices);
    pages.forEach((page) => newDoc.addPage(page));
    results.push(await newDoc.save());
  }

  return results;
}

export async function compressPdf(
  file: File,
  _options: {
    quality: number;
    stripMetadata: boolean;
    downscaleImages: boolean;
    grayscale: boolean;
    fastMode: boolean;
  }
): Promise<Uint8Array> {
  // pdf-lib doesn't support real image compression client-side,
  // but we can strip metadata and rebuild the document to reduce size.
  const source = await loadPdf(file);
  const newDoc = await PDFDocument.create();

  if (_options.stripMetadata) {
    newDoc.setTitle("");
    newDoc.setAuthor("");
    newDoc.setSubject("");
    newDoc.setKeywords([]);
    newDoc.setProducer("");
    newDoc.setCreator("");
  }

  const pages = await newDoc.copyPages(source, source.getPageIndices());
  pages.forEach((page) => newDoc.addPage(page));

  return newDoc.save();
}

export function downloadBlob(data: Uint8Array, filename: string) {
  const blob = new Blob([data as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
