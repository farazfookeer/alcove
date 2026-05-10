import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useWizardStore } from "../../stores/wizard-store";
import { AlcoveLogo } from "../ui/AlcoveLogo";
import type { SetupStep } from "../../lib/types";

const STEP_LABELS: Record<SetupStep, string> = {
  idle: "",
  checking_docker: "Checking your system...",
  pulling_image: "Downloading your assistant...",
  downloading_runtime: "Downloading runtime...",
  installing_openclaw: "Installing OpenClaw...",
  writing_config: "Configuring your choices...",
  starting_gateway: "Starting your assistant...",
  complete: "All systems go!",
  failed: "Something went wrong",
  cancelled: "Setup cancelled",
};

function getDockerSteps(): SetupStep[] {
  return [
    "checking_docker",
    "pulling_image",
    "writing_config",
    "starting_gateway",
    "complete",
  ];
}

function getNativeSteps(): SetupStep[] {
  return [
    "downloading_runtime",
    "installing_openclaw",
    "writing_config",
    "starting_gateway",
    "complete",
  ];
}

export function SetupScreen() {
  const {
    runtimeMode,
    setupStep,
    setSetupStep,
    setLaunched,
    setLaunching,
  } = useWizardStore();
  const [showCancel, setShowCancel] = useState(false);
  const [rollbackMessages, setRollbackMessages] = useState<string[]>([]);

  const steps = runtimeMode === "docker" ? getDockerSteps() : getNativeSteps();
  const currentIndex = steps.indexOf(setupStep);
  const isComplete = setupStep === "complete";
  const isFailed = setupStep === "failed";
  const isCancelled = setupStep === "cancelled";
  const isPulling = setupStep === "pulling_image" || setupStep === "downloading_runtime";

  const handleCancel = () => {
    setShowCancel(true);
  };

  const confirmCancel = async () => {
    setShowCancel(false);
    // Signal abort
    try {
      await invoke("abort_setup");
    } catch {
      // outside Tauri
    }
    // Rollback
    let messages: string[];
    try {
      messages = await invoke<string[]>("rollback_setup");
    } catch {
      messages = [
        "Stopped gateway",
        "Removed configuration",
        "Cleaned up",
      ];
    }
    setRollbackMessages(messages);
    setSetupStep("cancelled");
    setLaunching(false);
  };

  const handleRetry = async () => {
    try {
      await invoke("reset_abort");
    } catch {
      // outside Tauri
    }
    setSetupStep("idle");
    setRollbackMessages([]);
    setLaunching(true);
    runMockSetup();
  };

  // Mock setup pipeline — simulates each step with delays
  const runMockSetup = () => {
    const stepDelays = steps.filter((s) => s !== "complete");
    let i = 0;
    const runNext = () => {
      if (i < stepDelays.length) {
        setSetupStep(stepDelays[i]);
        i++;
        setTimeout(runNext, 800 + Math.random() * 600);
      } else {
        setSetupStep("complete");
        setTimeout(() => {
          setLaunching(false);
          setLaunched(true);
        }, 1000);
      }
    };
    runNext();
  };

  // Start the mock pipeline on first render if launching
  useState(() => {
    runMockSetup();
  });

  if (isCancelled) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>&#128721;</div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#F1F5F9",
            margin: 0,
          }}
        >
          Setup cancelled
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#64748B",
            marginTop: 12,
            lineHeight: 1.6,
          }}
        >
          Everything has been cleaned up.
        </p>
        {rollbackMessages.length > 0 && (
          <div
            style={{
              marginTop: 20,
              padding: "16px 20px",
              background: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: 10,
              textAlign: "left",
            }}
          >
            {rollbackMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  fontSize: 12,
                  color: "#22C55E",
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "4px 0",
                }}
              >
                &#10003; {msg}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleRetry}
          style={{
            marginTop: 28,
            padding: "14px 32px",
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "#0B0F1A",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      {isComplete ? (
        <div style={{ animation: "pulse-glow 2s infinite" }}>
          <AlcoveLogo />
        </div>
      ) : (
        <div style={{ fontSize: 48, marginBottom: 8 }}>
          {runtimeMode === "docker" ? "\u{1F433}" : "\u{1F4BB}"}
        </div>
      )}

      <h2
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: isComplete ? "#22C55E" : "#F1F5F9",
          marginTop: 20,
          margin: isComplete ? "20px 0 0 0" : "12px 0 0 0",
        }}
      >
        {isComplete
          ? "All systems go!"
          : isFailed
            ? "Something went wrong"
            : "Setting up your assistant..."}
      </h2>

      {/* Step list */}
      <div
        style={{
          marginTop: 28,
          padding: "16px 24px",
          background: "#0F172A",
          border: "1px solid #1E293B",
          borderRadius: 12,
          textAlign: "left",
        }}
      >
        {steps
          .filter((s) => s !== "complete")
          .map((s, i) => {
            const stepIndex = steps.indexOf(s);
            const isDone = currentIndex > stepIndex;
            const isActive = s === setupStep;

            return (
              <div
                key={s}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom:
                    i < steps.length - 2
                      ? "1px solid rgba(30,41,59,0.5)"
                      : "none",
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    background: isDone
                      ? "#22C55E"
                      : isActive
                        ? "#F59E0B"
                        : "#1E293B",
                    color: isDone || isActive ? "#0B0F1A" : "#475569",
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                  }}
                >
                  {isDone ? "\u2713" : isActive ? "..." : ""}
                </span>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: isDone
                        ? "#22C55E"
                        : isActive
                          ? "#F59E0B"
                          : "#475569",
                      fontWeight: isActive ? 700 : 400,
                    }}
                  >
                    {STEP_LABELS[s]}
                  </span>
                  {/* Pull progress indicator for download steps */}
                  {isActive && isPulling && (
                    <div
                      style={{
                        marginTop: 6,
                        height: 3,
                        background: "#1E293B",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background: "linear-gradient(90deg, #F59E0B, #D97706)",
                          borderRadius: 2,
                          animation: "pull-progress 2s ease-in-out infinite",
                          width: "60%",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Progress bar */}
      {!isComplete && !isFailed && (
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              width: "100%",
              height: 4,
              background: "#1E293B",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.max(5, (currentIndex / (steps.length - 1)) * 100)}%`,
                background: "linear-gradient(90deg, #F59E0B, #D97706)",
                borderRadius: 2,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Cancel button */}
      {!isComplete && !isFailed && (
        <div style={{ marginTop: 24 }}>
          {showCancel ? (
            <div
              style={{
                padding: "16px 20px",
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: "#94A3B8",
                  margin: "0 0 14px 0",
                }}
              >
                Cancel setup? Everything downloaded so far will be
                removed.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button
                  onClick={() => setShowCancel(false)}
                  style={{
                    padding: "8px 20px",
                    background: "#1E293B",
                    color: "#F1F5F9",
                    border: "1px solid #334155",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Keep going
                </button>
                <button
                  onClick={confirmCancel}
                  style={{
                    padding: "8px 20px",
                    background: "rgba(239,68,68,0.15)",
                    color: "#EF4444",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel setup
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleCancel}
              style={{
                padding: "8px 20px",
                background: "transparent",
                color: "#64748B",
                border: "1px solid #1E293B",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes pull-progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(80%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
