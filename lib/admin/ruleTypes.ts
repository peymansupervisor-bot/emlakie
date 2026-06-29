import 'server-only'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export interface ParameterField {
  type: 'enum' | 'integer' | 'string' | 'boolean' | 'decimal'
  label: string
  values?: string[]
  default?: unknown
  required?: boolean
  help?: string
  min?: number
  max?: number
}

export type ParameterSchema = Record<string, ParameterField>

export interface RuleTypeRow {
  id: string
  slug: string
  name: string
  description: string | null
  parameter_schema: ParameterSchema | null
  exemption_types_allowed: string[] | null
  calculator_slug: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export async function listRuleTypes(): Promise<RuleTypeRow[]> {
  const db = createSupabaseAdmin()
  const { data, error } = await db
    .from('compliance_rule_types')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) return []
  return (data ?? []) as RuleTypeRow[]
}

export async function getRuleType(id: string): Promise<RuleTypeRow | null> {
  const db = createSupabaseAdmin()
  const { data, error } = await db
    .from('compliance_rule_types')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as RuleTypeRow
}
