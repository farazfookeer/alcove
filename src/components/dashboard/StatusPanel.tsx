import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useGateway } from "../../hooks/useGateway";
import { useWizardStore } from "../../stores/wizard-store";
import {
  PROVIDERS,
  CHANNELS,
  QUICK_MODELS,
  DEEP_MODELS,
} from "../../lib/constants";
import { CostTracker } from "./CostTracker";
import type { ChannelStatus } from "../../lib/types";

export function StatusPanel() {
  const { status, loading, stop, restart } = useGateway();
  const { provider, quickModel, deepModel, runtimeMode, channels, skills } =
    useWizardStore();

  const prov = PROVIDERS.find((p) => p.id === provider);
  const quickName = provider
    ? QUICK_MODELS[provider]?.find((m) => m.id === quickModel)?.name
    : null;
  const deepName = provider
    ? DEEP_MODELS[provider]?.find((m) => m.id === deepModel)?.name
    : null;
  const [channelStatuses, setChannelStatuses] = useState<ChannelStatus[]>([]);

  useEffect(() => {
    invoke<ChannelStatus[]>("channel_get_all_status")
      .then(setChannelStatuses)
      .catch(() => {});
  }, []);

  const getChannelPaired = (channelId: string) =>
    channelStatuses.find((s) => s.id === channelId)?.paired ?? false;

  return (
    <div>
      {/* Gateway status card */}
      <div
        style={{
          padding: "24px",
          background: "#0F172A",
          border: "1px solid #1E293B",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: status.running ? "#22C55E" : "#EF4444",
                boxShadow: status.running
                  ? "0 0 8px rgba(34,197,94,0.5)"
                  : "0 0 8px rgba(239,68,68,0.5)",
              }}
            />
            <div>
              <div
                style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}
              >
                Gateway
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#64748B",
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: 2,
                }}
              >
                Port {status.port} &middot;{" "}
                {runtimeMode === "docker" ? "Container" : "Native"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={restart}
              disabled={loading}
              style={{
                padding: "8px 16px",
                background: "#1E293B",
                color: "#F1F5F9",
                border: "1px solid #334155",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                opacity: loading ? 0.5 : 1,
              }}
            >
              Restart
            </button>
            <button
              onClick={stop}
              disabled={loading}
              style={{
                padding: "8px 16px",
                background: "rgba(239,68,68,0.1)",
                color: "#EF4444",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                opacity: loading ? 0.5 : 1,
              }}
            >
              Stop
            </button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {/* AI Brain */}
        <div
          style={{
            padding: "20px",
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
            }}
          >
            AI Brain
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#F59E0B",
              marginTop: 8,
            }}
          >
            {prov?.name ?? "—"}
          </div>
        </div>

        {/* Skills count */}
        <div
          style={{
            padding: "20px",
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
            }}
          >
            Skills
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#F1F5F9",
              marginTop: 6,
            }}
          >
            {skills.length}
          </div>
        </div>
      </div>

      {/* Models */}
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
            marginBottom: 14,
          }}
        >
          Models
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                color: "#94A3B8",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>&#9889;</span> Quick replies
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#E2E8F0",
                marginTop: 4,
              }}
            >
              {quickName ?? "—"}
            </div>
          </div>
          <div
            style={{
              width: 1,
              background: "#1E293B",
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                color: "#94A3B8",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>&#129504;</span> Deep thinking
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#E2E8F0",
                marginTop: 4,
              }}
            >
              {deepName ?? "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Tracker */}
      <div style={{ marginBottom: 16 }}>
        <CostTracker />
      </div>

      {/* Channels */}
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
            marginBottom: 12,
          }}
        >
          Channels
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {channels.map((id) => {
            const ch = CHANNELS.find((c) => c.id === id);
            if (!ch) return null;
            const paired = getChannelPaired(id);
            return (
              <span
                key={id}
                style={{
                  padding: "6px 14px",
                  background: paired
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(100,116,139,0.08)",
                  border: `1px solid ${paired ? "rgba(34,197,94,0.2)" : "rgba(100,116,139,0.2)"}`,
                  borderRadius: 20,
                  fontSize: 12,
                  color: paired ? "#22C55E" : "#64748B",
                  fontFamily: "'JetBrains Mono', monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: paired ? "#22C55E" : "#475569",
                    display: "inline-block",
                  }}
                />
                {ch.name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
