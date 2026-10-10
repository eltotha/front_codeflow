import "./StatCard.css";

export default function StatCard({ label, value, description, color = "var(--color-cyan)" }) {
	return (
		<div className="stat-card" style={{ "--stat-accent": color }}>
			<span className="stat-card-label">{label}</span>
			<span className="stat-card-value">{value}</span>
			{description && <span className="stat-card-desc">{description}</span>}
		</div>
	);
}
