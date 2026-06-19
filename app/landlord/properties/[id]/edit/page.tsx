'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { deleteListing, getMyListing, updateListing } from '@/lib/landlord/client';
import { LandlordListing } from '@/lib/landlord/types';
import AddressField from '@/components/AddressField';

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
  'Air conditioning', 'Heating', 'In-unit laundry', 'Laundry in building',
  'Dishwasher', 'Parking', 'Garage', 'Pet-friendly', 'Pool', 'Gym',
  'Balcony', 'Furnished', 'Hardwood floors', 'EV charging', 'Storage',
];

const inputCls = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-0';
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [listing, setListing] = useState<LandlordListing | null | undefined>(undefined);
  const [form, setForm] = useState({
    address: '',
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
    amenities: [] as string[],
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
        address: l.address ?? '',
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
        amenities: l.amenities ?? [],
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
    if (!form.city.trim() || !form.state.trim() || !form.zip.trim()) { setError('City, state, and ZIP are required.'); return; }
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.price || isNaN(+form.price) || +form.price < 100) { setError('Enter a valid monthly rent.'); return; }
    if (form.description.length < 30) { setError('Description must be at least 30 characters.'); return; }
    setError('');
    setBusy(true);
    try {
      const result = await updateListing(id, {
        address: form.address.trim(),
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
        amenities: form.amenities,
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

        {/* Amenities */}
        <div>
          <p className={labelCls}>Amenities</p>
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
          className="flex-1 rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
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
