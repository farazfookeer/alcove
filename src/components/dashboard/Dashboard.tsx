import { useState } from "react";
import { AlcoveLogo } from "../ui/AlcoveLogo";
import { StatusPanel } from "./StatusPanel";
import { LogViewer } from "./LogViewer";
import { SettingsPanel } from "./SettingsPanel";
import { SkillStore } from "../skillstore/SkillStore";
import { ChannelManager } from "../channels/ChannelManager";

type Tab = "status" | "channels" | "skills" | "logs" | "settings";

export function Dashboard() {
  const [tab, setTab] = useState<Tab>("status");

  const tabs: { id: Tab; label: string }[] = [
    { id: "status", label: "Status" },
    { id: "channels", label: "Channels" },
    { id: "skills", label: "Skills" },
    { id: "logs", label: "Logs" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0F1A",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 640,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 14 }}
          >
            <div style={{ transform: "scale(0.5)", transformOrigin: "left center" }}>
              <AlcoveLogo />
            </div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#F1F5F9",
                fontFamily: "'DM Serif Display', Georgia, serif",
              }}
            >
              Alcove
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22C55E",
                boxShadow: "0 0 6px rgba(34,197,94,0.5)",
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: "#22C55E",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}
            >
              Online
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Dashboard navigation"
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 28,
            background: "#0F172A",
            borderRadius: 10,
            padding: 4,
            border: "1px solid #1E293B",
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              role="tab"
              aria-label={`${t.label} tab`}
              aria-selected={tab === t.id}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                background:
                  tab === t.id ? "rgba(245,158,11,0.1)" : "transparent",
                color: tab === t.id ? "#FCD34D" : "#64748B",
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                transition: "all 0.2s ease",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div role="tabpanel" aria-label={`${tab} panel`}>
        {tab === "status" && <StatusPanel />}
        {tab === "channels" && <ChannelManager />}
        {tab === "skills" && <SkillStore />}
        {tab === "logs" && <LogViewer />}
        {tab === "settings" && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
}
