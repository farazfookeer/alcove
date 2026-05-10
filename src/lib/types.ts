export interface Step {
  id: string;
  label: string;
}

export interface Provider {
  id: string;
  name: string;
  company: string;
  desc: string;
  cost: string;
  badge: string | null;
  color: string;
  icon: string;
}

export interface ModelOption {
  id: string;
  name: string;
  desc: string;
  cost: string;
  provider: string;
}

export interface Channel {
  id: string;
  name: string;
  icon: string;
  desc: string;
  popular: boolean;
}

export type SafetyRating = "high" | "medium" | "low";

export interface Skill {
  id: string;
  name: string;
  cat: string;
  desc: string;
  safety: SafetyRating;
  icon: string;
}

export type ApiValidationState = "checking" | "valid" | "invalid" | null;

export type RuntimeMode = "docker" | "native";

export type TestMode = "mock" | "sandbox" | "production";

export interface DockerStatus {
  available: boolean;
  version: string | null;
  download_url: string;
}

export type SetupStep =
  | "idle"
  | "checking_docker"
  | "pulling_image"
  | "downloading_runtime"
  | "installing_openclaw"
  | "writing_config"
  | "starting_gateway"
  | "complete"
  | "failed"
  | "cancelled";

// ── ClawHub Skill Store ───────────────────────────────────

export interface ClawHubSkill {
  slug: string;
  name: string;
  description: string;
  author: string;
  category: string;
  version: string;
  downloads: number;
  stars: number;
  safety: SafetyRating;
  license: string;
  requires_bins: string[];
  requires_env: string[];
  os: string[];
}

export interface ClawHubSearchResult {
  skills: ClawHubSkill[];
  total: number;
}

export interface InstalledSkill {
  name: string;
  slug: string;
  version: string;
  has_update: boolean;
}

// ── Channel Pairing ──────────────────────────────────────

export interface ChannelStatus {
  id: string;
  name: string;
  paired: boolean;
  status: "connected" | "disconnected" | "pairing" | "error";
  detail: string | null;
}

export interface QrCode {
  data: string;
  expires_in: number;
}

export interface PairingResult {
  success: boolean;
  message: string;
  channel_id: string;
}

export interface WizardState {
  step: number;
  provider: string | null;
  quickModel: string | null;
  deepModel: string | null;
  apiKey: string;
  apiValid: ApiValidationState;
  channels: string[];
  skills: string[];
  skillFilter: string;
  runtimeMode: RuntimeMode | null;
  dockerStatus: DockerStatus | null;
  setupStep: SetupStep;
  setupProgress: number;
  launching: boolean;
  launched: boolean;
  fadeIn: boolean;
}
