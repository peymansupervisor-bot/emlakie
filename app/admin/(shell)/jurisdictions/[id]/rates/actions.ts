'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { createRate, approveRate, rejectRate } from '@/lib/admin/rates'
import { redirect } from 'next/navigation'

export async function createRateAction(
  jurisdictionId: string,
  _prevState: unknown,
  formData: FormData,
) {
  const admin = await requireAdmin()
  const canWrite = admin.role === 'editor' || admin.role === 'superadmin'
  if (!canWrite) {
    return { error: 'Insufficient permissions. Editor or Superadmin role required.' }
  }

  const legalRuleId = formData.get('legal_rule_id') as string
  const rateKey = (formData.get('rate_key') as string) || 'annual_interest_rate'
  const effectiveFrom = formData.get('effective_from') as string
  const effectiveToRaw = formData.get('effective_to') as string
  const effectiveTo = effectiveToRaw?.trim() || null
  const numericRaw = formData.get('numeric_value') as string
  const rateSourceDescription = formData.get('rate_source_description') as string
  const rateSourceUrl = (formData.get('rate_source_url') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!legalRuleId) return { error: 'Legal rule is required.' }
  if (!effectiveFrom) return { error: 'Effective from date is required.' }
  if (!rateSourceDescription?.trim()) return { error: 'Source description is required.' }

  const numericValue = parseFloat(numericRaw)
  if (isNaN(numericValue) || numericValue < 0) {
    return { error: 'Rate value must be a non-negative number (e.g. 2.75 for 2.75%).' }
  }

  if (effectiveTo && effectiveTo <= effectiveFrom) {
    return { error: 'Effective to date must be after effective from date.' }
  }

  const result = await createRate(
    {
      legal_rule_id: legalRuleId,
      jurisdiction_id: jurisdictionId,
      rule_type_id: '', // derived server-side from legal_rule in createRate()
      rate_key: rateKey,
      effective_from: effectiveFrom,
      effective_to: effectiveTo,
      numeric_value: numericValue,
      rate_source_description: rateSourceDescription.trim(),
      rate_source_url: rateSourceUrl,
      notes,
    },
    admin,
  )

  if ('error' in result) return { error: result.error }

  redirect(`/admin/jurisdictions/${jurisdictionId}/rates/${result.id}`)
}

export async function approveRateAction(
  jurisdictionId: string,
  rateId: string,
  _prevState?: unknown,
  _formData?: FormData,
): Promise<{ error: string } | { success: true }> {
  const admin = await requireAdmin()
  if (admin.role !== 'superadmin') {
    return { error: 'Only superadmins can approve rates.' }
  }
  return approveRate(rateId, admin)
}

export async function rejectRateAction(
  jurisdictionId: string,
  rateId: string,
  _prevState: unknown,
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  const admin = await requireAdmin()
  if (admin.role !== 'superadmin') {
    return { error: 'Only superadmins can reject rates.' }
  }
  const notes = (formData.get('rejection_notes') as string)?.trim()
  if (!notes) return { error: 'Rejection notes are required.' }
  return rejectRate(rateId, notes, admin)
}
