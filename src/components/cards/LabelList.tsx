import labelStyles from "./Label.module.css";

interface LabelListProps {
  labels: string[];
}

export const LabelList = ({ labels }: LabelListProps) => {
  if (labels.length === 0) return null;
  return (
    <div className={labelStyles.labelList}>
      {labels.map((l) => (
        <span key={l} className={`${labelStyles.label} ${labelStyles[l] ?? labelStyles.fallback}`}>
          {l}
        </span>
      ))}
    </div>
  );
};
