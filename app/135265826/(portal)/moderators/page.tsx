import { adminClient } from '@/lib/moderator';
import AddModeratorForm from './AddModeratorForm';
import RemoveModeratorButton from './RemoveModeratorButton';

export const dynamic = 'force-dynamic';

export default async function ModeratorsPage() {
  const sb = adminClient();
  const { data: moderators } = await sb
    .from('moderators')
    .select('id, email, created_at')
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-extrabold text-white mb-1">Moderators</h1>
      <p className="text-sm text-gray-400 mb-8">
        Moderators can view, edit, suspend, and delete any listing. They sign in at{' '}
        <span className="text-brand-400">/135265826/login</span> using their Emlakie account.
      </p>

      <div className="rounded-2xl border border-gray-800 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-xs text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Added</th>
              <th className="px-4 py-3 text-left">Remove</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(moderators ?? []).map((m) => (
              <tr key={m.id} className="hover:bg-gray-900/50">
                <td className="px-4 py-3 font-semibold text-white">{m.email}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(m.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <RemoveModeratorButton moderatorId={m.id} email={m.email} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 px-6 py-6">
        <h2 className="text-sm font-bold text-white mb-4">Add a moderator</h2>
        <p className="text-xs text-gray-400 mb-4">
          The person must already have an Emlakie landlord account. Enter their exact email address.
        </p>
        <AddModeratorForm />
      </div>
    </div>
  );
}
