import { useState } from 'react';

interface RRLogoProps {
  className?: string;
}

export function RRLogo({ className = 'h-24 w-auto' }: RRLogoProps) {
  const [step, setStep] = useState<'primary' | 'uploaded' | 'crest'>('primary');

  if (step === 'primary') {
    return (
      <img
        src="/assets/rr-logo.png"
        alt="Rajasthan Royals Crest"
        referrerPolicy="no-referrer"
        onError={() => setStep('uploaded')}
        className={className}
      />
    );
  }

  if (step === 'uploaded') {
    return (
      <img
        src="/assets/aistudio/rr-new_0ad08f57.webp"
        alt="Rajasthan Royals Crest"
        referrerPolicy="no-referrer"
        onError={() => setStep('crest')}
        className={`rounded-2xl object-contain ${className}`}
      />
    );
  }

  return (
    <div
      aria-label="Rajasthan Royals Crest"
      className={`inline-flex items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br from-[#EA1A85] to-[#254AA5] px-6 py-4 shadow-2xl ${className}`}
    >
      <svg
        viewBox="0 0 80 60"
        className="h-14 w-20 text-white"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 22L24 10L40 18L56 10L66 22L60 30H20L14 22Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <text
          x="40"
          y="50"
          textAnchor="middle"
          fill="currentColor"
          fontFamily="Poppins, sans-serif"
          fontWeight="800"
          fontSize="20"
        >
          RR
        </text>
      </svg>
    </div>
  );
}
