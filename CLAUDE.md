# Alcove

Desktop app that installs, configures, and manages OpenClaw for non-technical users. Tagline: "OpenClaw without the stress."

## What This Is

A Tauri 2.0 desktop app (Rust backend + React frontend) that wraps the entire OpenClaw lifecycle: install, configure, run, update, monitor. Users never see a terminal. Also supports remote VPS deployment via DigitalOcean API.

## Tech Stack

- **Shell:** Tauri 2.0 (Rust)
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **State:** Zustand (local app state) + SQLite via `tauri-plugin-sql`
- **Fonts:** DM Serif Display (wordmark), JetBrains Mono (UI)
- **Palette:** Background #0B0F1A, surface #0F172A, border #1E293B, amber #F59E0B, green #22C55E
- **Bundled runtime:** Node.js 22 (embedded, user does not install separately)
- **VPS provisioning:** DigitalOcean API v2
- **Secrets:** OS keychain via `tauri-plugin-keychain`

## Architecture

```
alcove/
├── src-tauri/          # Rust backend
│   ├── src/
│   │   ├── main.rs     # Tauri entry, command registration
│   │   ├── commands/   # Tauri IPC commands (invoke from frontend)
│   │   ├── openclaw/   # OpenClaw process management (install, start, stop, health)
│   │   ├── vps/        # DigitalOcean provisioning + SSH management
│   │   └── keychain/   # API key storage via OS keychain
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                # React frontend
│   ├── App.tsx
│   ├── components/
│   │   ├── wizard/     # 6-step onboarding wizard
│   │   ├── dashboard/  # Post-setup monitoring dashboard
│   │   └── ui/         # Shared UI primitives
│   ├── stores/         # Zustand stores
│   ├── hooks/          # React hooks wrapping Tauri invoke calls
│   └── lib/            # Utilities, constants, types
├── CLAUDE.md
├── plan.md             # Living build plan (update after each phase)
└── package.json
```

## Key Decisions

- OpenClaw runs as a **managed subprocess** (local) or **SSH-supervised process** (VPS). Alcove is the supervisor, not a fork.
- API keys go in OS keychain, NEVER in config files or SQLite.
- The wizard flow is: Welcome → Deploy Target (local/cloud) → Provider → API Key → Channels → Skills → Launch.
- All Tauri commands return `Result<T, String>`. Frontend handles errors with toast notifications.
- Prefer `tauri::command` for all backend operations. No raw shell commands from the frontend.

## Build & Test

```bash
# Dev
pnpm install
pnpm tauri dev

# Build
pnpm tauri build

# Test frontend
pnpm test

# Test Rust
cd src-tauri && cargo test

# Lint
pnpm lint && cd src-tauri && cargo clippy
```

## Coding Rules

- TypeScript strict mode. No `any`.
- Rust: use `thiserror` for error types, not string errors in library code.
- React: functional components only, hooks for all Tauri IPC.
- Tailwind only for styling. No CSS modules, no styled-components.
- Every Tauri command gets a corresponding `useX` hook in `src/hooks/`.
- Commit messages: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`.

## Phase Plan

See @plan.md for current build phase and task checklist.
