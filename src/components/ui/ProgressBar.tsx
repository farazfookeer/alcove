import { STEPS } from "../../lib/constants";

interface ProgressBarProps {
  step: number;
}

export function ProgressBar({ step }: ProgressBarProps) {
  return (
    <div>
      {/* Step counter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "#FCD34D",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          {STEPS[step].label}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#475569",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {step} of {STEPS.length - 1}
        </span>
      </div>

      {/* Bar */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 2,
          background: "#1E293B",
          borderRadius: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${(step / (STEPS.length - 1)) * 100}%`,
            background: "linear-gradient(90deg, #F59E0B, #D97706)",
            borderRadius: 1,
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}
