import crypto from 'crypto';

export const newToken = () => crypto.randomBytes(32).toString('hex');
export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );
export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const csvCell = (value: unknown) => {
  const text = String(value ?? '');
  // Neutralize spreadsheet formulas before RFC 4180 quoting.
  const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};
