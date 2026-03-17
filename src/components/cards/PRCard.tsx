import type { PRItem } from "@/types";
import labelStyles from "./Label.module.css";

interface PRCardProps {
  item: PRItem;
}

export const PRCard = ({ item }: PRCardProps) => {
  return (
    <div className="card">
      <div className="card-top">
        <span className="card-repo">{item.repo}</span>
        <span className="card-age">{item.age}</span>
      </div>
      <div className="card-title">
        {item.draft && <span className="draft-badge">DRAFT</span>}#{item.number} {item.title}
      </div>
      <div className="card-meta">
        <span className="card-author">@{item.author}</span>
        <div className="card-stats">
          <span
            className="card-stat"
            style={{
              color: item.reviews.approved > 0 ? "#4ade80" : "#6b7280",
            }}
          >
            ✓{item.reviews.approved}
          </span>
          {item.reviews.requested > 0 && (
            <span className="card-stat" style={{ color: "#fbbf24" }}>
              ⟳{item.reviews.requested}
            </span>
          )}
          <span className="card-stat" style={{ color: "#6b7280" }}>
            💬{item.comments}
          </span>
        </div>
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
