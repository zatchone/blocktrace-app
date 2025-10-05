// components/Hero.tsx
import Image from 'next/image';

export default function Hero() {
  return (
    <div className="text-center">
      <Image 
        src="/assets/logo.svg" 
        alt="BLOCKTrace Logo" 
        width={180}
        height={180}
        className="mx-auto mb-4"
        priority
      />
    </div>
  );
}