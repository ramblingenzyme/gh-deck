interface Props {
  className?: string;
}
export const EyeIcon = ({ className }: Props) => (
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
    <path d="M1 8C4 3 12 3 15 8C12 13 4 13 1 8Z" />
    <circle cx="8" cy="8" r="2.5" />
  </svg>
);
