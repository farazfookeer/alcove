import { useEffect } from "react";
import { useGateway } from "../../hooks/useGateway";

export function LogViewer() {
  const { logs, fetchLogs } = useGateway();

  useEffect(() => {
    fetchLogs(100);
    const interval = setInterval(() => fetchLogs(100), 3000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#F1F5F9",
          }}
        >
          Gateway Logs
        </span>
        <button
          onClick={() => fetchLogs(100)}
          style={{
            padding: "6px 14px",
            background: "#1E293B",
            color: "#94A3B8",
            border: "1px solid #334155",
            borderRadius: 6,
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Refresh
        </button>
      </div>

      <div
        style={{
          padding: "20px",
          background: "#0F172A",
          border: "1px solid #1E293B",
          borderRadius: 12,
          maxHeight: 400,
          overflowY: "auto",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          lineHeight: 1.8,
          color: "#94A3B8",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {logs || "No logs available yet."}
      </div>
    </div>
  );
}
