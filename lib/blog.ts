export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  category: string;
  readTime: number; // minutes
  content: string; // HTML
}

export const posts: Post[] = [
  {
    slug: 'average-rent-los-angeles-2026',
    title: 'Average Rent in Los Angeles in 2026: What to Expect',
    description: 'A breakdown of average rental prices across LA neighborhoods in 2026 — from Hollywood to the Valley.',
    date: '2026-06-10',
    category: 'Market Trends',
    readTime: 5,
    content: `
<p>Los Angeles remains one of the most competitive rental markets in the United States. Whether you're moving from out of state or relocating within the city, understanding what rents look like in 2026 can save you time and help you negotiate confidently.</p>

<h2>Citywide Average</h2>
<p>The median rent for a one-bedroom apartment in Los Angeles is currently around <strong>$2,300/month</strong>, while two-bedrooms average <strong>$3,100/month</strong>. These figures vary significantly by neighborhood.</p>

<h2>Rent by Neighborhood</h2>
<ul>
  <li><strong>Santa Monica / West LA:</strong> $2,800–$4,200/mo (1BR)</li>
  <li><strong>Silver Lake / Los Feliz:</strong> $2,200–$3,200/mo (1BR)</li>
  <li><strong>Hollywood:</strong> $1,900–$2,800/mo (1BR)</li>
  <li><strong>Koreatown:</strong> $1,600–$2,400/mo (1BR)</li>
  <li><strong>San Fernando Valley:</strong> $1,700–$2,500/mo (1BR)</li>
  <li><strong>Long Beach:</strong> $1,500–$2,200/mo (1BR)</li>
  <li><strong>Inglewood:</strong> $1,600–$2,300/mo (1BR)</li>
</ul>

<h2>What's Driving Prices?</h2>
<p>LA's rental market is shaped by a persistent housing shortage, strict zoning laws that limit new construction, and strong demand from the entertainment, tech, and healthcare industries. Even as remote work reduced demand in some coastal cities, LA's population of renters has remained resilient.</p>

<h2>Tips for Renting in LA</h2>
<ul>
  <li><strong>Move fast.</strong> Good units at fair prices get multiple applications within 24–48 hours.</li>
  <li><strong>Have your documents ready.</strong> Pay stubs, bank statements, and a letter of employment speed up the process.</li>
  <li><strong>Know the 3x rule.</strong> Most LA landlords require monthly income of at least 3× the rent.</li>
  <li><strong>Look beyond the westside.</strong> Koreatown, Inglewood, and the Valley offer far better value per square foot.</li>
</ul>

<p>Browse current LA rentals on EMLAKIE to find listings posted directly by landlords — no broker fees, no middlemen.</p>
    `.trim(),
  },
  {
    slug: 'best-neighborhoods-rent-los-angeles',
    title: 'Best Neighborhoods to Rent in Los Angeles (2026 Guide)',
    description: 'From walkable Silver Lake to affordable Inglewood — a renter\'s guide to the best LA neighborhoods right now.',
    date: '2026-06-08',
    category: 'Neighborhood Guides',
    readTime: 6,
    content: `
<p>Los Angeles is not one city — it's dozens of distinct neighborhoods, each with its own character, commute profile, and price point. Here's our breakdown of the best places to rent in LA right now.</p>

<h2>Best for Young Professionals: Silver Lake</h2>
<p>Silver Lake hits the sweet spot between walkability, nightlife, and a genuine sense of community. The reservoir area is especially popular. Expect to pay $2,200–$3,200/mo for a one-bedroom. Parking can be tricky, but if you work remotely or near the metro it's hard to beat.</p>

<h2>Best Value: Koreatown</h2>
<p>Koreatown (K-Town) offers more square footage per dollar than almost any other central LA neighborhood. It's well-served by the Metro Purple and Red lines, which makes car-free commuting to downtown or Hollywood realistic. Average 1BR: $1,600–$2,200/mo.</p>

<h2>Best for Families: Sherman Oaks</h2>
<p>Over the hill in the San Fernando Valley, Sherman Oaks offers good schools, quiet streets, and significantly larger apartments for the same price as a cramped studio in West Hollywood. Average 2BR: $2,400–$3,000/mo.</p>

<h2>Best Beachside: Long Beach</h2>
<p>If you want ocean access without Santa Monica prices, Long Beach delivers. A thriving arts scene, the Pike, and easy freeway access make it popular with both remote workers and port-industry employees. Average 1BR: $1,600–$2,200/mo.</p>

<h2>Up and Coming: Inglewood</h2>
<p>Since the opening of SoFi Stadium, Inglewood has seen major investment. Rents are rising but still well below Westside levels, and the new Metro K Line connects it to Expo/Crenshaw. Average 1BR: $1,600–$2,300/mo.</p>

<h2>Best Walkable Urban: Downtown LA (DTLA)</h2>
<p>DTLA has reinvented itself with converted loft buildings, rooftop pools, and a growing restaurant scene. It's best suited for renters who actually work downtown. High-rises offer amenities that single-family rentals can't match. Average 1BR: $2,000–$3,000/mo.</p>

<p>Ready to start your search? Browse LA rental listings on EMLAKIE — all posted directly by landlords.</p>
    `.trim(),
  },
  {
    slug: 'how-to-apply-rental-los-angeles',
    title: 'How to Apply for a Rental in Los Angeles: A Step-by-Step Guide',
    description: 'Everything you need to know to submit a strong rental application in LA\'s competitive market — documents, timelines, and red flags to watch.',
    date: '2026-06-05',
    category: 'Renter Tips',
    readTime: 4,
    content: `
<p>Getting approved for an apartment in Los Angeles is more competitive than ever. Here's exactly what landlords look for and how to put your best foot forward.</p>

<h2>What Landlords Require</h2>
<ul>
  <li><strong>Income verification:</strong> Most require 2.5–3× monthly rent in gross income. Have your last 2–3 pay stubs ready, or a bank statement if you're self-employed.</li>
  <li><strong>Credit check:</strong> A score of 650+ is generally the floor. 700+ gives you a strong advantage.</li>
  <li><strong>Rental history:</strong> Contact info for your previous landlord. A reference letter helps significantly.</li>
  <li><strong>Photo ID:</strong> A valid government-issued ID.</li>
</ul>

<h2>The Timeline</h2>
<p>In LA, desirable units move fast. Here's a typical timeline:</p>
<ul>
  <li><strong>Day 1:</strong> Listing goes live.</li>
  <li><strong>Day 1–2:</strong> Showings happen — often back-to-back.</li>
  <li><strong>Day 2–3:</strong> Landlord selects top applicants and runs credit/background checks.</li>
  <li><strong>Day 3–5:</strong> Approved tenant signs lease and pays deposit.</li>
</ul>
<p>If you wait 48 hours to apply, the unit may already be gone.</p>

<h2>How to Stand Out</h2>
<ul>
  <li>Apply the same day you tour — don't wait.</li>
  <li>Include a short personal note introducing yourself to the landlord.</li>
  <li>Offer to provide additional references proactively.</li>
  <li>If your credit is borderline, offer a larger security deposit upfront.</li>
</ul>

<h2>Red Flags to Watch</h2>
<ul>
  <li>Landlord asks for cash-only deposit before you've signed anything.</li>
  <li>Listing photos look too good or are clearly stock images.</li>
  <li>Pressure to decide immediately without seeing the unit in person.</li>
  <li>No lease agreement offered.</li>
</ul>

<p>On EMLAKIE, every listing is posted by a verified landlord. Apply directly from the listing page — no broker, no fees.</p>
    `.trim(),
  },
  {
    slug: 'landlord-guide-listing-rental-la',
    title: 'A Los Angeles Landlord\'s Guide to Listing a Rental Property in 2026',
    description: 'How to price, photograph, and market your LA rental to find great tenants fast — without paying broker fees.',
    date: '2026-06-01',
    category: 'Landlord Tips',
    readTime: 5,
    content: `
<p>Listing a rental property in Los Angeles doesn't have to be complicated or expensive. Here's what experienced LA landlords do to find quality tenants quickly.</p>

<h2>Price It Right From Day One</h2>
<p>Overpriced listings sit vacant for weeks. Check comparable active listings in your neighborhood — not the asking prices, but what similar units actually rented for recently. Price your unit at or slightly below market and you'll attract significantly more applications, giving you a better pool to choose from.</p>

<h2>Photos Make or Break Your Listing</h2>
<p>Listings with high-quality photos get 3–4× more inquiries. You don't need a professional photographer — a modern smartphone with good lighting is enough. Tips:</p>
<ul>
  <li>Shoot during the day with all lights on and blinds open.</li>
  <li>Declutter completely before shooting.</li>
  <li>Lead with the best room — usually the living room or kitchen.</li>
  <li>Always include a photo of the exterior.</li>
</ul>

<h2>Know California Tenant Protections</h2>
<p>LA has some of the strongest tenant protections in the country. Before listing, understand:</p>
<ul>
  <li><strong>AB 1482:</strong> Annual rent increases are capped at 5% + CPI for most units built before 2005.</li>
  <li><strong>Just Cause Eviction:</strong> Once a tenant has lived in a unit for 12 months, you generally need a legally recognized reason to evict them.</li>
  <li><strong>Security Deposit:</strong> Capped at 2 months' rent for unfurnished units.</li>
</ul>

<h2>Screen Tenants Carefully</h2>
<p>A bad tenant costs far more than a vacant month. Ask for proof of income, run a credit check, and always call previous landlord references. Look for stability — someone who's held the same job for 2+ years and has rented the same place for 2+ years is a lower risk than someone who moves frequently.</p>

<h2>Use EMLAKIE to List for Free</h2>
<p>EMLAKIE lets LA landlords post rentals directly to tenants — no broker fees, no middlemen. Tenants apply through the app or website, and you receive an email with their income, credit score, and an AI match score so you can compare applicants at a glance.</p>
    `.trim(),
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find(p => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return posts.map(p => p.slug);
}
