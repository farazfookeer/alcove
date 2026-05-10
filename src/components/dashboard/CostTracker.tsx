import { useWizardStore } from "../../stores/wizard-store";
import { QUICK_MODELS, DEEP_MODELS } from "../../lib/constants";

// Cost per 1K tokens (rough estimates based on public pricing)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "anthropic/claude-haiku-4-5": { input: 0.0008, output: 0.004 },
  "anthropic/claude-sonnet-4-5": { input: 0.003, output: 0.015 },
  "anthropic/claude-opus-4-5": { input: 0.015, output: 0.075 },
  "openai/gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "openai/gpt-4o": { input: 0.0025, output: 0.01 },
  "openai/o1": { input: 0.015, output: 0.06 },
  "deepseek/deepseek-chat": { input: 0.00014, output: 0.00028 },
  "deepseek/deepseek-reasoner": { input: 0.00055, output: 0.0022 },
};

// Assumed monthly usage: ~500 quick messages (~300 tokens each), ~50 deep messages (~1500 tokens each)
const QUICK_MSGS_PER_MONTH = 500;
const QUICK_TOKENS = 300;
const DEEP_MSGS_PER_MONTH = 50;
const DEEP_TOKENS = 1500;

function estimateMonthlyCost(modelId: string, msgsPerMonth: number, avgTokens: number): number {
  const costs = MODEL_COSTS[modelId];
  if (!costs) return 0;
  const totalTokensK = (msgsPerMonth * avgTokens) / 1000;
  // Assume roughly equal input/output
  return totalTokensK * (costs.input + costs.output) / 2;
}

export function CostTracker() {
  const { provider, quickModel, deepModel } = useWizardStore();

  const quickName = provider
    ? QUICK_MODELS[provider]?.find((m) => m.id === quickModel)?.name
    : null;
  const deepName = provider
    ? DEEP_MODELS[provider]?.find((m) => m.id === deepModel)?.name
    : null;

  const quickCost = quickModel
    ? estimateMonthlyCost(quickModel, QUICK_MSGS_PER_MONTH, QUICK_TOKENS)
    : 0;
  const deepCost = deepModel
    ? estimateMonthlyCost(deepModel, DEEP_MSGS_PER_MONTH, DEEP_TOKENS)
    : 0;
  const totalCost = quickCost + deepCost;

  const isLocal = provider === "ollama";

  return (
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
          marginBottom: 16,
        }}
      >
        Estimated Monthly Cost
      </div>

      {isLocal ? (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#22C55E" }}>
            Free
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>
            Running locally on your hardware
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B" }}>
              ${totalCost.toFixed(0)}
            </span>
            <span style={{ fontSize: 14, color: "#64748B", marginLeft: 4 }}>
              /month
            </span>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {/* Quick model cost */}
            <div
              style={{
                flex: 1,
                padding: "12px 14px",
                background: "#0B0F1A",
                borderRadius: 8,
                border: "1px solid #1E293B",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#64748B",
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>&#9889;</span> Quick replies
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>
                {quickName ?? "—"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0" }}>
                ${quickCost.toFixed(0)}/mo
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#475569",
                  marginTop: 4,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                ~{QUICK_MSGS_PER_MONTH} msgs/mo
              </div>
            </div>

            {/* Deep model cost */}
            <div
              style={{
                flex: 1,
                padding: "12px 14px",
                background: "#0B0F1A",
                borderRadius: 8,
                border: "1px solid #1E293B",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#64748B",
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>&#129504;</span> Deep thinking
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>
                {deepName ?? "—"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0" }}>
                ${deepCost.toFixed(0)}/mo
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#475569",
                  marginTop: 4,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                ~{DEEP_MSGS_PER_MONTH} msgs/mo
              </div>
            </div>
          </div>

          <p
            style={{
              fontSize: 11,
              color: "#475569",
              marginTop: 12,
              marginBottom: 0,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Estimate based on typical usage. Actual costs depend on message
            length and frequency.
          </p>
        </>
      )}
    </div>
  );
}
