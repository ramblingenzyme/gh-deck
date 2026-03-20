interface Props {
  className?: string;
}
export const ArrowRightIcon = ({ className }: Props) => (
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
    <line x1="2" y1="8" x2="14" y2="8" />
    <polyline points="9,3 14,8 9,13" />
  </svg>
);
