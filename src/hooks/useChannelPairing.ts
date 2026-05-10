import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { ChannelStatus, QrCode, PairingResult } from "../lib/types";

export function useChannelPairing() {
  const [statuses, setStatuses] = useState<ChannelStatus[]>([]);
  const [qrCode, setQrCode] = useState<QrCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [pairing, setPairing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifiedBot, setVerifiedBot] = useState<string | null>(null);

  const refreshStatuses = useCallback(async () => {
    try {
      const list = await invoke<ChannelStatus[]>("channel_get_all_status");
      setStatuses(list);
    } catch {
      // Outside Tauri, keep empty
    }
  }, []);

  const startWhatsAppPairing = useCallback(async () => {
    setPairing("whatsapp");
    setError(null);
    setQrCode(null);
    try {
      const qr = await invoke<QrCode>("channel_whatsapp_qr", {});
      setQrCode(qr);
    } catch (e) {
      setError(String(e));
    }
    setPairing(null);
  }, []);

  const checkWhatsAppStatus = useCallback(async () => {
    try {
      const status = await invoke<ChannelStatus>("channel_whatsapp_status", {});
      setStatuses((prev) =>
        prev.map((s) => (s.id === "whatsapp" ? status : s))
      );
      return status;
    } catch (e) {
      setError(String(e));
      return null;
    }
  }, []);

  const verifyTelegramToken = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    setVerifiedBot(null);
    try {
      const botName = await invoke<string>("channel_telegram_verify", { token });
      setVerifiedBot(botName);
      setLoading(false);
      return botName;
    } catch (e) {
      setError(String(e));
      setLoading(false);
      return null;
    }
  }, []);

  const pairTelegram = useCallback(async (token: string) => {
    setPairing("telegram");
    setError(null);
    try {
      const result = await invoke<PairingResult>("channel_telegram_pair", { token });
      if (result.success) {
        await refreshStatuses();
      }
      setPairing(null);
      return result;
    } catch (e) {
      setError(String(e));
      setPairing(null);
      return null;
    }
  }, [refreshStatuses]);

  const verifyDiscordToken = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    setVerifiedBot(null);
    try {
      const botName = await invoke<string>("channel_discord_verify", { token });
      setVerifiedBot(botName);
      setLoading(false);
      return botName;
    } catch (e) {
      setError(String(e));
      setLoading(false);
      return null;
    }
  }, []);

  const pairDiscord = useCallback(async (token: string) => {
    setPairing("discord");
    setError(null);
    try {
      const result = await invoke<PairingResult>("channel_discord_pair", { token });
      if (result.success) {
        await refreshStatuses();
      }
      setPairing(null);
      return result;
    } catch (e) {
      setError(String(e));
      setPairing(null);
      return null;
    }
  }, [refreshStatuses]);

  const startSignalPairing = useCallback(async () => {
    setPairing("signal");
    setError(null);
    setQrCode(null);
    try {
      const qr = await invoke<QrCode>("channel_signal_qr", {});
      setQrCode(qr);
    } catch (e) {
      setError(String(e));
    }
    setPairing(null);
  }, []);

  const disconnectChannel = useCallback(async (channelId: string) => {
    setLoading(true);
    setError(null);
    try {
      await invoke<string>("channel_disconnect", { channelId });
      await refreshStatuses();
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  }, [refreshStatuses]);

  return {
    statuses,
    qrCode,
    loading,
    pairing,
    error,
    verifiedBot,
    refreshStatuses,
    startWhatsAppPairing,
    checkWhatsAppStatus,
    verifyTelegramToken,
    pairTelegram,
    verifyDiscordToken,
    pairDiscord,
    startSignalPairing,
    disconnectChannel,
    setError,
    setQrCode,
    setVerifiedBot,
  };
}
