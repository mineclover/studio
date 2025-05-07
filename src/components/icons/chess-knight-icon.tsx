// src/components/icons/chess-knight-icon.tsx
import type React from 'react';
import { cn } from '@/lib/utils';

interface ChessKnightIconProps extends React.SVGProps<SVGSVGElement> {}

const ChessKnightIcon: React.FC<ChessKnightIconProps> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-chess-knight", className)}
      {...props}
    >
      <path d="M3 14.5A4.5 4.5 0 0 0 7.5 10H10a8 8 0 0 1 1.55-4.03" />
      <path d="M7.5 10c1.93.84 3.5 2.91 4.5 5.5" />
      <path d="M11.22 10.27a3.51 3.51 0 0 1-2.22 3.23" />
      <path d="M14 18.5c.46 0 .92-.04 1.37-.13a11.8 11.8 0 0 0 5.13-6.87c.45-1.32.18-2.92-.76-4.05a4.08 4.08 0 0 0-5.88-.5C12.25 8.36 12 10.5 12 13a6.44 6.44 0 0 0 .58 2.91" />
      <path d="M21 12c-1.81-1.39-3.32-3.05-4.47-4.82a1.03 1.03 0 0 0-1.46-.38c-.18.1-.34.24-.47.38-.92.92-1.78 2.18-2.52 3.82" />
      <path d="M20.5 18a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />
    </svg>
  );
};

export default ChessKnightIcon;
