import type { ClawHubSkill } from "../../lib/types";

const SAFETY_INFO: Record<string, { color: string; label: string; desc: string }> = {
  high: {
    color: "#22C55E",
    label: "Safe",
    desc: "No external dependencies. Runs entirely within OpenClaw.",
  },
  medium: {
    color: "#F59E0B",
    label: "Needs credentials",
    desc: "Requires API keys or environment variables to function.",
  },
  low: {
    color: "#EF4444",
    label: "Needs system access",
    desc: "Requires external binaries installed on your machine.",
  },
};

interface SkillDetailProps {
  skill: ClawHubSkill;
  isInstalled: boolean;
  installing: boolean;
  onInstall: () => void;
  onRemove: () => void;
  onBack: () => void;
}

export function SkillDetail({
  skill,
  isInstalled,
  installing,
  onInstall,
  onRemove,
  onBack,
}: SkillDetailProps) {
  const safety = SAFETY_INFO[skill.safety] || SAFETY_INFO.high;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          padding: "6px 14px",
          background: "transparent",
          color: "#64748B",
          border: "1px solid #1E293B",
          borderRadius: 6,
          fontSize: 12,
          cursor: "pointer",
          fontFamily: "'JetBrains Mono', monospace",
          marginBottom: 20,
        }}
      >
        &#8592; Back
      </button>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#F1F5F9",
              margin: 0,
            }}
          >
            {skill.name}
          </h2>
          <div
            style={{
              fontSize: 13,
              color: "#64748B",
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span>{skill.author}</span>
            <span>v{skill.version}</span>
            <span>{skill.license}</span>
          </div>
        </div>
        <button
          onClick={isInstalled ? onRemove : onInstall}
          disabled={installing}
          style={{
            padding: "10px 28px",
            background: isInstalled
              ? "rgba(239,68,68,0.1)"
              : "linear-gradient(135deg, #F59E0B, #D97706)",
            color: isInstalled ? "#EF4444" : "#0B0F1A",
            border: isInstalled
              ? "1px solid rgba(239,68,68,0.2)"
              : "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            opacity: installing ? 0.5 : 1,
          }}
        >
          {installing
            ? "Working..."
            : isInstalled
              ? "Remove"
              : "Install"}
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatBox label="Downloads" value={formatNumber(skill.downloads)} />
        <StatBox label="Stars" value={skill.stars.toString()} />
        <StatBox label="Category" value={skill.category} />
      </div>

      {/* Description */}
      <div
        style={{
          padding: "20px 24px",
          background: "#0F172A",
          border: "1px solid #1E293B",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#64748B",
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 10,
          }}
        >
          Description
        </div>
        <p
          style={{
            fontSize: 14,
            color: "#CBD5E1",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {skill.description}
        </p>
      </div>

      {/* Safety breakdown */}
      <div
        style={{
          padding: "20px 24px",
          background: "#0F172A",
          border: "1px solid #1E293B",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#64748B",
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 10,
          }}
        >
          Safety
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: safety.color,
            }}
          />
          <span
            style={{ fontSize: 14, fontWeight: 700, color: safety.color }}
          >
            {safety.label}
          </span>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "#94A3B8",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {safety.desc}
        </p>

        {skill.requires_bins.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                fontSize: 11,
                color: "#64748B",
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 6,
              }}
            >
              Required binaries:
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {skill.requires_bins.map((bin) => (
                <span
                  key={bin}
                  style={{
                    padding: "3px 10px",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 4,
                    fontSize: 11,
                    color: "#EF4444",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {bin}
                </span>
              ))}
            </div>
          </div>
        )}

        {skill.requires_env.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                fontSize: 11,
                color: "#64748B",
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 6,
              }}
            >
              Required environment variables:
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {skill.requires_env.map((env) => (
                <span
                  key={env}
                  style={{
                    padding: "3px 10px",
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.15)",
                    borderRadius: 4,
                    fontSize: 11,
                    color: "#F59E0B",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {env}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Platform support */}
      {skill.os.length > 0 && (
        <div
          style={{
            padding: "20px 24px",
            background: "#0F172A",
            border: "1px solid #1E293B",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#64748B",
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 10,
            }}
          >
            Platforms
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {skill.os.map((platform) => (
              <span
                key={platform}
                style={{
                  padding: "4px 12px",
                  background: "#1E293B",
                  borderRadius: 4,
                  fontSize: 12,
                  color: "#94A3B8",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {platform === "darwin"
                  ? "macOS"
                  : platform === "win32"
                    ? "Windows"
                    : platform === "linux"
                      ? "Linux"
                      : platform}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        background: "#0F172A",
        border: "1px solid #1E293B",
        borderRadius: 10,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#64748B",
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#F1F5F9",
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}
