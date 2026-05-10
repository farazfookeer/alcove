import { useState, useEffect } from "react";
import { useChannelPairing } from "../../hooks/useChannelPairing";
import { useWizardStore } from "../../stores/wizard-store";
import { CHANNELS } from "../../lib/constants";
import { QrPairing } from "./QrPairing";
import { TokenPairing } from "./TokenPairing";
import { ErrorBanner } from "../ui/ErrorBanner";

type PairingView = null | "whatsapp" | "telegram" | "discord" | "signal";

export function ChannelManager() {
  const { channels } = useWizardStore();
  const {
    statuses,
    qrCode,
    loading,
    pairing,
    error,
    verifiedBot,
    refreshStatuses,
    startWhatsAppPairing,
    verifyTelegramToken,
    pairTelegram,
    verifyDiscordToken,
    pairDiscord,
    startSignalPairing,
    disconnectChannel,
    setError,
    setQrCode,
    setVerifiedBot,
  } = useChannelPairing();

  const [activeView, setActiveView] = useState<PairingView>(null);

  useEffect(() => {
    refreshStatuses();
  }, [refreshStatuses]);

  const selectedChannels = CHANNELS.filter((ch) => channels.includes(ch.id));

  const getStatus = (channelId: string) =>
    statuses.find((s) => s.id === channelId);

  const handleStartPairing = (channelId: string) => {
    setError(null);
    setQrCode(null);
    setVerifiedBot(null);
    setActiveView(channelId as PairingView);
  };

  const handleCancel = () => {
    setActiveView(null);
    setError(null);
    setQrCode(null);
    setVerifiedBot(null);
  };

  const handlePairSuccess = () => {
    setActiveView(null);
    refreshStatuses();
  };

  // Pairing view
  if (activeView) {
    return (
      <div>
        <ErrorBanner message={error} onDismiss={() => setError(null)} />

        {activeView === "whatsapp" && (
          <QrPairing
            channelName="WhatsApp"
            qrData={qrCode?.data ?? null}
            loading={pairing === "whatsapp"}
            instructions="Scan this QR code with your phone to link WhatsApp. Open WhatsApp, go to Settings, then Linked Devices, and tap Link a Device."
            onRequestQr={startWhatsAppPairing}
            onCancel={handleCancel}
          />
        )}

        {activeView === "telegram" && (
          <TokenPairing
            channelName="Telegram"
            placeholder="123456789:ABCdef..."
            instructions="Create a bot using @BotFather on Telegram, then paste the bot token here."
            helpUrl="t.me/BotFather"
            helpLabel="Open BotFather"
            verifiedName={verifiedBot}
            loading={loading}
            pairing={pairing === "telegram"}
            onVerify={verifyTelegramToken}
            onPair={async (token) => {
              const result = await pairTelegram(token);
              if (result?.success) handlePairSuccess();
            }}
            onCancel={handleCancel}
          />
        )}

        {activeView === "discord" && (
          <TokenPairing
            channelName="Discord"
            placeholder="MTk4NjIz..."
            instructions="Create a bot in the Discord Developer Portal, then paste the bot token here."
            helpUrl="discord.com/developers"
            helpLabel="Open Developer Portal"
            verifiedName={verifiedBot}
            loading={loading}
            pairing={pairing === "discord"}
            onVerify={verifyDiscordToken}
            onPair={async (token) => {
              const result = await pairDiscord(token);
              if (result?.success) handlePairSuccess();
            }}
            onCancel={handleCancel}
          />
        )}

        {activeView === "signal" && (
          <QrPairing
            channelName="Signal"
            qrData={qrCode?.data ?? null}
            loading={pairing === "signal"}
            instructions="Scan this QR code with Signal on your phone. Open Signal, go to Settings, then Linked Devices."
            onRequestQr={startSignalPairing}
            onCancel={handleCancel}
          />
        )}
      </div>
    );
  }

  // Channel list view
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#F1F5F9",
            margin: 0,
          }}
        >
          Channels
        </h2>
        <div
          style={{
            fontSize: 11,
            color: "#64748B",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {statuses.filter((s) => s.paired).length} of {selectedChannels.length}{" "}
          connected
        </div>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {selectedChannels.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#64748B",
            fontSize: 13,
          }}
        >
          No channels selected. Go to the wizard to add channels.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {selectedChannels.map((ch) => {
            const status = getStatus(ch.id);
            const isPaired = status?.paired ?? false;
            const statusText = status?.status ?? "disconnected";
            const detail = status?.detail;

            return (
              <div
                key={ch.id}
                style={{
                  padding: "16px 20px",
                  background: "#0F172A",
                  border: `1px solid ${isPaired ? "rgba(34,197,94,0.2)" : "#1E293B"}`,
                  borderRadius: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 14 }}
                >
                  <span style={{ fontSize: 24 }}>{ch.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#F1F5F9",
                      }}
                    >
                      {ch.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: isPaired ? "#22C55E" : "#64748B",
                        fontFamily: "'JetBrains Mono', monospace",
                        marginTop: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: isPaired ? "#22C55E" : "#475569",
                          display: "inline-block",
                        }}
                      />
                      {isPaired
                        ? `Connected${detail ? ` — ${detail}` : ""}`
                        : statusText === "pairing"
                          ? "Pairing..."
                          : "Not connected"}
                    </div>
                  </div>
                </div>

                <div>
                  {isPaired ? (
                    <button
                      onClick={() => disconnectChannel(ch.id)}
                      disabled={loading}
                      style={{
                        padding: "6px 14px",
                        background: "rgba(239,68,68,0.1)",
                        color: "#EF4444",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        opacity: loading ? 0.5 : 1,
                      }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartPairing(ch.id)}
                      style={{
                        padding: "6px 14px",
                        background: "rgba(245,158,11,0.1)",
                        color: "#F59E0B",
                        border: "1px solid rgba(245,158,11,0.2)",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
