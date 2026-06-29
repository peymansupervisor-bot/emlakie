'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Admin',
  jurisdictions: 'Jurisdictions',
  'rule-types': 'Rule Types',
  rules: 'Legal Rules',
  rates: 'Rates',
  exemptions: 'Exemptions',
  citations: 'Citations',
  'verification-queue': 'Verification Queue',
  'audit-log': 'Audit Log',
  'data-health': 'Data Health',
  analytics: 'Analytics',
  settings: 'Settings',
  login: 'Login',
  unauthorized: 'Unauthorized',
}

function label(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment
}

export default function AdminBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  const crumbs = segments.map((seg, i) => ({
    label: label(seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {i > 0 && <span>/</span>}
          {crumb.isLast ? (
            <span className="font-medium text-gray-700">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-gray-600 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
