import { useState, useEffect, useRef } from "react";

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "provider", label: "AI Provider" },
  { id: "apikey", label: "API Key" },
  { id: "channels", label: "Channels" },
  { id: "skills", label: "Skills" },
  { id: "launch", label: "Launch" },
];

const PROVIDERS = [
  {
    id: "claude",
    name: "Claude",
    company: "Anthropic",
    desc: "Best reasoning, safest defaults",
    cost: "~$30/mo typical",
    badge: "Recommended",
    color: "#D97706",
    icon: "🧠",
  },
  {
    id: "openai",
    name: "GPT-4o",
    company: "OpenAI",
    desc: "Strong all-rounder, wide ecosystem",
    cost: "~$25/mo typical",
    badge: null,
    color: "#10B981",
    icon: "⚡",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    company: "DeepSeek",
    desc: "Budget-friendly, solid performance",
    cost: "~$8/mo typical",
    badge: "Budget pick",
    color: "#6366F1",
    icon: "🔮",
  },
  {
    id: "ollama",
    name: "Local (Ollama)",
    company: "Your hardware",
    desc: "Fully private, no API costs",
    cost: "Free (needs GPU)",
    badge: "Privacy first",
    color: "#EC4899",
    icon: "🏠",
  },
];

const CHANNELS = [
  { id: "whatsapp", name: "WhatsApp", icon: "💬", desc: "QR code pairing", popular: true },
  { id: "telegram", name: "Telegram", icon: "✈️", desc: "Bot token setup", popular: true },
  { id: "discord", name: "Discord", icon: "🎮", desc: "Server integration", popular: true },
  { id: "signal", name: "Signal", icon: "🔒", desc: "Privacy-focused", popular: false },
  { id: "slack", name: "Slack", icon: "💼", desc: "Workspace bot", popular: false },
  { id: "imessage", name: "iMessage", icon: "🍎", desc: "macOS only", popular: false },
];

const SKILLS = [
  { id: "email", name: "Email Manager", cat: "Productivity", desc: "Triage, draft, and schedule emails", safety: "high", icon: "📧" },
  { id: "calendar", name: "Calendar Sync", cat: "Productivity", desc: "Manage events across platforms", safety: "high", icon: "📅" },
  { id: "web", name: "Web Browser", cat: "Automation", desc: "Browse, scrape, and fill forms", safety: "medium", icon: "🌐" },
  { id: "files", name: "File Manager", cat: "System", desc: "Organise and search local files", safety: "medium", icon: "📁" },
  { id: "notes", name: "Notes & Obsidian", cat: "Productivity", desc: "Capture and organise knowledge", safety: "high", icon: "📝" },
  { id: "smarthome", name: "Smart Home", cat: "IoT", desc: "Control lights, devices, scenes", safety: "medium", icon: "🏡" },
  { id: "github", name: "GitHub", cat: "Developer", desc: "Issues, PRs, and repo management", safety: "high", icon: "🐙" },
  { id: "health", name: "Health Tracker", cat: "Personal", desc: "Sync wearable and fitness data", safety: "high", icon: "❤️" },
  { id: "shell", name: "Shell Access", cat: "System", desc: "Execute terminal commands", safety: "low", icon: "⚡" },
];

const safetyColors = { high: "#22C55E", medium: "#F59E0B", low: "#EF4444" };
const safetyLabels = { high: "Safe", medium: "Caution", low: "Advanced" };

// Lobster ASCII for the welcome screen
const AlcoveLogo = () => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="arch" x1="40" y1="0" x2="40" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Outer arch */}
      <path d="M12 72 V36 Q12 8 40 8 Q68 8 68 36 V72" stroke="url(#arch)" strokeWidth="4" strokeLinecap="round" fill="none" filter="url(#glow)" />
      {/* Inner alcove space */}
      <path d="M24 72 V42 Q24 22 40 22 Q56 22 56 42 V72" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      {/* Threshold line */}
      <line x1="8" y1="72" x2="72" y2="72" stroke="url(#arch)" strokeWidth="3" strokeLinecap="round" />
      {/* Warm glow inside alcove */}
      <ellipse cx="40" cy="58" rx="12" ry="10" fill="#F59E0B" opacity="0.06" />
    </svg>
  </div>
);

