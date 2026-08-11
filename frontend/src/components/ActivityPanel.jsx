import { Clock3 } from "lucide-react";

export default function ActivityPanel({ activities }) {
  return (
    <aside className="activity-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">Audit trail</p>
          <h3>Recent activity</h3>
        </div>
        <Clock3 size={18} />
      </div>

      {activities.length === 0 ? (
        <p className="muted">No activity yet.</p>
      ) : (
        <div className="timeline">
          {activities.map(item => (
            <div className="timeline-item" key={item._id}>
              <span className={`timeline-dot ${item.action.toLowerCase()}`} />
              <div>
                <strong>{item.message}</strong>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
