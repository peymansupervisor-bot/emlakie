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
  property_type: 'apartment' | 'house' | 'condo' | 'studio' | 'townhouse' | 'commercial';
  amenities: string[];
  photos: string[];
  status: string;
  availableFrom?: string;
  view_count?: number;
  isSample?: boolean;
  dom?: number;
  domStartDate?: string | null;
}

export interface ListingFilters {
  city?: string;
  zip?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  propertyType?: string;
  page?: string;
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
