'use client'

import { useFormStatus } from 'react-dom'

interface Props {
  label: string
  pendingLabel?: string
  className?: string
  variant?: 'primary' | 'danger' | 'warning'
}

export default function SubmitButton({ label, pendingLabel, className, variant = 'primary' }: Props) {
  const { pending } = useFormStatus()

  const base = 'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60'
  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    warning: 'bg-amber-500 text-white hover:bg-amber-600',
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${base} ${variants[variant]} ${className ?? ''}`}
    >
      {pending ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {pendingLabel ?? label}
        </>
      ) : label}
    </button>
  )
}
