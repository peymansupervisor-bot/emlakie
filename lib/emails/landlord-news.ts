/** Shared branded template for the recurring "EMLAKIE UPDATE" landlord newsletter. */
export function buildLandlordNewsEmail(opts: {
  badge?: string;
  title: string;
  bodyHtml: string;
  unsubscribeUrl: string;
}): string {
  const badge = opts.badge ?? 'EMLAKIE UPDATE';
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;background:#f3f4f6;padding:32px 16px;">
      <div style="background:#16a34a;border-radius:16px 16px 0 0;padding:24px 32px;text-align:center;">
        <p style="margin:0;font-size:22px;font-weight:900;color:#fff;">EMLAKIE</p>
        <p style="margin:4px 0 0;font-size:13px;color:#bbf7d0;letter-spacing:0.04em;text-transform:uppercase;">${badge}</p>
      </div>
      <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px 32px;">
        <h2 style="margin:0 0 16px;font-size:20px;color:#111;">${opts.title}</h2>
        ${opts.bodyHtml}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
          You're receiving this because you have a listing on EMLAKIE.
          <a href="${opts.unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe from EMLAKIE Update</a>
        </p>
      </div>
    </div>
  `;
}
