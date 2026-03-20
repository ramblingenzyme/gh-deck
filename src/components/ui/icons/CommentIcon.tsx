interface Props {
  className?: string;
}
export const CommentIcon = ({ className }: Props) => (
  <svg
    className={className}
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
  >
    <path d="M2 2.5C2 2.22 2.22 2 2.5 2H13.5C13.78 2 14 2.22 14 2.5V10C14 10.28 13.78 10.5 13.5 10.5H5L2 13.5V2.5Z" />
  </svg>
);
