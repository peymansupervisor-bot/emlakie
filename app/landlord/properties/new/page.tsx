'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { createListing } from '@/lib/landlord/client';
import { supabase } from '@/lib/supabase';

const PROPERTY_TYPES = [
  { value: 'house',     label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo',     label: 'Condominium (Condo)' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'studio',    label: 'Studio' },
  { value: 'adu',       label: 'ADU (Accessory Dwelling Unit)' },
  { value: 'jadu',      label: 'JADU (Junior ADU)' },
  { value: 'room',      label: 'Room' },
];

// Studio ownership choices — determines E-sale Value™ eligibility
const STUDIO_OWNERSHIP = [
  { value: 'apartment', label: 'Apartment unit (part of a multi-unit building, rental only)' },
  { value: 'condo',     label: 'Condominium (has its own deed, can be sold)' },
];
const AMENITIES_LIST = [
  'Air conditioning', 'Heating', 'In-unit laundry', 'Laundry in building',
  'Dishwasher', 'Parking', 'Garage', 'Pet-friendly', 'Pool', 'Gym',
  'Balcony', 'Furnished', 'Hardwood floors', 'EV charging', 'Storage',
];

type Step = 1 | 2 | 3 | 4;

// Compress a photo in the browser before upload so the multipart body stays
// well under Vercel's 4.5 MB serverless request limit. The server runs sharp
// again for final quality tuning, but this pre-pass is what prevents 413s.
async function compressBrowser(file: File): Promise<File> {
  const MAX_PX = 1920;
  const QUALITY = 0.82;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file),
        'image/jpeg',
        QUALITY,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

interface FormData {
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
  ownershipType: string;   // only required when propertyType === 'studio'
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  price: string;
  availableFrom: string;
  title: string;
  description: string;
  amenities: string[];
  isBroker: boolean | null;
  licenseNumber: string;
  virtualTourUrl: string;
}

const empty: FormData = {
  address: '', city: '', state: '', zip: '',
  propertyType: 'house', ownershipType: '',
  bedrooms: '1', bathrooms: '1',
  sqft: '', price: '', availableFrom: '',
  title: '', description: '', amenities: [],
  isBroker: null,
  licenseNumber: '',
  virtualTourUrl: '',
};

const inputCls = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-0';
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1';

type NominatimSuggestion = { display: string; address: string; city: string; state: string; zip: string };

function AddressField({ onSelect, onType, id }: {
  onSelect: (address: string, city: string, state: string, zip: string) => void;
  onType: (address: string) => void;
  id?: string;
}) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function lookup(val: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.length < 4) { setSuggestions([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      try {
        const q = encodeURIComponent(`${val}, USA`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${q}&format=json&addressdetails=1&limit=5&countrycodes=us`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const results: NominatimSuggestion[] = data
          .map((r: any) => {
            const a = r.address ?? {};
            const streetNum = a.house_number ?? '';
            const road = a.road ?? '';
            const street = [streetNum, road].filter(Boolean).join(' ');
            const city = a.city ?? a.town ?? a.village ?? '';
            const state = a['ISO3166-2-lvl4']?.split('-')[1] ?? a.state ?? '';
            const zip = a.postcode ?? '';
            return { display: r.display_name, address: street, city, state, zip };
          })
          .filter((r: NominatimSuggestion) => r.address);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch { setSuggestions([]); setOpen(false); }
    }, 350);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    onType(v);
    lookup(v);
  }

  function handleSelect(s: NominatimSuggestion) {
    setValue(s.address);
    setSuggestions([]);
    setOpen(false);
    onSelect(s.address, s.city, s.state, s.zip);
  }

  return (
    <div className="relative">
      <input
        id={id}
        className={inputCls}
        placeholder="123 Main St"
        value={value}
        autoComplete="off"
        onChange={handleChange}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li key={i}
              onMouseDown={() => handleSelect(s)}
              className="cursor-pointer px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 first:rounded-t-xl last:rounded-b-xl">
              <span className="font-medium">{s.address}</span>
              <span className="ml-2 text-xs text-gray-500">{s.city}{s.state ? `, ${s.state}` : ''}{s.zip ? ` ${s.zip}` : ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function NewPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(empty);

  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filterWarnings, setFilterWarnings] = useState<{term: string; reason: string; law: string; suggestion: string}[]>([]);
  const [filterChecking, setFilterChecking] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const filterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function checkContent(text: string) {
    if (!text.trim()) { setFilterWarnings([]); return; }
    setFilterChecking(true);
    try {
      const res = await fetch('/api/validate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.status === 422) {
        const data = await res.json();
        setFilterWarnings(data.violations.map((v: { term: string; reason: string; law: string; suggestion: string }) => ({
          term: v.term, reason: v.reason, law: v.law, suggestion: v.suggestion,
        })));
      } else {
        setFilterWarnings([]);
      }
    } catch {
      // silently ignore network errors during check
    } finally {
      setFilterChecking(false);
    }
  }

  function set(field: keyof FormData, value: string | boolean | null) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === 'title' || field === 'description') {
      if (filterTimer.current) clearTimeout(filterTimer.current);
      filterTimer.current = setTimeout(() => {
        const updated = field === 'title'
          ? `${value} ${form.description}`
          : `${form.title} ${value}`;
        checkContent(updated);
      }, 600);
    }
  }

  async function generateDescription() {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/listings/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: form.address,
          city: form.city,
          state: form.state,
          propertyType: form.propertyType,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          sqft: form.sqft,
          price: form.price,
          amenities: form.amenities,
        }),
      });
      if (res.ok) {
        const { description } = await res.json();
        set('description', description);
      }
    } catch {
      // silently ignore — landlord can still write manually
    } finally {
      setAiGenerating(false);
    }
  }

  function toggleAmenity(a: string) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setPhotos((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  }

  function removePhoto(i: number) {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  }

  function validateStep(): string {
    if (step === 1) {
      if (form.isBroker === null) return 'Please tell us whether you are the property owner or a licensed broker.';
      if (form.isBroker) {
        const parts = form.licenseNumber.trim().split(' ');
        if (parts.length < 2 || !parts[0] || !parts[1]) return 'Please select your license state and enter your license number.';
      }
      if (!form.address.trim()) return 'Address is required.';
      if (!form.city.trim()) return 'City is required.';
      if (!form.state.trim()) return 'State is required.';
      if (!form.price.trim() || isNaN(+form.price) || +form.price < 100) return 'Enter a valid monthly rent.';
      if (form.propertyType === 'studio' && !form.ownershipType) return 'Please specify whether this studio is an apartment unit or a condominium.';
    }
    if (step === 2) {
      if (!form.title.trim()) return 'Add a listing title.';
      if (form.description.length < 30) return 'Description must be at least 30 characters.';
      if (filterWarnings.length > 0) return 'Please remove the flagged language before continuing.';
    }
    // photo minimum temporarily disabled for debugging
    return '';
  }

  function next() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => (s + 1) as Step);
  }

  async function submit() {
    setBusy(true);
    setError('');
    try {
      // ── Step 1: get auth user ──────────────────────────────────────────────
      console.log('[submit] step 1: getting auth user');
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? 'anon';
      console.log('[submit] uid:', uid);

      // ── Step 2: upload photos to Supabase Storage directly ────────────────
      console.log('[submit] step 2: uploading', photos.length, 'photos directly to Supabase Storage');
      const photoUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        console.log(`[submit] uploading photo ${i + 1}/${photos.length}: ${file.name} (${(file.size / 1024).toFixed(0)} KB, compression disabled)`);
        const blob = file;
        const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error: upErr } = await supabase.storage
          .from('listing-photos')
          .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
        if (upErr) {
          console.error(`[submit] Supabase storage upload failed for photo ${i + 1}:`, upErr);
          throw new Error(`Photo ${i + 1} upload failed: ${upErr.message}`);
        }
        const url = supabase.storage.from('listing-photos').getPublicUrl(path).data.publicUrl;
        console.log(`[submit] photo ${i + 1} uploaded → ${url}`);
        photoUrls.push(url);
      }
      console.log('[submit] all photos uploaded, URLs:', photoUrls);

      // ── Step 3: build FormData with text fields + URLs only ───────────────
      console.log('[submit] step 3: building FormData (text + URL strings only, no binary)');
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('address', form.address);
      fd.append('city', form.city);
      fd.append('state', form.state);
      fd.append('zip', form.zip);
      fd.append('price', form.price);
      fd.append('bedrooms', form.bedrooms);
      fd.append('bathrooms', form.bathrooms);
      fd.append('sqft', form.sqft);
      fd.append('propertyType', form.propertyType);
      fd.append('availableFrom', form.availableFrom);
      fd.append('amenities', JSON.stringify(form.amenities));
      fd.append('listingSource', form.isBroker ? 'broker' : 'owner');
      if (form.isBroker && form.licenseNumber.trim()) fd.append('licenseNumber', form.licenseNumber.trim());
      if (form.ownershipType) fd.append('ownershipType', form.ownershipType);
      if (form.virtualTourUrl.trim()) fd.append('virtualTourUrl', form.virtualTourUrl.trim());
      photoUrls.forEach((url) => fd.append('photoUrl', url));
      console.log('[submit] FormData entries:', [...fd.keys()]);

      // ── Step 4: POST to /api/listings ──────────────────────────────────────
      console.log('[submit] step 4: POST /api/listings');
      await createListing(fd);
      console.log('[submit] listing created successfully');
      router.push('/landlord?created=1');
    } catch (e) {
      console.error('[submit] FAILED:', e);
      setError(e instanceof Error ? e.message : 'Could not publish the listing. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const steps = ['Property details', 'Description', 'Photos', 'Review'];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back */}
      <button onClick={() => step === 1 ? router.push('/landlord') : setStep((s) => (s - 1) as Step)}
        className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        ← {step === 1 ? 'All properties' : 'Back'}
      </button>

      <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Add a property</h1>

      {/* Step indicator */}
      <div className="mt-6 flex items-center gap-2">
        {steps.map((label, i) => {
          const n = (i + 1) as Step;
          const done = n < step;
          const active = n === step;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                done ? 'bg-brand-600 text-white' : active ? 'border-2 border-brand-600 text-brand-700' : 'border border-gray-300 text-gray-500'
              }`}>
                {done ? '✓' : n}
              </div>
              <span className={`hidden text-xs font-semibold sm:block ${active ? 'text-brand-700' : 'text-gray-500'}`}>
                {label}
              </span>
              {i < steps.length - 1 && <div className="h-px w-6 bg-gray-200" />}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      )}

      {/* Step 1: Property details */}
      {step === 1 && (
        <div className="mt-8 space-y-5">
          {/* Broker / Owner question */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">Are you the property owner or a licensed real estate broker/agent? *</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => set('isBroker', false)}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                  form.isBroker === false
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                🏠 Property Owner
                <span className="block text-xs font-normal mt-0.5 text-current opacity-70">I own this property directly</span>
              </button>
              <button
                type="button"
                onClick={() => set('isBroker', true)}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                  form.isBroker === true
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                🪪 Broker / Agent
                <span className="block text-xs font-normal mt-0.5 text-current opacity-70">I'm a licensed real estate professional</span>
              </button>
            </div>
            {form.isBroker === true && (
              <div className="mt-3 rounded-lg bg-blue-50 px-3 py-3 space-y-2">
                <p className="text-xs text-blue-700">
                  Your listing will be labeled <strong>Broker Listed</strong> so renters know it&apos;s professionally represented.
                </p>
                <div>
                  <p className="text-xs font-semibold text-blue-800 mb-1">Real estate license number *</p>
                  <div className="flex gap-2">
                    <select
                      value={form.licenseNumber.split(' ')[0] ?? ''}
                      onChange={(e) => {
                        const num = form.licenseNumber.split(' ').slice(1).join(' ');
                        set('licenseNumber', `${e.target.value} ${num}`.trim());
                      }}
                      aria-label="License state"
                      className="w-20 shrink-0 rounded-lg border border-blue-200 bg-white px-2 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    >
                      <option value="">State</option>
                      {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={form.licenseNumber.split(' ').slice(1).join(' ')}
                      onChange={(e) => {
                        const state = form.licenseNumber.split(' ')[0] ?? '';
                        set('licenseNumber', `${state} ${e.target.value.toUpperCase()}`.trim());
                      }}
                      placeholder="01234567"
                      aria-label="License number"
                      className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 placeholder-gray-400"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-blue-600">Displayed on your listing as required by law — e.g. CA 01726653</p>
                </div>
              </div>
            )}
            {form.isBroker === false && (
              <p className="mt-3 text-xs text-brand-700 bg-brand-50 rounded-lg px-3 py-2">
                Your listing will show an <strong>Owner Direct</strong> badge — renters love going straight to the source.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="new-address" className={labelCls}>Street address *</label>
            <AddressField
              id="new-address"
              onSelect={(address, city, state, zip) =>
                setForm((f) => ({ ...f, address, city, state, zip }))
              }
              onType={(address) => setForm((f) => ({ ...f, address }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-city" className={labelCls}>City *</label>
              <input id="new-city" className={inputCls} placeholder="Austin" value={form.city}
                onChange={(e) => set('city', e.target.value)} />
            </div>
            <div>
              <label htmlFor="new-state" className={labelCls}>State *</label>
              <input id="new-state" className={inputCls} placeholder="TX" maxLength={2}
                value={form.state} onChange={(e) => set('state', e.target.value.toUpperCase())} />
            </div>
          </div>
          <div>
            <label htmlFor="new-zip" className={labelCls}>ZIP code</label>
            <input id="new-zip" className={inputCls} placeholder="78745" maxLength={5} value={form.zip}
              onChange={(e) => set('zip', e.target.value)} />
          </div>
          <div>
            <label htmlFor="new-property-type" className={labelCls}>Property type</label>
            <select id="new-property-type" className={inputCls} value={form.propertyType}
              onChange={(e) => set('propertyType', e.target.value)}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Studio ownership clarification — required for accurate E-sale Value™ */}
          {form.propertyType === 'studio' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Is this studio an apartment or a condominium? *
              </label>
              <p className="text-xs text-amber-700 mb-3">
                This helps EMLAKIE accurately show the E-sale Value™ estimate. Studios in apartment
                buildings cannot be sold individually — only condominiums can.
              </p>
              <div className="space-y-2">
                {STUDIO_OWNERSHIP.map((o) => (
                  <label key={o.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="ownershipType"
                      value={o.value}
                      checked={form.ownershipType === o.value}
                      onChange={(e) => set('ownershipType', e.target.value)}
                      className="mt-0.5 accent-brand-600"
                    />
                    <span className="text-sm text-amber-900">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="new-bedrooms" className={labelCls}>Bedrooms</label>
              <select id="new-bedrooms" className={inputCls} value={form.bedrooms}
                onChange={(e) => set('bedrooms', e.target.value)}>
                {['0','1','2','3','4','5','6'].map((n) => (
                  <option key={n} value={n}>{n === '0' ? 'Studio' : n}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-bathrooms" className={labelCls}>Bathrooms</label>
              <select id="new-bathrooms" className={inputCls} value={form.bathrooms}
                onChange={(e) => set('bathrooms', e.target.value)}>
                {['1','1.5','2','2.5','3','4'].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-sqft" className={labelCls}>Sq ft</label>
              <input id="new-sqft" className={inputCls} type="number" placeholder="900" value={form.sqft}
                onChange={(e) => set('sqft', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-price" className={labelCls}>Monthly rent ($) *</label>
              <input id="new-price" className={inputCls} type="number" placeholder="1500" value={form.price}
                onChange={(e) => set('price', e.target.value)} />
            </div>
            <div>
              <label htmlFor="new-available-from" className={labelCls}>Available from</label>
              <input id="new-available-from" className={inputCls} type="date" value={form.availableFrom}
                onChange={(e) => set('availableFrom', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Description & amenities */}
      {step === 2 && (
        <div className="mt-8 space-y-5">
          <div>
            <label htmlFor="new-title" className={labelCls}>Listing title *</label>
            <input id="new-title" className={inputCls} placeholder="Bright 2BR in downtown Austin with parking"
              value={form.title} onChange={(e) => set('title', e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">Make it specific — renters search by keywords.</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="new-description" className={labelCls.replace(' mb-1', '')}>Description *</label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={aiGenerating}
                className="flex items-center gap-1.5 rounded-lg bg-violet-50 border border-violet-200 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition disabled:opacity-60"
              >
                {aiGenerating ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Writing…
                  </>
                ) : (
                  <>✨ Write with AI</>
                )}
              </button>
            </div>
            <textarea
              id="new-description"
              className={`${inputCls} min-h-[160px] resize-y ${filterWarnings.length > 0 ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : ''}`}
              placeholder="Describe the home, neighborhood, nearby transit, any house rules, etc."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-gray-500">{form.description.length} / 30 min characters</p>
              {filterChecking && <p className="text-xs text-gray-500">Checking content…</p>}
            </div>
            {filterWarnings.length > 0 && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700 mb-2">⚠ Fair Housing Violation Detected</p>
                <p className="text-xs text-red-600 mb-2">This listing contains language that may violate federal or California fair housing laws. Please remove or rephrase the following:</p>
                <ul className="space-y-3">
                  {filterWarnings.map((w, i) => (
                    <li key={i} className="text-xs">
                      <p className="text-red-700 font-medium">• &ldquo;{w.term}&rdquo; — {w.reason} <span className="font-normal text-red-500">({w.law})</span></p>
                      <p className="mt-1 text-green-700 bg-green-50 rounded-lg px-3 py-2">💡 <strong>Suggestion:</strong> {w.suggestion}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="new-virtual-tour" className={labelCls}>Virtual tour URL <span className="text-gray-500 font-normal">(optional)</span></label>
            <input id="new-virtual-tour" className={inputCls} type="url" placeholder="https://my.matterport.com/show/?m=... or YouTube link"
              value={form.virtualTourUrl} onChange={(e) => set('virtualTourUrl', e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">Paste a Matterport 3D tour or YouTube walkthrough link. Renters can view it directly on your listing.</p>
          </div>
          <div>
            <p className={labelCls} id="amenities-label">Amenities</p>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="amenities-label">
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
        </div>
      )}

      {/* Step 3: Photos */}
      {step === 3 && (
        <div className="mt-8 space-y-5">
          <p className="text-sm text-gray-600">
            Upload photos of your property. Good photos get more applicants.
          </p>

          {/* Drop zone */}
          <button type="button" onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addPhotos(e.dataTransfer.files); }}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-10 text-gray-500 transition hover:border-brand-400 hover:bg-brand-50">
            <svg viewBox="0 0 24 24" className="h-10 w-10 stroke-gray-400" fill="none" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <span className="font-semibold">Click or drag photos here</span>
            <span className="text-xs">JPG, PNG — up to 20 photos</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => addPhotos(e.target.files)} />

          {/* Preview grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {previews.map((src, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Property photo ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
                      Cover
                    </span>
                  )}
                  <button onClick={() => removePhoto(i)}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100">
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-500">{photos.length} photo{photos.length !== 1 ? 's' : ''} selected</p>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-gray-200 p-5 shadow-card">
            <h2 className="font-bold text-gray-900">Property</h2>
            <p className="mt-1 text-gray-700">{form.address}, {form.city}, {form.state} {form.zip}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {form.propertyType} · {form.bedrooms === '0' ? 'Studio' : `${form.bedrooms} bed`} · {form.bathrooms} bath
              {form.sqft ? ` · ${form.sqft} sqft` : ''}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 shadow-card">
            <h2 className="font-bold text-gray-900">Rent</h2>
            <p className="mt-1 text-2xl font-extrabold text-brand-700">
              ${(+form.price).toLocaleString()}<span className="text-base font-medium text-gray-500">/mo</span>
            </p>
            {form.availableFrom && (
              <p className="text-sm text-gray-500">Available {new Date(form.availableFrom).toLocaleDateString()}</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 shadow-card">
            <h2 className="font-bold text-gray-900">{form.title}</h2>
            <p className="mt-2 text-sm text-gray-700 line-clamp-4">{form.description}</p>
            {form.amenities.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">{form.amenities.join(' · ')}</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 shadow-card">
            <h2 className="font-bold text-gray-900">Photos</h2>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {previews.map((src, i) => (
                <div key={i} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Property photo ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-8 flex gap-3">
        {step < 4 && (
          <button onClick={next}
            className="flex-1 rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700">
            Continue →
          </button>
        )}
        {step === 4 && (
          <button onClick={submit} disabled={busy}
            className="flex-1 rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {busy ? 'Publishing…' : 'Publish listing'}
          </button>
        )}
      </div>
    </div>
  );
}
