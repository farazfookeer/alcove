import { useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useWizardStore } from "../stores/wizard-store";
import type { SetupStep } from "../lib/types";

export function useSetup() {
  const {
    runtimeMode,
    provider,
    quickModel,
    deepModel,
    apiKey,
    channels,
    skills,
    setSetupStep,
    setLaunching,
    setLaunched,
  } = useWizardStore();

  const abortedRef = useRef(false);

  const checkAbort = async () => {
    try {
      const aborted = await invoke<boolean>("is_setup_aborted");
      return aborted;
    } catch {
      return abortedRef.current;
    }
  };

  const advance = async (step: SetupStep): Promise<boolean> => {
    if (await checkAbort()) return false;
    setSetupStep(step);
    return true;
  };

  const runSetup = useCallback(async () => {
    abortedRef.current = false;
    try {
      await invoke("reset_abort");
    } catch {
      // outside Tauri
    }
    setLaunching(true);

    try {
      if (runtimeMode === "docker") {
        if (!(await advance("checking_docker"))) return;
        await invoke("check_docker");

        if (!(await advance("pulling_image"))) return;
        await invoke("docker_pull_image");

        if (!(await advance("writing_config"))) return;
        await invoke("generate_config", {
          provider,
          quickModel,
          deepModel,
          apiKey,
          channels,
          skills,
        });

        if (!(await advance("starting_gateway"))) return;
        await invoke("docker_start", { apiKey, port: 18789 });

        // Wait for health
        for (let i = 0; i < 10; i++) {
          if (await checkAbort()) return;
          await new Promise((r) => setTimeout(r, 1000));
          const healthy = await invoke<boolean>("check_health", {
            port: 18789,
          });
          if (healthy) break;
        }
      } else {
        if (!(await advance("downloading_runtime"))) return;
        const nodeDir = await invoke<string>("native_download_node");

        if (!(await advance("installing_openclaw"))) return;
        await invoke("native_install_openclaw", { nodeDir });

        if (!(await advance("writing_config"))) return;
        await invoke("generate_config", {
          provider,
          quickModel,
          deepModel,
          apiKey,
          channels,
          skills,
        });

        if (!(await advance("starting_gateway"))) return;
        await invoke("native_start_gateway", { nodeDir, port: 18789 });

        // Wait for health
        for (let i = 0; i < 10; i++) {
          if (await checkAbort()) return;
          await new Promise((r) => setTimeout(r, 1000));
          const healthy = await invoke<boolean>("check_health", {
            port: 18789,
          });
          if (healthy) break;
        }
      }

      if (await checkAbort()) return;

      // Run doctor deep on first launch
      try {
        await invoke("run_doctor_deep");
      } catch {
        // non-fatal
      }

      setSetupStep("complete");
      setTimeout(() => {
        setLaunching(false);
        setLaunched(true);
      }, 1000);
    } catch (err) {
      if (await checkAbort()) return;
      setSetupStep("failed");
      setLaunching(false);
    }
  }, [
    runtimeMode,
    provider,
    quickModel,
    deepModel,
    apiKey,
    channels,
    skills,
    setSetupStep,
    setLaunching,
    setLaunched,
  ]);

  const abort = useCallback(async () => {
    abortedRef.current = true;
    try {
      await invoke("abort_setup");
    } catch {
      // outside Tauri
    }
  }, []);

  const rollback = useCallback(async () => {
    await abort();
    try {
      await invoke<string[]>("rollback_setup");
    } catch {
      // ignore — mock mode
    }
    setSetupStep("cancelled");
    setLaunching(false);
  }, [setSetupStep, setLaunching, abort]);

  return { runSetup, rollback, abort };
}
