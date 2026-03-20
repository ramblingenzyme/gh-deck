interface Props {
  className?: string;
}
export const BellIcon = ({ className }: Props) => (
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
    <path d="M5 6a3 3 0 1 1 6 0c0 3.5 1.5 5 1.5 5H3.5S5 9.5 5 6Z" />
    <path d="M6.5 11.5a1.5 1.5 0 0 0 3 0" />
  </svg>
);
