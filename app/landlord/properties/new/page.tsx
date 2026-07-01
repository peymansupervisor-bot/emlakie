'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { createListing, getProfile, getToken, updateProfile } from '@/lib/landlord/client';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

interface PhotoItem {
  preview: string;   // blob URL for preview (revoked after processing)
  medium: string;    // processed 1200px JPEG URL from server
  uploading: boolean;
  error?: string;
}

const PROPERTY_TYPES = [
  { value: 'adu',       label: 'ADU (Accessory Dwelling Unit)' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo',     label: 'Condominium (Condo)' },
  { value: 'house',     label: 'House' },
  { value: 'jadu',      label: 'JADU (Junior ADU)' },
  { value: 'room',      label: 'Room' },
  { value: 'studio',    label: 'Studio' },
  { value: 'townhouse', label: 'Townhouse' },
];

// Studio ownership choices — determines E-sale Value™ eligibility
const STUDIO_OWNERSHIP = [
  { value: 'apartment', label: 'Apartment unit (part of a multi-unit building, rental only)' },
  { value: 'condo',     label: 'Condominium (has its own deed, can be sold)' },
];
const AMENITIES_LIST = [
  'Gym', 'Balcony', 'Hardwood floors', 'EV charging', 'Storage',
];

const LAUNDRY_OPTIONS = [
  { value: 'in_unit',      label: 'Washer & dryer in unit' },
  { value: 'hookup',       label: 'Washer & dryer hookup only' },
  { value: 'in_building',  label: 'Washer & dryer in building (shared)' },
  { value: 'none',         label: 'No laundry on-site' },
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
  { value: 'garage',    label: 'Garage (attached or detached)' },
  { value: 'carport',   label: 'Carport' },
  { value: 'assigned',  label: 'Assigned parking spot' },
  { value: 'lot',       label: 'On-site parking lot' },
  { value: 'street',    label: 'Street parking' },
];

const PETS_OPTIONS = [
  { value: 'no_pets',        label: 'No pets' },
  { value: 'cats_ok',        label: 'Cats allowed' },
  { value: 'dogs_ok',        label: 'Dogs allowed' },
  { value: 'cats_and_dogs',  label: 'Cats & dogs allowed' },
  { value: 'case_by_case',   label: 'Case by case' },
];

const UTILITIES_OPTIONS = [
  'Water', 'Trash', 'Gas', 'Electricity', 'Internet',
];

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

type Step = 1 | 2 | 3 | 4;


const UNIT_REQUIRED_TYPES = ['apartment', 'condo'];
const UNIT_OPTIONAL_TYPES = ['townhouse'];

interface FormData {
  address: string;
  unit: string;
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
  phone: string;
  title: string;
  description: string;
  amenities: string[];
  section8Accepted: boolean;
  furnished: boolean;
  laundryType: string;
  pool: boolean;
  poolType: string;
  fireplace: boolean;
  fireplaceLocation: string;
  parking: boolean;
  parkingSpaces: string;
  parkingType: string;
  airConditioning: boolean;
  heatingType: string;
  petsPolicy: string;
  yard: boolean;
  yardType: string;
  utilitiesIncluded: string[];
  leaseTerms: string[];
  smokingAllowed: boolean;
  appliances: string[];
  isBroker: boolean | null;
  licenseNumber: string;
  agentName: string;
  officeName: string;
  virtualTourUrl: string;
}

const empty: FormData = {
  address: '', unit: '', city: '', state: '', zip: '',
  propertyType: 'house', ownershipType: '',
  bedrooms: '1', bathrooms: '1',
  sqft: '', price: '', availableFrom: '',
  phone: '',
  title: '', description: '', amenities: [],
  section8Accepted: false, furnished: false, laundryType: '', pool: false, poolType: '',
  fireplace: false, fireplaceLocation: '',
  parking: false, parkingSpaces: '', parkingType: '',
  airConditioning: false, heatingType: '',
  petsPolicy: '', yard: false, yardType: '',
  utilitiesIncluded: [], leaseTerms: [],
  smokingAllowed: false,
  appliances: [],
  isBroker: null,
  licenseNumber: '',
  agentName: '',
  officeName: '',
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

  const listId = id ? `${id}-suggestions` : 'address-suggestions';

  return (
    <div className="relative">
      <input
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        className={inputCls}
        placeholder="123 Main St"
        value={value}
        autoComplete="off"
        onChange={handleChange}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
      />
      {open && suggestions.length > 0 && (
        <ul id={listId} role="listbox" aria-label="Address suggestions" className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li key={i}
              role="option"
              aria-selected="false"
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

  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filterWarnings, setFilterWarnings] = useState<{term: string; reason: string; law: string; suggestion: string}[]>([]);
  const [filterChecking, setFilterChecking] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const filterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [profileName, setProfileName] = useState({ first_name: '', last_name: '' });
  const [profileHasPhone, setProfileHasPhone] = useState(false);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [autofillApplied, setAutofillApplied] = useState(false);

  useEffect(() => {
    getProfile().then((p) => {
      setProfileName({ first_name: p?.first_name ?? '', last_name: p?.last_name ?? '' });
      if (p?.phone?.trim()) {
        setForm((f) => ({ ...f, phone: p.phone!.trim() }));
        setProfileHasPhone(true);
      }
    }).catch(() => {});
  }, []);

  function formatPhone(raw: string) {
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('1') && digits.length >= 11) digits = digits.slice(1);
    digits = digits.slice(0, 10);
    if (digits.length > 6) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    if (digits.length > 3) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    if (digits.length > 0) return `(${digits}`;
    return '';
  }

  // Pre-fills bedrooms/bathrooms/sqft/propertyType from public property records
  // once an address is selected. Only fills fields the landlord hasn't already
  // changed from their defaults — never overwrites something they've typed.
  async function lookupPropertyDetails(address: string, city: string, state: string, zip: string) {
    setAutofillApplied(false);
    setAutofillLoading(true);
    try {
      const params = new URLSearchParams({ address, city, state, zip });
      const res = await fetch(`/api/properties/lookup?${params.toString()}`);
      const data = await res.json();
      if (!data.found) return;

      setForm((f) => {
        const next = { ...f };
        let changed = false;
        if (f.bedrooms === empty.bedrooms && data.bedrooms != null) {
          next.bedrooms = String(Math.min(6, Math.max(0, Math.round(data.bedrooms))));
          changed = true;
        }
        if (f.bathrooms === empty.bathrooms && data.bathrooms != null) {
          const rounded = Math.round(data.bathrooms * 2) / 2;
          next.bathrooms = String(Math.min(4, Math.max(1, rounded)));
          changed = true;
        }
        if (!f.sqft && data.sqft != null) {
          next.sqft = String(data.sqft);
          changed = true;
        }
        if (f.propertyType === empty.propertyType && data.propertyType) {
          next.propertyType = data.propertyType;
          changed = true;
        }
        if (changed) setAutofillApplied(true);
        return next;
      });
    } catch {
      // Silent — landlord just fills the form manually, same as before this existed.
    } finally {
      setAutofillLoading(false);
    }
  }

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
    setAiError(null);
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
      } else {
        const data = await res.json().catch(() => ({}));
        setAiError(data.error || 'Failed to generate description. Please try again.');
      }
    } catch {
      setAiError('Unable to reach the AI service. Please check your connection and try again.');
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

  const MAX_PHOTOS = 25;
  const MAX_PHOTO_BYTES = 25 * 1024 * 1024;

  async function processOnePhoto(f: File, preview: string, user: { id: string }) {
    try {
      const rawPath = `${user.id}/originals/${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const { error: upErr } = await supabase.storage
        .from('listing-photos')
        .upload(rawPath, f, { upsert: false });
      if (upErr) throw new Error(upErr.message);

      const token = await getToken();
      const res = await fetch('/api/process-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: rawPath }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Processing failed');

      URL.revokeObjectURL(preview);
      setPhotoItems((prev) => prev.map((p) =>
        p.preview === preview ? { preview: data.medium, medium: data.medium, uploading: false } : p,
      ));
    } catch (err) {
      URL.revokeObjectURL(preview);
      setPhotoItems((prev) => prev.map((p) =>
        p.preview === preview ? { ...p, uploading: false, error: (err as Error).message } : p,
      ));
    }
  }

  async function addPhotos(files: FileList | null) {
    if (!files) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('You must be signed in to upload photos.'); return; }

    const accepted = Array.from(files).filter(
      (f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name),
    );

    const oversized = accepted.filter((f) => f.size > MAX_PHOTO_BYTES);
    if (oversized.length > 0) {
      setError(`${oversized.length} photo${oversized.length > 1 ? 's' : ''} exceed the 25 MB size limit and were skipped.`);
    }
    const sized = accepted.filter((f) => f.size <= MAX_PHOTO_BYTES);

    // Enforce cap
    const slotsLeft = MAX_PHOTOS - photoItems.filter((p) => !p.error).length;
    const toProcess = sized.slice(0, slotsLeft);

    if (toProcess.length === 0) {
      if (oversized.length === 0) setError(`Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }

    // Add all placeholders immediately so the user sees spinners
    const placeholders: PhotoItem[] = toProcess.map((f) => ({
      preview: URL.createObjectURL(f),
      medium: '',
      uploading: true,
    }));
    setPhotoItems((prev) => [...prev, ...placeholders]);

    // Process up to 3 at a time (concurrency limit)
    const CONCURRENCY = 3;
    for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
      const batch = toProcess.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map((f, bi) => processOnePhoto(f, placeholders[i + bi].preview, user))
      );
    }
  }

  function removePhoto(i: number) {
    setPhotoItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function validateStep(): string {
    if (step === 1) {
      if (form.isBroker === null) return 'Please tell us whether you are the property owner or a licensed broker.';
      if (form.isBroker) {
        const parts = form.licenseNumber.trim().split(' ');
        if (parts.length < 2 || !parts[0] || !parts[1]) return 'Please select your license state and enter your license number.';
        if (!form.agentName.trim()) return 'Please enter your name as the agent or broker.';
        if (!form.officeName.trim()) return 'Please enter your brokerage or office name.';
      }
      if (!form.address.trim()) return 'Address is required.';
      if (UNIT_REQUIRED_TYPES.includes(form.propertyType) && !form.unit.trim()) return 'Unit number is required for this property type.';
      if (!form.city.trim()) return 'City is required.';
      if (!form.state.trim()) return 'State is required.';
      if (!form.price.trim() || isNaN(+form.price) || +form.price < 100) return 'Enter a valid monthly rent.';
      if (form.propertyType === 'studio' && !form.ownershipType) return 'Please specify whether this studio is an apartment unit or a condominium.';
      if (!profileHasPhone) {
        const phoneDigits = form.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) return 'Enter a valid 10-digit US phone number so renters can reach you.';
      }
    }
    if (step === 2) {
      if (!form.title.trim()) return 'Add a listing title.';
      if (form.description.length < 30) return 'Description must be at least 30 characters.';
      if (!form.heatingType) return 'Heating type is required — landlords are legally obligated to disclose heating in most states.';
      if (filterWarnings.length > 0) return 'Please remove the flagged language before continuing.';
    }
    if (step === 3) {
      const ready = photoItems.filter((p) => !p.uploading && !p.error && p.medium);
      if (ready.length < 1) return 'Please add at least 1 photo before continuing.';
    }
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
      // ── Step 1: persist phone to profile (collected in wizard Step 1) ────────
      // Only update name fields if they are non-empty to avoid clearing existing profile data
      await updateProfile({
        ...(profileName.first_name ? { first_name: profileName.first_name } : {}),
        ...(profileName.last_name ? { last_name: profileName.last_name } : {}),
        phone: form.phone,
      });

      // ── Step 2: get auth user ──────────────────────────────────────────────
      console.log('[submit] step 1: getting auth user');
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? 'anon';
      console.log('[submit] uid:', uid);

      // ── Step 2: collect processed photo URLs (uploaded + processed during selection) ──
      const photoUrls = photoItems.filter((p) => !p.uploading && !p.error && p.medium).map((p) => p.medium);
      console.log('[submit] photo URLs:', photoUrls);

      // ── Step 3: build FormData with text fields + URLs only ───────────────
      console.log('[submit] step 3: building FormData (text + URL strings only, no binary)');
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      const fullAddress = form.unit.trim()
        ? `${form.address.trim()} ${form.unit.trim()}`
        : form.address.trim();
      fd.append('address', fullAddress);
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
      fd.append('section8Accepted', String(form.section8Accepted));
      fd.append('furnished', String(form.furnished));
      if (form.laundryType) fd.append('laundryType', form.laundryType);
      fd.append('pool', String(form.pool));
      if (form.pool && form.poolType) fd.append('poolType', form.poolType);
      fd.append('fireplace', String(form.fireplace));
      if (form.fireplace && form.fireplaceLocation) fd.append('fireplaceLocation', form.fireplaceLocation);
      fd.append('parking', String(form.parking));
      if (form.parking && form.parkingSpaces) fd.append('parkingSpaces', form.parkingSpaces);
      if (form.parking && form.parkingType) fd.append('parkingType', form.parkingType);
      fd.append('airConditioning', String(form.airConditioning));
      if (form.heatingType) fd.append('heatingType', form.heatingType);
      if (form.petsPolicy) fd.append('petsPolicy', form.petsPolicy);
      fd.append('yard', String(form.yard));
      if (form.yard && form.yardType) fd.append('yardType', form.yardType);
      fd.append('utilitiesIncluded', JSON.stringify(form.utilitiesIncluded));
      fd.append('leaseTerms', JSON.stringify(form.leaseTerms));
      fd.append('smokingAllowed', String(form.smokingAllowed));
      fd.append('appliances', JSON.stringify(form.appliances));
      fd.append('listingSource', form.isBroker ? 'broker' : 'owner');
      if (form.isBroker && form.licenseNumber.trim()) fd.append('licenseNumber', form.licenseNumber.trim());
      if (form.isBroker && form.agentName.trim()) fd.append('agentName', form.agentName.trim());
      if (form.isBroker && form.officeName.trim()) fd.append('officeName', form.officeName.trim());
      if (form.ownershipType) fd.append('ownershipType', form.ownershipType);
      if (form.virtualTourUrl.trim()) fd.append('virtualTourUrl', form.virtualTourUrl.trim());
      if (form.phone.trim()) fd.append('phone', form.phone.trim());
      photoUrls.forEach((url) => fd.append('photoUrl', url));
      console.log('[submit] FormData entries:', Array.from(fd.keys()));

      // ── Step 4: POST to /api/listings ──────────────────────────────────────
      console.log('[submit] step 4: POST /api/listings');
      await createListing(fd);
      console.log('[submit] listing created successfully');
      trackEvent('listing_published');
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
      <button
        type="button"
        onClick={() => step === 1 ? router.push('/landlord') : setStep((s) => (s - 1) as Step)}
        aria-label={step === 1 ? 'Back to all properties' : `Back to step ${step - 1}`}
        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition hover:text-brand-600"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
          <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
        </svg>
        {step === 1 ? 'All properties' : 'Back'}
      </button>

      {/* Progress stepper */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-extrabold text-gray-900">Add a property</h1>
          <span className="text-xs font-semibold text-gray-400">Step {step} of 4</span>
        </div>

        {/* Progress bar */}
        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={4}
          />
        </div>

        {/* Step labels */}
        <div className="grid grid-cols-4 gap-1">
          {steps.map((label, i) => {
            const n = (i + 1) as Step;
            const done = n < step;
            const active = n === step;
            return (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5"
                aria-label={done ? `Step ${n}: ${label} — complete` : active ? `Step ${n}: ${label} — current` : `Step ${n}: ${label}`}
                aria-current={active ? 'step' : undefined}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  done
                    ? 'bg-brand-700 text-white shadow-sm shadow-brand-600/30'
                    : active
                    ? 'border-2 border-brand-600 bg-brand-50 text-brand-700'
                    : 'border border-gray-200 bg-white text-gray-400'
                }`}>
                  {done ? (
                    <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
                      <path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0Z" />
                    </svg>
                  ) : n}
                </div>
                <span className={`text-center text-[10px] font-semibold leading-tight ${
                  active ? 'text-brand-700' : done ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
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
            <p id="role-group-label" className="text-sm font-semibold text-gray-800 mb-3">Are you the property owner or a licensed real estate broker/agent? *</p>
            <div className="flex gap-3" role="radiogroup" aria-labelledby="role-group-label" aria-required="true">
              <button
                type="button"
                role="radio"
                aria-checked={form.isBroker === false}
                onClick={() => set('isBroker', false)}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                  form.isBroker === false
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span aria-hidden="true">🏠</span> Property Owner
                <span className="block text-xs font-normal mt-0.5 text-current opacity-70">I own this property directly</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={form.isBroker === true}
                onClick={() => set('isBroker', true)}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                  form.isBroker === true
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span aria-hidden="true">🪪</span> Broker / Agent
                <span className="block text-xs font-normal mt-0.5 text-current opacity-70">I&apos;m a licensed real estate professional</span>
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
                <div>
                  <p className="text-xs font-semibold text-blue-800 mb-1">Your name (agent/broker) *</p>
                  <input
                    type="text"
                    value={form.agentName}
                    onChange={(e) => set('agentName', e.target.value)}
                    placeholder="Jane Smith"
                    aria-label="Agent name"
                    className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 placeholder-gray-400"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-800 mb-1">Brokerage / office name *</p>
                  <input
                    type="text"
                    value={form.officeName}
                    onChange={(e) => set('officeName', e.target.value)}
                    placeholder="ABC Real Estate Group"
                    aria-label="Office name"
                    className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 placeholder-gray-400"
                  />
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
              onSelect={(address, city, state, zip) => {
                setForm((f) => ({ ...f, address, city, state, zip }));
                lookupPropertyDetails(address, city, state, zip);
              }}
              onType={(address) => setForm((f) => ({ ...f, address }))}
            />
            {autofillLoading && (
              <p className="mt-1.5 text-xs text-gray-500">Looking up property details…</p>
            )}
            {!autofillLoading && autofillApplied && (
              <p className="mt-1.5 text-xs text-brand-700">
                ✓ Bedrooms, bathrooms, sq ft, and property type auto-filled from public records — please verify.
              </p>
            )}
          </div>
          {(UNIT_REQUIRED_TYPES.includes(form.propertyType) || UNIT_OPTIONAL_TYPES.includes(form.propertyType)) && (
            <div>
              <label htmlFor="new-unit" className={labelCls}>
                Unit number {UNIT_REQUIRED_TYPES.includes(form.propertyType) ? '*' : '(optional)'}
              </label>
              <input
                id="new-unit"
                className={inputCls}
                placeholder="e.g. Apt 4, Unit 2B, #301"
                value={form.unit}
                onChange={(e) => set('unit', e.target.value)}
              />
            </div>
          )}
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
          {!profileHasPhone && (
            <div>
              <label htmlFor="new-phone" className={labelCls}>Your phone number *</label>
              <input
                id="new-phone"
                type="tel"
                className={inputCls}
                placeholder="(555) 000-0000"
                value={form.phone}
                onChange={(e) => set('phone', formatPhone(e.target.value))}
              />
              <p className="mt-1 text-xs text-gray-500">
                Renters will reach you at this number. EMLAKIE assigns a private forwarding number to protect your privacy.
              </p>
            </div>
          )}
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
            {aiError && (
              <p className="mb-1 text-xs text-red-600">{aiError}</p>
            )}
            <textarea
              id="new-description"
              className={`${inputCls} min-h-[160px] resize-y ${filterWarnings.length > 0 ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : ''}`}
              placeholder="Describe the home, neighborhood, nearby transit, any house rules, etc."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              aria-invalid={filterWarnings.length > 0 ? 'true' : 'false'}
              aria-describedby={filterWarnings.length > 0 ? 'filter-warnings' : undefined}
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-gray-500">{form.description.length} / 30 min characters</p>
              {filterChecking && <p className="text-xs text-gray-500" aria-live="polite">Checking content…</p>}
            </div>
            <div aria-live="polite" aria-atomic="true">
            {filterWarnings.length > 0 && (
              <div id="filter-warnings" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
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
          </div>
          <div>
            <label htmlFor="new-virtual-tour" className={labelCls}>Virtual tour URL <span className="text-gray-500 font-normal">(optional)</span></label>
            <input id="new-virtual-tour" className={inputCls} type="url" placeholder="https://my.matterport.com/show/?m=... or YouTube link"
              value={form.virtualTourUrl} onChange={(e) => set('virtualTourUrl', e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">Paste a Matterport 3D tour or YouTube walkthrough link. Renters can view it directly on your listing.</p>
          </div>
          {/* Section 8 */}
          <div>
            <p className={labelCls}>Section 8 / Housing Choice Vouchers</p>
            <div className="flex gap-3">
              {[{ v: true, l: 'Accepted' }, { v: false, l: 'Contact landlord' }].map(({ v, l }) => (
                <button key={l} type="button" onClick={() => setForm(f => ({ ...f, section8Accepted: v }))}
                  aria-pressed={form.section8Accepted === v}
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
                  aria-pressed={form.furnished === v}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                    form.furnished === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>{l}</button>
              ))}
            </div>
          </div>

          {/* Laundry */}
          <div>
            <label htmlFor="laundry-type" className={labelCls}>Washer & Dryer</label>
            <select id="laundry-type" className={inputCls}
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
                  aria-pressed={form.pool === v}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                    form.pool === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>{l}</button>
              ))}
            </div>
            {form.pool && (
              <div className="mt-3 flex gap-3">
                {[{ v: 'private', l: 'Private pool' }, { v: 'community', l: 'Community pool' }].map(({ v, l }) => (
                  <button key={v} type="button" onClick={() => setForm(f => ({ ...f, poolType: v }))}
                    aria-pressed={form.poolType === v}
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
                  aria-pressed={form.airConditioning === v}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                    form.airConditioning === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>{l}</button>
              ))}
            </div>
          </div>

          {/* Heating */}
          <div>
            <label htmlFor="heating-type" className={labelCls}>Heating type *</label>
            <select id="heating-type" className={inputCls}
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
                  aria-pressed={form.fireplace === v}
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
                    aria-pressed={form.fireplaceLocation === loc}
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
                  aria-pressed={form.parking === v}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                    form.parking === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>{l}</button>
              ))}
            </div>
            {form.parking && (
              <div className="mt-3 space-y-3">
                <div>
                  <label htmlFor="parking-spaces" className="block text-xs font-semibold text-gray-600 mb-1">Number of parking spaces</label>
                  <input id="parking-spaces" type="number" min="1" max="10" className={inputCls} placeholder="e.g. 2"
                    value={form.parkingSpaces} onChange={(e) => setForm(f => ({ ...f, parkingSpaces: e.target.value }))} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Parking type</p>
                  <div className="flex flex-wrap gap-2">
                    {PARKING_TYPES.map(o => (
                      <button key={o.value} type="button"
                        onClick={() => setForm(f => ({ ...f, parkingType: o.value }))}
                        aria-pressed={form.parkingType === o.value}
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
                    aria-pressed={active}
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
                    aria-pressed={form.petsPolicy === o.value}
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
                  aria-pressed={form.yard === v}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                    form.yard === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>{l}</button>
              ))}
            </div>
            {form.yard && (
              <div className="mt-3 flex gap-3">
                {[{ v: 'private', l: 'Private yard' }, { v: 'shared', l: 'Shared yard' }].map(({ v, l }) => (
                  <button key={v} type="button" onClick={() => setForm(f => ({ ...f, yardType: v }))}
                    aria-pressed={form.yardType === v}
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
                  aria-pressed={form.utilitiesIncluded.includes(u)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    form.utilitiesIncluded.includes(u) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>{u}</button>
              ))}
              <button type="button"
                onClick={() => setForm(f => ({ ...f, utilitiesIncluded: f.utilitiesIncluded.includes('None') ? [] : ['None'] }))}
                aria-pressed={form.utilitiesIncluded.includes('None')}
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
                  aria-pressed={form.leaseTerms.includes(o.value)}
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
                  aria-pressed={form.smokingAllowed === v}
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
                  aria-pressed={form.appliances.includes(a)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    form.appliances.includes(a) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>{a}</button>
              ))}
              <button type="button"
                onClick={() => setForm(f => ({ ...f, appliances: f.appliances.includes('None') ? [] : ['None'] }))}
                aria-pressed={form.appliances.includes('None')}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  form.appliances.includes('None') ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}>None included</button>
            </div>
          </div>

          {/* Other Amenities */}
          <div>
            <p className={labelCls} id="amenities-label">Other amenities</p>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="amenities-label">
              {AMENITIES_LIST.map((a) => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  aria-pressed={form.amenities.includes(a)}
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
            <span className="text-xs">JPG, PNG, HEIC · Tap multiple times to add up to 25 photos</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            aria-label="Upload property photos"
            onChange={(e) => addPhotos(e.target.files)} />

          {/* Preview grid */}
          {photoItems.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photoItems.map((item, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                  {item.uploading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg className="h-6 w-6 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                      </svg>
                    </div>
                  ) : item.error ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center">
                      <span className="text-[10px] font-semibold text-red-500">Failed</span>
                      <span className="text-[9px] text-red-400 leading-tight line-clamp-3">{item.error}</span>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.preview} alt={`Property photo ${i + 1}`} className="h-full w-full object-cover" />
                  )}
                  {i === 0 && !item.uploading && !item.error && (
                    <span className="absolute left-1 top-1 rounded-full bg-brand-700 px-2 py-0.5 text-xs font-bold text-white">
                      Cover
                    </span>
                  )}
                  {!item.uploading && (
                    <button onClick={() => removePhoto(i)}
                      aria-label={`Remove photo ${i + 1}`}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100">
                      <span aria-hidden="true">×</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-500">{photoItems.filter(p => !p.uploading && !p.error).length} photo{photoItems.filter(p => !p.uploading && !p.error).length !== 1 ? 's' : ''} ready{photoItems.some(p => p.uploading) ? ` · ${photoItems.filter(p => p.uploading).length} processing…` : ''}</p>
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
              {photoItems.filter(p => !p.error).map((item, i) => (
                <div key={i} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.uploading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg className="h-5 w-5 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                      </svg>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.preview} alt={`Property photo ${i + 1}`} className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">{photoItems.filter(p => !p.uploading && !p.error).length} photo{photoItems.filter(p => !p.uploading && !p.error).length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-8 flex gap-3">
        {step < 4 && (
          <button type="button" onClick={next}
            className="flex-1 rounded-xl bg-brand-700 py-3 font-semibold text-white transition hover:bg-brand-800">
            Continue
          </button>
        )}
        {step === 4 && (
          <button type="button" onClick={submit} disabled={busy}
            className="flex-1 rounded-xl bg-brand-700 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:opacity-60">
            {busy ? 'Publishing…' : 'Publish listing'}
          </button>
        )}
      </div>
    </div>
  );
}
