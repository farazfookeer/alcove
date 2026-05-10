interface QrPairingProps {
  channelName: string;
  qrData: string | null;
  loading: boolean;
  instructions: string;
  onRequestQr: () => void;
  onCancel: () => void;
}

export function QrPairing({
  channelName,
  qrData,
  loading,
  instructions,
  onRequestQr,
  onCancel,
}: QrPairingProps) {
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

      {/* QR Code display */}
      <div
        style={{
          width: 200,
          height: 200,
          margin: "0 auto 20px",
          background: qrData ? "#FFFFFF" : "#1E293B",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #334155",
        }}
      >
        {loading ? (
          <span
            style={{
              fontSize: 13,
              color: "#64748B",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Loading...
          </span>
        ) : qrData ? (
          <div
            style={{
              width: 180,
              height: 180,
              background: `repeating-conic-gradient(#0B0F1A 0% 25%, #FFFFFF 0% 50%) 0 0 / 12px 12px`,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={`${channelName} QR code`}
          >
            <span
              style={{
                fontSize: 10,
                color: "#0B0F1A",
                fontFamily: "'JetBrains Mono', monospace",
                background: "#FFFFFF",
                padding: "4px 8px",
                borderRadius: 4,
              }}
            >
              QR Ready
            </span>
          </div>
        ) : (
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
            Click below
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
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
          onClick={onRequestQr}
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "#0B0F1A",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? "Requesting..." : qrData ? "Refresh QR" : "Get QR Code"}
        </button>
      </div>
    </div>
  );
}
