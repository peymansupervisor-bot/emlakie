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
    headline: 'Houses & Apartments for Rent in Bakersfield, CA',
    intro:
      'Bakersfield is the ninth-largest city in California and one of the most affordable places to rent in the entire state. Located at the southern end of the San Joaquin Valley in Kern County, Bakersfield offers houses, apartments, and condos for rent at prices 50–60% lower than Los Angeles or the Bay Area. Whether you\'re looking for a 3-bedroom house in Northwest Bakersfield for your family, a studio near California State University Bakersfield (CSUB), or a home close to the area\'s agriculture and oil employers, EMLAKIE connects you directly with Bakersfield landlords — no broker fees, no middlemen.',
    highlights: [
      { icon: '💰', label: 'Affordability', detail: 'Houses for rent in Bakersfield average $1,400–$2,000/month for a 3-bedroom — some of the lowest prices of any major California city.' },
      { icon: '🏠', label: 'Space', detail: 'Unlike coastal California, Bakersfield rentals typically include a yard, garage, and multiple bedrooms at prices renters on the coast can only dream of.' },
      { icon: '🛣️', label: 'Commute to LA', detail: 'Bakersfield is roughly 110 miles north of Los Angeles via I-5 or SR-99 — under 2 hours on a clear day. Amtrak San Joaquins also runs daily.' },
      { icon: '🎓', label: 'Universities', detail: 'Home to California State University Bakersfield (CSUB) and Bakersfield College — strong demand for student and faculty rentals near campus.' },
      { icon: '🌡️', label: 'Climate', detail: 'Hot summers (regularly over 100°F) with mild winters. Always confirm air conditioning is included before signing a lease.' },
    ],
    neighborhoods: ['Northwest Bakersfield', 'Southwest Bakersfield', 'Stockdale', 'Rosedale', 'Downtown Bakersfield', 'Oleander', 'East Bakersfield', 'Oildale'],
    rentTips:
      'Northwest and Southwest Bakersfield are the most desirable areas for families, with newer construction, good schools, and suburban amenities. Stockdale and Rosedale are upscale with larger homes. Downtown is up-and-coming with restaurants and nightlife. East Bakersfield and Oildale offer the most affordable rents. Air conditioning is non-negotiable — confirm it\'s included. Landlords in Bakersfield mostly list direct, so you won\'t pay a broker fee on EMLAKIE.',
    faqs: [
      { q: 'How much does it cost to rent a house in Bakersfield, CA?', a: 'Houses for rent in Bakersfield typically cost $1,400–$2,000/month for a 3-bedroom. Smaller 2-bedroom houses range from $1,100–$1,600/month. Prices vary by neighborhood — Northwest and Southwest Bakersfield command a premium, while East Bakersfield and Oildale are more affordable.' },
      { q: 'What is the average rent in Bakersfield, CA?', a: 'The average rent in Bakersfield is approximately $1,200–$1,500/month for a 1-bedroom apartment and $1,500–$2,200/month for a 3-bedroom house. This makes Bakersfield one of the most affordable rental markets in California.' },
      { q: 'Are there homes for rent in Bakersfield without broker fees?', a: 'Yes. All listings on EMLAKIE are posted directly by Bakersfield landlords — there are no broker fees or agent commissions. You contact the property owner directly and apply online at no cost.' },
      { q: 'Is Bakersfield a good place to rent a home?', a: 'Yes — especially for renters who want space and affordability. You get significantly more square footage per dollar than anywhere on the California coast, with a stable local economy anchored by agriculture, oil, healthcare, and logistics. Northwest and Southwest Bakersfield offer excellent schools and family-friendly neighborhoods.' },
      { q: 'Does Bakersfield have rent control?', a: 'No. Bakersfield does not have a local rent stabilization ordinance. California\'s statewide AB 1482 applies to qualifying buildings over 15 years old, capping annual increases at 5% + local CPI. Always ask your landlord whether your unit is covered.' },
      { q: 'What neighborhoods in Bakersfield have the most homes for rent?', a: 'Northwest Bakersfield and Southwest Bakersfield have the highest concentration of rental listings — mostly single-family homes and newer apartment complexes. Stockdale is popular for upscale homes. East Bakersfield and Oildale offer the most budget-friendly options.' },
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

  'new-york': {
    headline: 'Renting in New York City, NY',
    intro:
      'New York City is the most populous city in the United States and the most competitive rental market in the country. With five boroughs spanning Manhattan, Brooklyn, Queens, the Bronx, and Staten Island, NYC offers an extraordinary range of rental options — from pre-war walk-ups in Harlem to glass high-rises in Long Island City. Broker fees, rent stabilization, and a September 1st lease cycle make NYC renting unlike any other market.',
    highlights: [
      { icon: '🚇', label: 'Transit', detail: 'The NYC subway runs 24/7, 365 days a year across 472 stations — the most extensive transit system in North America.' },
      { icon: '🏙️', label: 'Density', detail: 'With 8.3 million residents, NYC offers unmatched access to jobs, culture, restaurants, and entertainment within walking or subway distance.' },
      { icon: '🛡️', label: 'Rent Stabilization', detail: 'Over one million NYC apartments are rent-stabilized, limiting annual rent increases. Always ask if a unit is stabilized before signing.' },
      { icon: '⚖️', label: 'Tenant Rights', detail: 'NYC has some of the strongest tenant protection laws in the country, including just cause eviction requirements and strict security deposit rules.' },
      { icon: '🌍', label: 'Diversity', detail: 'NYC is home to people from over 200 countries. Neighborhoods like Jackson Heights, Flushing, and Flatbush offer rich cultural experiences unique in the world.' },
    ],
    neighborhoods: ['Williamsburg', 'Astoria', 'Harlem', 'Crown Heights', 'Bushwick', 'Long Island City', 'Jackson Heights', 'Inwood', 'Bed-Stuy', 'Sunset Park'],
    rentTips:
      'Under NYC\'s FARE Act, landlords must now pay broker fees — not tenants. Ask about rent stabilization status before signing; stabilized units offer significant long-term savings. Many landlords require annual income of 40–45× the monthly rent. If you fall short, a guarantor service like Insurent can step in. Always tour in person — photos can be deceptive in NYC.',
    faqs: [
      { q: 'Do I have to pay a broker fee in NYC?', a: 'No. Under the FARE Act, which took effect in 2024, landlords who use brokers must pay the broker fee themselves. Tenants are not required to pay broker fees when renting in New York City.' },
      { q: 'What is rent stabilization in NYC?', a: 'Rent-stabilized apartments have legally limited annual rent increases set by the NYC Rent Guidelines Board. Tenants in stabilized units also have the right to renew their lease and strong eviction protections. Over 1 million NYC apartments are stabilized.' },
      { q: 'When is the best time to find a rental in NYC?', a: 'The NYC rental market peaks in summer (May–August) when apartments are most abundant but competition is highest. Winter (November–February) offers less selection but more negotiating power. The September 1st lease cycle dominates many neighborhoods.' },
    ],
    nearbySearches: [
      { label: 'Brooklyn rentals', slug: 'brooklyn' },
      { label: 'Jersey City rentals', slug: 'jersey-city' },
      { label: 'Hoboken rentals', slug: 'hoboken' },
    ],
  },

  'chicago': {
    headline: 'Renting in Chicago, IL',
    intro:
      'Chicago is the third-largest city in the United States and arguably the best value among major American cities. World-class architecture, 26 miles of lakefront parks, legendary food and music scenes, and an excellent rapid transit network — all at rents 40–50% lower than comparable neighborhoods in New York or Los Angeles. Chicago\'s rental market spans everything from coach houses in Lincoln Park to loft conversions in the West Loop.',
    highlights: [
      { icon: '🚇', label: 'Transit', detail: 'The CTA "L" train serves all major neighborhoods with seven rail lines. 24-hour bus service fills gaps. Monthly passes run about $105.' },
      { icon: '🏖️', label: 'Lakefront', detail: '26 miles of public lakefront parks, beaches, and bike paths are free and accessible from every neighborhood via transit.' },
      { icon: '🍕', label: 'Food', detail: 'A world-class dining city with deep-dish pizza, Chicago-style hot dogs, a James Beard Award-winning restaurant scene, and legendary neighborhood diners.' },
      { icon: '💰', label: 'Value', detail: 'Chicago offers more space per dollar than any comparable major US city — a 2BR that costs $5,000/mo in NYC rents for $2,000–$2,800 here.' },
      { icon: '🏛️', label: 'Architecture', detail: 'The birthplace of the skyscraper and home to architectural masterpieces from Louis Sullivan, Frank Lloyd Wright, and Mies van der Rohe.' },
    ],
    neighborhoods: ['Lincoln Park', 'Wicker Park', 'Logan Square', 'Pilsen', 'Andersonville', 'Hyde Park', 'River North', 'Bucktown', 'Ukranian Village', 'Bronzeville'],
    rentTips:
      'Chicago leases typically run October–October or May–May — time your search accordingly. Heat is often included in rent for older buildings (radiator heat), which is a meaningful savings given brutal winters. Ask whether parking is available; street parking is free in residential neighborhoods. The city\'s Residential Landlord and Tenant Ordinance (RLTO) requires security deposits to be held in interest-bearing accounts.',
    faqs: [
      { q: 'Does Chicago have rent control?', a: 'No. Illinois state law preempts local rent control ordinances, so Chicago cannot enact rent stabilization. However, Chicago\'s RLTO provides strong tenant protections including security deposit rules and habitability standards.' },
      { q: 'What is the average rent in Chicago?', a: 'Chicago rents average $1,400–$2,200/month for a 1-bedroom depending on neighborhood. Lincoln Park, Wicker Park, and Lakeview command premiums; Logan Square, Pilsen, and Hyde Park offer better value.' },
      { q: 'Which Chicago neighborhoods have the best transit access?', a: 'Neighborhoods along the L train lines offer the best transit. The Blue Line (Logan Square, Wicker Park), Red Line (Lincoln Park, Lakeview), and Brown Line (Ravenswood, Lincoln Square) are especially convenient for downtown commuters.' },
    ],
    nearbySearches: [
      { label: 'Evanston rentals', slug: 'evanston' },
      { label: 'Oak Park rentals', slug: 'oak-park' },
      { label: 'Naperville rentals', slug: 'naperville' },
    ],
  },

  'houston': {
    headline: 'Renting in Houston, TX',
    intro:
      'Houston is the fourth-largest city in the United States and consistently one of the most affordable major rental markets in the country. With no zoning laws, no state income tax, and a diverse economy anchored by energy, healthcare, aerospace, and a rapidly growing tech sector, Houston attracts renters who want big-city opportunity at a fraction of coastal prices. The city\'s sheer size — over 670 square miles — means neighborhoods vary dramatically in character and price.',
    highlights: [
      { icon: '💰', label: 'Affordability', detail: 'Houston rents are among the lowest of any large US city. A 2-bedroom that costs $4,000+ in LA or NYC typically runs $1,500–$2,300 in Houston.' },
      { icon: '🛢️', label: 'Economy', detail: 'The energy capital of the world hosts 26 Fortune 500 headquarters. Healthcare (Texas Medical Center — the world\'s largest), aerospace (NASA JSC), and tech are also major employers.' },
      { icon: '🌍', label: 'Diversity', detail: 'Houston is the most ethnically and linguistically diverse major city in the US. Over 145 languages are spoken here.' },
      { icon: '🍽️', label: 'Food Scene', detail: 'James Beard Award-winning restaurants, Vietnamese food halls in Bellaire, Mexican taquerias on the East End, and some of the best BBQ in Texas.' },
      { icon: '🏥', label: 'Healthcare', detail: 'The Texas Medical Center campus is the largest medical complex in the world, employing over 106,000 people and housing 60 institutions.' },
    ],
    neighborhoods: ['Montrose', 'The Heights', 'Midtown', 'Museum District', 'EaDo', 'Rice Military', 'Spring Branch', 'Bellaire', 'Sugar Land', 'Pearland'],
    rentTips:
      'Houston has no zoning code, which means industrial and residential uses can sit side by side. Walk or drive the neighborhood before committing. Flooding is a genuine risk — ask specifically whether the property flooded during Harvey (2017) or Imelda (2019). A car is non-negotiable in most of Houston; factor car costs into your housing budget. Most Houston landlords require income of 3× monthly rent.',
    faqs: [
      { q: 'Does Houston have rent control?', a: 'No. Texas state law prohibits local rent control ordinances. Landlords can raise rents freely at lease renewal. Read your lease carefully and understand the notice period required for rent increases.' },
      { q: 'Is flooding a concern in Houston?', a: 'Yes. Houston\'s flat topography and clay-heavy soil make flooding a recurring issue. Check FEMA flood maps for any property you\'re considering, ask about past flooding, and strongly consider renters insurance with flood coverage.' },
      { q: 'What is the best neighborhood to rent in Houston?', a: 'Montrose and The Heights are the most walkable and character-rich. Midtown offers the best nightlife. Museum District is great for professionals. Rice Military and EaDo are popular with young renters. Sugar Land and Pearland offer suburban family living at lower prices.' },
    ],
    nearbySearches: [
      { label: 'Sugar Land rentals', slug: 'sugar-land' },
      { label: 'The Woodlands rentals', slug: 'the-woodlands' },
      { label: 'Pearland rentals', slug: 'pearland' },
    ],
  },

  'phoenix': {
    headline: 'Renting in Phoenix, AZ',
    intro:
      'Phoenix is the fifth-largest city in the United States and one of the fastest-growing metros in the country. After a dramatic rent spike in 2021–2022, a wave of new apartment supply has brought Phoenix back to being one of the most renter-friendly markets in the Sun Belt. With 300+ days of sunshine, a booming tech and semiconductor industry, and no state income tax on the horizon, Phoenix continues to attract remote workers, retirees, and families seeking space and affordability.',
    highlights: [
      { icon: '☀️', label: 'Weather', detail: 'Phoenix averages 299 sunny days per year. Mild winters make outdoor living year-round a reality — hiking, cycling, and golf just steps from most neighborhoods.' },
      { icon: '💰', label: 'Value', detail: 'After the 2022–2024 apartment construction surge, Phoenix rents have softened significantly. Vacancy rates above 10% give renters real negotiating power in 2026.' },
      { icon: '🏗️', label: 'Growth', detail: 'Major semiconductor and tech investments (TSMC, Intel, Amazon) are creating tens of thousands of well-paying jobs in the metro.' },
      { icon: '🚇', label: 'Light Rail', detail: 'The Valley Metro Rail system connects downtown Phoenix, Tempe, Mesa, and Scottsdale. Extensions are ongoing, making transit increasingly viable.' },
      { icon: '🏔️', label: 'Outdoors', detail: 'South Mountain, Camelback, and Piestewa Peak offer world-class hiking minutes from central Phoenix. Sedona and Flagstaff are 2 hours away.' },
    ],
    neighborhoods: ['Arcadia', 'Biltmore', 'Downtown Phoenix', 'Tempe', 'Scottsdale', 'Chandler', 'Gilbert', 'Glendale', 'Peoria', 'Queen Creek'],
    rentTips:
      'Phoenix is currently a renter\'s market — don\'t be afraid to negotiate. New apartment complexes are offering 1–2 months free rent as concessions. Summer energy bills can add $150–$300/month to your budget; ask about average utility costs before signing. A car is essential — Phoenix is one of the most car-dependent cities in the US. Light rail is useful near ASU and downtown but limited elsewhere.',
    faqs: [
      { q: 'Does Phoenix have rent control?', a: 'No. Arizona state law prohibits local rent control ordinances. However, the current market conditions strongly favor renters — high vacancy rates mean you have real negotiating leverage.' },
      { q: 'How hot does it get in Phoenix?', a: 'Phoenix summers are extreme. Temperatures regularly exceed 110°F in July. Air conditioning is not optional — it\'s essential. Budget $150–$300/month for electricity during summer months. The upside: winters are spectacularly mild with temperatures in the 65–75°F range.' },
      { q: 'Is Phoenix a good place to rent in 2026?', a: 'Yes — it\'s one of the best renter\'s markets in the country right now. High apartment supply, falling vacancy rates, and widespread concessions (free months, waived fees) make Phoenix an excellent time to rent, especially compared to coastal cities.' },
    ],
    nearbySearches: [
      { label: 'Scottsdale rentals', slug: 'scottsdale' },
      { label: 'Tempe rentals', slug: 'tempe' },
      { label: 'Chandler rentals', slug: 'chandler' },
    ],
  },

  'san-antonio': {
    headline: 'Renting in San Antonio, TX',
    intro:
      'San Antonio is the second-largest city in Texas and one of the most affordable major rental markets in the country. Home to the historic River Walk, the Alamo, and a booming military and bioscience economy, San Antonio offers a warm climate, rich culture, and significantly lower costs of living than Austin or Dallas. The city\'s large military population (five bases including Lackland AFB and Fort Sam Houston) creates a stable, year-round rental demand.',
    highlights: [
      { icon: '🌊', label: 'River Walk', detail: 'The iconic San Antonio River Walk winds through downtown — a pedestrian-friendly promenade lined with restaurants, bars, hotels, and cultural venues.' },
      { icon: '💰', label: 'Affordability', detail: 'San Antonio rents are among the lowest of any major Texas city — typically 20–30% below Austin and 15% below Dallas for comparable units.' },
      { icon: '🎖️', label: 'Military', detail: 'Five military installations employ over 80,000 active-duty personnel and dependents, creating steady housing demand and landlord-friendly lease terms.' },
      { icon: '🎭', label: 'Culture', detail: 'Deep Mexican-American heritage, mariachi festivals, Fiesta San Antonio, and the Pearl District\'s food and arts scene make SA one of the most culturally vibrant cities in Texas.' },
      { icon: '🌡️', label: 'Climate', detail: 'San Antonio enjoys mild winters and hot summers. Spring and fall are spectacular. Air conditioning is essential May through September.' },
    ],
    neighborhoods: ['King William District', 'Alamo Heights', 'Stone Oak', 'The Pearl', 'Monte Vista', 'South Town', 'Medical Center', 'Leon Valley', 'Converse', 'Helotes'],
    rentTips:
      'San Antonio\'s rental market is less competitive than Austin or Dallas — you have more time to make decisions. The Stone Oak and North Central areas have newer construction and better schools. The King William and Southtown neighborhoods offer historic charm at higher prices. Always ask whether AC is central air or a window unit — window units struggle in San Antonio summers.',
    faqs: [
      { q: 'Is San Antonio cheaper than Austin?', a: 'Yes, significantly. San Antonio rents average 25–35% below Austin for comparable units. The two cities are 80 miles apart, and some remote workers split the difference by living in San Antonio and commuting to Austin as needed.' },
      { q: 'What is the average rent in San Antonio?', a: 'A 1-bedroom in San Antonio typically rents for $950–$1,400/month. A 3-bedroom house runs $1,400–$2,000/month — making it one of the most affordable major cities in Texas.' },
      { q: 'Does San Antonio have rent control?', a: 'No. Texas state law prohibits local rent control. However, the market is generally less aggressive than Austin or Dallas, and there is more negotiating room with landlords.' },
    ],
    nearbySearches: [
      { label: 'Austin rentals', slug: 'austin' },
      { label: 'New Braunfels rentals', slug: 'new-braunfels' },
      { label: 'Boerne rentals', slug: 'boerne' },
    ],
  },

  'san-diego': {
    headline: 'Renting in San Diego, CA',
    intro:
      'San Diego is consistently ranked one of the most desirable places to live in the United States — a combination of near-perfect weather, beaches, military bases, biotech and defense industries, and a laid-back lifestyle that\'s difficult to match. It\'s also one of the most expensive rental markets in California, with limited housing supply and strong demand from military families, university students, and tech workers. Whether you want surf access in Ocean Beach or a suburban feel in Chula Vista, San Diego offers a rental for every lifestyle.',
    highlights: [
      { icon: '🌊', label: 'Beaches', detail: 'San Diego has 70 miles of coastline including Pacific Beach, Mission Beach, Ocean Beach, La Jolla, and Coronado Island.' },
      { icon: '☀️', label: 'Weather', detail: 'San Diego averages 266 sunny days per year with mild temperatures year-round — rarely above 85°F or below 45°F in most neighborhoods.' },
      { icon: '🔬', label: 'Biotech Hub', detail: 'Torrey Pines, Sorrento Valley, and Kearny Mesa host the highest concentration of biotech and pharmaceutical companies on the West Coast.' },
      { icon: '🎖️', label: 'Military', detail: 'San Diego hosts the largest naval complex in the world. Military families represent a significant portion of the rental market, especially in areas near bases.' },
      { icon: '🏫', label: 'Universities', detail: 'UC San Diego, San Diego State, and University of San Diego create strong rental demand in North Park, Mission Valley, and La Jolla.' },
    ],
    neighborhoods: ['North Park', 'South Park', 'Ocean Beach', 'Pacific Beach', 'Mission Hills', 'Hillcrest', 'La Jolla', 'Chula Vista', 'Clairemont', 'Normal Heights'],
    rentTips:
      'San Diego rentals move quickly — especially anything near the beach or in North Park. Hillcrest and North Park offer the best walkability and nightlife access. Ocean Beach and Pacific Beach are popular with younger renters but command a beach premium. Chula Vista and El Cajon offer significantly better value with freeway access. California AB 1482 caps annual rent increases on most units built before 2009.',
    faqs: [
      { q: 'Does San Diego have rent control?', a: 'San Diego does not have a local rent control ordinance. California\'s AB 1482 (statewide rent cap) applies to qualifying units built before 2009, limiting annual increases to 5% + CPI. Some cities within San Diego County (like National City) have their own ordinances.' },
      { q: 'What is the average rent in San Diego?', a: 'San Diego 1-bedroom apartments average $2,200–$3,200/month depending on neighborhood. Beach communities (La Jolla, Pacific Beach) are pricier; East County and South Bay neighborhoods like El Cajon and Chula Vista offer significantly better value.' },
      { q: 'Is San Diego or Los Angeles more expensive to rent?', a: 'They\'re comparable, with some neighborhoods in each city costing more. San Diego\'s central and beach neighborhoods are slightly more expensive on average than comparable LA non-westside areas, but both cities have wide ranges.' },
    ],
    nearbySearches: [
      { label: 'Chula Vista rentals', slug: 'chula-vista' },
      { label: 'El Cajon rentals', slug: 'el-cajon' },
      { label: 'Carlsbad rentals', slug: 'carlsbad' },
    ],
  },

  'dallas': {
    headline: 'Renting in Dallas, TX',
    intro:
      'Dallas is the anchor of the Dallas-Fort Worth metroplex — the fourth-largest metro in the United States. A world-class arts district, a booming corporate headquarters economy (AT&T, ExxonMobil, Toyota, Goldman Sachs have all relocated here), and Texas\'s favorable tax environment have made Dallas one of the fastest-growing rental markets in the country. The city offers everything from high-rise luxury apartments in Uptown to craftsman bungalows in Bishop Arts to spacious suburban homes in Plano.',
    highlights: [
      { icon: '🏙️', label: 'Corporate Hub', detail: 'Dallas hosts more Fortune 500 headquarters than any US city except New York — creating strong demand for executive and professional rentals.' },
      { icon: '🎨', label: 'Arts District', detail: 'The Dallas Arts District is the largest contiguous urban arts district in the US, featuring the AT&T Performing Arts Center and the Perot Museum.' },
      { icon: '🚇', label: 'DART', detail: 'The DART light rail system covers 93 miles across four lines. Living near a DART station dramatically reduces car dependence in this otherwise driving-centric city.' },
      { icon: '💰', label: 'Value', detail: 'No state income tax combined with rents well below comparable coastal cities makes Dallas a strong financial choice for relocating professionals.' },
      { icon: '🍽️', label: 'Food Scene', detail: 'Dallas has emerged as one of America\'s premier dining destinations, with award-winning chefs across Oak Cliff, East Dallas, and Uptown.' },
    ],
    neighborhoods: ['Uptown', 'Deep Ellum', 'Oak Lawn', 'Oak Cliff / Bishop Arts', 'Lower Greenville', 'Knox-Henderson', 'M-Streets', 'East Dallas', 'Lake Highlands', 'Lakewood'],
    rentTips:
      'Dallas is building apartments at a record pace — use this leverage to negotiate free months or waived fees. DART access should be a major factor in your neighborhood choice; Dallas traffic is severe. Uptown has the best walkability but the highest rents. Oak Cliff and East Dallas offer character and value. Summers are brutal (100°F+); energy-efficient HVAC is worth asking about.',
    faqs: [
      { q: 'Does Dallas have rent control?', a: 'No. Texas state law prohibits local rent control. However, the current high apartment supply means landlords are competing for tenants — you have more negotiating power in 2026 than in recent years.' },
      { q: 'What is the most walkable neighborhood in Dallas?', a: 'Uptown Dallas is the most walkable neighborhood with a Walk Score above 90. The area around McKinney Avenue and the Trolley is the closest thing to a true urban neighborhood in the city.' },
      { q: 'Is Fort Worth significantly cheaper than Dallas?', a: 'Yes — Fort Worth rents average 15–20% below Dallas for comparable units. The Trinity Railway Express connects the two cities, making Fort Worth a viable option for Dallas workers willing to commute.' },
    ],
    nearbySearches: [
      { label: 'Fort Worth rentals', slug: 'fort-worth' },
      { label: 'Plano rentals', slug: 'plano' },
      { label: 'Irving rentals', slug: 'irving' },
    ],
  },

  'austin': {
    headline: 'Renting in Austin, TX',
    intro:
      'Austin has transformed over the past decade from a quirky college town into a major tech hub and one of the most in-demand cities in the country. Home to the University of Texas, South by Southwest, and a growing roster of tech giants including Apple, Tesla, and Dell, Austin attracts a steady stream of young professionals and remote workers. After an explosive rent spike in 2020–2022, a massive supply of new apartments has brought the market back to earth — making 2026 one of the best years to rent in Austin in recent memory.',
    highlights: [
      { icon: '🎸', label: 'Music', detail: 'The "Live Music Capital of the World" hosts more live music venues per capita than any US city. SXSW, Austin City Limits, and countless local venues make music part of daily life.' },
      { icon: '💻', label: 'Tech Hub', detail: 'Apple, Tesla, Google, Amazon, Oracle, and hundreds of startups have major Austin presences, making it one of the fastest-growing tech job markets in the US.' },
      { icon: '🌞', label: 'Outdoors', detail: 'Barton Springs Pool, Lady Bird Lake kayaking, hiking on the Greenbelt, and a year-round outdoor lifestyle distinguish Austin from most major US cities.' },
      { icon: '🎓', label: 'University', detail: 'The University of Texas at Austin (50,000+ students) creates enormous rental demand near campus and shapes the culture of the city.' },
      { icon: '💰', label: 'Tax Savings', detail: 'Texas has no state income tax, which effectively increases take-home pay for anyone relocating from California, New York, or other high-tax states.' },
    ],
    neighborhoods: ['East Austin', 'South Congress (SoCo)', 'Hyde Park', 'Mueller', 'Rainey Street', 'North Loop', 'Bouldin Creek', 'Clarksville', 'Round Rock', 'Cedar Park'],
    rentTips:
      'Austin is currently a buyer\'s market — new apartment supply has created real negotiating leverage. Ask about move-in specials; many landlords are offering one to two months free rent. East Austin has the best food and bar scene but can be competitive. South Congress and Bouldin Creek offer a classic Austin feel. Round Rock and Cedar Park provide suburban value with strong school districts.',
    faqs: [
      { q: 'Has Austin rent gone down?', a: 'Yes, significantly from the 2022 peak. A wave of new apartment construction — Austin permitted more units per capita than almost any other US city — has brought rents down 10–20% from their highs. It\'s currently one of the best times to rent in Austin in recent years.' },
      { q: 'What is the average rent in Austin?', a: 'Austin 1-bedroom apartments average $1,500–$2,200/month in 2026, depending on neighborhood. East Austin and Downtown are pricier; Round Rock, Cedar Park, and Pflugerville offer significant savings.' },
      { q: 'Is Austin walkable?', a: 'Austin\'s walkability varies dramatically by neighborhood. East Austin, South Congress, and Downtown are relatively walkable. Most of the city is car-dependent. The CapMetro rail and bus system is improving but a car is recommended for most residents.' },
    ],
    nearbySearches: [
      { label: 'Round Rock rentals', slug: 'round-rock' },
      { label: 'Cedar Park rentals', slug: 'cedar-park' },
      { label: 'San Antonio rentals', slug: 'san-antonio' },
    ],
  },

  'san-francisco': {
    headline: 'Renting in San Francisco, CA',
    intro:
      'San Francisco is one of the most expensive rental markets in the world and one of the most renter-protected cities in the United States. The 7×7-mile peninsula is home to the global tech industry, world-class dining, Victorian architecture, and some of the strongest tenant protections in the country. Rents famously collapsed during the pandemic and have since partially recovered — but the window to find relative value in SF is still open in 2026, especially compared to the 2018–2019 peak.',
    highlights: [
      { icon: '🏛️', label: 'Rent Control', detail: 'Buildings built before June 1979 are subject to SF\'s Rent Ordinance, which caps annual increases and requires just cause for eviction. Over 170,000 units are covered.' },
      { icon: '🚇', label: 'Transit', detail: 'Muni, BART, Caltrain, and the new SFMTA systems make SF genuinely car-optional for most residents. A car-free lifestyle is common and practical.' },
      { icon: '💼', label: 'Tech Economy', detail: 'Salesforce, Twitter, Airbnb, Lyft, Stripe, and hundreds of startups are based in SF. The city generates some of the highest average salaries in the world.' },
      { icon: '🌁', label: 'Character', detail: 'Victorian Painted Ladies, Golden Gate Park, the Castro, Chinatown, the Mission\'s murals — SF has more distinct character per square mile than any city in the US.' },
      { icon: '🌊', label: 'Natural Beauty', detail: 'Ocean Beach, Marin Headlands, Angel Island, and the Bay itself make SF one of the most scenically dramatic cities in the world.' },
    ],
    neighborhoods: ['Mission District', 'Castro', 'Noe Valley', 'Richmond', 'Sunset', 'Hayes Valley', 'Haight-Ashbury', 'Bernal Heights', 'Dogpatch', 'Portola'],
    rentTips:
      'Seek out pre-1979 buildings explicitly — rent-controlled units offer dramatic long-term savings and eviction protection. The Richmond and Sunset districts offer the best value in SF proper. East Bay cities (Oakland, Berkeley, Emeryville) offer 30–40% savings with 15–25 minute BART commutes. Always see units in person; SF listings move within 24–48 hours. Roommate living is extremely common as a cost management strategy.',
    faqs: [
      { q: 'Does San Francisco have rent control?', a: 'Yes. SF\'s Rent Ordinance covers most buildings built before June 13, 1979. Covered tenants have annual rent increase limits and strong just cause eviction protections. Always ask if a unit is rent-controlled before signing.' },
      { q: 'What is the average rent in San Francisco?', a: 'SF 1-bedroom apartments average $2,800–$3,800/month in 2026. Studios run $2,000–$2,800. The Richmond and Sunset offer slightly lower rents. Luxury buildings in SoMa and Pacific Heights command $4,000–$5,500+.' },
      { q: 'Is Oakland a good alternative to San Francisco?', a: 'Absolutely. Oakland rents are typically 30–40% lower than SF, and BART connects the two cities in 15–20 minutes. Oakland has its own thriving food scene, arts community, and neighborhoods with strong character. Many SF workers live in Oakland, Berkeley, or Emeryville.' },
    ],
    nearbySearches: [
      { label: 'Oakland rentals', slug: 'oakland' },
      { label: 'Berkeley rentals', slug: 'berkeley' },
      { label: 'San Jose rentals', slug: 'san-jose' },
    ],
  },

  'seattle': {
    headline: 'Renting in Seattle, WA',
    intro:
      'Seattle is the cultural and economic capital of the Pacific Northwest, home to Amazon, Microsoft, Boeing, Starbucks, and a thriving startup ecosystem. Surrounded by mountains, water, and old-growth forest, Seattle offers natural beauty that few cities can match. Rents have softened from their pandemic-era peaks as new apartment supply hits the market — and Washington\'s lack of a state income tax continues to make it financially attractive for high earners relocating from California or the Northeast.',
    highlights: [
      { icon: '⛰️', label: 'Natural Beauty', detail: 'Mount Rainier, the Olympics, the Cascades, Puget Sound, and Lake Washington surround the city. Skiing, hiking, kayaking, and camping are accessible within an hour.' },
      { icon: '💼', label: 'Tech Economy', detail: 'Amazon\'s global HQ, Microsoft\'s campus in Redmond, Boeing\'s facilities, and hundreds of tech startups create some of the highest average salaries in the US.' },
      { icon: '🚇', label: 'Light Rail', detail: 'Sound Transit\'s Link light rail is rapidly expanding, connecting the airport to downtown and beyond. By 2026, the system reaches from Everett to Tacoma.' },
      { icon: '💰', label: 'No Income Tax', detail: 'Washington has no state income tax, which effectively increases take-home pay compared to California or New York — partially offsetting Seattle\'s above-average rents.' },
      { icon: '☕', label: 'Culture', detail: 'Birthplace of Starbucks, grunge music, and Amazon. Seattle\'s coffee culture, music scene, Pike Place Market, and tech culture create a uniquely Pacific Northwest identity.' },
    ],
    neighborhoods: ['Capitol Hill', 'Ballard', 'Fremont', 'South Lake Union', 'Beacon Hill', 'Columbia City', 'Queen Anne', 'Rainier Valley', 'West Seattle', 'Magnolia'],
    rentTips:
      'Units near Link light rail stations command premiums but can make car-free living viable. Capitol Hill is the most walkable and lively neighborhood. Ballard and Fremont have great character at slightly lower prices. South Lake Union is convenient to Amazon but feels corporate. West Seattle offers value and a neighborhood feel with a ferry commute to downtown. Always ask what utilities are included — some older buildings bundle heat and water.',
    faqs: [
      { q: 'Does Seattle have rent control?', a: 'No. Washington state law prohibits local rent control ordinances. However, Seattle has strong tenant protections including required notice periods for rent increases above 10% (20 days) and just cause eviction requirements.' },
      { q: 'What is the average rent in Seattle?', a: 'Seattle 1-bedroom apartments average $1,900–$2,500/month in 2026. South Lake Union and newer construction are priciest. Capitol Hill, Ballard, and Beacon Hill offer better value. Bellevue and Redmond on the Eastside average $2,200–$3,100.' },
      { q: 'Is parking expensive in Seattle?', a: 'Yes. In Capitol Hill, First Hill, and downtown, street parking is paid or permit-only. Building parking typically adds $150–$250/month. Many Seattle renters choose to live car-free, especially with the expanding light rail network.' },
    ],
    nearbySearches: [
      { label: 'Bellevue rentals', slug: 'bellevue' },
      { label: 'Tacoma rentals', slug: 'tacoma' },
      { label: 'Redmond rentals', slug: 'redmond' },
    ],
  },

  'denver': {
    headline: 'Renting in Denver, CO',
    intro:
      'Denver is the outdoor recreation capital of the United States — a mile above sea level with easy access to world-class skiing, hiking, cycling, and camping in the Rocky Mountains. Over the past decade, the city has grown dramatically, driven by the cannabis industry, a booming tech scene, and an influx of residents from coastal cities seeking lower costs and outdoor lifestyles. Rents have risen significantly but remain well below comparable neighborhoods in LA, Seattle, or San Francisco.',
    highlights: [
      { icon: '⛷️', label: 'Mountains', detail: 'World-class ski resorts — Vail, Breckenridge, Keystone, Arapahoe Basin — are 1–2 hours from downtown. Hiking, climbing, and camping are accessible year-round.' },
      { icon: '☀️', label: 'Sunshine', detail: 'Denver averages 300 sunny days per year — more than Miami or San Diego. Low humidity makes even warm days comfortable.' },
      { icon: '🍺', label: 'Craft Beer', detail: 'Colorado has the highest density of craft breweries of any state. Denver\'s RiNo and South Broadway neighborhoods are epicenters of the craft beer scene.' },
      { icon: '🚇', label: 'RTD Light Rail', detail: 'RTD\'s light rail and bus rapid transit network covers the metro area. The W Line reaches Lakewood; the A Line connects downtown to DIA in 37 minutes.' },
      { icon: '💊', label: 'Cannabis', detail: 'Colorado\'s cannabis legalization has created a unique industry and cultural scene. Denver has more licensed dispensaries than Starbucks locations.' },
    ],
    neighborhoods: ['LoDo', 'RiNo', 'Capitol Hill', 'Washington Park', 'Highland', 'City Park West', 'Sloan\'s Lake', 'Baker', 'Congress Park', 'Stapleton/Central Park'],
    rentTips:
      'Denver\'s rental market has seen increased supply — shop around and ask for concessions. RiNo and LoDo are the trendiest but priciest neighborhoods. Capitol Hill offers the most character at lower prices. Washington Park is ideal for active renters and families. Consider altitude: some people need a few weeks to adjust if moving from sea level. A car is useful even with the RTD system, especially for mountain access.',
    faqs: [
      { q: 'Does Denver have rent control?', a: 'No. Colorado state law prohibits local rent control ordinances. However, Denver has some tenant protections including a 21-day cure period before eviction proceedings begin.' },
      { q: 'What is the average rent in Denver?', a: 'Denver 1-bedroom apartments average $1,600–$2,300/month in 2026. LoDo, Union Station, and RiNo are priciest. Capitol Hill, Baker, and Aurora offer better value. Lakewood and Englewood provide suburban alternatives via light rail.' },
      { q: 'Is Denver a good city for outdoor enthusiasts?', a: 'Exceptionally so. You can ski, hike, mountain bike, kayak, and climb without leaving the metro area. The Rocky Mountains are literally visible from downtown. Winter Park and Keystone ski resorts have direct shuttle service from the city.' },
    ],
    nearbySearches: [
      { label: 'Aurora rentals', slug: 'aurora' },
      { label: 'Boulder rentals', slug: 'boulder' },
      { label: 'Lakewood rentals', slug: 'lakewood' },
    ],
  },

  'nashville': {
    headline: 'Renting in Nashville, TN',
    intro:
      'Nashville has transformed from a regional country music hub into one of America\'s most dynamic cities. Corporate relocations (Amazon, Oracle, AllianceBernstein), a booming healthcare industry (HCA, Vanderbilt Medical), and a relentless stream of transplants from higher-cost cities have made Nashville\'s rental market one of the most competitive in the Southeast. From converted lofts in The Gulch to bungalows in East Nashville to suburban family homes in Brentwood, Nashville offers something for every renter — at prices still well below coastal equivalents.',
    highlights: [
      { icon: '🎸', label: 'Music', detail: 'The Grand Ole Opry, Broadway honky-tonks, the Ryman Auditorium, and the Nashville Symphony make music the city\'s lifeblood.' },
      { icon: '🏥', label: 'Healthcare', detail: 'Nashville is the US healthcare industry capital — HCA, Community Health Systems, and Vanderbilt Medical Center collectively employ over 200,000 people.' },
      { icon: '💰', label: 'No Income Tax', detail: 'Tennessee has no state income tax on wages, which meaningfully increases take-home pay compared to states like California or New York.' },
      { icon: '🌱', label: 'Growth', detail: 'Nashville adds roughly 100 people per day. It\'s one of the fastest-growing major metros in the US, creating a vibrant, young energy across the city.' },
      { icon: '🍽️', label: 'Food Scene', detail: 'Hot chicken, meat-and-three restaurants, and a James Beard Award-winning restaurant scene sit alongside chef-driven concepts in the Gulch and East Nashville.' },
    ],
    neighborhoods: ['East Nashville', 'The Gulch', '12South', 'Germantown', 'Sylvan Park', 'Green Hills', 'Hillsboro Village', 'Wedgewood-Houston (WeHo)', 'Antioch', 'Brentwood'],
    rentTips:
      'East Nashville\'s bungalows and cottages move fast — apply quickly when you find one you like. The Gulch and Midtown offer walkability at a premium price. Look at Murfreesboro (35 miles SE) or Hendersonville (25 miles NE) for significant savings with reasonable commutes. Nashville traffic is severe; proximity to work matters. Most landlords require 3× monthly income in rent.',
    faqs: [
      { q: 'Does Nashville have rent control?', a: 'No. Tennessee has no rent control and is generally a landlord-friendly state. Rents have risen sharply over the past five years. However, new apartment supply is increasing, and some landlords are offering concessions in 2026.' },
      { q: 'What is the average rent in Nashville?', a: 'Nashville 1-bedroom apartments average $1,600–$2,300/month in 2026. The Gulch and Midtown are priciest. East Nashville and 12South command mid-range premiums. Antioch and Madison offer the most affordable options close to the city.' },
      { q: 'Is Nashville good for young professionals?', a: 'Very much so. Nashville\'s young professional scene is one of the most vibrant in the South — strong job market, no state income tax, a lively food and bar scene, and lower costs than comparable East or West Coast cities make it an excellent choice for career-starters and remote workers.' },
    ],
    nearbySearches: [
      { label: 'Murfreesboro rentals', slug: 'murfreesboro' },
      { label: 'Franklin rentals', slug: 'franklin' },
      { label: 'Brentwood rentals', slug: 'brentwood' },
    ],
  },

  'miami': {
    headline: 'Renting in Miami, FL',
    intro:
      'Miami has undergone a remarkable transformation over the past decade — from a regional tourist and retirement destination into a global financial center and tech hub. An influx of hedge funds, crypto companies, and startups fleeing New York and California has brought a new wave of high-income renters, pushing prices to record levels. Despite the costs, Miami offers a lifestyle combination — year-round warm weather, beach access, Latin culture, international cuisine, and vibrant nightlife — that is genuinely unmatched among US cities.',
    highlights: [
      { icon: '🏖️', label: 'Beaches', detail: 'South Beach, Coconut Grove, and Key Biscayne are minutes away. 12 months of beach weather is a reality that residents never take for granted.' },
      { icon: '🌍', label: 'International', detail: 'Miami is the most international city in the US — more than 70% of residents speak a language other than English at home. Latin American culture, food, and business are deeply woven into daily life.' },
      { icon: '💼', label: 'Finance & Tech', detail: 'Citadel, Blackstone, and dozens of hedge funds and private equity firms have relocated HQs to Miami. A booming tech scene in Wynwood and Brickell adds diversity to the economy.' },
      { icon: '🎨', label: 'Arts', detail: 'Art Basel Miami Beach, the Pérez Art Museum, Wynwood Walls, and a world-class gallery scene make Miami one of the premier art cities in the Western Hemisphere.' },
      { icon: '🌴', label: 'Climate', detail: 'Miami averages 248 sunny days per year. Winters are mild and dry; summers are hot and humid with afternoon thunderstorms. Hurricane season runs June–November.' },
    ],
    neighborhoods: ['Brickell', 'Wynwood', 'Little Havana', 'Edgewater', 'Coconut Grove', 'Coral Gables', 'Little Haiti', 'Miami Beach', 'Doral', 'Hialeah'],
    rentTips:
      'Florida has no state rent control following the 2023 preemption law. Rents can jump significantly at renewal — negotiate a longer lease (18–24 months) to lock in your rate. Flood zone and hurricane risk are real concerns; ask for FEMA flood maps and confirm whether your building has generator backup. Little Havana and Hialeah offer the best value close to downtown. A car is essential except in Brickell and parts of Miami Beach.',
    faqs: [
      { q: 'Does Miami have rent control?', a: 'No. Florida\'s 2023 law preempts all local rent control ordinances statewide. Miami-Dade had a rent control measure that was voided. There is currently no rent cap in Miami.' },
      { q: 'What is the average rent in Miami?', a: 'Miami 1-bedroom apartments average $2,200–$3,200/month in 2026. Brickell and Wynwood are priciest. Little Havana, Hialeah, and Doral offer meaningfully lower rents while remaining accessible to downtown.' },
      { q: 'Is Miami at risk of flooding?', a: 'Yes. Miami sits on porous limestone just a few feet above sea level. Sunny day flooding during high tides is increasingly common in low-lying areas like Miami Beach and Little Haiti. Check FEMA flood maps before renting and consider units above the first floor.' },
    ],
    nearbySearches: [
      { label: 'Fort Lauderdale rentals', slug: 'fort-lauderdale' },
      { label: 'Coral Gables rentals', slug: 'coral-gables' },
      { label: 'Doral rentals', slug: 'doral' },
    ],
  },

  'portland': {
    headline: 'Renting in Portland, OR',
    intro:
      'Portland is one of the most livable and culturally distinctive cities in the United States — a city of bridges, bikes, coffee, craft beer, bookstores, and some of the most passionate local food culture in the country. After years of rapid rent growth, Portland\'s market has softened considerably due to high apartment construction and population stabilization. For renters, 2026 represents a genuine opportunity to find value in a city that packs a lot of character into a compact, transit-connected footprint.',
    highlights: [
      { icon: '🚲', label: 'Bikeability', detail: 'Portland consistently ranks as one of the most bikeable cities in the US, with an extensive network of protected lanes and car-free paths along the Willamette River.' },
      { icon: '🚇', label: 'TriMet', detail: 'MAX light rail, streetcars, and extensive bus service make Portland one of the best transit cities west of Chicago. A monthly pass costs about $100.' },
      { icon: '🌲', label: 'Nature', detail: 'Forest Park — 5,200 acres of urban forest — is the largest in any US city. Mount Hood, the Columbia Gorge, and the Oregon Coast are 1–2 hours away.' },
      { icon: '☕', label: 'Food & Coffee', detail: 'Portland has more restaurants per capita than New York City. The food cart culture, craft coffee scene, and farm-to-table dining are genuine points of local pride.' },
      { icon: '📚', label: 'Culture', detail: 'Powell\'s Books (the world\'s largest independent bookstore), a thriving indie music scene, and the Portland Art Museum anchor a uniquely literary and arts-focused culture.' },
    ],
    neighborhoods: ['Division Street', 'Alberta Arts District', 'Mississippi Avenue', 'Pearl District', 'Hawthorne', 'Sellwood', 'St. Johns', 'Irvington', 'Concordia', 'Foster-Powell'],
    rentTips:
      'Portland is currently one of the most renter-friendly markets on the West Coast — vacancy is up and landlords are negotiating. Oregon has statewide rent stabilization (increases capped at 10% per year or CPI + 3%, whichever is lower) on units more than 15 years old. The Pearl District and inner Southeast are walkable and transit-rich but pricier. East Portland neighborhoods offer significantly lower rents with MAX access. Portland\'s rainy winters (November–March) are a lifestyle factor worth considering.',
    faqs: [
      { q: 'Does Portland have rent control?', a: 'Oregon enacted statewide rent stabilization in 2019 — the first state to do so. Annual rent increases are capped at 10% or CPI + 3% (whichever is lower) for units more than 15 years old. Newly constructed units are exempt for their first 15 years.' },
      { q: 'What is the average rent in Portland?', a: 'Portland 1-bedroom apartments average $1,400–$2,000/month in 2026. The Pearl District and inner Southeast neighborhoods are priciest. East Portland, St. Johns, and Foster-Powell offer significantly better value.' },
      { q: 'Is Portland safe to live in?', a: 'Portland has experienced well-publicized challenges with homelessness and property crime, particularly downtown. Residential neighborhoods like Sellwood, Irvington, and Lake Oswego are generally safe and family-friendly. Research specific neighborhoods and visit before committing to a lease.' },
    ],
    nearbySearches: [
      { label: 'Beaverton rentals', slug: 'beaverton' },
      { label: 'Gresham rentals', slug: 'gresham' },
      { label: 'Vancouver WA rentals', slug: 'vancouver' },
    ],
  },

  'charlotte': {
    headline: 'Renting in Charlotte, NC',
    intro:
      'Charlotte is the largest city in North Carolina and the second-largest banking center in the United States after New York. Home to Bank of America\'s global headquarters and a significant Wells Fargo presence, Charlotte\'s financial sector drives a professional rental market with strong demand for quality housing. The city has also seen rapid tech and healthcare growth, and a steady stream of transplants from the Northeast and Midwest seeking lower costs and warmer weather. Charlotte is one of the fastest-growing major cities in the US.',
    highlights: [
      { icon: '🏦', label: 'Finance Hub', detail: 'Bank of America, Wells Fargo, Truist, and LendingTree are headquartered in Charlotte, making it the second-largest US banking center and a strong job market for finance professionals.' },
      { icon: '🏈', label: 'Sports', detail: 'Charlotte is home to the NFL Panthers, NBA Hornets, and NASCAR Hall of Fame. Sports are central to the city\'s social fabric.' },
      { icon: '🌳', label: 'Greenways', detail: 'Charlotte\'s expanding greenway system and multiple parks provide outdoor access throughout the metro, and Lake Norman to the north is a popular recreation destination.' },
      { icon: '💰', label: 'Value', detail: 'Charlotte rents are 30–40% below comparable Northeast cities. No city income tax, and North Carolina\'s flat 4.5% state income tax makes the financial picture compelling for relocators.' },
      { icon: '🚇', label: 'LYNX Blue Line', detail: 'The LYNX Blue Line light rail connects the University area to Pineville via uptown Charlotte. Extensions are planned to improve coverage.' },
    ],
    neighborhoods: ['NoDa (North Davidson)', 'Plaza Midwood', 'South End', 'Dilworth', 'Myers Park', 'Uptown', 'University City', 'Ballantyne', 'Matthews', 'Concord'],
    rentTips:
      'South End along the light rail is Charlotte\'s most walkable neighborhood and has seen the most new apartment construction. NoDa and Plaza Midwood offer the best indie restaurant and bar scene at somewhat lower rents. Myers Park and Dilworth are the traditional upscale residential neighborhoods. Ballantyne and the south suburbs are family-oriented with newer construction. Traffic on I-77 and I-485 is increasingly heavy; live near work or the light rail.',
    faqs: [
      { q: 'Does Charlotte have rent control?', a: 'No. North Carolina state law prohibits local rent control ordinances. The market is currently competitive due to strong job growth, but the pipeline of new apartments should provide some relief.' },
      { q: 'What is the average rent in Charlotte?', a: 'Charlotte 1-bedroom apartments average $1,500–$2,200/month in 2026. South End, Uptown, and SouthPark are priciest. University City, Concord, and Gastonia offer more affordable options with reasonable commutes.' },
      { q: 'Is Charlotte a good city for young professionals?', a: 'Yes — Charlotte ranks consistently as one of the best US cities for young professionals. Strong job market (especially finance and tech), relatively affordable housing, a growing food and social scene, and warm climate make it an attractive destination for 20s and 30s renters.' },
    ],
    nearbySearches: [
      { label: 'Raleigh rentals', slug: 'raleigh' },
      { label: 'Concord rentals', slug: 'concord' },
      { label: 'Gastonia rentals', slug: 'gastonia' },
    ],
  },

  'minneapolis': {
    headline: 'Renting in Minneapolis, MN',
    intro:
      'Minneapolis is the cultural and economic heart of the Upper Midwest — a city that punches dramatically above its size. Home to Target, Best Buy, UnitedHealth Group, and a thriving medical device industry, Minneapolis offers a strong job market, world-class arts and music scene (birthplace of Prince), and one of the most extensive urban trail and parks systems in the country. Rents are moderate by major-city standards, and Minnesota has enacted meaningful tenant protections that give Minneapolis renters more security than in most Midwest cities.',
    highlights: [
      { icon: '🎵', label: 'Music & Arts', detail: 'Birthplace of Prince and The Replacements; First Avenue, the Guthrie Theater, and the Walker Art Center make Minneapolis a genuine arts city.' },
      { icon: '🏞️', label: 'Chain of Lakes', detail: 'Minneapolis has 22 lakes within city limits. The Chain of Lakes — Bde Maka Ska, Lake Harriet, Lake of the Isles — is walkable, bikeable, and free year-round.' },
      { icon: '🚇', label: 'Metro Transit', detail: 'The Green and Blue light rail lines, extensive bus network, and A-Line BRT serve most major destinations. The downtown skyway system lets you walk 80 blocks without going outside in winter.' },
      { icon: '💰', label: 'Value', detail: 'Minneapolis rents are a fraction of comparable coastal cities. Spacious apartments in walkable neighborhoods run $1,200–$2,000/month — with amenities that would cost twice as much in NYC or SF.' },
      { icon: '🏥', label: 'Healthcare & Tech', detail: 'UnitedHealth Group, Allina Health, and a dense medical device industry (Boston Scientific, Medtronic) make healthcare a pillar of the economy alongside retail and finance.' },
    ],
    neighborhoods: ['Uptown', 'Northeast', 'Whittier', 'Seward', 'Longfellow', 'North Loop', 'Marcy-Holmes', 'Linden Hills', 'Powderhorn', 'Stadium Village'],
    rentTips:
      'Minneapolis winters are brutal (expect -20°F wind chills) — ask whether heat is included and what the average utility cost is. The Uptown and Northeast neighborhoods offer the best walkability and character. North Loop is the trendiest downtown-adjacent neighborhood. Saint Paul (the other Twin City) offers 15–20% lower rents just across the river with easy commuter options. Minnesota\'s landlord licensing requirements and tenant protection laws are more robust than most states.',
    faqs: [
      { q: 'Does Minneapolis have rent control?', a: 'Minneapolis voters approved rent stabilization in 2021, but Minnesota state law and legal challenges have limited implementation. As of 2026, rent stabilization enforcement remains contested. Check current ordinance status when renting.' },
      { q: 'What is the average rent in Minneapolis?', a: 'Minneapolis 1-bedroom apartments average $1,300–$1,900/month in 2026. Uptown, North Loop, and Stadium Village are priciest. Powderhorn, Longfellow, and Northeast offer better value. Saint Paul averages 15–20% less.' },
      { q: 'How bad are Minneapolis winters?', a: 'Minneapolis winters are legitimately cold — the coldest large city in the US by many measures. January averages 13°F with regular subzero wind chills. However, the city is extremely well-adapted: the downtown skyway system, excellent winter infrastructure, and an active outdoor culture make winter life manageable and even enjoyable for those who embrace it.' },
    ],
    nearbySearches: [
      { label: 'Saint Paul rentals', slug: 'saint-paul' },
      { label: 'Bloomington rentals', slug: 'bloomington' },
      { label: 'Edina rentals', slug: 'edina' },
    ],
  },

  'sacramento': {
    headline: 'Renting in Sacramento, CA',
    intro:
      'Sacramento is California\'s capital city and one of the most underrated rental markets in the state. With access to the Sierra Nevada mountains two hours east, the Napa Valley wine country an hour west, and San Francisco just 90 miles away, Sacramento offers remarkable geographic versatility at a fraction of Bay Area costs. The city has seen steady population growth driven by remote workers leaving the Bay Area and a growing state government, healthcare, and tech sector.',
    highlights: [
      { icon: '🏛️', label: 'State Capital', detail: 'As California\'s capital, Sacramento has one of the most stable job markets in the state — anchored by state government employment with strong benefits and job security.' },
      { icon: '🍷', label: 'Wine Country', detail: 'Napa, Sonoma, and the Sierra Foothills wine regions are all within 1–2 hours. Sacramento is a launching point for some of the best wine tourism in the world.' },
      { icon: '⛷️', label: 'Sierra Nevada', detail: 'Lake Tahoe and Truckee are roughly 2 hours away. World-class skiing, hiking, and lake recreation are within easy driving distance.' },
      { icon: '💰', label: 'Bay Area Alternative', detail: 'Sacramento rents average 50–60% below San Francisco for comparable units. Many remote workers have relocated to Sacramento while maintaining Bay Area salaries.' },
      { icon: '🌳', label: 'Tree City', detail: 'Sacramento is known as the "City of Trees" — its urban canopy is one of the most extensive of any US city, making neighborhoods shady and walkable even in summer heat.' },
    ],
    neighborhoods: ['Midtown Sacramento', 'East Sacramento', 'Land Park', 'Oak Park', 'Curtis Park', 'North Sacramento', 'Natomas', 'Elk Grove', 'Folsom', 'Roseville'],
    rentTips:
      'Midtown Sacramento is the most walkable and has the best restaurant and bar scene. East Sacramento and Land Park are family-friendly residential neighborhoods with great parks. Oak Park has seen significant gentrification and offers character at lower prices. Natomas and Elk Grove are suburban and more affordable but car-dependent. California AB 1482 applies to most units built before 2009, limiting annual increases to 5% + CPI.',
    faqs: [
      { q: 'Is Sacramento a good alternative to the Bay Area?', a: 'For many people, yes. Sacramento rents are 50–60% below San Francisco and 35–45% below San Jose. Remote workers have poured in from the Bay Area since 2020. The downside: Sacramento summers are very hot (regularly over 100°F) and the city is car-dependent outside of Midtown.' },
      { q: 'What is the average rent in Sacramento?', a: 'Sacramento 1-bedroom apartments average $1,400–$1,900/month in 2026. Midtown and East Sacramento command premiums. Oak Park, North Sacramento, and Natomas offer lower rents. Elk Grove and Roseville in the suburbs run $1,200–$1,700.' },
      { q: 'Does Sacramento have rent control?', a: 'Sacramento does not have a local rent control ordinance. California\'s AB 1482 (statewide cap) applies to qualifying units built before 2009, limiting increases to 5% + CPI per year.' },
    ],
    nearbySearches: [
      { label: 'Elk Grove rentals', slug: 'elk-grove' },
      { label: 'Roseville rentals', slug: 'roseville' },
      { label: 'Folsom rentals', slug: 'folsom' },
    ],
  },

  'fresno': {
    headline: 'Renting in Fresno, CA',
    intro:
      'Fresno is the largest city in the San Joaquin Valley and one of the most affordable rental markets in California. Positioned at the geographic center of the state, Fresno offers access to three national parks — Yosemite, Kings Canyon, and Sequoia — within an hour or two, plus a short drive to both the Bay Area and Southern California. The city\'s economy is driven by agriculture, healthcare, education, and a growing manufacturing sector. For renters who want California living at Midwest prices, Fresno is hard to beat.',
    highlights: [
      { icon: '🏔️', label: 'National Parks', detail: 'Yosemite, Kings Canyon, and Sequoia national parks are all within 1–2 hours. No major city in the US offers better access to wilderness.' },
      { icon: '💰', label: 'Affordability', detail: 'Fresno rents are among the lowest in California — typically $1,000–$1,500 for a 1-bedroom. You can rent a house with a yard for what a small LA apartment costs.' },
      { icon: '🌾', label: 'Agriculture', detail: 'Fresno County is the most productive agricultural county in the United States, generating over $8 billion in annual farm output. Fresh produce is extraordinarily accessible and affordable.' },
      { icon: '🏫', label: 'Education', detail: 'California State University, Fresno (Fresno State) and Fresno City College create significant student and faculty rental demand.' },
      { icon: '🌡️', label: 'Climate', detail: 'Hot, dry summers (105°F+) and mild winters. Valley fog ("tule fog") is a winter hazard for drivers but the city enjoys over 300 sunny days per year.' },
    ],
    neighborhoods: ['Tower District', 'Fig Garden', 'Woodward Park', 'Sunnyside', 'Northeast Fresno', 'Downtown Fresno', 'Clovis (adjacent city)', 'West Fresno', 'Central Fresno'],
    rentTips:
      'The Tower District is Fresno\'s most character-rich neighborhood — arts, dining, and nightlife concentrated in a walkable area. Fig Garden and Woodward Park are the upscale residential choices. Northeast Fresno and Clovis offer newer construction in family-friendly suburban settings. Air conditioning is non-negotiable — make sure it\'s included. A car is necessary; public transit is limited.',
    faqs: [
      { q: 'Is Fresno a good place to rent?', a: 'For budget-conscious renters who want to stay in California, Fresno is an excellent choice. Rents are among the lowest in the state, national parks are nearby, and the job market is stable. The tradeoffs are brutal summers, car dependency, and a smaller job market than coastal cities.' },
      { q: 'What is the average rent in Fresno?', a: 'A 1-bedroom in Fresno typically rents for $1,000–$1,500/month, and a 3-bedroom house for $1,400–$2,000 — significantly below statewide averages. Clovis tends to run 5–10% above Fresno proper due to its strong school district.' },
      { q: 'How hot does it get in Fresno?', a: 'Fresno summers are intense. July and August regularly see temperatures of 100–107°F. Air conditioning is absolutely essential. The good news: it\'s a dry heat (unlike Houston or Miami), and evenings cool down significantly. Budget $150–$250/month for cooling in summer.' },
    ],
    nearbySearches: [
      { label: 'Clovis rentals', slug: 'clovis' },
      { label: 'Visalia rentals', slug: 'visalia' },
      { label: 'Modesto rentals', slug: 'modesto' },
    ],
  },
};

export function getCityContent(slug: string): CityContent | null {
  return CITY_CONTENT[slug] ?? null;
}

export function getAllCitySlugs(): string[] {
  return Object.keys(CITY_CONTENT);
}
