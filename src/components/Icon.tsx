interface IconProps {
  children: React.ReactNode;
  className?: string;
}

export const Icon = ({ children, className }: IconProps) => (
  <span className={className} aria-hidden="true">{children}</span>
);
