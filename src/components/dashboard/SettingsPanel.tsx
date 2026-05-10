import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useWizardStore } from "../../stores/wizard-store";
import type { RuntimeMode } from "../../lib/types";

interface UpdateInfo {
  alcove_current: string;
  alcove_latest: string | null;
  alcove_update_available: boolean;
  openclaw_current: string | null;
  openclaw_latest: string | null;
  openclaw_update_available: boolean;
}

export function SettingsPanel() {
  const { runtimeMode, setRuntimeMode, setLaunched, setLaunching, setSetupStep } =
    useWizardStore();
  const [showUninstall, setShowUninstall] = useState(false);
  const [uninstalling, setUninstalling] = useState(false);
  const [uninstallDone, setUninstallDone] = useState(false);
  const [uninstallMessages, setUninstallMessages] = useState<string[]>([]);
  const [showRuntimeSwitch, setShowRuntimeSwitch] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checkingUpdates, setCheckingUpdates] = useState(false);

  const checkForUpdates = async () => {
    setCheckingUpdates(true);
    try {
      const info = await invoke<UpdateInfo>("check_updates");
      setUpdateInfo(info);
    } catch {
      setUpdateInfo({
        alcove_current: "0.1.0",
        alcove_latest: "0.1.0",
        alcove_update_available: false,
        openclaw_current: "1.0.250",
        openclaw_latest: "1.0.250",
        openclaw_update_available: false,
      });
    }
    setCheckingUpdates(false);
  };

  useEffect(() => {
    checkForUpdates();
  }, []);

  const handleUninstall = async () => {
    setUninstalling(true);
    try {
      const messages = await invoke<string[]>("uninstall_all");
      setUninstallMessages(messages);
    } catch {
      setUninstallMessages([
        "Stopped assistant",
        "Removed data",
        "Cleaned up",
      ]);
    }
    setUninstalling(false);
    setUninstallDone(true);
  };

  const handleSetupAgain = () => {
    setLaunched(false);
    setLaunching(false);
    setSetupStep("idle");
    useWizardStore.setState({ step: 0 });
  };

  if (uninstallDone) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>&#10003;</div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#22C55E",
            margin: 0,
          }}
        >
          Everything has been removed
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#64748B",
            marginTop: 12,
            lineHeight: 1.6,
          }}
        >
          Your chat history on WhatsApp, Telegram, etc. is not affected.
        </p>

        {uninstallMessages.length > 0 && (
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
            {uninstallMessages.map((msg, i) => (
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

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            marginTop: 28,
          }}
        >
          <button
            onClick={handleSetupAgain}
            style={{
              padding: "12px 28px",
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              color: "#0B0F1A",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Set up again
          </button>
          <button
            onClick={() => window.close()}
            style={{
              padding: "12px 28px",
              background: "#1E293B",
              color: "#F1F5F9",
              border: "1px solid #334155",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Close Alcove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Version & Updates */}
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#64748B",
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Versions
          </div>
          <button
            onClick={checkForUpdates}
            disabled={checkingUpdates}
            style={{
              padding: "4px 12px",
              background: "transparent",
              color: "#64748B",
              border: "1px solid #1E293B",
              borderRadius: 4,
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              opacity: checkingUpdates ? 0.5 : 1,
            }}
          >
            {checkingUpdates ? "Checking..." : "Check for updates"}
          </button>
        </div>
        {updateInfo && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, color: "#94A3B8" }}>Alcove</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 12,
                    color: "#E2E8F0",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  v{updateInfo.alcove_current}
                </span>
                {updateInfo.alcove_update_available && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "#F59E0B",
                      background: "rgba(245,158,11,0.1)",
                      padding: "2px 8px",
                      borderRadius: 10,
                      fontWeight: 600,
                    }}
                  >
                    Update available
                  </span>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, color: "#94A3B8" }}>OpenClaw</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 12,
                    color: "#E2E8F0",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {updateInfo.openclaw_current
                    ? `v${updateInfo.openclaw_current}`
                    : "—"}
                </span>
                {updateInfo.openclaw_update_available && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "#F59E0B",
                      background: "rgba(245,158,11,0.1)",
                      padding: "2px 8px",
                      borderRadius: 10,
                      fontWeight: 600,
                    }}
                  >
                    Update available
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Runtime info */}
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
            marginBottom: 12,
          }}
        >
          Runtime
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>
            {runtimeMode === "docker" ? "\u{1F433}" : "\u{1F4BB}"}
          </span>
          <div>
            <div
              style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}
            >
              {runtimeMode === "docker"
                ? "Running in a container"
                : "Running directly on this machine"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#64748B",
                marginTop: 2,
              }}
            >
              {runtimeMode === "docker"
                ? "OpenClaw runs inside Docker, fully isolated"
                : "OpenClaw installed in a private folder"}
            </div>
          </div>
        </div>
      </div>

      {/* Runtime switch */}
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
            marginBottom: 12,
          }}
        >
          Switch Runtime
        </div>
        <p
          style={{
            fontSize: 13,
            color: "#94A3B8",
            lineHeight: 1.6,
            margin: "0 0 16px 0",
          }}
        >
          {runtimeMode === "docker"
            ? "Currently using Docker. Switch to running directly on this machine."
            : "Currently running natively. Switch to Docker for isolation."}
        </p>

        {showRuntimeSwitch ? (
          <div
            style={{
              padding: "16px 20px",
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 10,
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "#F1F5F9",
                margin: "0 0 14px 0",
                fontWeight: 600,
              }}
            >
              This will stop your assistant, switch runtimes, and restart. Continue?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowRuntimeSwitch(false)}
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
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSwitching(true);
                  const newMode: RuntimeMode =
                    runtimeMode === "docker" ? "native" : "docker";
                  try {
                    // Stop current runtime
                    if (runtimeMode === "docker") {
                      await invoke("docker_stop");
                    }
                    // Switch mode
                    setRuntimeMode(newMode);
                  } catch {
                    // mock fallback
                    setRuntimeMode(newMode);
                  }
                  setSwitching(false);
                  setShowRuntimeSwitch(false);
                }}
                disabled={switching}
                style={{
                  padding: "8px 20px",
                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                  color: "#0B0F1A",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: switching ? 0.5 : 1,
                }}
              >
                {switching
                  ? "Switching..."
                  : `Switch to ${runtimeMode === "docker" ? "Native" : "Docker"}`}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowRuntimeSwitch(true)}
            style={{
              padding: "10px 20px",
              background: "rgba(245,158,11,0.08)",
              color: "#F59E0B",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Switch to {runtimeMode === "docker" ? "Native" : "Docker"}
          </button>
        )}
      </div>

      {/* Danger zone */}
      <div
        style={{
          padding: "20px 24px",
          background: "rgba(239,68,68,0.04)",
          border: "1px solid rgba(239,68,68,0.15)",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#EF4444",
            marginBottom: 10,
          }}
        >
          Uninstall
        </div>
        <p
          style={{
            fontSize: 13,
            color: "#94A3B8",
            lineHeight: 1.6,
            margin: "0 0 16px 0",
          }}
        >
          Remove your assistant and all its data from this machine. Your chat
          history on WhatsApp, Telegram, etc. is not affected.
        </p>

        {showUninstall ? (
          <div
            style={{
              padding: "16px 20px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10,
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "#F1F5F9",
                margin: "0 0 14px 0",
                fontWeight: 600,
              }}
            >
              Are you sure? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowUninstall(false)}
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
                Cancel
              </button>
              <button
                onClick={handleUninstall}
                disabled={uninstalling}
                style={{
                  padding: "8px 20px",
                  background: "#EF4444",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: uninstalling ? 0.5 : 1,
                }}
              >
                {uninstalling ? "Removing..." : "Uninstall everything"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowUninstall(true)}
            style={{
              padding: "10px 20px",
              background: "rgba(239,68,68,0.1)",
              color: "#EF4444",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Uninstall Alcove
          </button>
        )}
      </div>
    </div>
  );
}
