import type { Step, Provider, Channel, Skill, ModelOption } from "./types";

export const STEPS: Step[] = [
  { id: "welcome", label: "Welcome" },
  { id: "provider", label: "AI Provider" },
  { id: "models", label: "Models" },
  { id: "apikey", label: "API Key" },
  { id: "runtime", label: "Runtime" },
  { id: "channels", label: "Channels" },
  { id: "skills", label: "Skills" },
  { id: "launch", label: "Launch" },
];

export const PROVIDERS: Provider[] = [
  {
    id: "claude",
    name: "Claude",
    company: "Anthropic",
    desc: "Best reasoning, safest defaults",
    cost: "~$30/mo typical",
    badge: "Recommended",
    color: "#D97706",
    icon: "\u{1F9E0}",
  },
  {
    id: "openai",
    name: "GPT-4o",
    company: "OpenAI",
    desc: "Strong all-rounder, wide ecosystem",
    cost: "~$25/mo typical",
    badge: null,
    color: "#10B981",
    icon: "\u26A1",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    company: "DeepSeek",
    desc: "Budget-friendly, solid performance",
    cost: "~$8/mo typical",
    badge: "Budget pick",
    color: "#6366F1",
    icon: "\u{1F52E}",
  },
  {
    id: "ollama",
    name: "Local (Ollama)",
    company: "Your hardware",
    desc: "Fully private, no API costs",
    cost: "Free (needs GPU)",
    badge: "Privacy first",
    color: "#EC4899",
    icon: "\u{1F3E0}",
  },
];

export const QUICK_MODELS: Record<string, ModelOption[]> = {
  claude: [
    { id: "anthropic/claude-haiku-4-5", name: "Claude Haiku", desc: "Lightning fast, great for simple replies", cost: "~$3/mo", provider: "claude" },
    { id: "anthropic/claude-sonnet-4-5", name: "Claude Sonnet", desc: "Fast and smart, good balance", cost: "~$15/mo", provider: "claude" },
  ],
  openai: [
    { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", desc: "Quick and affordable for everyday chats", cost: "~$2/mo", provider: "openai" },
    { id: "openai/gpt-4o", name: "GPT-4o", desc: "Fast and capable, good balance", cost: "~$12/mo", provider: "openai" },
  ],
  deepseek: [
    { id: "deepseek/deepseek-chat", name: "DeepSeek Chat", desc: "Budget-friendly everyday assistant", cost: "~$1/mo", provider: "deepseek" },
  ],
  ollama: [
    { id: "ollama/llama3.2", name: "Llama 3.2 (8B)", desc: "Fast local model, runs on most machines", cost: "Free", provider: "ollama" },
    { id: "ollama/phi3", name: "Phi-3 Mini", desc: "Very fast, lightweight", cost: "Free", provider: "ollama" },
  ],
};

export const DEEP_MODELS: Record<string, ModelOption[]> = {
  claude: [
    { id: "anthropic/claude-sonnet-4-5", name: "Claude Sonnet", desc: "Smart and reliable for most tasks", cost: "~$15/mo", provider: "claude" },
    { id: "anthropic/claude-opus-4-5", name: "Claude Opus", desc: "Most powerful, best for complex reasoning", cost: "~$45/mo", provider: "claude" },
  ],
  openai: [
    { id: "openai/gpt-4o", name: "GPT-4o", desc: "Strong all-rounder for complex tasks", cost: "~$20/mo", provider: "openai" },
    { id: "openai/o1", name: "o1", desc: "Advanced reasoning for hard problems", cost: "~$40/mo", provider: "openai" },
  ],
  deepseek: [
    { id: "deepseek/deepseek-reasoner", name: "DeepSeek Reasoner", desc: "Deep thinking at a fraction of the cost", cost: "~$5/mo", provider: "deepseek" },
  ],
  ollama: [
    { id: "ollama/llama3.2:70b", name: "Llama 3.2 (70B)", desc: "Powerful local model, needs good GPU", cost: "Free", provider: "ollama" },
    { id: "ollama/deepseek-r1:32b", name: "DeepSeek R1 (32B)", desc: "Strong reasoning, runs locally", cost: "Free", provider: "ollama" },
  ],
};

export const CHANNELS: Channel[] = [
  { id: "whatsapp", name: "WhatsApp", icon: "\u{1F4AC}", desc: "QR code pairing", popular: true },
  { id: "telegram", name: "Telegram", icon: "\u2708\uFE0F", desc: "Bot token setup", popular: true },
  { id: "discord", name: "Discord", icon: "\u{1F3AE}", desc: "Server integration", popular: true },
  { id: "signal", name: "Signal", icon: "\u{1F512}", desc: "Privacy-focused", popular: false },
  { id: "slack", name: "Slack", icon: "\u{1F4BC}", desc: "Workspace bot", popular: false },
  { id: "imessage", name: "iMessage", icon: "\u{1F34E}", desc: "macOS only", popular: false },
];

export const SKILLS: Skill[] = [
  { id: "email", name: "Email Manager", cat: "Productivity", desc: "Triage, draft, and schedule emails", safety: "high", icon: "\u{1F4E7}" },
  { id: "calendar", name: "Calendar Sync", cat: "Productivity", desc: "Manage events across platforms", safety: "high", icon: "\u{1F4C5}" },
  { id: "web", name: "Web Browser", cat: "Automation", desc: "Browse, scrape, and fill forms", safety: "medium", icon: "\u{1F310}" },
  { id: "files", name: "File Manager", cat: "System", desc: "Organise and search local files", safety: "medium", icon: "\u{1F4C1}" },
  { id: "notes", name: "Notes & Obsidian", cat: "Productivity", desc: "Capture and organise knowledge", safety: "high", icon: "\u{1F4DD}" },
  { id: "smarthome", name: "Smart Home", cat: "IoT", desc: "Control lights, devices, scenes", safety: "medium", icon: "\u{1F3E1}" },
  { id: "github", name: "GitHub", cat: "Developer", desc: "Issues, PRs, and repo management", safety: "high", icon: "\u{1F419}" },
  { id: "health", name: "Health Tracker", cat: "Personal", desc: "Sync wearable and fitness data", safety: "high", icon: "\u2764\uFE0F" },
  { id: "shell", name: "Shell Access", cat: "System", desc: "Execute terminal commands", safety: "low", icon: "\u26A1" },
];

export const SAFETY_COLORS: Record<string, string> = {
  high: "#22C55E",
  medium: "#F59E0B",
  low: "#EF4444",
};

export const SAFETY_LABELS: Record<string, string> = {
  high: "Safe",
  medium: "Caution",
  low: "Advanced",
};

export const SPOOF_KEYS: Record<string, string> = {
  claude: "sk-ant-api03-7xKm9Qr2Fp4Ld8Wn1Vc6Yb0Hj5Gt3Es-DEMO",
  openai: "sk-proj-8mNp2Xr5Kd7Lq9Wf4Vc1Yb6Hj3Gt0Es-DEMO",
  deepseek: "sk-ds-4fKm7Qr9Xp2Ld8Wn5Vc1Yb6Hj3Gt0EsA-DEMO",
  ollama: "http://localhost:11434",
};

export const KEY_URLS: Record<string, string> = {
  claude: "console.anthropic.com",
  openai: "platform.openai.com",
  deepseek: "platform.deepseek.com",
  ollama: "localhost:11434",
};
