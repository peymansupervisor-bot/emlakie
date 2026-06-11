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
}

export interface ListingFilters {
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  propertyType?: string;
  page?: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  usingSampleData: boolean;
}
