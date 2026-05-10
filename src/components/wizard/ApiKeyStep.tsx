import { useEffect } from "react";
import { useWizardStore } from "../../stores/wizard-store";
import { PROVIDERS, KEY_URLS, SPOOF_KEYS } from "../../lib/constants";

export function ApiKeyStep() {
  const { provider, apiKey, apiValid, setApiKey, setApiValid, validateKey } =
    useWizardStore();
  const prov = PROVIDERS.find((p) => p.id === provider);
  const keyUrl = provider ? KEY_URLS[provider] : "";

  useEffect(() => {
    if (provider && !apiKey) {
      const key = SPOOF_KEYS[provider] || "";
      setApiKey(key);
      if (key) {
        const t1 = setTimeout(() => {
          setApiValid("checking");
          const t2 = setTimeout(() => setApiValid("valid"), 1200);
          return () => clearTimeout(t2);
        }, 600);
        return () => clearTimeout(t1);
      }
    }
  }, [provider]);

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
        Connect to {prov?.name}
      </h2>
      <p style={{ fontSize: 15, color: "#64748B", marginTop: 10, lineHeight: 1.6 }}>
        {provider === "ollama"
          ? "We'll connect to your local Ollama instance."
          : `Paste your API key from ${keyUrl}. It stays on your machine.`}
      </p>

      {/* Input */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#0F172A",
          borderRadius: 12,
          padding: 5,
          marginTop: 28,
          transition: "border-color 0.3s",
          border: `1px solid ${
            apiValid === "valid"
              ? "#22C55E"
              : apiValid === "invalid"
                ? "#EF4444"
                : "#1E293B"
          }`,
        }}
      >
        <input
          type="text"
          placeholder={
            provider === "ollama" ? "http://localhost:11434" : "sk-ant-api03-..."
          }
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            flex: 1,
            padding: "16px 18px",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#F1F5F9",
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        />
        <button
          onClick={validateKey}
          style={{
            padding: "12px 22px",
            background: apiKey.length > 0 ? "#1E293B" : "#111827",
            color: apiKey.length > 0 ? "#F1F5F9" : "#475569",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {apiValid === "checking" ? "Checking..." : "Validate"}
        </button>
      </div>

      {/* Validation result */}
      {apiValid === "valid" && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ color: "#22C55E", fontSize: 18 }}>&#10003;</span>
          <span
            style={{
              color: "#22C55E",
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            API key verified. Connection established.
          </span>
        </div>
      )}
      {apiValid === "invalid" && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ color: "#EF4444", fontSize: 18 }}>&#10007;</span>
          <span
            style={{
              color: "#EF4444",
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Invalid key. Check and try again.
          </span>
        </div>
      )}

      {/* Security note */}
      <div
        style={{
          marginTop: 28,
          padding: "18px 22px",
          background: "rgba(245,158,11,0.04)",
          border: "1px solid rgba(245,158,11,0.1)",
          borderRadius: 12,
        }}
      >
        <div
          style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.8 }}
        >
          <span style={{ color: "#F59E0B", fontWeight: 700 }}>
            &#128274; Security note
          </span>
          <br />
          Your API key is stored locally in an encrypted keychain. It never
          leaves your machine. Alcove has zero access to your key.
        </div>
      </div>

      {provider !== "ollama" && (
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{
            display: "inline-block",
            marginTop: 20,
            color: "#F59E0B",
            fontSize: 13,
            textDecoration: "none",
            borderBottom: "1px dashed rgba(245,158,11,0.4)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Don't have a key? Get one from {keyUrl} &rarr;
        </a>
      )}
    </div>
  );
}
