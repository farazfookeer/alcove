import { AlcoveLogo } from "../ui/AlcoveLogo";
import { Button } from "../ui/Button";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <AlcoveLogo />

      <h1
        style={{
          fontSize: 46,
          fontWeight: 800,
          color: "#F1F5F9",
          letterSpacing: "-0.5px",
          fontFamily: "'DM Serif Display', Georgia, serif",
          margin: "32px 0 0 0",
        }}
      >
        Alcove
      </h1>

      <p
        style={{
          fontSize: 15,
          color: "#F59E0B",
          marginTop: 10,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 500,
          letterSpacing: "0.5px",
        }}
      >
        OpenClaw without the stress
      </p>

      <p
        style={{
          fontSize: 15,
          color: "#64748B",
          marginTop: 20,
          lineHeight: 1.7,
          maxWidth: 380,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Your personal AI assistant, running in 3 minutes. No terminal. No config
        files. Just step inside.
      </p>

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          marginTop: 32,
        }}
      >
        {["macOS", "Windows", "Linux"].map((os) => (
          <span
            key={os}
            style={{
              padding: "8px 20px",
              borderRadius: 20,
              background: "#1E293B",
              color: "#94A3B8",
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              border: "1px solid #334155",
            }}
          >
            {os}
          </span>
        ))}
      </div>

      <div
        style={{
          marginTop: 36,
          padding: "16px 20px",
          background: "rgba(245,158,11,0.05)",
          border: "1px solid rgba(245,158,11,0.15)",
          borderRadius: 12,
          fontSize: 13,
          color: "#94A3B8",
          lineHeight: 1.6,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Installs <span style={{ color: "#F59E0B" }}>OpenClaw v2026.3.5</span>{" "}
        &middot; Open source &middot; MIT license
      </div>

      <div style={{ marginTop: 36 }}>
        <Button onClick={onNext} className="!px-14 !py-4 !text-[15px]">
          Step Inside &rarr;
        </Button>
      </div>
    </div>
  );
}
