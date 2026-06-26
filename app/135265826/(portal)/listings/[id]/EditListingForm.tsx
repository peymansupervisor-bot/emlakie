'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Listing {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  monthly_rent: number;
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
}

function toNum(v: number | string): number | undefined {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

export default function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: listing.title ?? '',
    description: listing.description ?? '',
    address: listing.address ?? '',
    city: listing.city ?? '',
    state: listing.state ?? '',
    zip: listing.zip ?? '',
    monthly_rent: listing.monthly_rent ?? '',
    bedrooms: listing.bedrooms ?? '',
    bathrooms: listing.bathrooms ?? '',
    living_area_sqft: listing.living_area_sqft ?? '',
    status: listing.status ?? 'active',
    property_type: listing.property_type ?? 'apartment',
    available_date: listing.available_date ? listing.available_date.slice(0, 10) : '',
    listing_source: listing.listing_source ?? 'owner',
    agent_name: listing.agent_name ?? '',
    office_name: listing.office_name ?? '',
    license_number: listing.license_number ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const field = 'bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-green-500 w-full';
  const label = 'block text-[11px] uppercase tracking-wider text-gray-400 mb-1';

  async function save() {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch(`/api/admin/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          monthly_rent: toNum(form.monthly_rent),
          bedrooms: toNum(form.bedrooms),
          bathrooms: toNum(form.bathrooms),
          living_area_sqft: toNum(form.living_area_sqft),
        }),
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

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setSuccess(false);
  }

  return (
    <div className="space-y-6">
      {/* Core details */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-sm font-bold text-white mb-4">Listing Details</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={label}>Title</label>
            <input className={field} value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className={label}>Description</label>
            <textarea className={field + ' min-h-[120px] resize-y'} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-sm font-bold text-white mb-4">Address</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={label}>Street Address</label>
            <input className={field} value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div>
            <label className={label}>City</label>
            <input className={field} value={form.city} onChange={e => set('city', e.target.value)} />
          </div>
          <div>
            <label className={label}>State</label>
            <input className={field} value={form.state} onChange={e => set('state', e.target.value)} maxLength={2} />
          </div>
          <div>
            <label className={label}>ZIP</label>
            <input className={field} value={form.zip} onChange={e => set('zip', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Pricing & specs */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-sm font-bold text-white mb-4">Pricing & Specs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={label}>Rent ($/mo)</label>
            <input className={field} type="number" value={form.monthly_rent} onChange={e => set('monthly_rent', e.target.value)} />
          </div>
          <div>
            <label className={label}>Bedrooms</label>
            <input className={field} type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} />
          </div>
          <div>
            <label className={label}>Bathrooms</label>
            <input className={field} type="number" step="0.5" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} />
          </div>
          <div>
            <label className={label}>Sq Ft</label>
            <input className={field} type="number" value={form.living_area_sqft} onChange={e => set('living_area_sqft', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Status & type */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-sm font-bold text-white mb-4">Status & Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={label}>Status</label>
            <select className={field} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="rented">Rented</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className={label}>Property Type</label>
            <select className={field} value={form.property_type} onChange={e => set('property_type', e.target.value)}>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="studio">Studio</option>
              <option value="townhouse">Townhouse</option>
              <option value="room">Room</option>
              <option value="adu">ADU</option>
              <option value="jadu">JADU</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          <div>
            <label className={label}>Available From</label>
            <input className={field} type="date" value={form.available_date} onChange={e => set('available_date', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Broker / agent info */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-sm font-bold text-white mb-4">Listing Source & Broker</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Listing Source</label>
            <select className={field} value={form.listing_source} onChange={e => set('listing_source', e.target.value)}>
              <option value="owner">Owner</option>
              <option value="broker">Broker / Agent</option>
              <option value="mls">MLS</option>
            </select>
          </div>
          <div>
            <label className={label}>Agent / Broker Name</label>
            <input className={field} value={form.agent_name} onChange={e => set('agent_name', e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <label className={label}>Office / Brokerage Name</label>
            <input className={field} value={form.office_name} onChange={e => set('office_name', e.target.value)} placeholder="Brokerage name" />
          </div>
          <div>
            <label className={label}>License Number</label>
            <input className={field} value={form.license_number} onChange={e => set('license_number', e.target.value)} placeholder="DRE #" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {listing.slug && (
          <a
            href={`/rentals/${listing.slug}`}
            target="_blank"
            className="text-sm text-green-400 hover:text-green-300 transition"
          >
            View Listing ↗
          </a>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">Saved successfully.</p>}
      </div>
    </div>
  );
}
