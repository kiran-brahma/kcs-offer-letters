import Papa from 'papaparse';

// Accepted header spellings -> canonical field.
const ALIASES = {
  fullName: ['name', 'full name', 'employee name', 'fullname', 'emp name'],
  employeeId: ['employee id', 'employeeid', 'emp id', 'empid', 'id', 'employee code', 'emp code'],
  dateOfJoining: ['date of joining', 'doj', 'joining date', 'date_of_joining', 'joining'],
  designation: ['designation', 'role', 'position', 'job title', 'title'],
};

function canonicalField(header) {
  const h = String(header || '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  for (const [field, names] of Object.entries(ALIASES)) {
    if (names.includes(h)) return field;
  }
  return null;
}

export const REQUIRED_FIELDS = ['fullName', 'employeeId', 'dateOfJoining', 'designation'];

export const FIELD_LABELS = {
  fullName: 'Name',
  employeeId: 'Employee ID',
  dateOfJoining: 'Date of Joining',
  designation: 'Designation',
};

export function formatDate(value) {
  if (value instanceof Date && !isNaN(value)) return fmt(value);
  const s = String(value ?? '').trim();
  if (!s) return '';

  // Excel serial date (days since 1899-12-30).
  if (/^\d{5}$/.test(s)) {
    const d = new Date(Date.UTC(1899, 11, 30) + Number(s) * 86400000);
    if (!isNaN(d)) return fmt(d);
  }

  // dd/mm/yyyy or dd-mm-yyyy — Indian convention, day first.
  const dmy = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (dmy) {
    let [, d, m, y] = dmy;
    if (y.length === 2) y = `20${y}`;
    const dt = new Date(Date.UTC(+y, +m - 1, +d));
    if (!isNaN(dt)) return fmt(dt);
  }

  // ISO yyyy-mm-dd
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const dt = new Date(Date.UTC(+iso[1], +iso[2] - 1, +iso[3]));
    if (!isNaN(dt)) return fmt(dt);
  }

  return s; // pass through anything else untouched
}

function fmt(d) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${String(d.getUTCDate()).padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function rowsToRecords(rawRows) {
  if (!rawRows.length) return { records: [], missing: REQUIRED_FIELDS, headers: [] };

  const headers = Object.keys(rawRows[0]);
  const map = {};
  headers.forEach((h) => {
    const f = canonicalField(h);
    if (f && !(f in map)) map[f] = h;
  });

  const missing = REQUIRED_FIELDS.filter((f) => !(f in map));

  const records = rawRows
    .map((row) => ({
      fullName: String(row[map.fullName] ?? '').trim(),
      employeeId: String(row[map.employeeId] ?? '').trim(),
      dateOfJoining: formatDate(row[map.dateOfJoining]),
      designation: String(row[map.designation] ?? '').trim(),
    }))
    .filter((r) => r.fullName || r.employeeId);

  return { records, missing, headers };
}

export async function parseFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv') || name.endsWith('.txt')) {
    const text = await file.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    return rowsToRecords(parsed.data);
  }

  const XLSX = await import('xlsx');
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array', cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  return rowsToRecords(rows);
}

export function validate(records) {
  return records.map((r, i) => {
    const errors = REQUIRED_FIELDS.filter((f) => !r[f]).map((f) => FIELD_LABELS[f]);
    return { ...r, row: i + 2, errors };
  });
}
