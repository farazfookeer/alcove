import { useEffect, useState } from "react";
import { useWizardStore } from "../../stores/wizard-store";
import { invoke } from "@tauri-apps/api/core";
import type { DockerStatus } from "../../lib/types";

export function RuntimeStep() {
  const { runtimeMode, dockerStatus, setRuntimeMode, setDockerStatus } =
    useWizardStore();
  const [checking, setChecking] = useState(false);

  const checkDocker = async () => {
    setChecking(true);
    try {
      const status = await invoke<DockerStatus>("check_docker");
      setDockerStatus(status);
    } catch {
      // Outside Tauri (e.g. browser tests) — show Docker as available (mock)
      setDockerStatus({
        available: true,
        version: "mock",
        download_url: "https://docs.docker.com/desktop/setup/install/mac-install/",
      });
    }
    setChecking(false);
  };

  useEffect(() => {
    if (!dockerStatus) {
      checkDocker();
    }
  }, []);

  const dockerAvailable = dockerStatus?.available ?? false;

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
        How should we run your assistant?
      </h2>
      <p
        style={{
          fontSize: 15,
          color: "#64748B",
          marginTop: 10,
          lineHeight: 1.6,
        }}
      >
        Choose where your assistant lives on your machine.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginTop: 28,
        }}
      >
        {/* Docker option */}
        <div
          onClick={() => dockerAvailable && setRuntimeMode("docker")}
          style={{
            padding: "22px 24px",
            background:
              runtimeMode === "docker"
                ? "rgba(245,158,11,0.08)"
                : "#0F172A",
            border: `1.5px solid ${
              runtimeMode === "docker" ? "#F59E0B" : "#1E293B"
            }`,
            borderRadius: 12,
            cursor: dockerAvailable ? "pointer" : "default",
            transition: "all 0.3s ease",
            opacity: dockerAvailable ? 1 : 0.5,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 14,
              padding: "3px 10px",
              borderRadius: 4,
              background: "rgba(34,197,94,0.15)",
              color: "#22C55E",
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Recommended
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: 16 }}
          >
            <span style={{ fontSize: 32 }}>&#128051;</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color:
                    runtimeMode === "docker" ? "#FCD34D" : "#E2E8F0",
                }}
              >
                Run in a container
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#94A3B8",
                  marginTop: 6,
                  lineHeight: 1.6,
                }}
              >
                Your assistant runs in a sealed box, completely separate
                from your computer. Nothing gets installed on your
                machine. Easiest to remove later.
              </div>
              {dockerAvailable && dockerStatus?.version && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: "#22C55E",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  &#10003; Docker {dockerStatus.version} detected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Native option */}
        <div
          onClick={() => setRuntimeMode("native")}
          style={{
            padding: "22px 24px",
            background:
              runtimeMode === "native"
                ? "rgba(245,158,11,0.08)"
                : "#0F172A",
            border: `1.5px solid ${
              runtimeMode === "native" ? "#F59E0B" : "#1E293B"
            }`,
            borderRadius: 12,
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 16 }}
          >
            <span style={{ fontSize: 32 }}>&#128187;</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color:
                    runtimeMode === "native" ? "#FCD34D" : "#E2E8F0",
                }}
              >
                Run directly on this machine
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#94A3B8",
                  marginTop: 6,
                  lineHeight: 1.6,
                }}
              >
                Downloads a small runtime into a private folder. Fastest
                performance, no extra software needed.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Docker not available — help install */}
      {!dockerAvailable && !checking && (
        <div
          style={{
            marginTop: 24,
            padding: "20px 24px",
            background: "rgba(245,158,11,0.04)",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#FCD34D",
              marginBottom: 10,
            }}
          >
            &#128051; Want to use containers?
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#94A3B8",
              lineHeight: 1.7,
            }}
          >
            Containers keep everything completely separate from your
            computer. To use them, you'll need a free app called{" "}
            <strong style={{ color: "#E2E8F0" }}>Docker Desktop</strong>.
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            <a
              href={dockerStatus?.download_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                if (dockerStatus?.download_url) {
                  invoke("plugin:opener|open_url", {
                    url: dockerStatus.download_url,
                  });
                }
              }}
              style={{
                padding: "10px 20px",
                background: "#1E293B",
                color: "#F1F5F9",
                border: "1px solid #334155",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "none",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Download Docker Desktop &rarr;
            </a>
            <button
              onClick={checkDocker}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "#F59E0B",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              I've installed it — check again
            </button>
          </div>
        </div>
      )}

      {checking && (
        <div
          style={{
            marginTop: 24,
            fontSize: 13,
            color: "#F59E0B",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Checking for Docker...
        </div>
      )}
    </div>
  );
}
