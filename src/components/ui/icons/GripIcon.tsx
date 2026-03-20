interface Props {
  className?: string;
}
export const GripIcon = ({ className }: Props) => (
  <svg className={className} aria-hidden="true" viewBox="0 0 16 16">
    <circle cx="5.5" cy="4" r="1.25" fill="currentColor" />
    <circle cx="10.5" cy="4" r="1.25" fill="currentColor" />
    <circle cx="5.5" cy="8" r="1.25" fill="currentColor" />
    <circle cx="10.5" cy="8" r="1.25" fill="currentColor" />
    <circle cx="5.5" cy="12" r="1.25" fill="currentColor" />
    <circle cx="10.5" cy="12" r="1.25" fill="currentColor" />
  </svg>
);
