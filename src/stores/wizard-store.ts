import { create } from "zustand";
import type {
  WizardState,
  ApiValidationState,
  RuntimeMode,
  DockerStatus,
  SetupStep,
} from "../lib/types";

interface WizardActions {
  setStep: (step: number) => void;
  setProvider: (provider: string) => void;
  setQuickModel: (id: string) => void;
  setDeepModel: (id: string) => void;
  setApiKey: (key: string) => void;
  setApiValid: (state: ApiValidationState) => void;
  setRuntimeMode: (mode: RuntimeMode) => void;
  setDockerStatus: (status: DockerStatus) => void;
  setSetupStep: (step: SetupStep) => void;
  setSetupProgress: (progress: number) => void;
  toggleChannel: (id: string) => void;
  toggleSkill: (id: string) => void;
  setSkillFilter: (filter: string) => void;
  setLaunching: (launching: boolean) => void;
  setLaunched: (launched: boolean) => void;
  setFadeIn: (fadeIn: boolean) => void;
  validateKey: () => void;
  handleLaunch: () => void;
  canNext: () => boolean;
}

export const useWizardStore = create<WizardState & WizardActions>(
  (set, get) => ({
    step: 0,
    provider: null,
    quickModel: null,
    deepModel: null,
    apiKey: "",
    apiValid: null,
    channels: [],
    skills: ["email", "calendar", "notes"],
    skillFilter: "All",
    runtimeMode: null,
    dockerStatus: null,
    setupStep: "idle",
    setupProgress: 0,
    launching: false,
    launched: false,
    fadeIn: true,

    setStep: (step) => set({ step }),
    setProvider: (provider) =>
      set({
        provider,
        quickModel: null,
        deepModel: null,
        apiKey: "",
        apiValid: null,
      }),
    setQuickModel: (id) => set({ quickModel: id }),
    setDeepModel: (id) => set({ deepModel: id }),
    setApiKey: (key) => set({ apiKey: key, apiValid: null }),
    setApiValid: (state) => set({ apiValid: state }),
    setRuntimeMode: (mode) => set({ runtimeMode: mode }),
    setDockerStatus: (status) => set({ dockerStatus: status }),
    setSetupStep: (step) => set({ setupStep: step }),
    setSetupProgress: (progress) => set({ setupProgress: progress }),
    toggleChannel: (id) =>
      set((s) => ({
        channels: s.channels.includes(id)
          ? s.channels.filter((c) => c !== id)
          : [...s.channels, id],
      })),
    toggleSkill: (id) =>
      set((s) => ({
        skills: s.skills.includes(id)
          ? s.skills.filter((sk) => sk !== id)
          : [...s.skills, id],
      })),
    setSkillFilter: (filter) => set({ skillFilter: filter }),
    setLaunching: (launching) => set({ launching }),
    setLaunched: (launched) => set({ launched }),
    setFadeIn: (fadeIn) => set({ fadeIn }),

    validateKey: () => {
      set({ apiValid: "checking" });
      setTimeout(() => set({ apiValid: "valid" }), 1200);
    },

    handleLaunch: () => {
      set({ launching: true });
      setTimeout(() => set({ launching: false, launched: true }), 3000);
    },

    canNext: () => {
      const {
        step,
        provider,
        quickModel,
        deepModel,
        apiValid,
        runtimeMode,
        channels,
        skills,
      } = get();
      // Steps: 0=welcome, 1=provider, 2=models, 3=apikey, 4=runtime, 5=channels, 6=skills, 7=launch
      if (step === 1) return provider !== null;
      if (step === 2) return quickModel !== null && deepModel !== null;
      if (step === 3) return apiValid === "valid";
      if (step === 4) return runtimeMode !== null;
      if (step === 5) return channels.length > 0;
      if (step === 6) return skills.length > 0;
      return true;
    },
  })
);
