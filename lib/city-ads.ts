export interface CityAd {
  company: string;
  tagline: string;
  description: string;
  phone: string;
  url: string;
  logo?: string;
}

const CITY_ADS: Record<string, CityAd> = {
  'bakersfield': {
    company: 'Bakersfield Property Management',
    tagline: 'Professional property management in Bakersfield, CA since 2008',
    description:
      'Tenant screening, rent collection, maintenance, and leasing for 300+ properties across Bakersfield and Kern County.',
    phone: '(661) 861-1597',
    url: 'https://bakersfieldpropertymanagement.net/',
    logo: 'https://bakersfieldpropertymanagement.net/assets/bpm-logo-purple--j-Qz0wM.png',
  },
  'kansas-city': {
    company: 'Wise Owl Properties',
    tagline: 'Find a place that you can call home',
    description:
      'Residential rental property management across the Kansas City Metro — apartment and house rentals, online rent payment, and tenant maintenance requests.',
    phone: '424-247-7316',
    url: 'https://www.wiseowlproperties.com/',
    logo: 'https://lirp.cdn-website.com/c661a703/dms3rep/multi/opt/Wise-Owl-Properties-logo-horizontal-292w.jpeg',
  },
};

export function getCityAd(slug: string): CityAd | null {
  return CITY_ADS[slug] ?? null;
}
