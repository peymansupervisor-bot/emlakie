import Image from 'next/image';

export default function Logo({ className = 'h-8' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="Emlakie"
        width={32}
        height={32}
        className="h-full w-auto rounded-md"
        priority
      />
      <span className="text-2xl font-extrabold tracking-tight text-gray-900">
        EMLAK<span className="text-brand-600">IE</span>
      </span>
    </span>
  );
}
