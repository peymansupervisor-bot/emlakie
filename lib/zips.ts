const zipcodeLib = require('zipcodes') as {
  lookup: (zip: string) => ZipInfo | null;
};

export interface ZipInfo {
  zip: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  country: string;
}

export function lookupZip(zip: string): ZipInfo | null {
  if (!/^\d{5}$/.test(zip)) return null;
  return zipcodeLib.lookup(zip) ?? null;
}

export function isValidUsZip(zip: string): boolean {
  return !!lookupZip(zip);
}
