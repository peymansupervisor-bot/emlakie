import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'

export default async function UnauthorizedPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-sm text-gray-500">
          {user
            ? `Your account (${user.email}) does not have admin access to the Compliance Center.`
            : 'You must be signed in with an authorized admin account.'}
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Contact a superadmin to request access.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/admin/login"
            className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition"
          >
            Sign in with a different account
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Back to Emlakie
          </Link>
        </div>
      </div>
    </div>
  )
}
