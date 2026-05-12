import React from 'react';

export function PuzzleLogo({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="#cce9f1" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Left */}
      <path d="M 5 5 L 45 5 L 45 20 A 6 6 0 1 1 45 30 L 45 45 L 30 45 A 6 6 0 1 0 20 45 L 5 45 Z" />
      
      {/* Top Right */}
      <path d="M 47 5 L 87 5 L 87 45 L 72 45 A 6 6 0 1 0 62 45 L 47 45 L 47 30 A 6 6 0 1 0 47 20 L 47 5 Z" />
      
      {/* Bottom Left */}
      <path d="M 5 47 L 20 47 A 6 6 0 1 1 30 47 L 45 47 L 45 62 A 6 6 0 1 1 45 72 L 45 87 L 5 87 Z" />
      
      {/* Bottom Right (Detached and rotated) */}
      <g transform="translate(8, 8) rotate(-15, 67, 67)">
        <path d="M 47 47 L 62 47 A 6 6 0 1 1 72 47 L 87 47 L 87 87 L 47 87 L 47 72 A 6 6 0 1 0 47 62 L 47 47 Z" />
      </g>
    </svg>
  );
}
