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
        {/* SVG Skyline */}
        <svg
          viewBox="0 0 1400 420"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
          className="h-[480px] w-full sm:h-[540px]"
        >
          <defs>
            <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF"/>
              <stop offset="100%" stopColor="#F4F8F6"/>
            </linearGradient>
            <linearGradient id="hground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8ECEB"/>
              <stop offset="100%" stopColor="#D4DAD8"/>
            </linearGradient>
            <linearGradient id="hfadeL" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1"/>
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="hfadeR" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0"/>
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="hshade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.04"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="1400" height="420" fill="url(#hsky)"/>

          {/* Diagonal accent lines */}
          <line x1="0" y1="380" x2="1400" y2="290" stroke="#6FAF8F" strokeWidth="0.6" opacity="0.25"/>
          <line x1="0" y1="390" x2="1400" y2="300" stroke="#6FAF8F" strokeWidth="0.4" opacity="0.15"/>

          {/* Far background ghost buildings */}
          <g fill="#E8ECEB" opacity="0.55">
            <rect x="30"   y="280" width="28" height="110"/>
            <rect x="62"   y="260" width="22" height="130"/>
            <rect x="88"   y="272" width="34" height="118"/>
            <rect x="126"  y="248" width="26" height="142"/>
            <rect x="156"  y="265" width="30" height="125"/>
            <rect x="192"  y="255" width="20" height="135"/>
            <rect x="1148" y="268" width="26" height="122"/>
            <rect x="1178" y="252" width="32" height="138"/>
            <rect x="1214" y="262" width="24" height="128"/>
            <rect x="1242" y="245" width="28" height="145"/>
            <rect x="1274" y="258" width="22" height="132"/>
            <rect x="1300" y="270" width="30" height="120"/>
            <rect x="1334" y="255" width="24" height="135"/>
            <rect x="1362" y="272" width="28" height="118"/>
          </g>

          {/* Left cluster */}
          <rect x="80"  y="245" width="42" height="145" fill="#E8ECEB"/>
          <g stroke="#FFFFFF" strokeWidth="0.6" opacity="0.9">
            <line x1="96"  y1="245" x2="96"  y2="390"/>
            <line x1="112" y1="245" x2="112" y2="390"/>
            <line x1="80"  y1="265" x2="122" y2="265"/>
            <line x1="80"  y1="285" x2="122" y2="285"/>
            <line x1="80"  y1="305" x2="122" y2="305"/>
            <line x1="80"  y1="325" x2="122" y2="325"/>
            <line x1="80"  y1="345" x2="122" y2="345"/>
            <line x1="80"  y1="365" x2="122" y2="365"/>
          </g>
          <rect x="126" y="210" width="50" height="180" fill="#2E3135"/>
          <rect x="126" y="210" width="50" height="180" fill="url(#hshade)"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.08">
            <line x1="142" y1="210" x2="142" y2="390"/>
            <line x1="158" y1="210" x2="158" y2="390"/>
            <line x1="126" y1="228" x2="176" y2="228"/>
            <line x1="126" y1="246" x2="176" y2="246"/>
            <line x1="126" y1="264" x2="176" y2="264"/>
            <line x1="126" y1="282" x2="176" y2="282"/>
            <line x1="126" y1="300" x2="176" y2="300"/>
            <line x1="126" y1="318" x2="176" y2="318"/>
            <line x1="126" y1="336" x2="176" y2="336"/>
            <line x1="126" y1="354" x2="176" y2="354"/>
            <line x1="126" y1="372" x2="176" y2="372"/>
          </g>
          <g fill="#6FAF8F" opacity="0.55">
            <rect x="130" y="215" width="8" height="10"/>
            <rect x="142" y="215" width="8" height="10"/>
            <rect x="130" y="233" width="8" height="10"/>
            <rect x="158" y="233" width="8" height="10"/>
            <rect x="142" y="251" width="8" height="10"/>
            <rect x="158" y="215" width="8" height="10"/>
            <rect x="130" y="269" width="8" height="10"/>
          </g>
          <rect x="180" y="228" width="36" height="162" fill="#6FAF8F" opacity="0.35"/>
          <rect x="180" y="226" width="36" height="3" fill="#1E5A46" opacity="0.4"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5">
            <line x1="198" y1="228" x2="198" y2="390"/>
            <line x1="180" y1="248" x2="216" y2="248"/>
            <line x1="180" y1="268" x2="216" y2="268"/>
            <line x1="180" y1="288" x2="216" y2="288"/>
            <line x1="180" y1="308" x2="216" y2="308"/>
            <line x1="180" y1="328" x2="216" y2="328"/>
            <line x1="180" y1="348" x2="216" y2="348"/>
            <line x1="180" y1="368" x2="216" y2="368"/>
          </g>
          <rect x="220" y="300" width="60" height="90" fill="#E8ECEB"/>
          <rect x="220" y="298" width="60" height="3" fill="#6FAF8F" opacity="0.5"/>
          <g stroke="#FFFFFF" strokeWidth="0.6" opacity="0.8">
            <line x1="240" y1="300" x2="240" y2="390"/>
            <line x1="260" y1="300" x2="260" y2="390"/>
            <line x1="220" y1="320" x2="280" y2="320"/>
            <line x1="220" y1="340" x2="280" y2="340"/>
            <line x1="220" y1="360" x2="280" y2="360"/>
            <line x1="220" y1="380" x2="280" y2="380"/>
          </g>
          <rect x="284" y="255" width="44" height="135" fill="#2E3135" opacity="0.7"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.06">
            <line x1="300" y1="255" x2="300" y2="390"/>
            <line x1="314" y1="255" x2="314" y2="390"/>
            <line x1="284" y1="273" x2="328" y2="273"/>
            <line x1="284" y1="291" x2="328" y2="291"/>
            <line x1="284" y1="309" x2="328" y2="309"/>
            <line x1="284" y1="327" x2="328" y2="327"/>
            <line x1="284" y1="345" x2="328" y2="345"/>
            <line x1="284" y1="363" x2="328" y2="363"/>
            <line x1="284" y1="381" x2="328" y2="381"/>
          </g>
          <g fill="#6FAF8F" opacity="0.4">
            <rect x="288" y="260" width="7" height="9"/>
            <rect x="302" y="278" width="7" height="9"/>
            <rect x="316" y="260" width="7" height="9"/>
          </g>
          <rect x="332" y="238" width="38" height="152" fill="#E8ECEB"/>
          <rect x="332" y="236" width="38" height="3" fill="#2E3135" opacity="0.3"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.7">
            <line x1="351" y1="238" x2="351" y2="390"/>
            <line x1="332" y1="256" x2="370" y2="256"/>
            <line x1="332" y1="274" x2="370" y2="274"/>
            <line x1="332" y1="292" x2="370" y2="292"/>
            <line x1="332" y1="310" x2="370" y2="310"/>
            <line x1="332" y1="328" x2="370" y2="328"/>
            <line x1="332" y1="346" x2="370" y2="346"/>
            <line x1="332" y1="364" x2="370" y2="364"/>
            <line x1="332" y1="382" x2="370" y2="382"/>
          </g>

          {/* Left-center flanking tower */}
          <rect x="374" y="195" width="52" height="195" fill="#2E3135"/>
          <rect x="374" y="195" width="52" height="195" fill="url(#hshade)"/>
          <rect x="374" y="192" width="52" height="4" fill="#1E5A46"/>
          <rect x="396" y="178" width="8" height="17" fill="#2E3135"/>
          <rect x="398" y="174" width="4" height="6" fill="#1E5A46"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.07">
            <line x1="392" y1="195" x2="392" y2="390"/>
            <line x1="410" y1="195" x2="410" y2="390"/>
            <line x1="374" y1="213" x2="426" y2="213"/>
            <line x1="374" y1="231" x2="426" y2="231"/>
            <line x1="374" y1="249" x2="426" y2="249"/>
            <line x1="374" y1="267" x2="426" y2="267"/>
            <line x1="374" y1="285" x2="426" y2="285"/>
            <line x1="374" y1="303" x2="426" y2="303"/>
            <line x1="374" y1="321" x2="426" y2="321"/>
            <line x1="374" y1="339" x2="426" y2="339"/>
            <line x1="374" y1="357" x2="426" y2="357"/>
            <line x1="374" y1="375" x2="426" y2="375"/>
          </g>
          <g fill="#6FAF8F" opacity="0.5">
            <rect x="378" y="199" width="9" height="11"/>
            <rect x="392" y="199" width="9" height="11"/>
            <rect x="378" y="218" width="9" height="11"/>
            <rect x="410" y="199" width="9" height="11"/>
            <rect x="410" y="235" width="9" height="11"/>
            <rect x="392" y="253" width="9" height="11"/>
          </g>

          {/* Hero tower — deep forest green */}
          <rect x="430" y="120" width="82" height="270" fill="#1E5A46"/>
          <rect x="490" y="120" width="22" height="270" fill="#000000" opacity="0.06"/>
          <rect x="430" y="116" width="82" height="5" fill="#16a34a" opacity="0.8"/>
          <rect x="467" y="88"  width="8"  height="30" fill="#1E5A46"/>
          <rect x="469" y="82"  width="4"  height="10" fill="#6FAF8F" opacity="0.7"/>
          <rect x="442" y="104" width="58" height="16" fill="#164033"/>
          <rect x="448" y="108" width="12" height="8" fill="#1E5A46"/>
          <rect x="466" y="108" width="12" height="8" fill="#1E5A46"/>
          <rect x="484" y="108" width="12" height="8" fill="#1E5A46"/>
          <g stroke="#FFFFFF" strokeWidth="0.6" opacity="0.12">
            <line x1="452" y1="120" x2="452" y2="390"/>
            <line x1="472" y1="120" x2="472" y2="390"/>
            <line x1="492" y1="120" x2="492" y2="390"/>
            <line x1="430" y1="140" x2="512" y2="140"/>
            <line x1="430" y1="158" x2="512" y2="158"/>
            <line x1="430" y1="176" x2="512" y2="176"/>
            <line x1="430" y1="194" x2="512" y2="194"/>
            <line x1="430" y1="212" x2="512" y2="212"/>
            <line x1="430" y1="230" x2="512" y2="230"/>
            <line x1="430" y1="248" x2="512" y2="248"/>
            <line x1="430" y1="266" x2="512" y2="266"/>
            <line x1="430" y1="284" x2="512" y2="284"/>
            <line x1="430" y1="302" x2="512" y2="302"/>
            <line x1="430" y1="320" x2="512" y2="320"/>
            <line x1="430" y1="338" x2="512" y2="338"/>
            <line x1="430" y1="356" x2="512" y2="356"/>
            <line x1="430" y1="374" x2="512" y2="374"/>
          </g>
          <g fill="#FFFFFF" opacity="0.14">
            <rect x="434" y="124" width="14" height="12"/>
            <rect x="452" y="124" width="14" height="12"/>
            <rect x="470" y="124" width="14" height="12"/>
            <rect x="434" y="142" width="14" height="12"/>
            <rect x="470" y="142" width="14" height="12"/>
            <rect x="452" y="160" width="14" height="12"/>
            <rect x="434" y="178" width="14" height="12"/>
            <rect x="490" y="142" width="14" height="12"/>
            <rect x="470" y="196" width="14" height="12"/>
            <rect x="452" y="214" width="14" height="12"/>
            <rect x="434" y="232" width="14" height="12"/>
            <rect x="490" y="196" width="14" height="12"/>
          </g>
          <rect x="430" y="120" width="82" height="40" fill="#FFFFFF" opacity="0.04"/>

          {/* Right flanking tower */}
          <rect x="516" y="172" width="56" height="218" fill="#2E3135" opacity="0.9"/>
          <rect x="516" y="168" width="56" height="5" fill="#1E5A46"/>
          <rect x="536" y="155" width="6"  height="16" fill="#2E3135"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.07">
            <line x1="534" y1="172" x2="534" y2="390"/>
            <line x1="552" y1="172" x2="552" y2="390"/>
            <line x1="516" y1="190" x2="572" y2="190"/>
            <line x1="516" y1="208" x2="572" y2="208"/>
            <line x1="516" y1="226" x2="572" y2="226"/>
            <line x1="516" y1="244" x2="572" y2="244"/>
            <line x1="516" y1="262" x2="572" y2="262"/>
            <line x1="516" y1="280" x2="572" y2="280"/>
            <line x1="516" y1="298" x2="572" y2="298"/>
            <line x1="516" y1="316" x2="572" y2="316"/>
            <line x1="516" y1="334" x2="572" y2="334"/>
            <line x1="516" y1="352" x2="572" y2="352"/>
            <line x1="516" y1="370" x2="572" y2="370"/>
          </g>
          <g fill="#6FAF8F" opacity="0.45">
            <rect x="520" y="176" width="9" height="11"/>
            <rect x="534" y="194" width="9" height="11"/>
            <rect x="554" y="176" width="9" height="11"/>
            <rect x="520" y="212" width="9" height="11"/>
            <rect x="554" y="212" width="9" height="11"/>
            <rect x="534" y="248" width="9" height="11"/>
          </g>

          {/* Right cluster */}
          <rect x="576" y="218" width="46" height="172" fill="#E8ECEB"/>
          <rect x="576" y="215" width="46" height="4" fill="#2E3135" opacity="0.2"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.7">
            <line x1="599" y1="218" x2="599" y2="390"/>
            <line x1="576" y1="236" x2="622" y2="236"/>
            <line x1="576" y1="254" x2="622" y2="254"/>
            <line x1="576" y1="272" x2="622" y2="272"/>
            <line x1="576" y1="290" x2="622" y2="290"/>
            <line x1="576" y1="308" x2="622" y2="308"/>
            <line x1="576" y1="326" x2="622" y2="326"/>
            <line x1="576" y1="344" x2="622" y2="344"/>
            <line x1="576" y1="362" x2="622" y2="362"/>
            <line x1="576" y1="380" x2="622" y2="380"/>
          </g>
          <rect x="626" y="238" width="54" height="152" fill="#2E3135" opacity="0.75"/>
          <rect x="626" y="235" width="54" height="4" fill="#1E5A46" opacity="0.6"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.06">
            <line x1="644" y1="238" x2="644" y2="390"/>
            <line x1="662" y1="238" x2="662" y2="390"/>
            <line x1="626" y1="256" x2="680" y2="256"/>
            <line x1="626" y1="274" x2="680" y2="274"/>
            <line x1="626" y1="292" x2="680" y2="292"/>
            <line x1="626" y1="310" x2="680" y2="310"/>
            <line x1="626" y1="328" x2="680" y2="328"/>
            <line x1="626" y1="346" x2="680" y2="346"/>
            <line x1="626" y1="364" x2="680" y2="364"/>
            <line x1="626" y1="382" x2="680" y2="382"/>
          </g>
          <g fill="#6FAF8F" opacity="0.4">
            <rect x="630" y="242" width="9" height="11"/>
            <rect x="644" y="260" width="9" height="11"/>
            <rect x="662" y="242" width="9" height="11"/>
          </g>
          <rect x="684" y="200" width="44" height="190" fill="#6FAF8F" opacity="0.28"/>
          <rect x="684" y="197" width="44" height="4" fill="#1E5A46" opacity="0.5"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.45">
            <line x1="706" y1="200" x2="706" y2="390"/>
            <line x1="684" y1="218" x2="728" y2="218"/>
            <line x1="684" y1="236" x2="728" y2="236"/>
            <line x1="684" y1="254" x2="728" y2="254"/>
            <line x1="684" y1="272" x2="728" y2="272"/>
            <line x1="684" y1="290" x2="728" y2="290"/>
            <line x1="684" y1="308" x2="728" y2="308"/>
            <line x1="684" y1="326" x2="728" y2="326"/>
            <line x1="684" y1="344" x2="728" y2="344"/>
            <line x1="684" y1="362" x2="728" y2="362"/>
            <line x1="684" y1="380" x2="728" y2="380"/>
          </g>
          <rect x="732" y="295" width="72" height="95" fill="#E8ECEB"/>
          <rect x="732" y="292" width="72" height="4" fill="#6FAF8F" opacity="0.5"/>
          <g stroke="#FFFFFF" strokeWidth="0.6" opacity="0.8">
            <line x1="756" y1="295" x2="756" y2="390"/>
            <line x1="780" y1="295" x2="780" y2="390"/>
            <line x1="732" y1="315" x2="804" y2="315"/>
            <line x1="732" y1="335" x2="804" y2="335"/>
            <line x1="732" y1="355" x2="804" y2="355"/>
            <line x1="732" y1="375" x2="804" y2="375"/>
          </g>
          <rect x="808" y="248" width="48" height="142" fill="#2E3135" opacity="0.65"/>
          <rect x="808" y="245" width="48" height="4" fill="#1E5A46" opacity="0.4"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.06">
            <line x1="826" y1="248" x2="826" y2="390"/>
            <line x1="844" y1="248" x2="844" y2="390"/>
            <line x1="808" y1="266" x2="856" y2="266"/>
            <line x1="808" y1="284" x2="856" y2="284"/>
            <line x1="808" y1="302" x2="856" y2="302"/>
            <line x1="808" y1="320" x2="856" y2="320"/>
            <line x1="808" y1="338" x2="856" y2="338"/>
            <line x1="808" y1="356" x2="856" y2="356"/>
            <line x1="808" y1="374" x2="856" y2="374"/>
          </g>
          <g fill="#6FAF8F" opacity="0.4">
            <rect x="812" y="252" width="9" height="10"/>
            <rect x="826" y="270" width="9" height="10"/>
            <rect x="844" y="252" width="9" height="10"/>
          </g>
          <rect x="860" y="225" width="36" height="165" fill="#E8ECEB"/>
          <rect x="860" y="222" width="36" height="4" fill="#2E3135" opacity="0.2"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.7">
            <line x1="878" y1="225" x2="878" y2="390"/>
            <line x1="860" y1="243" x2="896" y2="243"/>
            <line x1="860" y1="261" x2="896" y2="261"/>
            <line x1="860" y1="279" x2="896" y2="279"/>
            <line x1="860" y1="297" x2="896" y2="297"/>
            <line x1="860" y1="315" x2="896" y2="315"/>
            <line x1="860" y1="333" x2="896" y2="333"/>
            <line x1="860" y1="351" x2="896" y2="351"/>
            <line x1="860" y1="369" x2="896" y2="369"/>
            <line x1="860" y1="387" x2="896" y2="387"/>
          </g>
          <rect x="900" y="195" width="52" height="195" fill="#1E5A46" opacity="0.82"/>
          <rect x="900" y="191" width="52" height="5" fill="#16a34a" opacity="0.7"/>
          <rect x="922" y="178" width="8" height="16" fill="#1E5A46"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.11">
            <line x1="918" y1="195" x2="918" y2="390"/>
            <line x1="936" y1="195" x2="936" y2="390"/>
            <line x1="900" y1="213" x2="952" y2="213"/>
            <line x1="900" y1="231" x2="952" y2="231"/>
            <line x1="900" y1="249" x2="952" y2="249"/>
            <line x1="900" y1="267" x2="952" y2="267"/>
            <line x1="900" y1="285" x2="952" y2="285"/>
            <line x1="900" y1="303" x2="952" y2="303"/>
            <line x1="900" y1="321" x2="952" y2="321"/>
            <line x1="900" y1="339" x2="952" y2="339"/>
            <line x1="900" y1="357" x2="952" y2="357"/>
            <line x1="900" y1="375" x2="952" y2="375"/>
          </g>
          <g fill="#FFFFFF" opacity="0.12">
            <rect x="904" y="199" width="10" height="11"/>
            <rect x="918" y="199" width="10" height="11"/>
            <rect x="904" y="217" width="10" height="11"/>
            <rect x="938" y="217" width="10" height="11"/>
            <rect x="918" y="253" width="10" height="11"/>
            <rect x="904" y="271" width="10" height="11"/>
          </g>
          <rect x="956"  y="258" width="42" height="132" fill="#2E3135" opacity="0.55"/>
          <rect x="956"  y="255" width="42" height="4"   fill="#6FAF8F" opacity="0.4"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.05">
            <line x1="974"  y1="258" x2="974"  y2="390"/>
            <line x1="956"  y1="276" x2="998"  y2="276"/>
            <line x1="956"  y1="294" x2="998"  y2="294"/>
            <line x1="956"  y1="312" x2="998"  y2="312"/>
            <line x1="956"  y1="330" x2="998"  y2="330"/>
            <line x1="956"  y1="348" x2="998"  y2="348"/>
            <line x1="956"  y1="366" x2="998"  y2="366"/>
            <line x1="956"  y1="384" x2="998"  y2="384"/>
          </g>
          <rect x="1002" y="275" width="34" height="115" fill="#E8ECEB"/>
          <rect x="1040" y="255" width="40" height="135" fill="#6FAF8F" opacity="0.22"/>
          <rect x="1040" y="252" width="40" height="4" fill="#1E5A46" opacity="0.35"/>
          <g stroke="#FFFFFF" strokeWidth="0.5" opacity="0.4">
            <line x1="1060" y1="255" x2="1060" y2="390"/>
            <line x1="1040" y1="273" x2="1080" y2="273"/>
            <line x1="1040" y1="291" x2="1080" y2="291"/>
            <line x1="1040" y1="309" x2="1080" y2="309"/>
            <line x1="1040" y1="327" x2="1080" y2="327"/>
            <line x1="1040" y1="345" x2="1080" y2="345"/>
            <line x1="1040" y1="363" x2="1080" y2="363"/>
            <line x1="1040" y1="381" x2="1080" y2="381"/>
          </g>
          <rect x="1084" y="265" width="38" height="125" fill="#2E3135" opacity="0.5"/>
          <rect x="1126" y="280" width="30" height="110" fill="#E8ECEB"/>
          <rect x="1160" y="268" width="36" height="122" fill="#6FAF8F" opacity="0.2"/>
          <rect x="1200" y="275" width="28" height="115" fill="#E8ECEB" opacity="0.7"/>

          {/* Horizon */}
          <line x1="0" y1="390" x2="1400" y2="390" stroke="#2E3135" strokeWidth="0.6" opacity="0.2"/>
          <rect x="0" y="390" width="1400" height="30" fill="url(#hground)" opacity="0.35"/>

          {/* Edge vignette */}
          <rect x="0"    y="0" width="100" height="420" fill="url(#hfadeL)"/>
          <rect x="1300" y="0" width="100" height="420" fill="url(#hfadeR)"/>
        </svg>

        {/* Text + search overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
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
