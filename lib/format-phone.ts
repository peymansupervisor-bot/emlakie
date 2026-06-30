/** Format any US phone (E.164, raw 10-digit, or formatted) to (XXX) XXX-XXXX */
export function fmtPhone(raw: string | null | undefined): string {
  if (!raw) return '—';
  const d = raw.replace(/\D/g, '').slice(-10);
  if (d.length !== 10) return raw;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
