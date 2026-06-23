import { adminClient } from '@/lib/moderator';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EditListingForm from './EditListingForm';

export const dynamic = 'force-dynamic';

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = adminClient();

  const { data: listing } = await sb
    .from('listings')
    .select('id, title, description, address, city, state, zip, monthly_rent, bedrooms, bathrooms, sqft, status, property_type, available_date, landlord_id, slug')
    .eq('id', id)
    .maybeSingle();

  if (!listing) notFound();

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

