/**
 * CRYPTORA Geometric Security Logo
 * Minimalist shield and vault emblem with clean monochrome typography.
 */

import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CryptoraLogo: React.FC<LogoProps> = ({
  className = '',
  iconOnly = false,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 32 : 26;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric Vault Shield Icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 text-[#111111]"
      >
        {/* Outer Shield Boundary */}
        <path
          d="M16 2L4 7V16C4 23.5 9.1 28.8 16 30C22.9 28.8 28 23.5 28 16V7L16 2Z"
          stroke="#111111"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Inner Keyhole Vault Geometry */}
        <circle cx="16" cy="13" r="3.2" stroke="#111111" strokeWidth="2" fill="none" />
        <path
          d="M14.2 16.2L13 22H19L17.8 16.2"
          stroke="#111111"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {!iconOnly && (
        <span className={`font-bold tracking-tight text-[#111111] ${textSize}`}>
          CRYPTORA
        </span>
      )}
    </div>
  );
};
