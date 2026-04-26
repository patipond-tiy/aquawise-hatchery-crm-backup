import Image from 'next/image';

type V3MarkProps = {
  size?: number;
  radius?: number;
  className?: string;
};

export function V3Mark({ size = 28, radius, className }: V3MarkProps) {
  const r = radius != null ? radius : Math.round(size * 0.22);
  return (
    <Image
      src="/aquawise-logo.png"
      alt="AquaWise"
      width={size}
      height={size}
      priority
      className={className}
      style={{
        display: 'block',
        borderRadius: r,
        objectFit: 'cover',
      }}
    />
  );
}
