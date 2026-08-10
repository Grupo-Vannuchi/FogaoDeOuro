/**
 * Normalize a Brazilian phone number to E.164 (`+55` + DDD + number).
 *
 * Accepts the messy ways visitors type their WhatsApp (spaces, parentheses,
 * dashes, a leading +55 or 55 or a leading 0). Returns null when the input can't
 * be confidently turned into a valid 10- or 11-digit national number.
 */
export function normalizePhoneBR(raw: string | undefined | null): string | null {
  let d = (raw ?? "").replace(/\D/g, "");
  if (!d) return null;

  // Drop a leading country code if present.
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
  // Drop a single leading trunk "0" (e.g. 0DD...).
  if (d.length >= 11 && d.startsWith("0")) d = d.slice(1);

  // National number must be DDD (2) + 8 (landline) or 9 (mobile) digits.
  if (d.length === 10 || d.length === 11) return `+55${d}`;

  return null;
}

/** Digits-only form (no `+`) used by the Evolution API `number` field. */
export function toWhatsappNumber(e164: string): string {
  return e164.replace(/\D/g, "");
}

/**
 * Progressive Brazilian phone mask for form inputs, e.g. "(13) 91234-5678".
 * Caps at 11 digits (DDD + 9-digit mobile); 10 digits render as a landline.
 */
export function maskPhoneBR(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
