import { DOC_VERSION } from './company';

// Canonical payload. Any change here invalidates every previously issued hash.
export function canonicalPayload({ fullName, employeeId, dateOfJoining, designation, refNumber }) {
  return [
    'KCS',
    DOC_VERSION,
    norm(fullName),
    norm(employeeId),
    norm(dateOfJoining),
    norm(designation),
    norm(refNumber),
  ].join('|');
}

function norm(v) {
  return String(v ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function documentHash(record) {
  return sha256Hex(canonicalPayload(record));
}

export function formatHash(hex) {
  return (hex.match(/.{1,8}/g) || []).join('-').toUpperCase();
}

export function generateRefNumber(date = new Date()) {
  const year = date.getFullYear();
  const rand = new Uint8Array(4);
  crypto.getRandomValues(rand);
  const suffix = Array.from(rand)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return `KCS/APP/${year}/${suffix}`;
}
