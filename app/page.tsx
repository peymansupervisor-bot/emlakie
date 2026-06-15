import Link from 'next/link';
import Image from 'next/image';

import SearchBar from '@/components/SearchBar';
import ListingCard from '@/components/ListingCard';
import AppBadges from '@/components/AppBadges';
import { getListings } from '@/lib/api';

export default async function HomePage() {
  const { listings } = await getListings();
  const featured = listings.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        {/* SVG Neighborhood Illustration */}
        <svg
          viewBox="0 0 1400 500"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          preserveAspectRatio="xMidYMax slice"
          className="h-[480px] w-full sm:h-[560px]"
        >
          <defs>
            <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF"/>
              <stop offset="100%" stopColor="#F2F7F4"/>
            </linearGradient>
            <linearGradient id="hgnd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C8DECE"/>
              <stop offset="100%" stopColor="#9EC4A8"/>
            </linearGradient>
            <linearGradient id="hfadeL" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="hfadeR" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0"/>
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9"/>
            </linearGradient>
            <linearGradient id="hshade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.08"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="hwk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E4E8E5"/>
              <stop offset="100%" stopColor="#CDD3CF"/>
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="1400" height="500" fill="url(#hsky)"/>

          {/* Rolling terrain */}
          <path d="M0,400 C200,385 500,378 750,386 C1000,394 1200,380 1400,387 L1400,500 L0,500Z" fill="#D6E8DC"/>
          <path d="M0,415 C180,403 450,396 720,403 C990,410 1220,398 1400,404 L1400,500 L0,500Z" fill="url(#hgnd)"/>
          <path d="M0,440 C200,433 600,428 900,434 C1150,440 1300,430 1400,435 L1400,500 L0,500Z" fill="#B8D0BF"/>

          {/* HOME 1 — Modern ranch */}
          <ellipse cx="235" cy="420" rx="105" ry="7" fill="#1E5A46" opacity="0.1"/>
          <rect x="130" y="362" width="220" height="58" fill="#FFFFFF"/>
          <rect x="130" y="362" width="220" height="58" stroke="#E0E8E4" strokeWidth="0.5" fill="none"/>
          <polygon points="124,362 356,362 363,348 117,348" fill="#2E3135"/>
          <polygon points="124,362 356,362 363,348 117,348" fill="url(#hshade)"/>
          <rect x="117" y="345" width="246" height="5" fill="#1E5A46" rx="1"/>
          <rect x="148" y="330" width="12" height="20" fill="#404548"/>
          <rect x="146" y="328" width="16" height="5" fill="#2E3135" rx="1"/>
          <rect x="130" y="367" width="90" height="53" fill="#F2F5F3"/>
          <g stroke="#D0D8D4" strokeWidth="0.6" fill="none">
            <rect x="137" y="372" width="76" height="44" rx="0.5"/>
            <line x1="137" y1="383" x2="213" y2="383"/>
            <line x1="137" y1="394" x2="213" y2="394"/>
            <line x1="137" y1="405" x2="213" y2="405"/>
            <line x1="175" y1="372" x2="175" y2="416"/>
          </g>
          <rect x="236" y="370" width="38" height="24" fill="#C8E0D0" rx="0.5"/>
          <line x1="255" y1="370" x2="255" y2="394" stroke="#fff" strokeWidth="0.8"/>
          <line x1="236" y1="382" x2="274" y2="382" stroke="#fff" strokeWidth="0.8"/>
          <rect x="282" y="370" width="32" height="24" fill="#C8E0D0" rx="0.5"/>
          <line x1="282" y1="382" x2="314" y2="382" stroke="#fff" strokeWidth="0.8"/>
          <rect x="318" y="370" width="28" height="50" fill="#1E5A46" rx="0.5"/>
          <rect x="322" y="374" width="20" height="28" fill="#6FAF8F" opacity="0.3" rx="0.5"/>
          <circle cx="338" cy="400" r="2" fill="#C8A96E" opacity="0.9"/>
          <ellipse cx="138" cy="416" rx="14" ry="9" fill="#6FAF8F" opacity="0.7"/>
          <ellipse cx="340" cy="416" rx="12" ry="8" fill="#6FAF8F" opacity="0.7"/>
          <ellipse cx="352" cy="417" rx="8" ry="6" fill="#1E5A46" opacity="0.5"/>
          <rect x="100" y="368" width="4" height="46" fill="#8B6B4E"/>
          <ellipse cx="102" cy="358" rx="18" ry="22" fill="#1E5A46" opacity="0.88"/>
          <path d="M238,420 L228,450 L250,450 L243,420Z" fill="url(#hwk)" opacity="0.7"/>

          {/* HOME 2 — Craftsman */}
          <ellipse cx="565" cy="418" rx="125" ry="8" fill="#1E5A46" opacity="0.09"/>
          <rect x="448" y="336" width="234" height="82" fill="#FAFBF9"/>
          <rect x="448" y="336" width="234" height="82" stroke="#E2E8E4" strokeWidth="0.5" fill="none"/>
          <polygon points="438,336 692,336 674,294 456,294" fill="#2E3135"/>
          <polygon points="438,336 692,336 674,294 456,294" fill="url(#hshade)"/>
          <line x1="456" y1="294" x2="674" y2="294" stroke="#1E5A46" strokeWidth="2.5"/>
          <rect x="448" y="370" width="234" height="16" fill="#EDEEED" rx="0.5"/>
          <rect x="462" y="340" width="9" height="30" fill="#E8ECEB"/>
          <rect x="460" y="336" width="13" height="6" fill="#D0D8D4" rx="0.5"/>
          <rect x="566" y="340" width="9" height="30" fill="#E8ECEB"/>
          <rect x="564" y="336" width="13" height="6" fill="#D0D8D4" rx="0.5"/>
          <rect x="662" y="340" width="9" height="30" fill="#E8ECEB"/>
          <rect x="660" y="336" width="13" height="6" fill="#D0D8D4" rx="0.5"/>
          <rect x="462" y="362" width="210" height="2.5" fill="#D0D8D4" rx="1"/>
          <rect x="462" y="368" width="210" height="2.5" fill="#D0D8D4" rx="1"/>
          <rect x="460" y="310" width="52" height="30" fill="#C8DDD0" rx="0.5"/>
          <line x1="486" y1="310" x2="486" y2="340" stroke="#fff" strokeWidth="1"/>
          <line x1="460" y1="325" x2="512" y2="325" stroke="#fff" strokeWidth="1"/>
          <rect x="455" y="310" width="5" height="30" fill="#2E3135" opacity="0.25" rx="0.3"/>
          <rect x="512" y="310" width="5" height="30" fill="#2E3135" opacity="0.25" rx="0.3"/>
          <rect x="614" y="310" width="52" height="30" fill="#C8DDD0" rx="0.5"/>
          <line x1="640" y1="310" x2="640" y2="340" stroke="#fff" strokeWidth="1"/>
          <line x1="614" y1="325" x2="666" y2="325" stroke="#fff" strokeWidth="1"/>
          <rect x="609" y="310" width="5" height="30" fill="#2E3135" opacity="0.25" rx="0.3"/>
          <rect x="666" y="310" width="5" height="30" fill="#2E3135" opacity="0.25" rx="0.3"/>
          <rect x="547" y="342" width="36" height="76" fill="#1E5A46" rx="0.5"/>
          <rect x="551" y="346" width="12" height="20" fill="#6FAF8F" opacity="0.35" rx="0.3"/>
          <rect x="565" y="346" width="12" height="20" fill="#6FAF8F" opacity="0.35" rx="0.3"/>
          <circle cx="567" cy="376" r="2.5" fill="#C8A96E" opacity="0.9"/>
          <rect x="468" y="268" width="16" height="28" fill="#A05A3A" opacity="0.75"/>
          <rect x="466" y="264" width="20" height="6" fill="#8B4E30" opacity="0.85" rx="0.5"/>
          <rect x="540" y="386" width="50" height="5" fill="#DDEAE1" rx="0.5"/>
          <rect x="536" y="390" width="58" height="5" fill="#D0D8D4" rx="0.5"/>
          <ellipse cx="457" cy="415" rx="16" ry="10" fill="#6FAF8F" opacity="0.72"/>
          <ellipse cx="445" cy="414" rx="10" ry="8" fill="#1E5A46" opacity="0.5"/>
          <ellipse cx="676" cy="415" rx="14" ry="10" fill="#6FAF8F" opacity="0.72"/>
          <rect x="420" y="330" width="4" height="82" fill="#8B6B4E"/>
          <ellipse cx="422" cy="320" rx="20" ry="25" fill="#1E5A46" opacity="0.9"/>
          <rect x="703" y="328" width="4" height="86" fill="#8B6B4E"/>
          <ellipse cx="705" cy="317" rx="19" ry="24" fill="#1E5A46" opacity="0.88"/>
          <path d="M558,418 L546,450 L572,450 L563,418Z" fill="url(#hwk)" opacity="0.7"/>

          {/* HOME 3 — Contemporary suburban */}
          <ellipse cx="886" cy="418" rx="122" ry="8" fill="#1E5A46" opacity="0.09"/>
          <rect x="756" y="326" width="136" height="92" fill="#FDFEFD"/>
          <rect x="756" y="326" width="136" height="92" stroke="#E0E8E4" strokeWidth="0.5" fill="none"/>
          <rect x="890" y="350" width="96" height="68" fill="#F6F8F6"/>
          <rect x="890" y="350" width="96" height="68" stroke="#E0E8E4" strokeWidth="0.5" fill="none"/>
          <polygon points="750,326 898,326 884,298 764,298" fill="#2E3135"/>
          <polygon points="750,326 898,326 884,298 764,298" fill="url(#hshade)"/>
          <polygon points="886,350 990,350 984,334 892,334" fill="#2E3135" opacity="0.88"/>
          <rect x="750" y="324" width="148" height="4" fill="#1E5A46" opacity="0.65"/>
          <rect x="886" y="348" width="104" height="3.5" fill="#1E5A46" opacity="0.45"/>
          <rect x="764" y="303" width="44" height="26" fill="#C8DCCF" rx="0.5"/>
          <line x1="786" y1="303" x2="786" y2="329" stroke="#fff" strokeWidth="0.8"/>
          <line x1="764" y1="316" x2="808" y2="316" stroke="#fff" strokeWidth="0.8"/>
          <rect x="820" y="303" width="44" height="26" fill="#C8DCCF" rx="0.5"/>
          <line x1="842" y1="303" x2="842" y2="329" stroke="#fff" strokeWidth="0.8"/>
          <line x1="820" y1="316" x2="864" y2="316" stroke="#fff" strokeWidth="0.8"/>
          <rect x="762" y="340" width="36" height="26" fill="#C8DCCF" rx="0.5"/>
          <line x1="762" y1="353" x2="798" y2="353" stroke="#fff" strokeWidth="0.8"/>
          <rect x="832" y="340" width="36" height="26" fill="#C8DCCF" rx="0.5"/>
          <line x1="832" y1="353" x2="868" y2="353" stroke="#fff" strokeWidth="0.8"/>
          <rect x="804" y="346" width="28" height="72" fill="#2E3135" rx="0.5"/>
          <rect x="807" y="349" width="22" height="34" fill="#6FAF8F" opacity="0.3" rx="0.3"/>
          <circle cx="820" cy="386" r="2.5" fill="#C8A96E" opacity="0.9"/>
          <rect x="898" y="358" width="80" height="58" fill="#E8ECEB" rx="0.5"/>
          <g stroke="#D0D8D4" strokeWidth="0.5" fill="none">
            <line x1="898" y1="370" x2="978" y2="370"/>
            <line x1="898" y1="382" x2="978" y2="382"/>
            <line x1="898" y1="394" x2="978" y2="394"/>
            <line x1="938" y1="358" x2="938" y2="416"/>
          </g>
          <ellipse cx="762" cy="416" rx="14" ry="9" fill="#6FAF8F" opacity="0.7"/>
          <ellipse cx="982" cy="416" rx="12" ry="8" fill="#6FAF8F" opacity="0.65"/>
          <rect x="990" y="372" width="4" height="44" fill="#8B6B4E"/>
          <ellipse cx="992" cy="363" rx="16" ry="20" fill="#1E5A46" opacity="0.85"/>
          <path d="M812,420 L800,450 L824,450 L817,420Z" fill="url(#hwk)" opacity="0.7"/>

          {/* HOME 4 — Upscale cottage */}
          <ellipse cx="1168" cy="419" rx="112" ry="8" fill="#1E5A46" opacity="0.09"/>
          <rect x="1062" y="347" width="206" height="71" fill="#FDFBF7"/>
          <rect x="1062" y="347" width="206" height="71" stroke="#E8E4DF" strokeWidth="0.5" fill="none"/>
          <polygon points="1052,347 1278,347 1256,294 1074,294" fill="#2E3135"/>
          <polygon points="1052,347 1278,347 1256,294 1074,294" fill="url(#hshade)"/>
          <polygon points="1052,347 1278,347 1256,294 1074,294" fill="#A05A3A" opacity="0.10"/>
          <line x1="1074" y1="294" x2="1256" y2="294" stroke="#2E3135" strokeWidth="2"/>
          <rect x="1138" y="278" width="54" height="22" fill="#F8F5F0" rx="0.5"/>
          <polygon points="1134,278 1196,278 1183,262 1147,262" fill="#2E3135"/>
          <rect x="1142" y="280" width="20" height="17" fill="#B0CEC0" rx="0.3"/>
          <line x1="1152" y1="280" x2="1152" y2="297" stroke="#fff" strokeWidth="0.8"/>
          <rect x="1166" y="280" width="20" height="17" fill="#B0CEC0" rx="0.3"/>
          <line x1="1176" y1="280" x2="1176" y2="297" stroke="#fff" strokeWidth="0.8"/>
          <rect x="1232" y="272" width="18" height="25" fill="#A09078" opacity="0.82"/>
          <rect x="1230" y="268" width="22" height="6" fill="#8B7A60" opacity="0.88" rx="0.5"/>
          <rect x="1070" y="320" width="52" height="30" fill="#B0CEC0" rx="0.5"/>
          <line x1="1096" y1="320" x2="1096" y2="350" stroke="#fff" strokeWidth="1"/>
          <line x1="1070" y1="335" x2="1122" y2="335" stroke="#fff" strokeWidth="1"/>
          <rect x="1065" y="320" width="6" height="30" fill="#6FAF8F" opacity="0.55" rx="0.3"/>
          <rect x="1121" y="320" width="6" height="30" fill="#6FAF8F" opacity="0.55" rx="0.3"/>
          <rect x="1206" y="320" width="50" height="30" fill="#B0CEC0" rx="0.5"/>
          <line x1="1231" y1="320" x2="1231" y2="350" stroke="#fff" strokeWidth="1"/>
          <line x1="1206" y1="335" x2="1256" y2="335" stroke="#fff" strokeWidth="1"/>
          <rect x="1201" y="320" width="6" height="30" fill="#6FAF8F" opacity="0.55" rx="0.3"/>
          <rect x="1256" y="320" width="6" height="30" fill="#6FAF8F" opacity="0.55" rx="0.3"/>
          <path d="M1145,418 L1145,358 Q1145,342 1165,342 Q1185,342 1185,358 L1185,418Z" fill="#1E5A46" opacity="0.82"/>
          <path d="M1147,358 Q1147,344 1165,344 Q1183,344 1183,358Z" fill="#B0CEC0" opacity="0.65"/>
          <circle cx="1178" cy="384" r="2.5" fill="#C8A96E" opacity="0.9"/>
          <rect x="1070" y="350" width="52" height="6" fill="#6FAF8F" opacity="0.38" rx="0.8"/>
          <rect x="1206" y="350" width="50" height="6" fill="#6FAF8F" opacity="0.38" rx="0.8"/>
          <g opacity="0.6">
            <circle cx="1082" cy="352" r="2.2" fill="#E8A0A8"/>
            <circle cx="1100" cy="352" r="2.2" fill="#E8A0A8"/>
            <circle cx="1218" cy="352" r="2.2" fill="#E8A0A8"/>
            <circle cx="1236" cy="352" r="2.2" fill="#E8A0A8"/>
          </g>
          <rect x="1138" y="417" width="54" height="5" fill="#E4E0DA" rx="0.5"/>
          <ellipse cx="1066" cy="413" rx="15" ry="10" fill="#6FAF8F" opacity="0.72"/>
          <ellipse cx="1056" cy="412" rx="10" ry="7" fill="#1E5A46" opacity="0.52"/>
          <ellipse cx="1264" cy="413" rx="15" ry="10" fill="#6FAF8F" opacity="0.72"/>
          <rect x="1030" y="332" width="4" height="82" fill="#8B6B4E"/>
          <ellipse cx="1032" cy="322" rx="21" ry="27" fill="#1E5A46" opacity="0.9"/>
          <rect x="1296" y="340" width="4" height="74" fill="#8B6B4E"/>
          <ellipse cx="1298" cy="330" rx="19" ry="24" fill="#1E5A46" opacity="0.85"/>
          <path d="M1165,419 L1155,448 L1175,448 L1168,419Z" fill="url(#hwk)" opacity="0.7"/>

          {/* Mid trees between homes */}
          <rect x="390" y="352" width="3.5" height="62" fill="#8B6B4E" opacity="0.65"/>
          <ellipse cx="392" cy="343" rx="15" ry="19" fill="#1E5A46" opacity="0.48"/>
          <rect x="736" y="348" width="3.5" height="66" fill="#8B6B4E" opacity="0.6"/>
          <ellipse cx="738" cy="339" rx="14" ry="17" fill="#1E5A46" opacity="0.43"/>

          {/* Edge vignettes */}
          <rect x="0" y="0" width="110" height="500" fill="url(#hfadeL)"/>
          <rect x="1290" y="0" width="110" height="500" fill="url(#hfadeR)"/>

          {/* Subtle focal glow */}
          <ellipse cx="700" cy="160" rx="380" ry="100" fill="#6FAF8F" opacity="0.022"/>
        </svg>

        {/* Text + search overlay — positioned in the clear upper ~75% */}
        <div className="absolute inset-x-0 top-0 flex h-[75%] flex-col items-center justify-center px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
            National Real Estate
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Find your next home
          </h1>
          <p className="mt-3 max-w-xl text-lg font-medium text-gray-600">
            Houses, apartments, and condos for rent — direct from landlords.
          </p>
          <div className="mt-8 w-full max-w-2xl">
            <SearchBar large />
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Homes for rent</h2>
            <p className="mt-1 text-gray-600">Fresh listings, updated daily</p>
          </div>
          <Link href="/rentals" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold text-gray-900">
            Renting, without the runaround
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: 'Talk directly to landlords',
                body: 'Message property owners in the app — no middlemen, no missed calls.',
                icon: (
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                ),
              },
              {
                title: 'Apply in minutes',
                body: 'One simple application. Landlords respond fast with a clear yes or no.',
                icon: (
                  <>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                  </>
                ),
              },
              {
                title: 'Verified listings',
                body: 'Every listing is posted by a real landlord — no bait-and-switch, no scams.',
                icon: (
                  <>
                    <path d="M20 13c0 5-3.5 7.5-8 8.5-4.5-1-8-3.5-8-8.5V6l8-3 8 3z" />
                    <path d="m9 12 2 2 4-4" />
                  </>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-6 text-center shadow-card">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 stroke-brand-600"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {item.icon}
                  </svg>
                </div>
                <h3 className="mt-4 font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App promo */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-10 rounded-3xl bg-brand-600 p-10 sm:p-14 lg:flex-row">
          <div className="max-w-xl text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-white">
              Take EMLAKIE with you
            </h2>
            <p className="mt-3 text-lg text-white">
              Search on the go, chat with landlords, and get instant alerts when new
              homes hit the market. Coming soon to the App Store and Google Play.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <AppBadges />
            </div>
          </div>
          <div className="hidden h-64 w-64 overflow-hidden rounded-full lg:flex">
            <Image src="/logo.png" alt="Emlakie" width={256} height={256} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
    </>
  );
}
