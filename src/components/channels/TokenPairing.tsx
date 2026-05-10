import { useState } from "react";

interface TokenPairingProps {
  channelName: string;
  placeholder: string;
  instructions: string;
  helpUrl: string;
  helpLabel: string;
  verifiedName: string | null;
  loading: boolean;
  pairing: boolean;
  onVerify: (token: string) => void;
  onPair: (token: string) => void;
  onCancel: () => void;
}

export function TokenPairing({
  channelName,
  placeholder,
  instructions,
  helpUrl,
  helpLabel,
  verifiedName,
  loading,
  pairing,
  onVerify,
  onPair,
  onCancel,
}: TokenPairingProps) {
  const [token, setToken] = useState("");

  return (
    <div>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#F1F5F9",
          margin: "0 0 8px 0",
        }}
      >
        Pair {channelName}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "#94A3B8",
          lineHeight: 1.6,
          margin: "0 0 20px 0",
        }}
      >
        {instructions}
      </p>

      {/* Help link */}
      <div
        style={{
          padding: "12px 16px",
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.15)",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 12, color: "#F59E0B" }}>
          {helpLabel}:{" "}
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "#FCD34D",
            }}
          >
            {helpUrl}
          </span>
        </span>
      </div>

      {/* Token input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={placeholder}
          aria-label={`${channelName} bot token`}
          style={{
            flex: 1,
            padding: "10px 16px",
            background: "#0F172A",
            border: `1px solid ${verifiedName ? "rgba(34,197,94,0.4)" : "#1E293B"}`,
            borderRadius: 8,
            color: "#F1F5F9",
            fontSize: 13,
            outline: "none",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        />
        <button
          onClick={() => onVerify(token)}
          disabled={loading || token.length < 10}
          style={{
            padding: "10px 16px",
            background: "#1E293B",
            color: "#F1F5F9",
            border: "1px solid #334155",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            opacity: loading || token.length < 10 ? 0.5 : 1,
          }}
        >
          {loading ? "Checking..." : "Verify"}
        </button>
      </div>

      {/* Verification result */}
      {verifiedName && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 8,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: "#22C55E", fontSize: 16 }}>&#10003;</span>
          <span style={{ fontSize: 13, color: "#22C55E" }}>
            Bot verified: {verifiedName}
          </span>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 20px",
            background: "#1E293B",
            color: "#F1F5F9",
            border: "1px solid #334155",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onPair(token)}
          disabled={!verifiedName || pairing}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "#0B0F1A",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            opacity: !verifiedName || pairing ? 0.5 : 1,
          }}
        >
          {pairing ? "Connecting..." : "Connect"}
        </button>
      </div>
    </div>
  );
}
