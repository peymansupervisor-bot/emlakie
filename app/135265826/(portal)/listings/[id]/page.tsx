import { adminClient } from '@/lib/moderator';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EditListingForm from './EditListingForm';

export const dynamic = 'force-dynamic';

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = adminClient();

  const { data: listing, error: listingError } = await sb
    .from('listings')
    .select('id, title, description, address, city, state, zip, monthly_rent, deposit, bedrooms, bathrooms, living_area_sqft, status, property_type, available_date, landlord_id, slug, listing_source, agent_name, office_name, license_number, virtual_tour_url, building_name, section_8_accepted, furnished, laundry_type, pool, pool_type, fireplace, fireplace_location, parking, parking_spaces, parking_type, air_conditioning, heating_type, pets_policy, yard, yard_type, utilities_included, lease_terms, smoking_allowed, appliances, amenities')
    .eq('id', id)
    .maybeSingle();

  if (listingError || !listing) {
    return (
      <div className="max-w-3xl">
        <div className="mb-6">
          <Link href="/135265826/landlords" className="text-xs text-gray-400 hover:text-white transition">
            ← Back to Landlords
          </Link>
        </div>
        <div className="rounded-2xl border border-red-800 bg-red-950/40 p-6 text-sm text-red-300">
          <p className="font-bold text-red-200 mb-2">Could not load listing</p>
          <p>ID: <span className="font-mono">{id}</span></p>
          {listingError && <p className="mt-1">Error: {listingError.message}</p>}
          {!listing && !listingError && <p className="mt-1">No listing found with this ID.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/135265826/landlords/${listing.landlord_id}`}
          className="text-xs text-gray-400 hover:text-white transition"
        >
          ← Back to Landlord
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-white">Edit Listing</h1>
        <p className="text-xs text-gray-500 font-mono mt-1">{listing.id}</p>
      </div>
      <EditListingForm listing={listing} />
    </div>
  );
}

