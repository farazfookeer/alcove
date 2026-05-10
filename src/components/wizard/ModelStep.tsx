import { useWizardStore } from "../../stores/wizard-store";
import { QUICK_MODELS, DEEP_MODELS } from "../../lib/constants";
import type { ModelOption } from "../../lib/types";

function ModelCard({
  model,
  selected,
  onClick,
}: {
  model: ModelOption;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "16px 18px",
        background: selected ? "rgba(245,158,11,0.08)" : "#0F172A",
        border: `1.5px solid ${selected ? "#F59E0B" : "#1E293B"}`,
        borderRadius: 12,
        cursor: "pointer",
        transition: "all 0.25s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: selected ? "#FCD34D" : "#E2E8F0",
          }}
        >
          {model.name}
        </div>
        <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
          {model.desc}
        </div>
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#94A3B8",
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {model.cost}
      </div>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: `2px solid ${selected ? "#F59E0B" : "#334155"}`,
          background: selected ? "#F59E0B" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          flexShrink: 0,
        }}
      >
        {selected && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#0B0F1A",
            }}
          />
        )}
      </div>
    </div>
  );
}

export function ModelStep() {
  const { provider, quickModel, deepModel, setQuickModel, setDeepModel } =
    useWizardStore();

  const quickOptions = provider ? QUICK_MODELS[provider] ?? [] : [];
  const deepOptions = provider ? DEEP_MODELS[provider] ?? [] : [];

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
        Choose your AI models
      </h2>
      <p
        style={{
          fontSize: 15,
          color: "#64748B",
          marginTop: 10,
          lineHeight: 1.6,
        }}
      >
        Pick a fast model for everyday messages and a smart one for harder
        tasks.
      </p>

      {/* Quick replies section */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 18 }}>&#9889;</span>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#E2E8F0",
              }}
            >
              Quick replies
            </div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
              Fast and affordable — handles most conversations
            </div>
          </div>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          {quickOptions.map((m) => (
            <ModelCard
              key={m.id}
              model={m}
              selected={quickModel === m.id}
              onClick={() => setQuickModel(m.id)}
            />
          ))}
        </div>
      </div>

      {/* Deep thinking section */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 18 }}>&#129504;</span>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#E2E8F0",
              }}
            >
              Deep thinking
            </div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
              Powerful but costs more — used for complex questions
            </div>
          </div>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          {deepOptions.map((m) => (
            <ModelCard
              key={m.id}
              model={m}
              selected={deepModel === m.id}
              onClick={() => setDeepModel(m.id)}
            />
          ))}
        </div>
      </div>

      {quickModel && deepModel && (
        <div
          style={{
            marginTop: 24,
            padding: "14px 18px",
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 10,
            fontSize: 13,
            color: "#94A3B8",
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: "#22C55E", fontWeight: 700 }}>&#10003;</span>
          {" "}Your assistant will use the fast model for most messages and
          switch to the smart model when it needs to think harder.
        </div>
      )}
    </div>
  );
}
