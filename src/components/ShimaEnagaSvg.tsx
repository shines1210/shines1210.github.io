import React from 'react';

interface Props {
  className?: string;
  size?: number;
  mood?: 'happy' | 'curious' | 'sleepy' | 'driving';
}

export const ShimaEnagaSvg: React.FC<Props> = ({ className = '', size = 56, mood = 'happy' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="北海道雪之精靈 銀喉長尾山雀 (シマエナガ)"
    >
      {/* Soft shadow */}
      <ellipse cx="50" cy="88" rx="30" ry="6" fill="#3B82F6" fillOpacity="0.12" />

      {/* Fluffy body */}
      <circle cx="50" cy="52" r="36" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

      {/* Tiny tail feathers peeking behind */}
      <path
        d="M20 66 C10 74 12 84 18 84 C26 84 28 72 26 66 Z"
        fill="#4A5568"
        stroke="#2D3748"
        strokeWidth="1.5"
      />

      {/* Tiny wings */}
      <ellipse cx="22" cy="56" rx="7" ry="12" fill="#718096" transform="rotate(-15 22 56)" />
      <ellipse cx="78" cy="56" rx="7" ry="12" fill="#718096" transform="rotate(15 78 56)" />

      {/* Fluffy white chest highlight */}
      <ellipse cx="50" cy="56" rx="26" ry="24" fill="#FAFCFF" />

      {/* Cute little winter hat */}
      <path
        d="M32 30 C32 18 68 18 68 30 Z"
        fill="#3B82F6"
        stroke="#2563EB"
        strokeWidth="1.5"
      />
      {/* Hat brim */}
      <rect x="28" y="27" width="44" height="7" rx="3.5" fill="#93C5FD" />
      {/* Hat pompom */}
      <circle cx="50" cy="18" r="5.5" fill="#FFFFFF" stroke="#DBEAFE" strokeWidth="1.5" />

      {/* Eyes */}
      {mood === 'sleepy' ? (
        <>
          <path d="M40 47 Q44 51 48 47" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M52 47 Q56 51 60 47" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="43" cy="46" r="3.2" fill="#1E293B" />
          <circle cx="44.2" cy="44.8" r="1.1" fill="#FFFFFF" />
          <circle cx="57" cy="46" r="3.2" fill="#1E293B" />
          <circle cx="58.2" cy="44.8" r="1.1" fill="#FFFFFF" />
        </>
      )}

      {/* Beak */}
      <polygon points="48,49 52,49 50,54" fill="#D97706" />

      {/* Blushing cheeks */}
      <ellipse cx="37" cy="52" rx="4.5" ry="3" fill="#F472B6" fillOpacity="0.45" />
      <ellipse cx="63" cy="52" rx="4.5" ry="3" fill="#F472B6" fillOpacity="0.45" />

      {/* Tiny little orange feet */}
      <path d="M44 84 L44 88 M41 87 L44 88 L47 87" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
      <path d="M56 84 L56 88 M53 87 L56 88 L59 87" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />

      {/* Winter snowflake badge on hat */}
      <path
        d="M50 22 L50 26 M48 24 L52 24"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
};
