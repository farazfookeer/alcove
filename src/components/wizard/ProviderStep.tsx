import { useWizardStore } from "../../stores/wizard-store";
import { PROVIDERS } from "../../lib/constants";

export function ProviderStep() {
  const { provider, setProvider } = useWizardStore();

  return (
    <div>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#F1F5F9",
          letterSpacing: "-0.5px",
          margin: 0,
        }}
      >
        Choose your AI brain
      </h2>
      <p style={{ fontSize: 15, color: "#64748B", marginTop: 10, lineHeight: 1.6 }}>
        This powers your assistant's intelligence. You can change this later.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginTop: 28,
        }}
      >
        {PROVIDERS.map((p) => {
          const active = provider === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setProvider(p.id)}
              style={{
                padding: 22,
                background: active ? "rgba(245,158,11,0.08)" : "#0F172A",
                border: `1.5px solid ${active ? "#F59E0B" : "#1E293B"}`,
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {p.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    padding: "3px 10px",
                    borderRadius: 4,
                    background:
                      p.id === "claude"
                        ? "rgba(217,119,6,0.2)"
                        : "rgba(100,116,139,0.2)",
                    color: p.id === "claude" ? "#FCD34D" : "#94A3B8",
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {p.badge}
                </span>
              )}
              <div style={{ fontSize: 30, marginBottom: 10 }}>{p.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#F1F5F9" }}>
                {p.name}
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 3 }}>
                {p.company}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#94A3B8",
                  marginTop: 10,
                  lineHeight: 1.5,
                }}
              >
                {p.desc}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: p.color,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {p.cost}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
