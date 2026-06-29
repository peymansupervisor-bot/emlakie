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
  agent_name?: string | null;
  office_name?: string | null;
  virtual_tour_url?: string | null;
  slug?: string | null;
  user_id?: string | null;
  landlord_id?: string | null;
  virtual_phone?: string | null;
  building_name?: string | null;
  refreshed_at?: string | null;
  boosted_until?: string | null;
  section_8_accepted?: boolean;
  furnished?: boolean;
  laundry_type?: string | null;
  pool?: boolean;
  pool_type?: string | null;
  fireplace?: boolean;
  fireplace_location?: string | null;
  parking?: boolean;
  parking_spaces?: number | null;
  parking_type?: string | null;
  air_conditioning?: boolean;
  heating_type?: string | null;
  pets_policy?: string | null;
  yard?: boolean;
  yard_type?: string | null;
  utilities_included?: string[];
  lease_terms?: string[];
  smoking_allowed?: boolean;
  appliances?: string[];
}

export interface ListingFilters {
  q?: string;       // general search: city, zip, address, state, neighborhood
  city?: string;    // legacy / filter bar
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
