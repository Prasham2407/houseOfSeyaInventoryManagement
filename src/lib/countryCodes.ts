export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'AE', name: 'UAE', dialCode: '+971' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'SG', name: 'Singapore', dialCode: '+65' },
  { code: 'SE', name: 'Sweden', dialCode: '+46' },
];

export const DEFAULT_COUNTRY_DIAL_CODE = '+91';

const DIAL_CODES_BY_LENGTH_DESC = [...COUNTRY_CODES]
  .map((c) => c.dialCode)
  .sort((a, b) => b.length - a.length);

export function splitPhoneNumber(phone: string | null | undefined): { dialCode: string; number: string } {
  if (!phone) return { dialCode: DEFAULT_COUNTRY_DIAL_CODE, number: '' };
  const trimmed = phone.trim();
  const match = DIAL_CODES_BY_LENGTH_DESC.find((dial) => trimmed.startsWith(dial));
  if (match) {
    return { dialCode: match, number: trimmed.slice(match.length).trim() };
  }
  return { dialCode: DEFAULT_COUNTRY_DIAL_CODE, number: trimmed };
}

export function joinPhoneNumber(dialCode: string, number: string): string {
  const trimmedNumber = number.trim();
  if (!trimmedNumber) return '';
  return `${dialCode} ${trimmedNumber}`;
}
