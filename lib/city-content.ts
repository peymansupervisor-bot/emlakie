export interface CityContent {
  headline: string;
  intro: string;
  highlights: { icon: string; label: string; detail: string }[];
  neighborhoods?: string[];
  rentTips: string;
  faqs: { q: string; a: string }[];
  nearbySearches: { label: string; slug: string }[];
}

const CITY_CONTENT: Record<string, CityContent> = {
  'beverly-hills': {
    headline: 'Renting in Beverly Hills, CA',
    intro:
      'Beverly Hills is one of the most prestigious addresses in Los Angeles County — an independent city surrounded by LA, famous for Rodeo Drive, manicured streets, and some of California\'s most sought-after rental homes. Despite its luxury reputation, Beverly Hills offers a range of rentals from spacious apartments near Santa Monica Blvd to gated estates in the flats and hillside homes above Sunset.',
    highlights: [
      { icon: '🏫', label: 'Schools', detail: 'Beverly Hills Unified School District — consistently rated among the top public school districts in California.' },
      { icon: '🚇', label: 'Transit', detail: 'Metro Bus lines and the upcoming Purple Line Extension (Wilshire/La Cienega stop) improve car-free options.' },
      { icon: '🛍️', label: 'Lifestyle', detail: 'Rodeo Drive, Beverly Gardens Park, and dozens of Michelin-starred restaurants within walking distance.' },
      { icon: '🏥', label: 'Healthcare', detail: 'Cedars-Sinai Medical Center is minutes away — one of the top hospitals in the US.' },
      { icon: '🌳', label: 'Parks', detail: 'Beverly Gardens Park stretches 1.9 miles along Santa Monica Blvd with rose gardens and the iconic Beverly Hills sign.' },
    ],
    neighborhoods: ['Beverly Hills Flats', 'Beverly Hills Post Office (BHPO)', 'Trousdale Estates', 'Benedict Canyon', 'Coldwater Canyon'],
    rentTips:
      'Rentals in Beverly Hills move fast — especially anything under $4,000/month. Units near Wilshire Blvd tend to be more affordable than the residential flats. Many landlords require proof of income equal to 3× the monthly rent. Listings here are mostly owner-direct with no broker fee.',
    faqs: [
      { q: 'Is Beverly Hills a separate city from Los Angeles?', a: 'Yes. Beverly Hills is an independent incorporated city entirely surrounded by the City of Los Angeles. It has its own police department, school district, and city services.' },
      { q: 'What is the average rent in Beverly Hills?', a: 'Rents vary widely — expect $2,500–$4,500/month for a 1-bedroom apartment, and $5,000+ for single-family homes. Luxury estates can exceed $30,000/month.' },
      { q: 'Is parking included in Beverly Hills rentals?', a: 'Most apartment buildings include at least one assigned parking space. Street parking requires an annual Beverly Hills residential permit.' },
    ],
    nearbySearches: [
      { label: 'West Hollywood rentals', slug: 'west-hollywood' },
      { label: 'Los Angeles rentals', slug: 'los-angeles' },
      { label: 'Venice rentals', slug: 'venice' },
    ],
  },

  'west-hollywood': {
    headline: 'Renting in West Hollywood, CA',
    intro:
      'West Hollywood (WeHo) is a vibrant, walkable city sandwiched between Beverly Hills and Hollywood. Known for the Sunset Strip, Santa Monica Boulevard, and its LGBTQ+ community, WeHo is one of the most energetic rental markets in LA. The city maintains strong tenant protections — rent stabilization covers most units built before 1979 — making it an attractive option for long-term renters.',
    highlights: [
      { icon: '🏳️‍🌈', label: 'Community', detail: 'West Hollywood was among the first US cities to elect a majority LGBTQ+ city council. Pride events and community programming run year-round.' },
      { icon: '🎶', label: 'Nightlife', detail: 'The Sunset Strip hosts legendary venues including the Roxy, Whisky a Go Go, and countless rooftop bars and restaurants.' },
      { icon: '🚌', label: 'Transit', detail: 'Well-served by DASH WeHo and Metro Bus. The city also operates free electric shuttles within WeHo boundaries.' },
      { icon: '🏋️', label: 'Fitness', detail: 'Santa Monica Blvd and the pedestrian-friendly streets make WeHo one of LA\'s most walkable and bikeable neighborhoods.' },
      { icon: '🛡️', label: 'Tenant Protections', detail: 'West Hollywood has some of California\'s strongest rent stabilization laws, limiting annual rent increases on covered units.' },
    ],
    neighborhoods: ['Sunset Strip', 'Santa Monica Boulevard Corridor', 'Design District', 'Norma Triangle', 'East WeHo'],
    rentTips:
      'Look for pre-1979 buildings if you want rent-stabilization protections. Newer luxury buildings have higher base rents but modern amenities. Parking is scarce — confirm whether your unit includes a space before signing. Many WeHo landlords list directly without brokers, saving you thousands.',
    faqs: [
      { q: 'Is West Hollywood the same as Hollywood?', a: 'No. West Hollywood is an independent city with its own mayor and city council, separate from the Hollywood neighborhood within the City of Los Angeles.' },
      { q: 'Does West Hollywood have rent control?', a: 'Yes. West Hollywood\'s Rent Stabilization Ordinance covers most rental units built before July 1, 1979. Landlords may only raise rent by a set annual percentage tied to the CPI.' },
      { q: 'How is parking in West Hollywood?', a: 'Parking is challenging. Many apartments include one space, but additional vehicles often require street parking permits or paid structures. Ask before you sign.' },
    ],
    nearbySearches: [
      { label: 'Beverly Hills rentals', slug: 'beverly-hills' },
      { label: 'Los Angeles rentals', slug: 'los-angeles' },
      { label: 'Venice rentals', slug: 'venice' },
    ],
  },

  'venice': {
    headline: 'Renting in Venice, CA',
    intro:
      'Venice is one of Los Angeles\'s most iconic and eclectic neighborhoods — a beachside community with famous canals, the Venice Boardwalk, and a thriving arts scene. As a neighborhood of the City of Los Angeles (not a separate city), Venice renters benefit from LA\'s tenant protections while enjoying a laid-back coastal lifestyle that blends surfer culture, tech startups (Silicon Beach), and world-class street art.',
    highlights: [
      { icon: '🏖️', label: 'Beach Access', detail: 'Venice Beach is one of the most visited beaches in the US. Most rentals are within a 10-minute walk or bike ride of the sand.' },
      { icon: '🛶', label: 'Canals', detail: 'The Venice Canals Historic District features quiet waterways lined with charming homes — a hidden gem tucked between Abbot Kinney and the beach.' },
      { icon: '💼', label: 'Silicon Beach', detail: 'Google, Snap, and dozens of tech companies are headquartered nearby, making Venice a hub for tech professionals.' },
      { icon: '🎨', label: 'Arts & Culture', detail: 'Abbot Kinney Blvd is lined with galleries, boutiques, and acclaimed restaurants. The Venice Boardwalk features live performance and murals year-round.' },
      { icon: '🚲', label: 'Bikeability', detail: 'The Marvin Braude Bike Trail (The Strand) runs the length of the beach, connecting Venice to Santa Monica and beyond.' },
    ],
    neighborhoods: ['Abbot Kinney', 'Venice Canals', 'Venice Boardwalk', 'Oakwood', 'Mar Vista (border)', 'Silver Triangle'],
    rentTips:
      'Rentals closest to the beach and canals command a premium. Units east of Lincoln Blvd offer more value. Venice has an active short-term rental market — confirm your lease is a long-term tenancy. Parking permits are required for most street parking west of Lincoln. Look for units with bike storage if you plan to skip the car.',
    faqs: [
      { q: 'Is Venice its own city?', a: 'No. Venice is a neighborhood within the City of Los Angeles, annexed in 1925. Renters are covered by LA\'s Rent Stabilization Ordinance (RSO) on qualifying units.' },
      { q: 'How close are Venice rentals to the beach?', a: 'Much of Venice is within 0.5–1.5 miles of the ocean. Anything west of Lincoln Blvd is generally considered walking distance to the beach.' },
      { q: 'Is Venice safe to live in?', a: 'Venice is generally a desirable neighborhood. The Boardwalk area can be busy and has visible homelessness, but residential streets — especially near the canals and Abbot Kinney — are quiet and family-friendly.' },
    ],
    nearbySearches: [
      { label: 'Los Angeles rentals', slug: 'los-angeles' },
      { label: 'West Hollywood rentals', slug: 'west-hollywood' },
      { label: 'Beverly Hills rentals', slug: 'beverly-hills' },
    ],
  },

  'winnetka': {
    headline: 'Renting in Winnetka, CA',
    intro:
      'Winnetka is a quiet, family-oriented neighborhood in the western San Fernando Valley, part of the City of Los Angeles. It sits between Canoga Park, Reseda, and Chatsworth — offering spacious homes and apartments at significantly lower prices than Westside LA. Winnetka is popular with families and working professionals who want more square footage for their dollar while staying within the LA city limits.',
    highlights: [
      { icon: '💰', label: 'Affordability', detail: 'Winnetka consistently offers some of the most competitive rental prices within the City of LA — ideal for renters priced out of the Westside.' },
      { icon: '🏠', label: 'Space', detail: 'Single-family homes, duplexes, and larger apartment units are common — great for families or roommates wanting extra bedrooms.' },
      { icon: '🚗', label: 'Commute', detail: 'US-101 and SR-118 provide freeway access. The Orange Line busway connects Winnetka to North Hollywood (and the Red Line subway) in about 30 minutes.' },
      { icon: '🛒', label: 'Amenities', detail: 'Winnetka Town Center, Westfield Topanga (nearby), and Victory Blvd corridor offer everyday shopping, dining, and services.' },
      { icon: '🏫', label: 'Schools', detail: 'Served by Los Angeles Unified School District, with several elementary and middle schools within walking distance for most residential blocks.' },
    ],
    neighborhoods: ['Winnetka Center', 'Victory Blvd Corridor', 'Vanowen Corridor', 'West Winnetka'],
    rentTips:
      'Winnetka offers excellent value — you can typically rent a 2-bedroom apartment for what a studio costs on the Westside. Look for units near the Orange Line stations (Winnetka or Canoga stops) if you rely on public transit. Most rentals here are owner-listed with no broker fee.',
    faqs: [
      { q: 'Is Winnetka a good neighborhood in LA?', a: 'Yes. Winnetka is a stable, residential neighborhood popular with families. It\'s quieter than Westside LA and offers larger homes at more affordable rents.' },
      { q: 'How do you get around Winnetka without a car?', a: 'The Metro Orange Line (now G Line) bus rapid transit runs through Winnetka with stops at Winnetka Ave and Canoga Ave, connecting to the Red/Purple Line subway at North Hollywood.' },
      { q: 'Is Winnetka covered by LA rent control?', a: 'Units in Winnetka built before October 1978 are covered by the City of Los Angeles Rent Stabilization Ordinance (RSO), limiting annual rent increases.' },
    ],
    nearbySearches: [
      { label: 'Los Angeles rentals', slug: 'los-angeles' },
      { label: 'West Hollywood rentals', slug: 'west-hollywood' },
      { label: 'Beverly Hills rentals', slug: 'beverly-hills' },
    ],
  },

  'bakersfield': {
    headline: 'Renting in Bakersfield, CA',
    intro:
      'Bakersfield is the ninth-largest city in California and the seat of Kern County, sitting at the southern end of the San Joaquin Valley. Known for its agricultural roots, thriving oil industry, and country music heritage (home of the "Bakersfield Sound"), it\'s one of the most affordable major rental markets in California. Renters get significantly more space for their dollar compared to coastal cities, with a growing downtown and easy freeway access to Los Angeles via I-5 and SR-99.',
    highlights: [
      { icon: '💰', label: 'Affordability', detail: 'Average rents in Bakersfield are among the lowest of any major California city — often 50–60% less than LA or the Bay Area for comparable space.' },
      { icon: '🛣️', label: 'Commute to LA', detail: 'Bakersfield is roughly 110 miles north of Los Angeles via I-5 (Tejon Pass) or SR-99. Amtrak San Joaquins and Thruway buses also connect to Southern California.' },
      { icon: '🌡️', label: 'Climate', detail: 'Hot summers (often over 100°F) with mild winters. Air conditioning is essential for rentals — confirm units are equipped before signing.' },
      { icon: '🎓', label: 'Education', detail: 'Home to California State University, Bakersfield (CSUB) and Bakersfield College, making it a strong market for student and faculty rentals.' },
      { icon: '🤠', label: 'Culture', detail: 'The Bakersfield Sound (Buck Owens, Merle Haggard) has left a lasting musical legacy. Buck Owens\' Crystal Palace is a local landmark.' },
    ],
    neighborhoods: ['Downtown Bakersfield', 'Northwest Bakersfield', 'Southwest Bakersfield', 'Oleander', 'Stockdale', 'Rosedale', 'East Bakersfield'],
    rentTips:
      'Northwest and Southwest Bakersfield are the most popular areas for families and professionals, with newer construction and better schools. Downtown is growing with new restaurants and arts venues. Air conditioning is non-negotiable — make sure it\'s included. Many landlords list directly here without brokers.',
    faqs: [
      { q: 'Is Bakersfield a good place to rent?', a: 'Yes, especially for budget-conscious renters. You get significantly more space per dollar than anywhere on the California coast, with a stable job market anchored by agriculture, oil, and healthcare.' },
      { q: 'What is the average rent in Bakersfield?', a: 'A 1-bedroom in Bakersfield typically rents for $1,000–$1,500/month, and a 3-bedroom house for $1,500–$2,200 — far below California coastal averages.' },
      { q: 'Does Bakersfield have rent control?', a: 'No. Bakersfield does not have a local rent stabilization ordinance. California\'s AB 1482 (statewide rent cap) applies to qualifying buildings over 15 years old, limiting increases to 5% + CPI per year.' },
    ],
    nearbySearches: [
      { label: 'Los Angeles rentals', slug: 'los-angeles' },
      { label: 'Fresno rentals', slug: 'fresno' },
      { label: 'Lancaster rentals', slug: 'lancaster' },
    ],
  },

  'los-angeles': {
    headline: 'Renting in Los Angeles, CA',
    intro:
      'Los Angeles is the second-largest city in the United States and one of the most diverse rental markets in the world. From beachside studios in Santa Monica to hillside homes in Silver Lake, craftsman bungalows in Los Feliz to high-rise towers in Downtown — LA offers a rental for every lifestyle and budget. The city\'s Rent Stabilization Ordinance (RSO) covers hundreds of thousands of units built before 1978, providing significant tenant protections.',
    highlights: [
      { icon: '🌞', label: 'Weather', detail: 'LA averages 284 sunny days per year — one of the best climates in the US with mild year-round temperatures.' },
      { icon: '🚇', label: 'Transit', detail: 'Metro Rail lines (Red, Purple, Blue, Green, Gold, Silver, Expo) are expanding rapidly. Bus Rapid Transit lines connect the Valley to the coast.' },
      { icon: '🎬', label: 'Entertainment', detail: 'The entertainment capital of the world — studios, live music, world-class dining, museums, beaches, and mountains all within reach.' },
      { icon: '🛡️', label: 'Tenant Rights', detail: 'LA\'s RSO limits rent increases on pre-1978 units. Just Cause eviction protections apply citywide under the LARSO.' },
      { icon: '🌊', label: 'Beaches', detail: 'Santa Monica, Venice, Malibu, Manhattan Beach — LA has 75 miles of Pacific coastline accessible from anywhere in the city.' },
    ],
    neighborhoods: ['Silver Lake', 'Los Feliz', 'Echo Park', 'Koreatown', 'Mid-City', 'Culver City', 'Mar Vista', 'Eagle Rock', 'Highland Park', 'Sherman Oaks'],
    rentTips:
      'LA\'s rental market moves quickly — be ready to apply the same day you tour. Pre-1978 buildings covered by the RSO offer predictable rent increases. Avoid units in flood zones or areas with high fire risk. Ask about parking (it\'s often extra). Owner-direct listings on EMLAKIE skip broker fees entirely, saving you one month\'s rent at signing.',
    faqs: [
      { q: 'Does Los Angeles have rent control?', a: 'Yes. The LA Rent Stabilization Ordinance (RSO) covers most buildings with 2+ units built before October 1, 1978. Annual rent increases are limited to a percentage set by the city each year (typically 3–8%).' },
      { q: 'What is the average rent in Los Angeles?', a: 'LA rents vary widely by neighborhood. Citywide, expect $1,800–$2,500/month for a 1-bedroom. Westside neighborhoods (Santa Monica, Venice, Beverly Hills) average $2,500–$4,000+. The Valley and East LA offer more affordable options at $1,500–$2,200.' },
      { q: 'What is the best neighborhood to rent in Los Angeles?', a: 'It depends on your priorities. Silver Lake and Los Feliz are great for arts and walkability. Sherman Oaks and Studio City offer family-friendly suburbia with good schools. Venice and Santa Monica appeal to beach lovers. Downtown LA suits professionals who want transit and nightlife.' },
    ],
    nearbySearches: [
      { label: 'Beverly Hills rentals', slug: 'beverly-hills' },
      { label: 'West Hollywood rentals', slug: 'west-hollywood' },
      { label: 'Venice rentals', slug: 'venice' },
    ],
  },
};

export function getCityContent(slug: string): CityContent | null {
  return CITY_CONTENT[slug] ?? null;
}
