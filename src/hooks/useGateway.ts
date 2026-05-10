import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface GatewayStatus {
  running: boolean;
  port: number;
  mode: string;
}

export function useGateway() {
  const [status, setStatus] = useState<GatewayStatus>({
    running: false,
    port: 18789,
    mode: "unknown",
  });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState("");

  const refresh = useCallback(async () => {
    try {
      const raw = await invoke<Record<string, unknown>>("get_gateway_status");
      setStatus({
        running: raw.running as boolean,
        port: (raw.port as number) ?? 18789,
        mode: (raw.mode as string) ?? "unknown",
      });
    } catch {
      // Outside Tauri — mock
      setStatus({ running: false, port: 18789, mode: "mock" });
    }
  }, []);

  const stop = useCallback(async () => {
    setLoading(true);
    try {
      if (status.mode === "docker") {
        await invoke("docker_stop");
      }
      // Native stop would need the PID — stored in manifest
    } catch {
      // ignore
    }
    await refresh();
    setLoading(false);
  }, [status.mode, refresh]);

  const restart = useCallback(async () => {
    setLoading(true);
    try {
      if (status.mode === "docker") {
        await invoke("docker_restart");
      }
    } catch {
      // ignore
    }
    await refresh();
    setLoading(false);
  }, [status.mode, refresh]);

  const fetchLogs = useCallback(async (tail = 100) => {
    try {
      const result = await invoke<string>("docker_logs", { tail });
      setLogs(result);
    } catch {
      setLogs("[No logs available]");
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { status, loading, logs, refresh, stop, restart, fetchLogs };
}
