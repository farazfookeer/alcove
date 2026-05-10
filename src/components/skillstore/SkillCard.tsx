import type { ClawHubSkill } from "../../lib/types";

const SAFETY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: "rgba(34,197,94,0.1)", text: "#22C55E", label: "Safe" },
  medium: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B", label: "Needs credentials" },
  low: { bg: "rgba(239,68,68,0.1)", text: "#EF4444", label: "Needs system access" },
};

interface SkillCardProps {
  skill: ClawHubSkill;
  isInstalled: boolean;
  installing: boolean;
  onInstall: () => void;
  onRemove: () => void;
  onSelect: () => void;
}

export function SkillCard({
  skill,
  isInstalled,
  installing,
  onInstall,
  onRemove,
  onSelect,
}: SkillCardProps) {
  const safety = SAFETY_COLORS[skill.safety] || SAFETY_COLORS.high;

  return (
    <div
      onClick={onSelect}
      style={{
        padding: "16px 20px",
        background: "#0F172A",
        border: "1px solid #1E293B",
        borderRadius: 10,
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "#334155")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "#1E293B")
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#F1F5F9",
              }}
            >
              {skill.name}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#64748B",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              v{skill.version}
            </span>
          </div>
          <p
            style={{
              fontSize: 12,
              color: "#94A3B8",
              margin: 0,
              lineHeight: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {skill.description}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 10,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#64748B",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {skill.author}
            </span>
            <span style={{ fontSize: 11, color: "#64748B" }}>
              &#11088; {skill.stars}
            </span>
            <span style={{ fontSize: 11, color: "#64748B" }}>
              &#8595; {formatNumber(skill.downloads)}
            </span>
            <span
              style={{
                fontSize: 10,
                padding: "2px 8px",
                background: safety.bg,
                color: safety.text,
                borderRadius: 10,
                fontWeight: 600,
              }}
            >
              {safety.label}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            isInstalled ? onRemove() : onInstall();
          }}
          disabled={installing}
          style={{
            padding: "6px 16px",
            background: isInstalled
              ? "rgba(239,68,68,0.1)"
              : "linear-gradient(135deg, #F59E0B, #D97706)",
            color: isInstalled ? "#EF4444" : "#0B0F1A",
            border: isInstalled
              ? "1px solid rgba(239,68,68,0.2)"
              : "none",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            opacity: installing ? 0.5 : 1,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {installing
            ? "..."
            : isInstalled
              ? "Remove"
              : "Install"}
        </button>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}
