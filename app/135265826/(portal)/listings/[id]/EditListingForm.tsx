'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const UNIT_REQUIRED_TYPES = ['apartment', 'condo'];
const UNIT_OPTIONAL_TYPES = ['townhouse'];

function splitAddressUnit(address: string): { address: string; unit: string } {
  const m = address.match(/^(.*?)\s+((?:apt|unit|#)\s*\S+)$/i);
  if (m) return { address: m[1].trim(), unit: m[2].trim() };
  return { address, unit: '' };
}

function toNum(v: number | string | null | undefined): number | undefined {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house',     label: 'House' },
  { value: 'condo',     label: 'Condominium (Condo)' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'studio',    label: 'Studio' },
  { value: 'adu',       label: 'ADU' },
  { value: 'jadu',      label: 'JADU' },
  { value: 'room',      label: 'Room' },
  { value: 'commercial',label: 'Commercial' },
];

const LAUNDRY_OPTIONS = [
  { value: 'in_unit',     label: 'In-unit washer & dryer' },
  { value: 'hookup',      label: 'Washer & dryer hookup only' },
  { value: 'in_building', label: 'In-building (shared)' },
  { value: 'none',        label: 'No laundry on-site' },
];

const HEATING_OPTIONS = [
  { value: 'forced_air', label: 'Forced air (ducted)' },
  { value: 'central',    label: 'Central heat' },
  { value: 'baseboard',  label: 'Baseboard / electric' },
  { value: 'wall_unit',  label: 'Wall unit heater' },
  { value: 'radiant',    label: 'Radiant / in-floor' },
  { value: 'none',       label: 'No heating' },
];

const PARKING_TYPES = [
  { value: 'garage',   label: 'Garage' },
  { value: 'carport',  label: 'Carport' },
  { value: 'assigned', label: 'Assigned spot' },
  { value: 'lot',      label: 'On-site lot' },
  { value: 'street',   label: 'Street parking' },
];

const PETS_OPTIONS = [
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
const FIREPLACE_LOCATIONS = ['Living room', 'Master bedroom', 'Bedroom', 'Den / family room', 'Multiple'];
const APPLIANCES_OPTIONS = ['Refrigerator', 'Stove / oven', 'Dishwasher', 'Microwave', 'Garbage disposal', 'Range hood', 'Freezer'];
const AMENITIES_LIST = ['Gym', 'Balcony', 'Hardwood floors', 'EV charging', 'Storage'];

interface Listing {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  monthly_rent: number;
  deposit?: number | null;
  bedrooms: number;
  bathrooms: number;
  living_area_sqft: number;
  status: string;
  property_type: string;
  available_date: string;
  landlord_id: string;
  slug: string;
  listing_source?: string | null;
  agent_name?: string | null;
  office_name?: string | null;
  license_number?: string | null;
  virtual_tour_url?: string | null;
  building_name?: string | null;
  section_8_accepted?: boolean | null;
  furnished?: boolean | null;
  laundry_type?: string | null;
  pool?: boolean | null;
  pool_type?: string | null;
  fireplace?: boolean | null;
  fireplace_location?: string | null;
  parking?: boolean | null;
  parking_spaces?: number | null;
  parking_type?: string | null;
  air_conditioning?: boolean | null;
  heating_type?: string | null;
  pets_policy?: string | null;
  yard?: boolean | null;
  yard_type?: string | null;
  utilities_included?: string[] | null;
  lease_terms?: string[] | null;
  smoking_allowed?: boolean | null;
  appliances?: string[] | null;
  amenities?: string[] | null;
}

export default function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: listing.title ?? '',
    description: listing.description ?? '',
    ...splitAddressUnit(listing.address ?? ''),
    city: listing.city ?? '',
    state: listing.state ?? '',
    zip: listing.zip ?? '',
    monthly_rent: listing.monthly_rent ? String(listing.monthly_rent) : '',
    deposit: listing.deposit ? String(listing.deposit) : '',
    bedrooms: listing.bedrooms ? String(listing.bedrooms) : '',
    bathrooms: listing.bathrooms ? String(listing.bathrooms) : '',
    living_area_sqft: listing.living_area_sqft ? String(listing.living_area_sqft) : '',
    status: listing.status ?? 'active',
    property_type: listing.property_type ?? 'apartment',
    available_date: listing.available_date ? listing.available_date.slice(0, 10) : '',
    listing_source: listing.listing_source ?? 'owner',
    agent_name: listing.agent_name ?? '',
    office_name: listing.office_name ?? '',
    license_number: listing.license_number ?? '',
    virtual_tour_url: listing.virtual_tour_url ?? '',
    building_name: listing.building_name ?? '',
    section_8_accepted: listing.section_8_accepted ?? false,
    furnished: listing.furnished ?? false,
    laundry_type: listing.laundry_type ?? '',
    pool: listing.pool ?? false,
    pool_type: listing.pool_type ?? '',
    fireplace: listing.fireplace ?? false,
    fireplace_location: listing.fireplace_location ?? '',
    parking: listing.parking ?? false,
    parking_spaces: listing.parking_spaces ? String(listing.parking_spaces) : '',
    parking_type: listing.parking_type ?? '',
    air_conditioning: listing.air_conditioning ?? false,
    heating_type: listing.heating_type ?? '',
    pets_policy: listing.pets_policy ?? 'no_pets',
    yard: listing.yard ?? false,
    yard_type: listing.yard_type ?? '',
    utilities_included: listing.utilities_included ?? [] as string[],
    lease_terms: listing.lease_terms ?? [] as string[],
    smoking_allowed: listing.smoking_allowed ?? false,
    appliances: listing.appliances ?? [] as string[],
    amenities: listing.amenities ?? [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const f = 'bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-green-500 w-full';
  const lbl = 'block text-[11px] uppercase tracking-wider text-gray-400 mb-1';

  function set(key: string, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  function toggle(key: 'utilities_included' | 'lease_terms' | 'appliances' | 'amenities', val: string) {
    setForm(prev => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
    setSuccess(false);
  }

  function pill(active: boolean) {
    return `rounded-full border px-4 py-1.5 text-sm font-medium transition cursor-pointer ${
      active ? 'border-green-500 bg-green-900/30 text-green-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'
    }`;
  }

  function yesno(key: string, val: boolean) {
    return `rounded-full border px-5 py-2 text-sm font-medium transition cursor-pointer ${
      (form as Record<string, unknown>)[key] === val ? 'border-green-500 bg-green-900/30 text-green-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'
    }`;
  }

  async function save() {
    if (!form.heating_type) { setError('Heating type is required — legally required disclosure in most states.'); return; }
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const body = {
        ...form,
        address: form.unit.trim() ? `${form.address.trim()} ${form.unit.trim()}` : form.address.trim(),
        monthly_rent: toNum(form.monthly_rent),
        deposit: toNum(form.deposit),
        bedrooms: toNum(form.bedrooms),
        bathrooms: toNum(form.bathrooms),
        living_area_sqft: toNum(form.living_area_sqft),
        parking_spaces: toNum(form.parking_spaces),
        // Convert empty strings to null for constrained columns
        heating_type: form.heating_type || null,
        laundry_type: form.laundry_type || null,
        virtual_tour_url: form.virtual_tour_url || null,
        building_name: form.building_name || null,
        agent_name: form.agent_name || null,
        office_name: form.office_name || null,
        license_number: form.license_number || null,
        pool_type: form.pool ? form.pool_type || null : null,
        fireplace_location: form.fireplace ? form.fireplace_location || null : null,
        parking_type: form.parking ? form.parking_type || null : null,
        yard_type: form.yard ? form.yard_type || null : null,
      };
      const res = await fetch(`/api/admin/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Save failed');
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  const section = 'rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4';
  const h2 = 'text-sm font-bold text-white mb-4';

  return (
    <div className="space-y-6">

      {/* Status */}
      <div className={section}>
        <h2 className={h2}>Status</h2>
        <div>
          <label className={lbl}>Listing Status</label>
          <select className={f} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="rented">Rented</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div className={section}>
        <h2 className={h2}>Address</h2>
        <div>
          <label className={lbl}>Street Address</label>
          <input className={f} value={form.address} onChange={e => set('address', e.target.value)} />
        </div>
        {(UNIT_REQUIRED_TYPES.includes(form.property_type) || UNIT_OPTIONAL_TYPES.includes(form.property_type)) && (
          <div>
            <label className={lbl}>Unit Number {UNIT_REQUIRED_TYPES.includes(form.property_type) ? '*' : '(optional)'}</label>
            <input className={f} placeholder="e.g. Apt 4, Unit 2B, #301" value={form.unit} onChange={e => set('unit', e.target.value)} />
          </div>
        )}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className={lbl}>City</label>
            <input className={f} value={form.city} onChange={e => set('city', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>State</label>
            <input className={f} value={form.state} onChange={e => set('state', e.target.value)} maxLength={2} />
          </div>
          <div>
            <label className={lbl}>ZIP</label>
            <input className={f} value={form.zip} onChange={e => set('zip', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Listing Details */}
      <div className={section}>
        <h2 className={h2}>Listing Details</h2>
        <div>
          <label className={lbl}>Title</label>
          <input className={f} value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Description</label>
          <textarea className={f + ' min-h-[140px] resize-y'} value={form.description} onChange={e => set('description', e.target.value)} />
          <p className="mt-1 text-xs text-gray-500">{form.description.length} chars</p>
        </div>
        <div>
          <label className={lbl}>Virtual Tour URL</label>
          <input className={f} type="url" value={form.virtual_tour_url} onChange={e => set('virtual_tour_url', e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className={lbl}>Building Name (groups units in dashboard)</label>
          <input className={f} value={form.building_name} onChange={e => set('building_name', e.target.value)} />
        </div>
      </div>

      {/* Pricing & Specs */}
      <div className={section}>
        <h2 className={h2}>Pricing & Specs</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Monthly Rent ($)</label>
            <input className={f} type="number" value={form.monthly_rent} onChange={e => set('monthly_rent', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Security Deposit ($)</label>
            <input className={f} type="number" value={form.deposit} onChange={e => set('deposit', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Available From</label>
            <input className={f} type="date" value={form.available_date} onChange={e => set('available_date', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Bedrooms</label>
            <select className={f} value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
              {['0','1','2','3','4','5','6'].map(n => <option key={n} value={n}>{n === '0' ? 'Studio' : n}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Bathrooms</label>
            <select className={f} value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}>
              {['1','1.5','2','2.5','3','4'].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Sq Ft</label>
            <input className={f} type="number" value={form.living_area_sqft} onChange={e => set('living_area_sqft', e.target.value)} />
          </div>
        </div>
        <div>
          <label className={lbl}>Property Type</label>
          <select className={f} value={form.property_type} onChange={e => set('property_type', e.target.value)}>
            {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Features */}
      <div className={section}>
        <h2 className={h2}>Features & Amenities</h2>

        {/* Section 8 */}
        <div>
          <p className={lbl}>Section 8 / Housing Vouchers</p>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <button key={String(v)} type="button" onClick={() => set('section_8_accepted', v)} className={yesno('section_8_accepted', v)}>
                {v ? 'Accepted' : 'Not accepted'}
              </button>
            ))}
          </div>
        </div>

        {/* Furnished */}
        <div>
          <p className={lbl}>Furnished</p>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <button key={String(v)} type="button" onClick={() => set('furnished', v)} className={yesno('furnished', v)}>
                {v ? 'Furnished' : 'Unfurnished'}
              </button>
            ))}
          </div>
        </div>

        {/* Laundry */}
        <div>
          <label className={lbl}>Washer & Dryer</label>
          <select className={f} value={form.laundry_type} onChange={e => set('laundry_type', e.target.value)}>
            <option value="">Select…</option>
            {LAUNDRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Air conditioning */}
        <div>
          <p className={lbl}>Air Conditioning</p>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <button key={String(v)} type="button" onClick={() => set('air_conditioning', v)} className={yesno('air_conditioning', v)}>
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>

        {/* Heating */}
        <div>
          <label className={lbl}>Heating Type *</label>
          <select className={`${f} ${!form.heating_type ? 'border-red-600' : ''}`} value={form.heating_type} onChange={e => set('heating_type', e.target.value)}>
            <option value="">Select heating type…</option>
            {HEATING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Pool */}
        <div>
          <p className={lbl}>Swimming Pool</p>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <button key={String(v)} type="button" onClick={() => set('pool', v)} className={yesno('pool', v)}>
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
          {form.pool && (
            <div className="mt-2 flex gap-3">
              {[{ v: 'private', l: 'Private' }, { v: 'community', l: 'Community' }].map(({ v, l }) => (
                <button key={v} type="button" onClick={() => set('pool_type', v)} className={pill(form.pool_type === v)}>{l}</button>
              ))}
            </div>
          )}
        </div>

        {/* Fireplace */}
        <div>
          <p className={lbl}>Fireplace</p>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <button key={String(v)} type="button" onClick={() => set('fireplace', v)} className={yesno('fireplace', v)}>
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
          {form.fireplace && (
            <div className="mt-2 flex flex-wrap gap-2">
              {FIREPLACE_LOCATIONS.map(loc => (
                <button key={loc} type="button" onClick={() => set('fireplace_location', loc)} className={pill(form.fireplace_location === loc)}>{loc}</button>
              ))}
            </div>
          )}
        </div>

        {/* Parking */}
        <div>
          <p className={lbl}>Parking</p>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <button key={String(v)} type="button" onClick={() => set('parking', v)} className={yesno('parking', v)}>
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
          {form.parking && (
            <div className="mt-3 space-y-3">
              <div>
                <label className={lbl}>Parking spaces</label>
                <input className={f} type="number" min="1" max="10" value={form.parking_spaces} onChange={e => set('parking_spaces', e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-2">
                {PARKING_TYPES.map(o => (
                  <button key={o.value} type="button" onClick={() => set('parking_type', o.value)} className={pill(form.parking_type === o.value)}>{o.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pets */}
        <div>
          <p className={lbl}>Pets Allowed</p>
          <div className="flex gap-3 mb-2">
            {[true, false].map(v => {
              const isYes = form.pets_policy !== 'no_pets';
              return (
                <button key={String(v)} type="button"
                  onClick={() => set('pets_policy', v ? 'cats_and_dogs' : 'no_pets')}
                  className={pill(v ? isYes : !isYes)}>
                  {v ? 'Yes' : 'No'}
                </button>
              );
            })}
          </div>
          {form.pets_policy !== 'no_pets' && (
            <div className="flex flex-wrap gap-2">
              {PETS_OPTIONS.map(o => (
                <button key={o.value} type="button" onClick={() => set('pets_policy', o.value)} className={pill(form.pets_policy === o.value)}>{o.label}</button>
              ))}
            </div>
          )}
        </div>

        {/* Yard */}
        <div>
          <p className={lbl}>Yard / Outdoor Space</p>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <button key={String(v)} type="button" onClick={() => set('yard', v)} className={yesno('yard', v)}>
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
          {form.yard && (
            <div className="mt-2 flex gap-3">
              {[{ v: 'private', l: 'Private' }, { v: 'shared', l: 'Shared' }].map(({ v, l }) => (
                <button key={v} type="button" onClick={() => set('yard_type', v)} className={pill(form.yard_type === v)}>{l}</button>
              ))}
            </div>
          )}
        </div>

        {/* Smoking */}
        <div>
          <p className={lbl}>Smoking Allowed</p>
          <div className="flex gap-3">
            {[true, false].map(v => (
              <button key={String(v)} type="button" onClick={() => set('smoking_allowed', v)} className={yesno('smoking_allowed', v)}>
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>

        {/* Utilities */}
        <div>
          <p className={lbl}>Utilities Included in Rent</p>
          <div className="flex flex-wrap gap-2">
            {UTILITIES_OPTIONS.map(u => (
              <button key={u} type="button" onClick={() => toggle('utilities_included', u)} className={pill(form.utilities_included.includes(u))}>{u}</button>
            ))}
            <button type="button" onClick={() => toggle('utilities_included', 'None')} className={pill(form.utilities_included.includes('None'))}>None</button>
          </div>
        </div>

        {/* Lease terms */}
        <div>
          <p className={lbl}>Lease Terms</p>
          <div className="flex flex-wrap gap-2">
            {LEASE_TERM_OPTIONS.map(o => (
              <button key={o.value} type="button" onClick={() => toggle('lease_terms', o.value)} className={pill(form.lease_terms.includes(o.value))}>{o.label}</button>
            ))}
          </div>
        </div>

        {/* Appliances */}
        <div>
          <p className={lbl}>Appliances Included</p>
          <div className="flex flex-wrap gap-2">
            {APPLIANCES_OPTIONS.map(a => (
              <button key={a} type="button" onClick={() => toggle('appliances', a)} className={pill(form.appliances.includes(a))}>{a}</button>
            ))}
            <button type="button" onClick={() => toggle('appliances', 'None')} className={pill(form.appliances.includes('None'))}>None</button>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <p className={lbl}>Other Amenities</p>
          <div className="flex flex-wrap gap-2">
            {AMENITIES_LIST.map(a => (
              <button key={a} type="button" onClick={() => toggle('amenities', a)} className={pill(form.amenities.includes(a))}>{a}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Listing Source & Broker */}
      <div className={section}>
        <h2 className={h2}>Listing Source & Broker</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Listing Source</label>
            <select className={f} value={form.listing_source} onChange={e => set('listing_source', e.target.value)}>
              <option value="owner">Owner</option>
              <option value="broker">Broker / Agent</option>
              <option value="mls">MLS</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Agent / Broker Name</label>
            <input className={f} value={form.agent_name} onChange={e => set('agent_name', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Office / Brokerage</label>
            <input className={f} value={form.office_name} onChange={e => set('office_name', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>License Number</label>
            <input className={f} value={form.license_number} onChange={e => set('license_number', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pb-8">
        <button onClick={save} disabled={saving}
          className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {listing.slug && (
          <a href={`/rentals/${listing.slug}`} target="_blank" className="text-sm text-green-400 hover:text-green-300 transition">
            View Listing ↗
          </a>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">Saved successfully.</p>}
      </div>
    </div>
  );
}
