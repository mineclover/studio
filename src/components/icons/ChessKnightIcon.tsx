import type React from 'react';

interface ChessKnightIconProps extends React.SVGProps<SVGSVGElement> {}

export const ChessKnightIcon: React.FC<ChessKnightIconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 45 45"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1.5"
    {...props}
  >
    <path
      d="M22.5 38c2.8 0 5.8-1.7 7.5-3.8 2.2-2.7 2.7-6.2 3.8-8.7 1.2-2.7 2.7-4.3 4.5-5.8 1-2.2.8-5.7-1-7.5-1.3-1.3-3-2-4.5-2.7-2-.8-3.2-2.3-3.8-4.5C28.3 2.8 25.3 0 22.5 0c-3 0-5.5 1.3-6.8 4.3-1.2 3.2-3.5 5-5.7 6-1.2.5-2.8.8-3.8 2-.5.8-.8 2.3-1.5 3-.8 1-1.5 2.5-1.5 3.8 0 2.3.8 4.8 2.3 6.8 1.8 2.3 4.8 4.3 4.8 7.5 0 3.3-2.7 6-5.2 6H22.5z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 27.8c0-1.9-1.1-3.7-2.5-4.8s-2-3.5-2-4.8c0-.8.2-1.7.5-2.5.3-.8.8-1.3 1.2-1.7.5-.5 1-1 1.5-1.3.5-.3 1-.8 1.2-1.3.2-.5.5-1 .5-1.5s0-1-.2-1.5c-.2-.5-.5-.8-.8-1.2-.3-.3-.8-.5-1.2-.8-.5-.2-1-.5-1.3-.8-.3-.3-.5-.8-.8-1.2-.2-.5-.3-1-.3-1.5 0-.5.2-1 .3-1.5.2-.5.5-.8.8-1.2.3-.3.8-.5 1.2-.8.5-.2 1-.5 1.3-.8.3-.3.5-.8.8-1.2.2-.5.3-1 .3-1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="12" r="1.5" fill="var(--background)" stroke="var(--background)" />
  </svg>
);
