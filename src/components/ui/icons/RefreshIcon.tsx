interface Props {
  className?: string;
}
export const RefreshIcon = ({ className }: Props) => (
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
    <path d="M1.5 4.5v4h4" />
    <path d="M3.5 10a6 6 0 1 0 1.8-5.8" />
  </svg>
);
