import { useWizardStore } from "../../stores/wizard-store";
import { SKILLS, SAFETY_COLORS, SAFETY_LABELS } from "../../lib/constants";

export function SkillStep() {
  const { skills, skillFilter, toggleSkill, setSkillFilter } =
    useWizardStore();

  const cats = ["All", ...new Set(SKILLS.map((s) => s.cat))];
  const filteredSkills =
    skillFilter === "All"
      ? SKILLS
      : SKILLS.filter((s) => s.cat === skillFilter);

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
        Pick your skills
      </h2>
      <p style={{ fontSize: 15, color: "#64748B", marginTop: 10, lineHeight: 1.6 }}>
        Skills teach your assistant new abilities. Start small, expand later.
      </p>

      {/* Category filters */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 24,
          flexWrap: "wrap",
        }}
      >
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setSkillFilter(c)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              background:
                skillFilter === c ? "rgba(245,158,11,0.15)" : "transparent",
              color: skillFilter === c ? "#FCD34D" : "#64748B",
              border: `1px solid ${
                skillFilter === c ? "rgba(245,158,11,0.3)" : "#1E293B"
              }`,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.2s ease",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Skill list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 20,
          maxHeight: 320,
          overflowY: "auto",
          paddingRight: 4,
        }}
      >
        {filteredSkills.map((sk) => {
          const active = skills.includes(sk.id);
          return (
            <div
              key={sk.id}
              onClick={() => toggleSkill(sk.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 18px",
                background: active ? "rgba(245,158,11,0.06)" : "#0F172A",
                border: `1px solid ${
                  active ? "rgba(245,158,11,0.25)" : "#1E293B"
                }`,
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
            >
              <span
                style={{ fontSize: 24, width: 32, textAlign: "center", flexShrink: 0 }}
              >
                {sk.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: active ? "#FCD34D" : "#E2E8F0",
                    }}
                  >
                    {sk.name}
                  </span>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: `${SAFETY_COLORS[sk.safety]}20`,
                      color: SAFETY_COLORS[sk.safety],
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: "0.5px",
                      flexShrink: 0,
                    }}
                  >
                    {SAFETY_LABELS[sk.safety]}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#64748B",
                    marginTop: 4,
                  }}
                >
                  {sk.desc}
                </div>
              </div>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: `2px solid ${active ? "#F59E0B" : "#334155"}`,
                  background: active ? "#F59E0B" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              >
                {active && (
                  <span
                    style={{
                      color: "#0B0F1A",
                      fontSize: 14,
                      fontWeight: 900,
                    }}
                  >
                    &#10003;
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 16,
          fontSize: 12,
          color: "#64748B",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {skills.length} skill{skills.length !== 1 ? "s" : ""} selected
      </div>
    </div>
  );
}
