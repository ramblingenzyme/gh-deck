interface Props {
  className?: string;
}
export const PlayIcon = ({ className }: Props) => (
  <svg className={className} aria-hidden="true" viewBox="0 0 16 16">
    <polygon points="4,2 14,8 4,14" fill="currentColor" />
  </svg>
);
