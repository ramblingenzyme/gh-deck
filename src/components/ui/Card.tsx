import cardStyles from "./Card.module.css";
import { SvgIcon, type IconName } from "./SvgIcon";
import { Tooltip } from "./Tooltip";
import { CardTop } from "../cards/CardParts";

interface CardProps {
  repo: string;
  age: string;
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ repo, age, className, children }: CardProps) => (
  <article className={`${cardStyles.card} ${className || ""}`}>
    <CardTop repo={repo} age={age} />
    {children}
  </article>
);

interface CardTitleProps {
  href: string;
  icon?: IconName;
  iconTooltip?: string;
  children: React.ReactNode;
}

export const CardTitle = ({ href, icon, iconTooltip, children }: CardTitleProps) => (
  <p className={cardStyles.cardTitle}>
    {icon &&
      (iconTooltip ? (
        <Tooltip text={iconTooltip} position="below">
          <span>
            <SvgIcon name={icon} className={cardStyles.titleIcon} />
          </span>
        </Tooltip>
      ) : (
        <SvgIcon name={icon} className={cardStyles.titleIcon} />
      ))}
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  </p>
);

export const CardFooter = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return <footer className={className || cardStyles.cardFooter}>{children}</footer>;
};
