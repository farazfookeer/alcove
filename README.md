# Alcove

**OpenClaw without the stress.** A desktop app that installs, configures, and manages [OpenClaw](https://openclaw.ai) for non-technical users. No terminal. No config files. No jargon.

## What is this?

Alcove wraps the entire OpenClaw lifecycle into a friendly desktop app: install, configure, run, update, and monitor your AI assistant — all through a visual interface. Pick your AI brain, connect your messaging apps, install skills, and you're done.

## Features

- **8-step onboarding wizard** — provider selection, dual model picker (fast + smart), API key validation, runtime choice, channel pairing, skill selection, review & launch
- **5-tab dashboard** — status overview, channel management, skill store, log viewer, settings
- **Dual runtime support** — run OpenClaw natively or in a Docker container
- **Skill Store** — browse, search, and install from 13,700+ community skills via ClawHub
- **Channel pairing** — WhatsApp (QR), Telegram (bot token), Discord (bot token), Signal (QR)
- **OS keychain** — API keys stored securely in macOS Keychain / Windows Credential Manager
- **Cost tracker** — estimated monthly API spend broken down by quick replies vs deep thinking
- **Auto-updater** — checks for new Alcove and OpenClaw versions
- **Full uninstall** — removes everything cleanly, leaves zero traces
- **Mock mode** — full UI works without any real downloads or installs (for development and demos)

## Tech Stack

- **Shell:** Tauri 2.0 (Rust backend + React frontend)
- **Frontend:** React 18, TypeScript, inline styles
- **State:** Zustand
- **Fonts:** DM Serif Display, JetBrains Mono
- **Palette:** Dark theme — `#0B0F1A` background, `#F59E0B` amber accents, `#22C55E` green status

## Quick Start

```bash
# Install dependencies
pnpm install

# Run in mock mode (no real downloads, no installs)
pnpm dev

# Run with Tauri (full desktop app)
pnpm tauri dev

# Run tests
pnpm test              # 18 Playwright E2E tests
cd src-tauri && cargo test  # 9 Rust integration tests
```

## Project Structure

```
alcove/
├── src/                     # React frontend
│   ├── components/
│   │   ├── wizard/          # 8-step onboarding wizard
│   │   ├── dashboard/       # Status, logs, settings, cost tracker
│   │   ├── channels/        # Channel pairing UI (QR, token flows)
│   │   ├── skillstore/      # ClawHub skill browser
│   │   └── ui/              # Shared components (Button, ErrorBanner, etc.)
│   ├── hooks/               # Tauri invoke wrappers
│   ├── stores/              # Zustand state
│   └── lib/                 # Types, constants
├── src-tauri/               # Rust backend
│   └── src/
│       ├── channels/        # Channel pairing (WhatsApp, Telegram, Discord, Signal)
│       ├── clawhub/         # ClawHub API client
│       ├── config/          # OpenClaw config generation
│       ├── docker/          # Docker container lifecycle
│       ├── gateway/         # WebSocket RPC client
│       ├── keychain/        # OS keychain storage
│       ├── native/          # Native Node.js runtime management
│       ├── paths/           # Cross-platform path resolution
│       ├── recovery/        # Claw Doctor wrapper
│       ├── setup/           # Setup manifest & rollback
│       └── lib.rs           # ~50 Tauri commands with mock mode
├── e2e/                     # Playwright E2E tests
└── plan.md                  # Build plan with phase tracking
```

## Current Status

| Phase | Status |
|-------|--------|
| Phase 1: Scaffold & Wizard UI | Complete |
| Phase 2: Local OpenClaw Engine | Complete |
| Phase 3: Channel Pairing | Complete |
| Phase 4: Skill Store & Polish | Complete |
| Phase 5: Open Source & Ship | In progress |

## Known Untested Areas

This project is functional but has gaps in test coverage. Contributions welcome.

### No unit tests
- React hooks (`useSkillStore`, `useChannelPairing`, `useGateway`, `useSetup`)
- Cost calculation logic in `CostTracker.tsx`
- Error humanization in `ErrorBanner.tsx` (`humanize()` function)
- Zustand store actions and `canNext()` validation logic

### No integration tests for critical flows
- Setup pipeline (download runtime → install OpenClaw → write config → start gateway)
- Rollback on failure (does aborting mid-setup actually clean up?)
- Full uninstall flow (does it remove all files, keychain entries, containers?)
- Runtime switching (Docker ↔ Native migration)
- Skill install/remove via actual `openclaw` CLI

### E2E tests only cover happy path
- No error state tests (API failures, network errors, invalid input)
- No edge case tests (empty states, timeouts, concurrent operations)
- Tests run in browser-only mock mode — Tauri invoke calls are never exercised
- Channel pairing tests only verify UI renders, not actual pair/verify/connect flows

### No real-world testing
- Never tested against a live OpenClaw gateway
- Channel pairing (WhatsApp QR, Telegram bot token) untested with real services
- ClawHub API calls untested against real `clawhub.ai` endpoints
- Docker container lifecycle untested with real Docker
- Cross-platform: not tested on Windows or Linux

### No accessibility testing
- ARIA labels exist but no screen reader testing
- No keyboard navigation testing beyond basic tab flow
- No colour contrast validation

## Contributing

See [plan.md](plan.md) for the full build plan and task breakdown. The untested areas listed above are a great place to start.

## License

MIT
