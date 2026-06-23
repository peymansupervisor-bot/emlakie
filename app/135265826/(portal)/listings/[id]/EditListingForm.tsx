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
  sqft: number;
  status: string;
  property_type: string;
  available_from: string;
  pets_allowed: boolean;
  parking: string;
  landlord_id: string;
  slug: string;
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
    sqft: listing.sqft ?? '',
    status: listing.status ?? 'active',
    property_type: listing.property_type ?? 'apartment',
    available_from: listing.available_from ? listing.available_from.slice(0, 10) : '',
    pets_allowed: listing.pets_allowed ?? false,
    parking: listing.parking ?? '',
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
          monthly_rent: Number(form.monthly_rent) || null,
          bedrooms: Number(form.bedrooms) || null,
          bathrooms: Number(form.bathrooms) || null,
          sqft: Number(form.sqft) || null,
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

  function set(k: string, v: string | boolean) {
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
            <input className={field} type="number" value={form.sqft} onChange={e => set('sqft', e.target.value)} />
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
            <input className={field} type="date" value={form.available_from} onChange={e => set('available_from', e.target.value)} />
          </div>
          <div>
            <label className={label}>Parking</label>
            <input className={field} value={form.parking} onChange={e => set('parking', e.target.value)} placeholder="e.g. 1 garage, street" />
          </div>
          <div className="flex items-center gap-3 mt-4">
            <input
              id="pets"
              type="checkbox"
              checked={form.pets_allowed}
              onChange={e => set('pets_allowed', e.target.checked)}
              className="w-4 h-4 accent-green-500"
            />
            <label htmlFor="pets" className="text-sm text-gray-300">Pets Allowed</label>
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
