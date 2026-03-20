interface Props {
  className?: string;
}
export const GitCommitIcon = ({ className }: Props) => (
  <svg
    className={className}
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <circle cx="8" cy="8" r="3" />
    <line x1="1" y1="8" x2="5" y2="8" />
    <line x1="11" y1="8" x2="15" y2="8" />
  </svg>
);
