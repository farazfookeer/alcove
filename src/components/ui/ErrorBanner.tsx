import { useState, useEffect } from "react";

interface ErrorBannerProps {
  message: string | null;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!visible || !message) return null;

  // Convert technical errors to human-readable messages
  const friendly = humanize(message);

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        padding: "12px 20px",
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <span style={{ fontSize: 13, color: "#F87171", lineHeight: 1.5 }}>
        {friendly}
      </span>
      <button
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
        aria-label="Dismiss error"
        style={{
          background: "transparent",
          border: "none",
          color: "#64748B",
          cursor: "pointer",
          fontSize: 16,
          padding: "0 4px",
          flexShrink: 0,
        }}
      >
        &#10005;
      </button>
    </div>
  );
}

function humanize(error: string): string {
  const lower = error.toLowerCase();

  if (lower.includes("network") || lower.includes("fetch") || lower.includes("econnrefused"))
    return "Can't reach the server. Check your internet connection and try again.";

  if (lower.includes("docker") && lower.includes("not found"))
    return "Docker isn't installed. Install Docker Desktop first, then try again.";

  if (lower.includes("permission") || lower.includes("eacces"))
    return "Permission denied. Try running Alcove with admin privileges.";

  if (lower.includes("timeout") || lower.includes("timed out"))
    return "The operation took too long. Your connection might be slow — try again.";

  if (lower.includes("api key") || lower.includes("unauthorized") || lower.includes("401"))
    return "Your API key doesn't seem to work. Double-check it and try again.";

  if (lower.includes("disk") || lower.includes("enospc") || lower.includes("no space"))
    return "Not enough disk space. Free up some storage and try again.";

  if (lower.includes("port") && lower.includes("in use"))
    return "Port 18789 is already in use. Another app might be running on it.";

  if (lower.includes("install") && lower.includes("fail"))
    return "Installation failed. Check your internet connection and try again.";

  // Strip common technical prefixes
  let cleaned = error
    .replace(/^Error:\s*/i, "")
    .replace(/^Failed to\s*/i, "Could not ")
    .replace(/\s*\(os error \d+\)/g, "");

  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}
