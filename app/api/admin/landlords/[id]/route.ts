import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';
import { sendWelcomeEmail } from '@/lib/welcome-email';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
async function auth() {
  return await getModeratorSession();
}

// PATCH: suspend, unsuspend, edit profile fields, or manually resend the welcome email for a landlord
// body: { action: 'suspend' | 'unsuspend' | 'resend_welcome' | 'edit_profile' }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const { action, listing_action, reassign_to, first_name, last_name, phone } = await req.json();

    if (action === 'edit_profile') {
      const sb = adminClient();
      const { data: existing, error: fetchErr } = await sb
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', id)
        .maybeSingle();
      if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
      if (!existing) return NextResponse.json({ error: 'This landlord has no profile row to edit' }, { status: 400 });

      const updates: Record<string, unknown> = {};
      if (typeof first_name === 'string') updates.first_name = first_name.trim() || null;
      if (typeof last_name === 'string') updates.last_name = last_name.trim() || null;
      if (typeof phone === 'string') {
        const digits = phone.replace(/\D/g, '');
        if (digits && digits.length !== 10) {
          return NextResponse.json({ error: 'Phone must be a valid 10-digit US number' }, { status: 400 });
        }
        updates.phone = digits || null;
        updates.phone_verified = false;
      }

      const nextFirst = 'first_name' in updates ? (updates.first_name as string | null) : existing.first_name;
      const nextLast = 'last_name' in updates ? (updates.last_name as string | null) : existing.last_name;
      if (nextFirst || nextLast) updates.display_name = [nextFirst, nextLast].filter(Boolean).join(' ');

      const { error } = await sb.from('profiles').update(updates).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ ok: true });
    }

    if (action === 'resend_welcome') {
      const sb = adminClient();
      const { data: profile, error: profileErr } = await sb
        .from('profiles')
        .select('display_name, first_name, phone, email')
        .eq('id', id)
        .single();
      if (profileErr || !profile?.email) return NextResponse.json({ error: 'Landlord has no email on file' }, { status: 400 });

      const firstName = profile.first_name ?? profile.display_name?.split(' ')[0] ?? 'there';
      const profileComplete = !!(profile.first_name && profile.phone);
      await sendWelcomeEmail({ email: profile.email, firstName, profileComplete });
      await sb.from('profiles').update({ welcome_sent: true }).eq('id', id);

      return NextResponse.json({ ok: true });
    }

    if (action !== 'suspend' && action !== 'unsuspend') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const sb = adminClient();

    // Ban/unban the auth user — 87600h = 10 years (effectively permanent)
    const { error: authErr } = await sb.auth.admin.updateUserById(id, {
      ban_duration: action === 'suspend' ? '87600h' : 'none',
    });
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 });

    if (action === 'suspend') {
      if (listing_action === 'reassign' && reassign_to) {
        await sb.from('listings').update({ landlord_id: reassign_to }).eq('landlord_id', id);
      } else {
        // Suspend active listings so they're hidden but distinguishable from voluntarily inactive ones
        await sb.from('listings').update({ status: 'suspended' }).eq('landlord_id', id).eq('status', 'active');
      }
    } else {
      // Restore only suspended listings back to active on unsuspend
      await sb.from('listings').update({ status: 'active' }).eq('landlord_id', id).eq('status', 'suspended');
    }

    return NextResponse.json({ ok: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Admin › Landlords › :id', message: _msg, details: _stack, endpoint: 'PATCH /api/admin/landlords/[id]', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}

// DELETE: permanently delete a landlord account and all their data
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const sb = adminClient();

    // Delete all their listings first
    const { error: listingsErr } = await sb.from('listings').delete().eq('landlord_id', id);
    if (listingsErr) return NextResponse.json({ error: listingsErr.message }, { status: 500 });

    // Delete the profile row (not cascaded automatically)
    const { error: profileErr } = await sb.from('profiles').delete().eq('id', id);
    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

    // Delete the auth user — orphaned profile rows have no matching auth user,
    // so "not found" here just means there's nothing left to delete, not a failure.
    const { error } = await sb.auth.admin.deleteUser(id);
    if (error && !/not.?found/i.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Admin › Landlords › :id', message: _msg, details: _stack, endpoint: 'DELETE /api/admin/landlords/[id]', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
