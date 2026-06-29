interface Props {
  isActive: boolean
}

export default function RuleTypeStatusBadge({ isActive }: Props) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
      isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}
