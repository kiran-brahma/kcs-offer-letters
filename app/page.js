'use client';

import { useCallback, useRef, useState } from 'react';
import { parseFile, validate, formatDate, FIELD_LABELS, REQUIRED_FIELDS } from '@/lib/parse';
import { documentHash, generateRefNumber, formatHash } from '@/lib/hash';
import { loadLogo, makeLetterPdf, makeMergedPdf, safeFileName } from '@/lib/pdf';

const SAMPLE = [
  { fullName: 'Ramesh Kumar', employeeId: 'KCS-1042', dateOfJoining: '01/04/2026', designation: 'Security Guard' },
  { fullName: 'Sunita Devi', employeeId: 'KCS-1043', dateOfJoining: '01/04/2026', designation: 'Housekeeping Attendant' },
  { fullName: 'Mohd Arif', employeeId: 'KCS-1044', dateOfJoining: '15/04/2026', designation: 'Supervisor' },
];

export default function GeneratePage() {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const generated = validRows.filter((r) => r.hash);

  const ingest = useCallback(async (file) => {
    setError('');
    setNotice('');
    try {
      const { records, missing } = await parseFile(file);
      if (missing.length) {
        setError(`Missing column(s): ${missing.map((m) => FIELD_LABELS[m]).join(', ')}. Required headers: ${REQUIRED_FIELDS.map((f) => FIELD_LABELS[f]).join(', ')}.`);
        setRows([]);
        return;
      }
      if (!records.length) {
        setError('No data rows found in the file.');
        setRows([]);
        return;
      }
      setRows(validate(records));
      setFileName(file.name);
      setNotice(`Loaded ${records.length} row(s) from ${file.name}.`);
    } catch (e) {
      setError(`Could not read the file: ${e.message}`);
    }
  }, []);

  function loadSample() {
    setError('');
    setRows(validate(SAMPLE.map((r) => ({ ...r, dateOfJoining: formatDate(r.dateOfJoining) }))));
    setFileName('sample data');
    setNotice('Loaded 3 sample rows.');
  }

  async function generate() {
    setBusy('Generating reference numbers and hashes…');
    setError('');
    try {
      const next = await Promise.all(
        rows.map(async (r) => {
          if (r.errors.length) return r;
          const refNumber = r.refNumber || generateRefNumber();
          const hash = await documentHash({ ...r, refNumber });
          return { ...r, refNumber, hash };
        })
      );
      setRows(next);
      setNotice(`${next.filter((r) => r.hash).length} letter(s) ready. Download individually or as one merged PDF.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }

  async function downloadOne(record) {
    setBusy(`Building PDF for ${record.fullName}…`);
    try {
      const logo = await loadLogo();
      const pdf = await makeLetterPdf(record, logo);
      pdf.download(safeFileName(record));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }

  async function downloadAllSeparate() {
    const list = generated;
    try {
      const logo = await loadLogo();
      for (let i = 0; i < list.length; i++) {
        setBusy(`Building PDF ${i + 1} of ${list.length}…`);
        const pdf = await makeLetterPdf(list[i], logo);
        pdf.download(safeFileName(list[i]));
        // Browsers throttle rapid consecutive downloads.
        await new Promise((r) => setTimeout(r, 400));
      }
      setNotice(`Downloaded ${list.length} individual PDFs. Allow multiple downloads if the browser asks.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }

  async function downloadMerged() {
    setBusy(`Merging ${generated.length} letters…`);
    try {
      const logo = await loadLogo();
      const pdf = await makeMergedPdf(generated, logo);
      const stamp = new Date().toISOString().slice(0, 10);
      pdf.download(`Appointment_Letters_${generated.length}_${stamp}.pdf`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }

  function downloadRegister() {
    const head = ['Name', 'Employee ID', 'Date of Joining', 'Designation', 'Reference No', 'SHA-256 Hash'];
    const body = generated.map((r) => [r.fullName, r.employeeId, r.dateOfJoining, r.designation, r.refNumber, r.hash]);
    const csv = [head, ...body]
      .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Issuance_Register_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setRows([]);
    setFileName('');
    setNotice('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <>
      <section className="card">
        <h2>1. Upload employee list</h2>
        <p className="hint">
          CSV or Excel (.xlsx / .xls) with columns: <strong>Name</strong>, <strong>Employee ID</strong>,{' '}
          <strong>Date of Joining</strong>, <strong>Designation</strong>. Header order does not matter.
        </p>

        <div
          className={`drop${over ? ' over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) ingest(f); }}
        >
          <strong>Click to choose a file</strong> or drag it here
          <div style={{ fontSize: 12, marginTop: 4 }}>{fileName ? `Current: ${fileName}` : '.csv, .xlsx, .xls'}</div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) ingest(f); }}
        />

        <div className="row" style={{ marginTop: 12 }}>
          <a className="btn ghost sm" href="/sample-employees.csv" download="sample-employees.csv">
            Download sample CSV template
          </a>
          <button className="btn ghost sm" onClick={loadSample}>Load sample data</button>
          {rows.length > 0 && <button className="btn ghost sm" onClick={reset}>Clear</button>}
        </div>
      </section>

      {error && <div className="msg err">{error}</div>}
      {notice && !error && <div className="msg ok">{notice}</div>}
      {busy && <div className="msg warn">{busy}</div>}

      {rows.length > 0 && (
        <section className="card">
          <h2>2. Review &amp; generate</h2>
          <p className="hint">
            {validRows.length} valid row(s){rows.length !== validRows.length ? `, ${rows.length - validRows.length} row(s) with missing data (highlighted, skipped)` : ''}.
            A unique reference number and SHA-256 integrity hash is created per letter.
          </p>

          <div className="row" style={{ marginBottom: 14 }}>
            <button className="btn" onClick={generate} disabled={!validRows.length || !!busy}>
              {generated.length ? 'Regenerate' : 'Generate letters'}
            </button>
            <button className="btn ghost" onClick={downloadMerged} disabled={!generated.length || !!busy}>
              Download merged PDF ({generated.length})
            </button>
            <button className="btn ghost" onClick={downloadAllSeparate} disabled={!generated.length || !!busy}>
              Download all separately
            </button>
            <button className="btn ghost" onClick={downloadRegister} disabled={!generated.length || !!busy}>
              Export issuance register (CSV)
            </button>
          </div>

          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Employee ID</th>
                  <th>Date of Joining</th>
                  <th>Designation</th>
                  <th>Reference</th>
                  <th>Hash</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={r.errors.length ? 'bad' : ''}>
                    <td>{i + 1}</td>
                    <td>{r.fullName || <em>—</em>}</td>
                    <td>{r.employeeId || <em>—</em>}</td>
                    <td>{r.dateOfJoining || <em>—</em>}</td>
                    <td>{r.designation || <em>—</em>}</td>
                    <td className="mono">{r.refNumber || '—'}</td>
                    <td className="mono">{r.hash ? `${formatHash(r.hash).slice(0, 17)}…` : '—'}</td>
                    <td>
                      {r.errors.length ? (
                        <span style={{ color: 'var(--err)', fontSize: 12 }}>Missing: {r.errors.join(', ')}</span>
                      ) : (
                        <button className="btn ghost sm" onClick={() => downloadOne(r)} disabled={!r.hash || !!busy}>
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
