interface Props {
  className?: string;
}
export const GitMergeIcon = ({ className }: Props) => (
  <svg
    className={className}
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="5" cy="4" r="2" />
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="8" r="2" />
    <line x1="5" y1="6" x2="5" y2="10" />
    <path d="M6.7 3.3 C9 3.3 12 5.5 12 6" />
    <path d="M6.7 12.7 C9 12.7 12 10.5 12 10" />
  </svg>
);
