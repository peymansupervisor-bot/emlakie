import { describe, it, expect } from 'vitest'
import { MockComplianceRepository } from './mock.repository'
import { SEED, IDS } from './seeds'
import { resolveApplicableCitation } from '../resolvers/resolveApplicableCitation'

const repo = new MockComplianceRepository(SEED)

describe('resolveApplicableCitation', () => {
  it('resolves citation by citationId directly', async () => {
    const citation = await resolveApplicableCitation(repo, {
      jurisdictionId: IDS.LA,
      citationId: IDS.CIT_LA,
    })
    expect(citation).not.toBeNull()
    expect(citation!.id).toBe(IDS.CIT_LA)
    expect(citation!.full_citation_formatted).toMatch(/LAMC §49.99/)
  })

  it('falls back to most recent jurisdiction citation when no citationId given', async () => {
    const citation = await resolveApplicableCitation(repo, {
      jurisdictionId: IDS.SF,
    })
    expect(citation).not.toBeNull()
    expect(citation!.jurisdiction_id).toBe(IDS.SF)
    expect(citation!.id).toBe(IDS.CIT_SF)
  })

  it('returns null for a jurisdiction with no citations', async () => {
    const citation = await resolveApplicableCitation(repo, {
      jurisdictionId: IDS.HOUSTON,
    })
    expect(citation).toBeNull()
  })

  it('returns null for an unknown citationId', async () => {
    const citation = await resolveApplicableCitation(repo, {
      jurisdictionId: IDS.LA,
      citationId: 'cit-does-not-exist',
    })
    expect(citation).toBeNull()
  })

  it('excludes citations whose effective_date is after asOfDate', async () => {
    // LA citation became effective 2015-07-01; querying in 2010 should return nothing
    const citation = await resolveApplicableCitation(repo, {
      jurisdictionId: IDS.LA,
      asOfDate: new Date('2010-01-01'),
    })
    expect(citation).toBeNull()
  })

  it('includes the plain_english_summary', async () => {
    const citation = await resolveApplicableCitation(repo, {
      jurisdictionId: IDS.LA,
      citationId: IDS.CIT_LA,
    })
    expect(citation!.plain_english_summary).toMatch(/Los Angeles landlords/)
  })
})
