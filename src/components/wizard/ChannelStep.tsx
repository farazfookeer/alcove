import { useWizardStore } from "../../stores/wizard-store";
import { CHANNELS } from "../../lib/constants";

export function ChannelStep() {
  const { channels, toggleChannel } = useWizardStore();

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
        Connect your channels
      </h2>
      <p style={{ fontSize: 15, color: "#64748B", marginTop: 10, lineHeight: 1.6 }}>
        Choose where you'll talk to your assistant. Add more anytime.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          marginTop: 28,
        }}
      >
        {CHANNELS.map((ch) => {
          const active = channels.includes(ch.id);
          return (
            <div
              key={ch.id}
              onClick={() => toggleChannel(ch.id)}
              style={{
                padding: "22px 16px",
                background: active ? "rgba(245,158,11,0.08)" : "#0F172A",
                border: `1.5px solid ${active ? "#F59E0B" : "#1E293B"}`,
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.3s ease",
                textAlign: "center",
                position: "relative",
              }}
            >
              {ch.popular && (
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#F59E0B",
                  }}
                />
              )}
              <div style={{ fontSize: 32, marginBottom: 8 }}>{ch.icon}</div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: active ? "#FCD34D" : "#E2E8F0",
                }}
              >
                {ch.name}
              </div>
              <div
                style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}
              >
                {ch.desc}
              </div>
              {active && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    color: "#22C55E",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Selected &#10003;
                </div>
              )}
            </div>
          );
        })}
      </div>

      {channels.includes("whatsapp") && (
        <div
          style={{
            marginTop: 24,
            padding: 24,
            background: "#0F172A",
            border: "1px solid #1E293B",
            borderRadius: 12,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 130,
              height: 130,
              margin: "0 auto",
              background: "#1E293B",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #334155",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#64748B",
                fontFamily: "'JetBrains Mono', monospace",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              [ QR Code ]
              <br />
              scan with
              <br />
              WhatsApp
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#64748B", marginTop: 14 }}>
            Open WhatsApp &rarr; Settings &rarr; Linked Devices &rarr; Scan
          </p>
        </div>
      )}
    </div>
  );
}
