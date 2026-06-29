import { describe, it, expect } from 'vitest'
import { MockComplianceRepository } from './mock.repository'
import { SEED, IDS } from './seeds'
import { resolveJurisdiction } from '../resolvers/resolveJurisdiction'

const repo = new MockComplianceRepository(SEED)

describe('resolveJurisdiction', () => {
  it('finds a jurisdiction by id', async () => {
    const result = await resolveJurisdiction(repo, { id: IDS.LA })
    expect(result).not.toBeNull()
    expect(result!.id).toBe(IDS.LA)
    expect(result!.name).toBe('Los Angeles')
    expect(result!.interest_required).toBe(true)
  })

  it('finds a jurisdiction by seo_slug', async () => {
    const result = await resolveJurisdiction(repo, { slug: 'san-francisco-ca' })
    expect(result).not.toBeNull()
    expect(result!.id).toBe(IDS.SF)
    expect(result!.name).toBe('San Francisco')
  })

  it('returns null for an unknown id', async () => {
    const result = await resolveJurisdiction(repo, { id: 'jur-does-not-exist' })
    expect(result).toBeNull()
  })

  it('returns null for an unknown slug', async () => {
    const result = await resolveJurisdiction(repo, { slug: 'nowhere-xy' })
    expect(result).toBeNull()
  })

  it('throws when neither id nor slug is provided', async () => {
    await expect(resolveJurisdiction(repo, {})).rejects.toThrow('resolveJurisdiction: provide id or slug')
  })
})
