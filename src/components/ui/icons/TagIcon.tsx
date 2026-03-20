interface Props {
  className?: string;
}
export const TagIcon = ({ className }: Props) => (
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
    <path d="M2 2H9L14 8L9 14H2Z" />
    <circle cx="5.5" cy="8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
