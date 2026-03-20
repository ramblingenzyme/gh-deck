interface Props {
  className?: string;
}
export const IssueOpenIcon = ({ className }: Props) => (
  <svg
    className={className}
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <circle cx="8" cy="8" r="6" />
    <line x1="8" y1="5" x2="8" y2="9" />
    <circle cx="8" cy="11.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);
