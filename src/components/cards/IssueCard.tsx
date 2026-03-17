import type { IssueItem } from "@/types";
import labelStyles from "./Label.module.css";

interface IssueCardProps {
  item: IssueItem;
}

export const IssueCard = ({ item }: IssueCardProps) => {
  return (
    <div className="card">
      <div className="card-top">
        <span className="card-repo">{item.repo}</span>
        <span className="card-age">{item.age}</span>
      </div>
      <div className="card-title">
        #{item.number} {item.title}
      </div>
      <div className="card-meta">
        <span className="card-author">{item.assignee ? `→ ${item.assignee}` : "unassigned"}</span>
        <span className="card-stat" style={{ color: "#6b7280" }}>
          💬{item.comments}
        </span>
      </div>
      {item.labels.length > 0 && (
        <div className="label-list">
          {item.labels.map((l) => (
            <span key={l} className={`label ${labelStyles[l] ?? labelStyles.fallback}`}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
};
