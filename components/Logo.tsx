import Image from 'next/image';

export default function Logo({
  className = 'h-8',
  textClassName = 'text-2xl',
}: {
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo.png"
        alt=""
        width={40}
        height={40}
        className="h-full w-auto rounded-md"
        priority
      />
      <span className={`${textClassName} font-extrabold tracking-tight text-gray-900 whitespace-nowrap`}>
        EMLAK<span className="text-brand-600">IE</span>
      </span>
    </span>
  );
}
