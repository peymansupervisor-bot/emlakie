export interface Listing {
  id: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  property_type: 'apartment' | 'house' | 'condo' | 'studio' | 'townhouse' | 'room' | 'adu' | 'jadu' | 'commercial';
  ownership_type?: 'apartment' | 'condo' | 'adu' | 'jadu' | null;
  amenities: string[];
  photos: string[];
  status: string;
  availableFrom?: string;
  view_count?: number;
  isSample?: boolean;
  dom?: number;
  domStartDate?: string | null;
  listing_source?: 'owner' | 'broker' | 'mls';
  license_number?: string | null;
  virtual_tour_url?: string | null;
}

export interface ListingFilters {
  city?: string;
  zip?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  propertyType?: string;
  amenities?: string;
  page?: string;
  ownerDirect?: string;
}

export interface ZipLocation {
  zip: string;
  city: string;
  state: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  usingSampleData: boolean;
}
