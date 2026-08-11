import { COMPANY, FOOTER_NOTE } from './company';
import { buildLetterContent } from './letter';

let pdfMakePromise = null;

async function getPdfMake() {
  if (!pdfMakePromise) {
    pdfMakePromise = (async () => {
      const mod = await import('pdfmake/build/pdfmake');
      const fontsMod = await import('pdfmake/build/vfs_fonts');
      const pdfMake = mod.default || mod;
      // vfs_fonts in pdfmake 0.3.11 is `module.exports = vfs`, i.e. the virtual
      // file system object itself. Some versions/transpilers instead wrap it as
      // { pdfMake: { vfs } }, or set the pdfMake global. Normalize all shapes:
      const f = fontsMod.default ?? fontsMod;
      const vfs =
        f?.pdfMake?.vfs ||
        f?.vfs ||
        f?.default?.pdfMake?.vfs ||
        (typeof f === 'object' && f && !Array.isArray(f) ? f : null) ||
        globalThis?.pdfMake?.vfs;
      if (!vfs) throw new Error('pdfmake fonts (vfs) failed to load');
      pdfMake.vfs = vfs;
      return pdfMake;
    })();
  }
  return pdfMakePromise;
}

let logoPromise = null;

// Logo is optional: if public/logo.png is absent the letterhead falls back to text.
export async function loadLogo() {
  if (!logoPromise) {
    logoPromise = (async () => {
      try {
        const res = await fetch(COMPANY.logoPath, { cache: 'force-cache' });
        if (!res.ok) return null;
        const blob = await res.blob();
        if (!blob.type.startsWith('image/')) return null;
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    })();
  }
  return logoPromise;
}

const STYLES = {
  companyName: { fontSize: 12.5, bold: true, color: '#A63200' },
  companyAddress: { fontSize: 8.5, color: '#444444', lineHeight: 1.15 },
  title: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 12], decoration: 'underline' },
  h1: { fontSize: 12, bold: true, margin: [0, 0, 0, 8] },
  h2: { fontSize: 10.5, bold: true, margin: [0, 8, 0, 4] },
  para: { fontSize: 9.5, alignment: 'justify', lineHeight: 1.25, margin: [0, 0, 0, 4] },
  meta: { fontSize: 9.5, margin: [0, 4, 0, 0] },
  bullet: { fontSize: 9.5, alignment: 'justify', lineHeight: 1.25 },
  authTitle: { fontSize: 9, bold: true },
  authLine: { fontSize: 8, color: '#333333' },
  hash: { fontSize: 8, bold: true, color: '#A63200', characterSpacing: 0.2 },
  authNote: { fontSize: 7, color: '#666666', italics: true, margin: [0, 4, 0, 0] },
};

function docDefinition(content) {
  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 48],
    content,
    styles: STYLES,
    defaultStyle: { font: 'Roboto', fontSize: 9.5 },
    footer: (currentPage, pageCount) => ({
      margin: [40, 8, 40, 0],
      columns: [
        { text: FOOTER_NOTE, fontSize: 7.5, color: '#777777' },
        { text: `Page ${currentPage} of ${pageCount}`, fontSize: 7.5, color: '#777777', alignment: 'right' },
      ],
    }),
    info: { title: 'Appointment Letter', author: COMPANY.name },
  };
}

export async function makeLetterPdf(record, logo) {
  const pdfMake = await getPdfMake();
  return pdfMake.createPdf(docDefinition(buildLetterContent(record, logo)));
}

export async function makeMergedPdf(records, logo) {
  const pdfMake = await getPdfMake();
  const content = [];
  records.forEach((r, i) => {
    const block = buildLetterContent(r, logo);
    if (i > 0) block[0] = { ...block[0], pageBreak: 'before' };
    content.push(...block);
  });
  return pdfMake.createPdf(docDefinition(content));
}

export function safeFileName(record) {
  const base = `${record.fullName}_${record.employeeId}`
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return `Appointment_Letter_${base || 'Employee'}.pdf`;
}
