interface Props {
  className?: string;
}
export const AtIcon = ({ className }: Props) => (
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
    <circle cx="8" cy="8" r="3" />
    <path d="M11 8c0 2.2-.5 3.5-2.5 3.5a5 5 0 1 1 4.5-5V8a1.5 1.5 0 0 1-3 0V8" />
  </svg>
);
