'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { createLegalRule } from '@/lib/admin/legalRules'
import { getRuleType } from '@/lib/admin/ruleTypes'
import { redirect } from 'next/navigation'

export async function createLegalRuleAction(
  jurisdictionId: string,
  _prevState: unknown,
  formData: FormData,
) {
  const admin = await requireAdmin()
  const canWrite = admin.role === 'editor' || admin.role === 'superadmin'
  if (!canWrite) {
    return { error: 'Insufficient permissions. Editor or Superadmin role required.' }
  }

  const ruleTypeId = formData.get('rule_type_id') as string
  const effectiveDate = formData.get('effective_date') as string
  const ruleAppliesVal = formData.get('rule_applies') as string
  const notApplicableReason = formData.get('not_applicable_reason') as string | null
  const citationId = formData.get('citation_id') as string | null
  const changeReason = formData.get('change_reason') as string

  // Validate required fields
  if (!ruleTypeId) return { error: 'Rule type is required.' }
  if (!effectiveDate) return { error: 'Effective date is required.' }
  if (!changeReason?.trim()) return { error: 'Change reason is required.' }

  const ruleApplies = ruleAppliesVal === 'true'
  if (!ruleApplies && !notApplicableReason?.trim()) {
    return { error: 'Not applicable reason is required when rule does not apply.' }
  }

  // Collect parameters from param_<key> fields
  const ruleType = await getRuleType(ruleTypeId)
  if (!ruleType) return { error: 'Invalid rule type.' }

  const parameters: Record<string, unknown> = {}
  const schema = ruleType.parameter_schema ?? {}

  for (const [key, field] of Object.entries(schema)) {
    const raw = formData.get(`param_${key}`)
    if (raw === null || raw === '') {
      if (field.required) {
        return { error: `Parameter "${field.label}" is required.` }
      }
      if (field.default !== undefined) {
        parameters[key] = field.default
      }
      continue
    }

    const val = raw as string
    if (field.type === 'integer') {
      const n = parseInt(val, 10)
      if (isNaN(n)) return { error: `Parameter "${field.label}" must be a whole number.` }
      if (field.min !== undefined && n < field.min) {
        return { error: `Parameter "${field.label}" must be ≥ ${field.min}.` }
      }
      if (field.max !== undefined && n > field.max) {
        return { error: `Parameter "${field.label}" must be ≤ ${field.max}.` }
      }
      parameters[key] = n
    } else if (field.type === 'decimal') {
      const n = parseFloat(val)
      if (isNaN(n)) return { error: `Parameter "${field.label}" must be a number.` }
      parameters[key] = n
    } else if (field.type === 'boolean') {
      parameters[key] = val === 'true'
    } else if (field.type === 'enum') {
      if (field.values && !field.values.includes(val)) {
        return { error: `Parameter "${field.label}" has an invalid value.` }
      }
      parameters[key] = val
    } else {
      parameters[key] = val
    }
  }

  // Build rule name from jurisdiction + rule type + effective date
  const ruleName = `${ruleType.name} (${effectiveDate})`

  const result = await createLegalRule(
    {
      jurisdiction_id: jurisdictionId,
      rule_type_id: ruleTypeId,
      rule_name: ruleName,
      effective_date: effectiveDate,
      rule_applies: ruleApplies,
      not_applicable_reason: ruleApplies ? null : notApplicableReason,
      parameters: ruleApplies ? parameters : {},
      citation_id: citationId || null,
      change_reason: changeReason.trim(),
    },
    admin,
  )

  if ('error' in result) {
    return { error: result.error }
  }

  redirect(`/admin/jurisdictions/${jurisdictionId}/rules/${result.id}`)
}