const ProgressBar = ({ step }) => {
  const pct = ((step) / (STEPS.length - 1)) * 100;
  return (
    <div style={{ position: "relative", width: "100%", height: "2px", background: "#1E293B", borderRadius: "1px" }}>
      <div style={{
        position: "absolute", left: 0, top: 0, height: "100%",
        width: `${pct}%`, background: "linear-gradient(90deg, #F59E0B, #D97706)",
        borderRadius: "1px", transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
      }} />
      <div style={{
        position: "absolute", display: "flex", justifyContent: "space-between",
        width: "100%", top: "-4px",
      }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{
            width: "10px", height: "10px", borderRadius: "50%",
            background: i <= step ? "#F59E0B" : "#334155",
            border: i === step ? "2px solid #FCD34D" : "2px solid transparent",
            transition: "all 0.4s ease",
            boxShadow: i === step ? "0 0 12px rgba(245,158,11,0.5)" : "none",
          }} />
        ))}
      </div>
    </div>
  );
};

const StepLabel = ({ step }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", marginTop: "16px",
    fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase",
    fontFamily: "'JetBrains Mono', monospace",
  }}>
    {STEPS.map((s, i) => (
      <span key={s.id} style={{
        color: i <= step ? "#F59E0B" : "#475569",
        transition: "color 0.4s ease", width: `${100/STEPS.length}%`, textAlign: "center",
      }}>
        {s.label}
      </span>
    ))}
  </div>
);

