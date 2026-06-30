'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { deleteListing, getMyListing, updateListing } from '@/lib/landlord/client';
import { LandlordListing } from '@/lib/landlord/types';
import AddressField from '@/components/AddressField';

const UNIT_REQUIRED_TYPES = ['apartment', 'condo'];
const UNIT_OPTIONAL_TYPES = ['townhouse'];

// Extract unit suffix (Apt 4, #301, Unit 2B) from an address string
function splitAddressUnit(address: string): { address: string; unit: string } {
  const m = address.match(/^(.*?)\s+((?:apt|unit|#)\s*\S+)$/i);
  if (m) return { address: m[1].trim(), unit: m[2].trim() };
  return { address, unit: '' };
}

const PROPERTY_TYPES = [
  { value: 'house',     label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo',     label: 'Condominium (Condo)' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'studio',    label: 'Studio' },
  { value: 'adu',       label: 'ADU' },
  { value: 'jadu',      label: 'JADU' },
  { value: 'room',      label: 'Room' },
];

const AMENITIES_LIST = [
  'Gym', 'Balcony', 'Hardwood floors', 'EV charging', 'Storage',
];

const LAUNDRY_OPTIONS = [
  { value: 'in_unit',     label: 'Washer & dryer in unit' },
  { value: 'hookup',      label: 'Washer & dryer hookup only' },
  { value: 'in_building', label: 'Washer & dryer in building (shared)' },
  { value: 'none',        label: 'No laundry on-site' },
];

const HEATING_OPTIONS = [
  { value: 'forced_air',  label: 'Forced air (ducted)' },
  { value: 'central',     label: 'Central heat' },
  { value: 'baseboard',   label: 'Baseboard / electric' },
  { value: 'wall_unit',   label: 'Wall unit heater' },
  { value: 'radiant',     label: 'Radiant / in-floor heat' },
  { value: 'none',        label: 'No heating' },
];

const PARKING_TYPES = [
  { value: 'garage',   label: 'Garage (attached or detached)' },
  { value: 'carport',  label: 'Carport' },
  { value: 'assigned', label: 'Assigned parking spot' },
  { value: 'lot',      label: 'On-site parking lot' },
  { value: 'street',   label: 'Street parking' },
];

const PETS_OPTIONS = [
  { value: 'no_pets',       label: 'No pets' },
  { value: 'cats_ok',       label: 'Cats allowed' },
  { value: 'dogs_ok',       label: 'Dogs allowed' },
  { value: 'cats_and_dogs', label: 'Cats & dogs allowed' },
  { value: 'case_by_case',  label: 'Case by case' },
];

const UTILITIES_OPTIONS = ['Water', 'Trash', 'Gas', 'Electricity', 'Internet'];

const LEASE_TERM_OPTIONS = [
  { value: 'month_to_month', label: 'Month-to-month' },
  { value: '6_months',       label: '6 months' },
  { value: '1_year',         label: '1 year' },
  { value: '2_years',        label: '2 years' },
];

const FIREPLACE_LOCATIONS = [
  'Living room', 'Master bedroom', 'Bedroom', 'Den / family room', 'Multiple',
];

const APPLIANCES_OPTIONS = [
  'Refrigerator', 'Stove / oven', 'Dishwasher', 'Microwave',
  'Garbage disposal', 'Range hood', 'Freezer',
];

const inputCls = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-0';
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [listing, setListing] = useState<LandlordListing | null | undefined>(undefined);
  const [form, setForm] = useState({
    address: '',
    unit: '',
    city: '',
    state: '',
    zip: '',
    title: '',
    description: '',
    price: '',
    bedrooms: '1',
    bathrooms: '1',
    sqft: '',
    propertyType: 'house',
    availableFrom: '',
    virtualTourUrl: '',
    buildingName: '',
    amenities: [] as string[],
    section8Accepted: false as boolean,
    furnished: false as boolean,
    laundryType: '' as string,
    pool: false as boolean,
    poolType: '' as string,
    fireplace: false as boolean,
    fireplaceLocation: '' as string,
    parking: false as boolean,
    parkingSpaces: '' as string,
    parkingType: '' as string,
    airConditioning: false as boolean,
    heatingType: '' as string,
    petsPolicy: '' as string,
    yard: false as boolean,
    yardType: '' as string,
    utilitiesIncluded: [] as string[],
    leaseTerms: [] as string[],
    smokingAllowed: false as boolean,
    appliances: [] as string[],
    isBroker: false as boolean,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getMyListing(id).then((l) => {
      setListing(l);
      if (!l) return;
      setForm({
        ...splitAddressUnit(l.address ?? ''),
        city: l.city ?? '',
        state: l.state ?? '',
        zip: l.zip ?? '',
        title: l.title ?? '',
        description: l.description ?? '',
        price: l.price ? String(l.price) : '',
        bedrooms: l.bedrooms ? String(l.bedrooms) : '1',
        bathrooms: l.bathrooms ? String(l.bathrooms) : '1',
        sqft: l.sqft ? String(l.sqft) : '',
        propertyType: l.property_type ?? 'house',
        availableFrom: l.availableFrom ? String(l.availableFrom).split('T')[0] : '',
        virtualTourUrl: l.virtual_tour_url ?? '',
        buildingName: l.building_name ?? '',
        amenities: l.amenities ?? [],
        section8Accepted: l.section_8_accepted ?? false,
        furnished: l.furnished ?? false,
        laundryType: l.laundry_type ?? '',
        pool: l.pool ?? false,
        poolType: l.pool_type ?? '',
        fireplace: l.fireplace ?? false,
        fireplaceLocation: l.fireplace_location ?? '',
        parking: l.parking ?? false,
        parkingSpaces: l.parking_spaces != null ? String(l.parking_spaces) : '',
        parkingType: l.parking_type ?? '',
        airConditioning: l.air_conditioning ?? false,
        heatingType: l.heating_type ?? '',
        petsPolicy: l.pets_policy ?? '',
        yard: l.yard ?? false,
        yardType: l.yard_type ?? '',
        utilitiesIncluded: l.utilities_included ?? [],
        leaseTerms: l.lease_terms ?? [],
        smokingAllowed: l.smoking_allowed ?? false,
        appliances: l.appliances ?? [],
        isBroker: l.listing_source === 'broker',
      });
    }).catch(() => setListing(null));
  }, [id]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleAmenity(a: string) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  }

  async function handleSave() {
    if (!form.address.trim()) { setError('Street address is required.'); return; }
    if (UNIT_REQUIRED_TYPES.includes(form.propertyType) && !form.unit.trim()) { setError('Unit number is required for this property type.'); return; }
    if (!form.city.trim() || !form.state.trim() || !form.zip.trim()) { setError('City, state, and ZIP are required.'); return; }
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.price || isNaN(+form.price) || +form.price < 100) { setError('Enter a valid monthly rent.'); return; }
    if (form.description.length < 30) { setError('Description must be at least 30 characters.'); return; }
    if (!form.heatingType) { setError('Heating type is required — landlords are legally obligated to disclose heating in most states.'); return; }
    setError('');
    setBusy(true);
    try {
      const result = await updateListing(id, {
        address: form.unit.trim() ? `${form.address.trim()} ${form.unit.trim()}` : form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
        title: form.title,
        description: form.description,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        living_area_sqft: form.sqft ? Number(form.sqft) : null,
        property_type: form.propertyType,
        available_date: form.availableFrom || null,
        virtual_tour_url: form.virtualTourUrl || null,
        building_name: form.buildingName.trim() || null,
        amenities: form.amenities,
        section_8_accepted: form.section8Accepted,
        furnished: form.furnished,
        laundry_type: form.laundryType || null,
        pool: form.pool,
        pool_type: form.pool && form.poolType ? form.poolType : null,
        fireplace: form.fireplace,
        fireplace_location: form.fireplace && form.fireplaceLocation ? form.fireplaceLocation : null,
        parking: form.parking,
        parking_spaces: form.parking && form.parkingSpaces ? Number(form.parkingSpaces) : null,
        parking_type: form.parking && form.parkingType ? form.parkingType : null,
        air_conditioning: form.airConditioning,
        heating_type: form.heatingType || null,
        pets_policy: form.petsPolicy || null,
        yard: form.yard,
        yard_type: form.yard && form.yardType ? form.yardType : null,
        utilities_included: form.utilitiesIncluded,
        lease_terms: form.leaseTerms,
        smoking_allowed: form.smokingAllowed,
        appliances: form.appliances,
        listing_source: form.isBroker ? 'broker' : 'owner',
      });
      setSaved(true);
      setTimeout(() => router.push(`/landlord/properties/${id}`), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save changes.');
    } finally {
      setBusy(false);
    }
  }

  if (listing === undefined) {
    return <p className="py-16 text-center text-gray-500">Loading…</p>;
  }
  if (listing === null) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-semibold text-gray-900">Property not found</p>
        <Link href="/landlord" className="mt-3 inline-block font-semibold text-brand-600">← Back</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/landlord/properties/${id}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        ← Back to property
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Edit listing</h1>
      <p className="mt-1 text-sm text-gray-500">{listing.address}</p>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      )}
      {saved && (
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">Saved! Redirecting…</p>
      )}

      <div className="mt-8 space-y-5">
        {/* Address */}
        <div>
          <label className={labelCls}>Street address *</label>
          <AddressField
            initialValue={form.address}
            onType={(address) => setForm((f) => ({ ...f, address }))}
            onSelect={(address, city, state, zip) => setForm((f) => ({ ...f, address, city, state, zip }))}
          />
        </div>
        {(UNIT_REQUIRED_TYPES.includes(form.propertyType) || UNIT_OPTIONAL_TYPES.includes(form.propertyType)) && (
          <div>
            <label className={labelCls}>
              Unit number {UNIT_REQUIRED_TYPES.includes(form.propertyType) ? '*' : '(optional)'}
            </label>
            <input
              className={inputCls}
              placeholder="e.g. Apt 4, Unit 2B, #301"
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            />
          </div>
        )}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className={labelCls}>City *</label>
            <input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)}
              placeholder="Bakersfield" />
          </div>
          <div>
            <label className={labelCls}>State *</label>
            <input className={inputCls} value={form.state} onChange={(e) => set('state', e.target.value)}
              placeholder="CA" maxLength={2} />
          </div>
          <div>
            <label className={labelCls}>ZIP *</label>
            <input className={inputCls} value={form.zip} onChange={(e) => set('zip', e.target.value)}
              placeholder="93312" />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className={labelCls}>Listing title *</label>
          <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)}
            placeholder="Bright 2BR with parking" />
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description *</label>
          <textarea className={`${inputCls} min-h-[160px] resize-y`} value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describe the home, neighborhood, rules, etc." />
          <p className="mt-1 text-xs text-gray-500">{form.description.length} chars (min 30)</p>
        </div>

        {/* Price & Available from */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Monthly rent ($) *</label>
            <input className={inputCls} type="number" value={form.price}
              onChange={(e) => set('price', e.target.value)} placeholder="1500" />
          </div>
          <div>
            <label className={labelCls}>Available from</label>
            <input className={inputCls} type="date" value={form.availableFrom}
              onChange={(e) => set('availableFrom', e.target.value)} />
          </div>
        </div>

        {/* Property type */}
        <div>
          <label className={labelCls}>Property type</label>
          <select className={inputCls} value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Beds / Baths / Sqft */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Bedrooms</label>
            <select className={inputCls} value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)}>
              {['0','1','2','3','4','5','6'].map((n) => (
                <option key={n} value={n}>{n === '0' ? 'Studio' : n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Bathrooms</label>
            <select className={inputCls} value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)}>
              {['1','1.5','2','2.5','3','4'].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Sq ft</label>
            <input className={inputCls} type="number" value={form.sqft}
              onChange={(e) => set('sqft', e.target.value)} placeholder="900" />
          </div>
        </div>

        {/* Virtual tour */}
        <div>
          <label className={labelCls}>Virtual tour URL <span className="font-normal text-gray-500">(optional)</span></label>
          <input className={inputCls} type="url" value={form.virtualTourUrl}
            onChange={(e) => set('virtualTourUrl', e.target.value)}
            placeholder="https://my.matterport.com/show/?m=..." />
        </div>

        {/* Building name — groups multiple units in landlord dashboard */}
        <div>
          <label className={labelCls}>Building name <span className="font-normal text-gray-500">(optional)</span></label>
          <input
            className={inputCls}
            value={form.buildingName}
            onChange={(e) => set('buildingName', e.target.value)}
            placeholder="e.g. 3133–3137 Hollycrest Dr"
          />
          <p className="mt-1 text-xs text-gray-500">
            Units that share the same building name will be grouped together in your dashboard.
          </p>
        </div>

        {/* Section 8 */}
        <div>
          <p className={labelCls}>Do you accept Section 8 / Housing Choice Vouchers?</p>
          <div className="flex gap-3">
            {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
              <button key={l} type="button" onClick={() => setForm(f => ({ ...f, section8Accepted: v }))}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  form.section8Accepted === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Furnished */}
        <div>
          <p className={labelCls}>Is the unit furnished?</p>
          <div className="flex gap-3">
            {[{ v: true, l: 'Furnished' }, { v: false, l: 'Unfurnished' }].map(({ v, l }) => (
              <button key={l} type="button" onClick={() => setForm(f => ({ ...f, furnished: v }))}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  form.furnished === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Laundry */}
        <div>
          <label htmlFor="edit-laundry-type" className={labelCls}>Washer & Dryer</label>
          <select id="edit-laundry-type" className={inputCls}
            value={form.laundryType} onChange={(e) => setForm(f => ({ ...f, laundryType: e.target.value }))}>
            <option value="">Select laundry option…</option>
            {LAUNDRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Pool */}
        <div>
          <p className={labelCls}>Swimming Pool</p>
          <div className="flex gap-3">
            {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
              <button key={l} type="button"
                onClick={() => setForm(f => ({ ...f, pool: v, poolType: v ? f.poolType : '' }))}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  form.pool === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>{l}</button>
            ))}
          </div>
          {form.pool && (
            <div className="mt-3 flex gap-3">
              {[{ v: 'private', l: 'Private pool' }, { v: 'community', l: 'Community pool' }].map(({ v, l }) => (
                <button key={v} type="button" onClick={() => setForm(f => ({ ...f, poolType: v }))}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                    form.poolType === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>{l}</button>
              ))}
            </div>
          )}
        </div>

        {/* Air Conditioning */}
        <div>
          <p className={labelCls}>Air conditioning?</p>
          <div className="flex gap-3">
            {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
              <button key={l} type="button" onClick={() => setForm(f => ({ ...f, airConditioning: v }))}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  form.airConditioning === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Heating */}
        <div>
          <label htmlFor="edit-heating-type" className={labelCls}>Heating type *</label>
          <select id="edit-heating-type" className={inputCls}
            value={form.heatingType} onChange={(e) => setForm(f => ({ ...f, heatingType: e.target.value }))}>
            <option value="">Select heating type…</option>
            {HEATING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Fireplace */}
        <div>
          <p className={labelCls}>Fireplace?</p>
          <div className="flex gap-3">
            {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
              <button key={l} type="button"
                onClick={() => setForm(f => ({ ...f, fireplace: v, fireplaceLocation: v ? f.fireplaceLocation : '' }))}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  form.fireplace === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>{l}</button>
            ))}
          </div>
          {form.fireplace && (
            <div className="mt-3 flex flex-wrap gap-2">
              <p className="w-full text-xs text-gray-500 font-medium">Where is the fireplace?</p>
              {FIREPLACE_LOCATIONS.map(loc => (
                <button key={loc} type="button"
                  onClick={() => setForm(f => ({ ...f, fireplaceLocation: loc }))}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    form.fireplaceLocation === loc ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>{loc}</button>
              ))}
            </div>
          )}
        </div>

        {/* Parking */}
        <div>
          <p className={labelCls}>Parking available?</p>
          <div className="flex gap-3">
            {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
              <button key={l} type="button"
                onClick={() => setForm(f => ({ ...f, parking: v, parkingSpaces: v ? f.parkingSpaces : '', parkingType: v ? f.parkingType : '' }))}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  form.parking === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>{l}</button>
            ))}
          </div>
          {form.parking && (
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="edit-parking-spaces" className="block text-xs font-semibold text-gray-600 mb-1">Number of parking spaces</label>
                <input id="edit-parking-spaces" type="number" min="1" max="10" className={inputCls} placeholder="e.g. 2"
                  value={form.parkingSpaces} onChange={(e) => setForm(f => ({ ...f, parkingSpaces: e.target.value }))} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Parking type</p>
                <div className="flex flex-wrap gap-2">
                  {PARKING_TYPES.map(o => (
                    <button key={o.value} type="button"
                      onClick={() => setForm(f => ({ ...f, parkingType: o.value }))}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                        form.parkingType === o.value ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}>{o.label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pets */}
        <div>
          <p className={labelCls}>Pets allowed?</p>
          <div className="flex gap-3">
            {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => {
              const isYes = form.petsPolicy !== 'no_pets';
              const active = v ? isYes : !isYes;
              return (
                <button key={l} type="button"
                  onClick={() => setForm(f => ({ ...f, petsPolicy: v ? 'cats_and_dogs' : 'no_pets' }))}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                    active ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>{l}</button>
              );
            })}
          </div>
          {form.petsPolicy !== 'no_pets' && (
            <div className="mt-3 flex flex-wrap gap-2">
              <p className="w-full text-xs font-semibold text-gray-600">Which pets are allowed?</p>
              {PETS_OPTIONS.filter(o => o.value !== 'no_pets').map(o => (
                <button key={o.value} type="button"
                  onClick={() => setForm(f => ({ ...f, petsPolicy: o.value }))}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    form.petsPolicy === o.value ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>{o.label}</button>
              ))}
            </div>
          )}
        </div>

        {/* Yard */}
        <div>
          <p className={labelCls}>Yard / outdoor space?</p>
          <div className="flex gap-3">
            {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
              <button key={l} type="button"
                onClick={() => setForm(f => ({ ...f, yard: v, yardType: v ? f.yardType : '' }))}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  form.yard === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>{l}</button>
            ))}
          </div>
          {form.yard && (
            <div className="mt-3 flex gap-3">
              {[{ v: 'private', l: 'Private yard' }, { v: 'shared', l: 'Shared yard' }].map(({ v, l }) => (
                <button key={v} type="button" onClick={() => setForm(f => ({ ...f, yardType: v }))}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                    form.yardType === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>{l}</button>
              ))}
            </div>
          )}
        </div>

        {/* Utilities included */}
        <div>
          <p className={labelCls}>Utilities included in rent <span className="text-gray-400 font-normal">(select all that apply)</span></p>
          <div className="flex flex-wrap gap-2">
            {UTILITIES_OPTIONS.map(u => (
              <button key={u} type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  utilitiesIncluded: f.utilitiesIncluded.includes(u)
                    ? f.utilitiesIncluded.filter(x => x !== u)
                    : [...f.utilitiesIncluded, u],
                }))}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  form.utilitiesIncluded.includes(u) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>{u}</button>
            ))}
            <button type="button"
              onClick={() => setForm(f => ({ ...f, utilitiesIncluded: f.utilitiesIncluded.includes('None') ? [] : ['None'] }))}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                form.utilitiesIncluded.includes('None') ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}>None included</button>
          </div>
        </div>

        {/* Lease terms */}
        <div>
          <p className={labelCls}>Lease terms offered <span className="text-gray-400 font-normal">(select all that apply)</span></p>
          <div className="flex flex-wrap gap-2">
            {LEASE_TERM_OPTIONS.map(o => (
              <button key={o.value} type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  leaseTerms: f.leaseTerms.includes(o.value)
                    ? f.leaseTerms.filter(x => x !== o.value)
                    : [...f.leaseTerms, o.value],
                }))}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  form.leaseTerms.includes(o.value) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>{o.label}</button>
            ))}
          </div>
        </div>

        {/* Smoking */}
        <div>
          <p className={labelCls}>Smoking allowed?</p>
          <div className="flex gap-3">
            {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
              <button key={l} type="button" onClick={() => setForm(f => ({ ...f, smokingAllowed: v }))}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  form.smokingAllowed === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Appliances */}
        <div>
          <p className={labelCls}>Appliances included <span className="text-gray-400 font-normal">(select all that apply)</span></p>
          <div className="flex flex-wrap gap-2">
            {APPLIANCES_OPTIONS.map(a => (
              <button key={a} type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  appliances: f.appliances.includes(a)
                    ? f.appliances.filter(x => x !== a)
                    : [...f.appliances, a],
                }))}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  form.appliances.includes(a) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>{a}</button>
            ))}
            <button type="button"
              onClick={() => setForm(f => ({ ...f, appliances: f.appliances.includes('None') ? [] : ['None'] }))}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                form.appliances.includes('None') ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}>None included</button>
          </div>
        </div>

        {/* Other Amenities */}
        <div>
          <p className={labelCls}>Other amenities</p>
          <div className="flex flex-wrap gap-2">
            {AMENITIES_LIST.map((a) => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  form.amenities.includes(a)
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Owner / Broker */}
        <div>
          <p className={labelCls}>Are you the property owner or a licensed broker/agent?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isBroker: false }))}
              className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition ${
                !form.isBroker
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              Direct owner
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isBroker: true }))}
              className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition ${
                form.isBroker
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              Licensed broker/agent
            </button>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="mt-8 flex gap-3">
        <button onClick={handleSave} disabled={busy || saved}
          className="flex-1 rounded-xl bg-brand-700 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:opacity-60">
          {busy ? 'Saving…' : 'Save changes'}
        </button>
        <Link href={`/landlord/properties/${id}`}
          className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-400">
          Cancel
        </Link>
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            className="rounded-xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60">
            Delete listing
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-red-700">Are you sure?</span>
            <button
              type="button"
              onClick={async () => {
                setBusy(true);
                try {
                  await deleteListing(id);
                  router.push('/landlord');
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Could not delete listing.');
                  setConfirmDelete(false);
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
              className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60">
              {busy ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-400">
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
