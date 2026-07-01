import Image from 'next/image';

export default function Logo({
  className = 'h-8',
  variant = 'green',
}: {
  className?: string;
  variant?: 'green' | 'white';
}) {
  return (
    <Image
      src={`/logo-mark-${variant}.png`}
      alt="EMLAKIE"
      width={1276}
      height={229}
      className={`w-auto ${className}`}
      priority
    />
  );
}
