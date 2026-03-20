interface Props {
  className?: string;
}
export const CircleDotIcon = ({ className }: Props) => (
  <svg className={className} aria-hidden="true" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="8" r="2" fill="currentColor" />
  </svg>
);
