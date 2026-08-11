'use client';

import { useState } from 'react';
import { documentHash, formatHash } from '@/lib/hash';
import { formatDate } from '@/lib/parse';

const EMPTY = { fullName: '', employeeId: '', dateOfJoining: '', designation: '', refNumber: '', printedHash: '' };

export default function VerifyPage() {
  const [f, setF] = useState(EMPTY);
  const [result, setResult] = useState(null);

  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setResult(null); };

  async function check(e) {
    e.preventDefault();
    const computed = await documentHash({
      fullName: f.fullName,
      employeeId: f.employeeId,
      dateOfJoining: formatDate(f.dateOfJoining),
      designation: f.designation,
      refNumber: f.refNumber,
    });
    const printed = f.printedHash.replace(/[^A-Fa-f0-9]/g, '').toLowerCase();
    setResult({ computed, match: printed.length === 64 && printed === computed, printedGiven: printed.length === 64 });
  }

  return (
    <>
      <section className="card">
        <h2>Verify a letter</h2>
        <p className="hint">
          Type the details exactly as printed on the letter, plus the SHA-256 hash from its footer. A match confirms
          the name, employee ID, joining date, designation and reference number were not altered after issue.
        </p>

        <form onSubmit={check}>
          <div className="grid2">
            <div><label className="field">Name</label><input type="text" value={f.fullName} onChange={set('fullName')} /></div>
            <div><label className="field">Employee ID</label><input type="text" value={f.employeeId} onChange={set('employeeId')} /></div>
            <div><label className="field">Date of Joining (as printed)</label><input type="text" value={f.dateOfJoining} onChange={set('dateOfJoining')} placeholder="01 April 2026" /></div>
            <div><label className="field">Designation</label><input type="text" value={f.designation} onChange={set('designation')} /></div>
            <div><label className="field">Reference number</label><input type="text" value={f.refNumber} onChange={set('refNumber')} placeholder="KCS/APP/2026/AB12CD34" /></div>
            <div><label className="field">Printed hash</label><input type="text" value={f.printedHash} onChange={set('printedHash')} placeholder="A1B2C3D4-…" /></div>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn" type="submit">Verify</button>
            <button className="btn ghost" type="button" onClick={() => { setF(EMPTY); setResult(null); }}>Clear</button>
          </div>
        </form>
      </section>

      {result && (
        <section className="card">
          <h2>Result</h2>
          {result.match ? (
            <div className="msg ok" style={{ marginBottom: 8 }}>
              <strong>Authentic.</strong> The hash matches the details entered. This letter was issued by the Company
              with exactly these particulars.
            </div>
          ) : (
            <div className="msg err" style={{ marginBottom: 8 }}>
              <strong>No match.</strong>{' '}
              {result.printedGiven
                ? 'The details do not produce the printed hash. Either a field was typed differently from the letter, or the document has been altered.'
                : 'Enter the full 64-character hash printed on the letter.'}
            </div>
          )}
          <p className="hint" style={{ margin: 0 }}>Hash computed from the details entered:</p>
          <p className="mono" style={{ wordBreak: 'break-all' }}>{formatHash(result.computed)}</p>
        </section>
      )}
    </>
  );
}
