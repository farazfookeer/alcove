import { useWizardStore } from "../../stores/wizard-store";
import { PROVIDERS, CHANNELS, QUICK_MODELS, DEEP_MODELS } from "../../lib/constants";
import { Button } from "../ui/Button";
import { SetupScreen } from "./SetupScreen";

export function ReviewLaunchStep() {
  const { provider, quickModel, deepModel, runtimeMode, channels, skills, launching, handleLaunch } =
    useWizardStore();
  const prov = PROVIDERS.find((p) => p.id === provider);
  const channelNames = channels
    .map((c) => CHANNELS.find((ch) => ch.id === c)?.name)
    .join(", ");
  const quickName = provider
    ? QUICK_MODELS[provider]?.find((m) => m.id === quickModel)?.name
    : null;
  const deepName = provider
    ? DEEP_MODELS[provider]?.find((m) => m.id === deepModel)?.name
    : null;

  // When launched, App.tsx renders the Dashboard instead

  const summaryItems = [
    { label: "AI Provider", value: prov?.name, icon: prov?.icon },
    { label: "Quick replies", value: quickName ?? "—", icon: "\u26A1" },
    { label: "Deep thinking", value: deepName ?? "—", icon: "\u{1F9E0}" },
    { label: "Runtime", value: runtimeMode === "docker" ? "Container" : "Direct", icon: runtimeMode === "docker" ? "\u{1F433}" : "\u{1F4BB}" },
    { label: "Channels", value: channelNames, icon: "\u{1F4E1}" },
    {
      label: "Skills",
      value: `${skills.length} selected`,
      icon: "\u{1F9E9}",
    },
  ];

  return (
    <div style={{ textAlign: "center" }}>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#F1F5F9",
          letterSpacing: "-0.5px",
          margin: 0,
        }}
      >
        Ready to launch
      </h2>
      <p style={{ fontSize: 15, color: "#64748B", marginTop: 10 }}>
        Here's what we'll set up:
      </p>

      <div
        style={{
          marginTop: 28,
          padding: "8px 24px",
          background: "#0F172A",
          border: "1px solid #1E293B",
          borderRadius: 12,
          textAlign: "left",
        }}
      >
        {summaryItems.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 0",
              borderBottom:
                i < summaryItems.length - 1 ? "1px solid #1E293B" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 13,
                  color: "#64748B",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {item.label}
              </span>
            </div>
            <span
              style={{ fontSize: 14, color: "#F1F5F9", fontWeight: 600 }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {launching ? (
        <SetupScreen />
      ) : (
        <div style={{ marginTop: 36 }}>
          <Button
            onClick={handleLaunch}
            className="!px-14 !py-4 !text-[15px]"
          >
            &#127963;&#65039; Launch with Alcove
          </Button>
        </div>
      )}
    </div>
  );
}
