interface OctodeckLogoProps {
  size?: number;
}

export const OctodeckLogo = ({ size = 28 }: OctodeckLogoProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Head */}
    <circle cx="16" cy="13" r="8" fill="currentColor" />
    {/* Eyes */}
    <circle cx="13" cy="12" r="1.5" fill="var(--bg-topbar)" />
    <circle cx="19" cy="12" r="1.5" fill="var(--bg-topbar)" />
    {/* Tentacles — 4 curling legs */}
    <path
      d="M10 20 Q8 24 6 23 Q5 22.5 6 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M13 21 Q12 25 10 25 Q9 24.5 10 23"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M19 21 Q20 25 22 25 Q23 24.5 22 23"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M22 20 Q24 24 26 23 Q27 22.5 26 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