export default function AlcoveInstaller() {
  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState(null);
  const spoofKeys = {
    claude: "sk-ant-api03-7xKm9Qr2Fp4Ld8Wn1Vc6Yb0Hj5Gt3Es-DEMO",
    openai: "sk-proj-8mNp2Xr5Kd7Lq9Wf4Vc1Yb6Hj3Gt0Es-DEMO",
    deepseek: "sk-ds-4fKm7Qr9Xp2Ld8Wn5Vc1Yb6Hj3Gt0EsA-DEMO",
    ollama: "http://localhost:11434",
  };
  const [apiKey, setApiKey] = useState("");
  const [apiValid, setApiValid] = useState(null);
  const [channels, setChannels] = useState([]);
  const [skills, setSkills] = useState(["email", "calendar", "notes"]);
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [skillFilter, setSkillFilter] = useState("All");

  const transition = (newStep) => {
    setFadeIn(false);
    setTimeout(() => {
      setStep(newStep);
      setFadeIn(true);
    }, 250);
  };

  const next = () => transition(Math.min(step + 1, STEPS.length - 1));
  const back = () => transition(Math.max(step - 1, 0));

  // Auto-populate spoofed key when arriving at API key step
  useEffect(() => {
    if (step === 2 && provider && !apiKey) {
      const key = spoofKeys[provider] || "";
      setApiKey(key);
      // Auto-trigger validation after a brief pause
      if (key) {
        setTimeout(() => {
          setApiValid("checking");
          setTimeout(() => setApiValid("valid"), 1200);
        }, 600);
      }
    }
  }, [step, provider]);

  const validateKey = () => {
    setApiValid("checking");
    setTimeout(() => setApiValid("valid"), 1200);
  };

  const toggleChannel = (id) => {
    setChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleSkill = (id) => {
    setSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleLaunch = () => {
    setLaunching(true);
    setTimeout(() => { setLaunching(false); setLaunched(true); }, 3000);
  };

  const canNext = () => {
    if (step === 1) return provider !== null;
    if (step === 2) return apiValid === "valid";
    if (step === 3) return channels.length > 0;
    if (step === 4) return skills.length > 0;
    return true;
  };

  const cats = ["All", ...new Set(SKILLS.map(s => s.cat))];
  const filteredSkills = skillFilter === "All" ? SKILLS : SKILLS.filter(s => s.cat === skillFilter);

  const containerStyle = {
    minHeight: "100vh",
    background: "#0B0F1A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  };

  const bgGrid = {
    position: "absolute", inset: 0, zIndex: 0,
    backgroundImage: `
      linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
  };

  const cardStyle = {
    position: "relative", zIndex: 1,
    width: "100%", maxWidth: "620px",
    background: "linear-gradient(180deg, #111827 0%, #0F172A 100%)",
    border: "1px solid #1E293B",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 0 80px rgba(0,0,0,0.6), 0 0 40px rgba(245,158,11,0.04)",
  };

  const contentStyle = {
    opacity: fadeIn ? 1 : 0,
    transform: fadeIn ? "translateY(0)" : "translateY(12px)",
    transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
    minHeight: "340px",
    marginTop: "32px",
  };

  const btnPrimary = (disabled) => ({
    padding: "12px 32px",
    background: disabled ? "#1E293B" : "linear-gradient(135deg, #F59E0B, #D97706)",
    color: disabled ? "#475569" : "#0B0F1A",
    border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: 700,
    letterSpacing: "0.5px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase",
  });

  const btnSecondary = {
    padding: "12px 24px",
    background: "transparent",
    color: "#94A3B8",
    border: "1px solid #334155",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    transition: "all 0.3s ease",
  };

  const heading = {
    fontSize: "28px", fontWeight: 800,
    color: "#F1F5F9",
    letterSpacing: "-0.5px",
    margin: 0,
    fontFamily: "'Inter', sans-serif",
  };

  const subheading = {
    fontSize: "14px", color: "#64748B",
    marginTop: "8px", lineHeight: 1.6,
    fontFamily: "'Inter', sans-serif",
  };

  // --- STEP CONTENT ---

  const WelcomeStep = () => (
    <div style={{ textAlign: "center" }}>
      <AlcoveLogo />
      <div style={{ marginTop: "28px" }}>
        <h1 style={{ ...heading, fontSize: "42px", letterSpacing: "-0.5px", fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Alcove
        </h1>
        <p style={{
          fontSize: "15px", color: "#F59E0B", marginTop: "6px",
          fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
          letterSpacing: "0.5px",
        }}>
          OpenClaw without the stress
        </p>
        <p style={{ ...subheading, maxWidth: "360px", margin: "16px auto 0" }}>
          Your personal AI assistant, running in 3 minutes. No terminal. No config files. Just step inside.
        </p>
      </div>
      <div style={{
        display: "flex", gap: "8px", justifyContent: "center",
        marginTop: "28px", flexWrap: "wrap",
      }}>
        {["macOS", "Windows", "Linux"].map(os => (
          <span key={os} style={{
            padding: "6px 16px", borderRadius: "20px",
            background: "#1E293B", color: "#94A3B8",
            fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
            border: "1px solid #334155",
          }}>{os}</span>
        ))}
      </div>
      <div style={{
        marginTop: "32px", padding: "16px",
        background: "rgba(245,158,11,0.05)",
        border: "1px solid rgba(245,158,11,0.15)",
        borderRadius: "10px", fontSize: "12px",
        color: "#94A3B8", lineHeight: 1.6,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        Installs <span style={{ color: "#F59E0B" }}>OpenClaw v2026.3.5</span> &middot; Open source &middot; MIT license
      </div>
      <button onClick={next} style={{ ...btnPrimary(false), marginTop: "32px", padding: "16px 48px", fontSize: "15px" }}>
        Step Inside →
      </button>
    </div>
  );

  const ProviderStep = () => (
    <div>
      <h2 style={heading}>Choose your AI brain</h2>
      <p style={subheading}>This powers your assistant's intelligence. You can change this later.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "24px" }}>
        {PROVIDERS.map(p => (
          <div
            key={p.id}
            onClick={() => { setProvider(p.id); setApiKey(""); setApiValid(null); }}
            style={{
              padding: "20px",
              background: provider === p.id ? "rgba(245,158,11,0.08)" : "#0F172A",
              border: `1.5px solid ${provider === p.id ? "#F59E0B" : "#1E293B"}`,
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {p.badge && (
              <span style={{
                position: "absolute", top: "8px", right: "8px",
                padding: "2px 8px", borderRadius: "4px",
                background: p.id === "claude" ? "rgba(217,119,6,0.2)" : "rgba(100,116,139,0.2)",
                color: p.id === "claude" ? "#FCD34D" : "#94A3B8",
                fontSize: "9px", fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>{p.badge}</span>
            )}
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{p.icon}</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#F1F5F9" }}>{p.name}</div>
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{p.company}</div>
            <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "8px", lineHeight: 1.5 }}>{p.desc}</div>
            <div style={{
              marginTop: "10px", fontSize: "11px",
              color: p.color,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{p.cost}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const ApiKeyStep = () => {
    const prov = PROVIDERS.find(p => p.id === provider);
    const keyUrls = {
      claude: "console.anthropic.com",
      openai: "platform.openai.com",
      deepseek: "platform.deepseek.com",
      ollama: "localhost:11434",
    };
    return (
      <div>
        <h2 style={heading}>Connect to {prov?.name}</h2>
        <p style={subheading}>
          {provider === "ollama"
            ? "We'll connect to your local Ollama instance."
            : `Paste your API key from ${keyUrls[provider]}. It stays on your machine.`}
        </p>
        <div style={{ marginTop: "24px" }}>
          <div style={{
            display: "flex", alignItems: "center",
            background: "#0F172A", border: "1px solid #1E293B",
            borderRadius: "10px", padding: "4px",
            transition: "border-color 0.3s",
            borderColor: apiValid === "valid" ? "#22C55E" : apiValid === "invalid" ? "#EF4444" : "#1E293B",
          }}>
            <input
              type="text"
              placeholder={provider === "ollama" ? "http://localhost:11434" : "sk-ant-api03-..."}
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setApiValid(null); }}
              style={{
                flex: 1, padding: "14px 16px",
                background: "transparent", border: "none", outline: "none",
                color: "#F1F5F9", fontSize: "14px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
            <button
              onClick={validateKey}
              style={{
                padding: "10px 20px",
                background: apiKey.length > 0 ? "#1E293B" : "#111827",
                color: apiKey.length > 0 ? "#F1F5F9" : "#475569",
                border: "none", borderRadius: "8px",
                fontSize: "12px", fontWeight: 600, cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {apiValid === "checking" ? "Checking..." : "Validate"}
            </button>
          </div>
          {apiValid === "valid" && (
            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#22C55E", fontSize: "18px" }}>✓</span>
              <span style={{ color: "#22C55E", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" }}>
                API key verified. Connection established.
              </span>
            </div>
          )}
          {apiValid === "invalid" && (
            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#EF4444", fontSize: "18px" }}>✗</span>
              <span style={{ color: "#EF4444", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" }}>
                Invalid key. Check and try again.
              </span>
            </div>
          )}
        </div>
        <div style={{
          marginTop: "24px", padding: "16px",
          background: "rgba(245,158,11,0.04)",
          border: "1px solid rgba(245,158,11,0.1)",
          borderRadius: "10px",
        }}>
          <div style={{ fontSize: "12px", color: "#94A3B8", lineHeight: 1.7 }}>
            <span style={{ color: "#F59E0B", fontWeight: 700 }}>🔒 Security note</span>
            <br />Your API key is stored locally in an encrypted keychain. It never leaves your machine. Alcove has zero access to your key.
          </div>
        </div>
        {provider !== "ollama" && (
          <a
            href="#"
            onClick={e => e.preventDefault()}
            style={{
              display: "inline-block", marginTop: "16px",
              color: "#F59E0B", fontSize: "12px",
              textDecoration: "none", borderBottom: "1px dashed rgba(245,158,11,0.4)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Don't have a key? Get one from {keyUrls[provider]} →
          </a>
        )}
      </div>
    );
  };

  const ChannelStep = () => (
    <div>
      <h2 style={heading}>Connect your channels</h2>
      <p style={subheading}>Choose where you'll talk to your assistant. Add more anytime.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "24px" }}>
        {CHANNELS.map(ch => {
          const active = channels.includes(ch.id);
          return (
            <div
              key={ch.id}
              onClick={() => toggleChannel(ch.id)}
              style={{
                padding: "18px 14px",
                background: active ? "rgba(245,158,11,0.08)" : "#0F172A",
                border: `1.5px solid ${active ? "#F59E0B" : "#1E293B"}`,
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                textAlign: "center",
                position: "relative",
              }}
            >
              {ch.popular && (
                <span style={{
                  position: "absolute", top: "6px", right: "6px",
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#F59E0B",
                }} />
              )}
              <div style={{ fontSize: "28px", marginBottom: "6px" }}>{ch.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: active ? "#FCD34D" : "#E2E8F0" }}>
                {ch.name}
              </div>
              <div style={{ fontSize: "10px", color: "#64748B", marginTop: "4px" }}>{ch.desc}</div>
              {active && (
                <div style={{
                  marginTop: "8px", fontSize: "10px",
                  color: "#22C55E",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>Selected ✓</div>
              )}
            </div>
          );
        })}
      </div>
      {channels.includes("whatsapp") && (
        <div style={{
          marginTop: "20px", padding: "20px",
          background: "#0F172A", border: "1px solid #1E293B",
          borderRadius: "12px", textAlign: "center",
        }}>
          <div style={{
            width: "120px", height: "120px", margin: "0 auto",
            background: "#1E293B", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid #334155",
          }}>
            <span style={{ fontSize: "11px", color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>
              [ QR Code ]<br />scan with<br />WhatsApp
            </span>
          </div>
          <p style={{ fontSize: "11px", color: "#64748B", marginTop: "12px" }}>
            Open WhatsApp → Settings → Linked Devices → Scan
          </p>
        </div>
      )}
    </div>
  );

  const SkillStep = () => (
    <div>
      <h2 style={heading}>Pick your skills</h2>
      <p style={subheading}>Skills teach your assistant new abilities. Start small, expand later.</p>
      <div style={{ display: "flex", gap: "6px", marginTop: "16px", flexWrap: "wrap" }}>
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setSkillFilter(c)}
            style={{
              padding: "5px 14px", borderRadius: "20px",
              background: skillFilter === c ? "rgba(245,158,11,0.15)" : "transparent",
              color: skillFilter === c ? "#FCD34D" : "#64748B",
              border: `1px solid ${skillFilter === c ? "rgba(245,158,11,0.3)" : "#1E293B"}`,
              fontSize: "11px", cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.2s ease",
            }}
          >{c}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px", maxHeight: "240px", overflowY: "auto" }}>
        {filteredSkills.map(sk => {
          const active = skills.includes(sk.id);
          return (
            <div
              key={sk.id}
              onClick={() => toggleSkill(sk.id)}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 16px",
                background: active ? "rgba(245,158,11,0.06)" : "#0F172A",
                border: `1px solid ${active ? "rgba(245,158,11,0.25)" : "#1E293B"}`,
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
            >
              <span style={{ fontSize: "22px", width: "30px", textAlign: "center" }}>{sk.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: active ? "#FCD34D" : "#E2E8F0" }}>
                  {sk.name}
                  <span style={{
                    marginLeft: "8px", padding: "2px 6px", borderRadius: "4px",
                    background: `${safetyColors[sk.safety]}20`,
                    color: safetyColors[sk.safety],
                    fontSize: "9px", fontWeight: 700,
                    textTransform: "uppercase",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{safetyLabels[sk.safety]}</span>
                </div>
                <div style={{ fontSize: "11px", color: "#64748B", marginTop: "3px" }}>{sk.desc}</div>
              </div>
              <div style={{
                width: "22px", height: "22px", borderRadius: "6px",
                border: `2px solid ${active ? "#F59E0B" : "#334155"}`,
                background: active ? "#F59E0B" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}>
                {active && <span style={{ color: "#0B0F1A", fontSize: "13px", fontWeight: 900 }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop: "12px", fontSize: "11px",
        color: "#64748B",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {skills.length} skill{skills.length !== 1 ? "s" : ""} selected
      </div>
    </div>
  );

  const LaunchStep = () => {
    const prov = PROVIDERS.find(p => p.id === provider);
    if (launched) {
      return (
        <div style={{ textAlign: "center" }}>
          <div style={{ animation: "pulse 2s infinite", marginBottom: "16px" }}>
            <AlcoveLogo />
          </div>
          <h2 style={{ ...heading, fontSize: "32px", color: "#22C55E" }}>You're live.</h2>
          <p style={{ ...subheading, maxWidth: "340px", margin: "12px auto 0" }}>
            Your OpenClaw assistant is running. Send it a message on {channels.map(c => CHANNELS.find(ch => ch.id === c)?.name).join(", ")}.
          </p>
          <div style={{
            marginTop: "28px", padding: "20px",
            background: "#0F172A", border: "1px solid #1E293B",
            borderRadius: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: "#22C55E",
                boxShadow: "0 0 8px rgba(34,197,94,0.5)",
              }} />
              <span style={{
                color: "#22C55E", fontSize: "13px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}>Gateway running on port 18789</span>
            </div>
            <div style={{
              marginTop: "16px", display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr", gap: "12px",
              textAlign: "center",
            }}>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#F1F5F9" }}>{skills.length}</div>
                <div style={{ fontSize: "10px", color: "#64748B", marginTop: "2px" }}>Skills</div>
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#F1F5F9" }}>{channels.length}</div>
                <div style={{ fontSize: "10px", color: "#64748B", marginTop: "2px" }}>Channels</div>
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#F59E0B" }}>{prov?.name}</div>
                <div style={{ fontSize: "10px", color: "#64748B", marginTop: "2px" }}>Brain</div>
              </div>
            </div>
          </div>
          <button style={{
            ...btnPrimary(false), marginTop: "24px", padding: "14px 40px",
            background: "linear-gradient(135deg, #1E293B, #0F172A)",
            color: "#F1F5F9", border: "1px solid #334155",
          }}>
            Open Alcove Dashboard →
          </button>
        </div>
      );
    }
    return (
      <div style={{ textAlign: "center" }}>
        <h2 style={heading}>Ready to launch</h2>
        <p style={subheading}>Here's what we'll set up:</p>
        <div style={{
          marginTop: "24px", padding: "24px",
          background: "#0F172A", border: "1px solid #1E293B",
          borderRadius: "12px", textAlign: "left",
        }}>
          {[
            { label: "AI Provider", value: prov?.name, icon: prov?.icon },
            { label: "Channels", value: channels.map(c => CHANNELS.find(ch => ch.id === c)?.name).join(", "), icon: "📡" },
            { label: "Skills", value: `${skills.length} selected`, icon: "🧩" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 0",
              borderBottom: i < 2 ? "1px solid #1E293B" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <span style={{ fontSize: "12px", color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>
                  {item.label}
                </span>
              </div>
              <span style={{ fontSize: "13px", color: "#F1F5F9", fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
        {launching ? (
          <div style={{ marginTop: "32px" }}>
            <div style={{
              width: "100%", height: "4px", background: "#1E293B",
              borderRadius: "2px", overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                background: "linear-gradient(90deg, #F59E0B, #D97706)",
                borderRadius: "2px",
                animation: "loading 2.5s ease-in-out forwards",
              }} />
            </div>
            <p style={{
              fontSize: "12px", color: "#F59E0B", marginTop: "12px",
              fontFamily: "'JetBrains Mono', monospace",
            }}>Alcove is setting up OpenClaw for you...</p>
          </div>
        ) : (
          <button onClick={handleLaunch} style={{ ...btnPrimary(false), marginTop: "32px", padding: "16px 48px", fontSize: "15px" }}>
            🏛️ Launch with Alcove
          </button>
        )}
      </div>
    );
  };

  const stepContent = [WelcomeStep, ProviderStep, ApiKeyStep, ChannelStep, SkillStep, LaunchStep];
  const StepContent = stepContent[step];

  return (
    <div style={containerStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        input::placeholder { color: #475569; }
      `}</style>
      <div style={bgGrid} />
      <div style={cardStyle}>
        {step > 0 && step < STEPS.length - 1 && (
          <div>
            <ProgressBar step={step} />
            <StepLabel step={step} />
          </div>
        )}
        <div style={contentStyle}>
          <StepContent />
        </div>
        {step > 0 && step < STEPS.length - 1 && !launched && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px" }}>
            <button onClick={back} style={btnSecondary}>← Back</button>
            <button onClick={next} disabled={!canNext()} style={btnPrimary(!canNext())}>
              {step === STEPS.length - 2 ? "Review →" : "Continue →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
