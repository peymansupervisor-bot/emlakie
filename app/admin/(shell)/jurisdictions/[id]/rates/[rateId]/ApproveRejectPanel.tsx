'use client'

import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import { approveRateAction, rejectRateAction } from '../actions'
import SubmitButton from '@/components/admin/SubmitButton'

interface Props {
  jurisdictionId: string
  rateId: string
}

export default function ApproveRejectPanel({ jurisdictionId, rateId }: Props) {
  const router = useRouter()

  const boundApprove = approveRateAction.bind(null, jurisdictionId, rateId)
  const boundReject = rejectRateAction.bind(null, jurisdictionId, rateId)

  const [approveState, approveAction] = useFormState(
    async (_prev: unknown, _formData: FormData) => {
      const result = await boundApprove()
      if ('success' in result) {
        router.push(`/admin/jurisdictions/${jurisdictionId}/rates/${rateId}?approved=1`)
        return null
      }
      return result
    },
    null,
  )

  const [rejectState, rejectAction] = useFormState(
    async (_prev: unknown, formData: FormData) => {
      const result = await boundReject(null, formData)
      if ('success' in result) {
        router.push(`/admin/jurisdictions/${jurisdictionId}/rates/${rateId}?rejected=1`)
        return null
      }
      return result
    },
    null,
  )

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Approve */}
      <div className="rounded-xl border border-green-200 bg-white p-5">
        <h3 className="mb-1 text-sm font-semibold text-gray-900">Approve &amp; Publish</h3>
        <p className="mb-4 text-xs text-gray-500">
          Publishes this rate. It will immediately be used by the compliance engine.
          The server will re-check for date-range overlaps before approving.
        </p>
        {approveState?.error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {approveState.error}
          </div>
        )}
        <form action={approveAction}>
          <SubmitButton
            label="Approve & Publish"
            pendingLabel="Approving…"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
          />
        </form>
      </div>

      {/* Reject */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-1 text-sm font-semibold text-gray-900">Reject</h3>
        <p className="mb-4 text-xs text-gray-500">
          Mark this rate as rejected. It will not be published.
        </p>
        {rejectState?.error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {rejectState.error}
          </div>
        )}
        <form action={rejectAction} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Rejection Reason *</label>
            <textarea
              name="rejection_notes"
              rows={2}
              placeholder="Explain why this rate is being rejected"
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <SubmitButton
            label="Reject"
            pendingLabel="Rejecting…"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
          />
        </form>
      </div>
    </div>
  )
}
