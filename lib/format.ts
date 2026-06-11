export function formatPrice(price: number): string {
  return `$${price.toLocaleString('en-US')}/mo`;
}

export function formatPropertyType(type: string): string {
  const labels: Record<string, string> = {
    apartment: 'Apartment',
    house: 'House',
    condo: 'Condo',
    studio: 'Studio',
    townhouse: 'Townhouse',
    commercial: 'Commercial',
  };
  return labels[type] ?? type;
}

export function formatBeds(bedrooms: number): string {
  return bedrooms === 0 ? 'Studio' : `${bedrooms} bd`;
}

export function formatBaths(bathrooms: number): string {
  return `${bathrooms} ba`;
}

export function formatSqft(sqft: number): string {
  return sqft > 0 ? `${sqft.toLocaleString('en-US')} sqft` : '— sqft';
}
