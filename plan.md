# Alcove Build Plan

Living document. Update status after completing each task.

## Design Principles

- **Target user:** Non-technical. No terminal, no config files, no jargon.
- **Language:** Use plain English everywhere. "AI brain" not "model provider". "Quick tasks" not "heartbeat model". "Deep thinking" not "complex reasoning model".
- **Dual model setup:** Users pick two models — a fast cheap one for everyday messages (heartbeat), and a powerful one for hard tasks (deep thinking). Alcove explains the tradeoff in simple terms (speed vs smarts, cost implications).
- **Cross-platform:** macOS (Intel + Apple Silicon) and Windows from day one. All Rust code must handle both OS path conventions, process management, and platform-specific Node binaries.
- **Reversible by default:** Every action Alcove takes can be undone. Setup can be aborted mid-way and rolled back cleanly. The app can be fully uninstalled leaving zero traces.

## Test Modes

Alcove supports three test modes via `ALCOVE_TEST_MODE` environment variable, so development and testing never touch your real machine:

### `mock` (default during dev)
- No downloads, no installs, no files written anywhere
- All backend calls return fake success responses after realistic delays
- Gateway health checks return `{ ok: true }` immediately
- Wizard "Launch" runs a timer animation then shows success
- **Use for:** UI development, Playwright E2E tests, demos

### `sandbox`
- Real downloads, real installs, real OpenClaw — but everything goes to `/tmp/alcove-test/` instead of `~/.alcove/` and `~/.openclaw/`
- Config, runtime, gateway all use the sandboxed paths
- Delete `/tmp/alcove-test/` and it's like nothing happened
- **Use for:** Testing the real install pipeline without risk

### `production` (default in release builds)
- Real paths: `~/.alcove/runtime/`, `~/.openclaw/openclaw.json`
- Real downloads, real installs, real gateway
- **Use for:** Shipping to users

**How it works in code:**
- Rust backend reads `ALCOVE_TEST_MODE` env var on startup (defaults to `mock` in dev, `production` in release)
- All file paths go through a `paths::base_dir()` function that returns the right root based on mode
- React frontend gets the mode via a Tauri command (`get_test_mode`) so it can show a "Test Mode" badge in dev

## Phase 1: Scaffold & Wizard UI (Week 1-2)
> Goal: Tauri app launches, wizard flow works with mock data

- [x] Init Tauri 2.0 project with React + TypeScript + Tailwind
- [x] Configure DM Serif Display + JetBrains Mono fonts
- [x] Set colour palette as Tailwind theme extensions
- [x] Build wizard shell: step progress bar, navigation, transitions
- [x] Step 1: Welcome screen (Alcove logo SVG, tagline, platform badges)
- [x] ~~Step 2: Deploy target selector~~ — CUT (no cloud in v1, local only)
- [x] Step 3: Provider picker (Claude, GPT-4o, DeepSeek, Ollama) with info cards
- [x] Step 4: API key input with validation UI (checking/valid/invalid states)
- [x] Step 5: Channel selector (WhatsApp, Telegram, Discord, Signal, Slack, iMessage)
- [x] Step 6: Skill picker with categories and safety ratings
- [x] Step 7: Review summary + launch button with progress animation
- [x] Zustand store for wizard state
- [x] Write Playwright E2E test: full wizard walkthrough with mock data
- [x] Verify: `pnpm tauri dev` launches app, wizard clickable end to end

**TODO (Phase 1 polish):**
- [x] Add dual model picker to wizard — Step 3 becomes: pick a fast model (heartbeat) and a smart model (deep thinking), with non-technical explanations and cost estimates
- [ ] UI polish pass — spacing, visual quality in Tauri webview

## Cross-Platform Strategy

### macOS
- **Paths:** `~/.alcove/`, `~/.openclaw/`
- **Node binary:** `node-v22.x.x-darwin-arm64.tar.gz` (Apple Silicon) or `node-v22.x.x-darwin-x64.tar.gz` (Intel)
- **Detection:** `std::env::consts::ARCH` → `aarch64` = Apple Silicon, `x86_64` = Intel
- **Process management:** `launchd` for auto-start (optional), `SIGTERM` for graceful shutdown
- **Keychain:** macOS Keychain via `tauri-plugin-keychain`

### Windows
- **Paths:** `%LOCALAPPDATA%\Alcove\`, `%LOCALAPPDATA%\OpenClaw\`
- **Node binary:** `node-v22.x.x-win-x64.zip` (most machines) or `node-v22.x.x-win-arm64.zip`
- **Process management:** Background process via `CREATE_NO_WINDOW` flag, `taskkill` for shutdown
- **Keychain:** Windows Credential Manager via `tauri-plugin-keychain`
- **Gotchas:** Path separators (`\` vs `/`), antivirus may flag Node download, Windows Defender SmartScreen on first launch

### Shared approach
- All paths go through `paths::base_dir()` and `paths::openclaw_dir()` — platform logic in one place
- Node download URL built from `std::env::consts::OS` + `std::env::consts::ARCH`
- Process spawn uses Rust `std::process::Command` which is cross-platform
- Test on both platforms before every release

## Abort & Rollback

Every setup step is tracked in a manifest file (`{base_dir}/setup-manifest.json`) that records what has been done so far. If the user cancels or something fails, Alcove knows exactly what to undo.

### How it works
```
Setup starts → manifest created (empty)
  Step 1: Download Node → manifest records: { "node_downloaded": "/path/to/node" }
  Step 2: Install OpenClaw → manifest records: { "openclaw_installed": true }
  Step 3: Write config → manifest records: { "config_written": "/path/to/config" }
  Step 4: Start gateway → manifest records: { "gateway_pid": 12345 }
```

### Abort (user clicks "Cancel" during setup)
- Alcove reads the manifest to see what's been done
- Rolls back in reverse order: stop gateway → delete config → uninstall OpenClaw → delete Node
- Deletes the manifest itself
- User sees: "Setup cancelled. Everything has been cleaned up."

### Rollback on failure
- Same as abort but automatic — if step 3 fails, Alcove undoes steps 1-2
- Then shows a friendly error with option to retry

### Cancel button
- Visible during every setup step
- Disabled briefly during each step's critical section (e.g., mid-file-write) to avoid corruption
- Confirmation prompt: "Cancel setup? Everything downloaded so far will be removed."

## Complete Uninstall

Accessible from: Settings → Uninstall (in dashboard), or re-running the wizard.

### What it removes

**If running native:**
1. **Stop gateway** — kill the OpenClaw process if running
2. **Delete OpenClaw** — remove the global npm package
3. **Delete Node runtime** — `{base_dir}/runtime/`
4. **Delete OpenClaw config** — `~/.openclaw/` (macOS) or `%LOCALAPPDATA%\OpenClaw\` (Windows)

**If running Docker:**
1. **Stop container** — `docker stop alcove-openclaw`
2. **Remove container** — `docker rm alcove-openclaw`
3. **Remove image** — `docker rmi openclaw/openclaw` (user prompted — they may want to keep it)

**Both modes:**
4. **Delete Alcove data** — `{base_dir}` — setup manifest, logs, cache, mounted config
5. **Remove API key** — delete from OS keychain
6. **Remove auto-start** — remove launchd plist (macOS) or scheduled task (Windows) if configured

### What it does NOT remove
- The Alcove app itself (user drags to Trash / uses Add/Remove Programs as normal)
- Any chat history stored by channels (WhatsApp messages etc. — those live on the platform, not locally)

### User flow
```
User clicks "Uninstall"
  → "This will remove your assistant and all its data. Your chat history on WhatsApp/Telegram/etc is not affected."
  → [Cancel] [Uninstall Everything]
  → Progress: Stopping assistant... Removing data... Cleaning up... Done.
  → "Everything has been removed. You can delete the Alcove app now, or set up again."
  → [Set Up Again] [Close Alcove]
```

## Phase 2: Local OpenClaw Engine (Week 3-4)
> Goal: Alcove can install and run OpenClaw locally for real

### First-Run Setup (what the user sees)
When a user clicks "Launch" for the first time, Alcove handles everything automatically:

**Native mode:**
```
Setting up your assistant...
  ✓ Downloading runtime          (30s, one-time)
  ✓ Installing OpenClaw           (20s, one-time)
  ✓ Configuring your choices      (instant)
  ✓ Starting gateway              (5s)
  ✓ All systems go!
```

**Docker mode:**
```
Setting up your assistant...
  ✓ Pulling latest OpenClaw       (45s, one-time)
  ✓ Configuring your choices      (instant)
  ✓ Starting container            (10s)
  ✓ All systems go!
```
No jargon. No "Node.js". No "Docker". Just a progress screen (~1 minute first time, instant on future launches).

### Runtime Strategy

Alcove supports two ways to run OpenClaw. The user picks during setup (or Alcove picks for them based on what's available):

#### Option A: Native (default)
- Alcove auto-downloads Node 22+ into a private folder (`{base_dir}/runtime/`) — invisible to the user
- Installs OpenClaw via npm into the same private folder
- Runs the gateway as a managed subprocess on the host
- **Pros:** No extra software needed, fastest performance, simplest for most users
- **Cons:** Node + OpenClaw files on the host (in a private folder)

#### Option B: Docker container
- Alcove pulls the official `openclaw/openclaw` Docker image
- Runs OpenClaw inside a container with only port 18789 exposed
- Config is mounted as a volume (`{base_dir}/config/` → `/etc/openclaw/` inside container)
- API keys passed as environment variables (never written to container filesystem)
- Container is named `alcove-openclaw` for easy management
- **Pros:** Complete isolation — nothing installed on host except Docker itself. Easy cleanup (`docker rm`). Consistent environment across machines.
- **Cons:** Requires Docker Desktop installed (extra ~500MB). Slightly slower cold start (~10s vs ~5s).

#### How Alcove decides
1. On first launch, check if Docker is available (`docker info`)
2. If Docker is running → offer both options: "Run in a container (recommended)" vs "Run directly on this machine"
3. If Docker is NOT available → recommend it and walk the user through installing it:

**Docker not found flow:**
```
"We recommend running your assistant in a container — it's
cleaner, safer, and easier to remove later."

  🐳 What's a container?
  Think of it like a sealed box. Your assistant runs inside it,
  completely separate from your computer. Nothing gets installed
  on your machine. If you ever want to remove it, the box
  disappears and it's like it was never there.

  To use containers, you'll need a free app called Docker Desktop.

  [Download Docker Desktop →]     (~500MB, takes 2-3 minutes)

  After installing, come back here and we'll continue.

  [I've installed Docker — check again]
  [Skip — run directly on my machine instead]
```

- "Download Docker Desktop" opens the correct download page in their browser:
  - macOS: `https://docs.docker.com/desktop/setup/install/mac-install/`
  - Windows: `https://docs.docker.com/desktop/setup/install/windows-install/`
- "Check again" re-runs `docker info` and proceeds if Docker is now available
- "Skip" falls through to native mode — no judgement, just works
- User can switch between modes later from dashboard settings

#### Docker lifecycle
```
Setup:    docker pull openclaw/openclaw:latest
Start:    docker run -d --name alcove-openclaw -p 18789:18789 -v {config_dir}:/etc/openclaw -e API_KEY=... openclaw/openclaw:latest
Stop:     docker stop alcove-openclaw
Restart:  docker restart alcove-openclaw
Health:   GET http://127.0.0.1:18789/health (same as native — container exposes the port)
Logs:     docker logs alcove-openclaw --tail 100
Update:   docker pull openclaw/openclaw:latest && docker stop && docker rm && docker run ...
Uninstall: docker stop alcove-openclaw && docker rm alcove-openclaw && docker rmi openclaw/openclaw
```

### Recovery Agent (powered by Claw Doctor)
When any setup step fails, Alcove wraps `openclaw doctor` to handle it automatically:
- Runs `openclaw doctor --non-interactive` first (safe auto-fixes for ~70% of issues)
- If that doesn't resolve it, runs `openclaw doctor --repair` for deeper fixes
- Parses doctor output to identify the failure category (config drift, port conflict, auth expiry, bad permissions, missing dependencies)
- Maps each failure to a friendly message ("Your assistant's connection dropped. Reconnecting..." not "WebSocket ECONNREFUSED")
- Shows the user a simple choice only when input is truly needed ("Your internet seems down. Retry?")
- Retries the failed step automatically after repair
- User never sees error codes, stack traces, or jargon

**Claw Doctor capabilities Alcove will use:**
- `openclaw doctor --non-interactive` — safe migrations only, no prompts
- `openclaw doctor --repair` — apply recommended fixes automatically
- `openclaw doctor --repair --force` — aggressive repairs (last resort, with user confirmation)
- `openclaw doctor --deep` — scan for extra gateway installations
- `openclaw status --all` — one-click diagnostic report before running doctor

### OpenClaw Integration Points
- **Install:** `npm install -g openclaw@latest` (using Alcove's private Node runtime)
- **Config:** JSON5 at `~/.openclaw/openclaw.json` — Alcove generates this
- **Gateway:** `openclaw gateway --port 18789` as managed subprocess
- **Health:** `GET http://127.0.0.1:18789/health` (unauthenticated)
- **Control:** WebSocket RPC at `ws://127.0.0.1:18789` (100+ methods)
- **CLI helpers:** `openclaw config get/set`, `openclaw skills install/list`, `openclaw status`
- **Diagnostics:** `openclaw doctor` — checks config, connectivity, dependencies, auth, permissions, services
- **Status:** `openclaw status --all` — full diagnostic report (run before doctor)
- **Skills CLI:** `openclaw skills search "query"`, `openclaw skills install <slug>`, `openclaw skills update --all`

### Config Generation
Alcove maps wizard answers to OpenClaw's JSON5 config:
```json5
{
  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-haiku-4-5",      // heartbeat — fast, cheap, everyday
        fallbacks: ["anthropic/claude-sonnet-4-5"]   // deep thinking — smart, expensive, hard tasks
      }
    }
  },
  channels: { whatsapp: { enabled: true }, telegram: { enabled: true } },
  skills: { entries: { "email": { enabled: true } } },
  gateway: { port: 18789 }
}
```

### Tasks

**Test mode infrastructure (build first):**
- [x] Rust module: `paths::base_dir()` that returns root dir based on `ALCOVE_TEST_MODE` (`/tmp/alcove-test/` for sandbox, `~/.alcove/` for production)
- [x] Rust module: mock backend — fake responses for all Tauri commands when mode is `mock`
- [x] Tauri command: `get_test_mode` — frontend reads current mode for UI badge
- [x] React: "Test Mode" badge in corner when not in production mode

**Cross-platform paths:**
- [x] Rust module: `paths::base_dir()` returns `~/.alcove/` (macOS) or `%LOCALAPPDATA%\Alcove\` (Windows), respects test mode
- [x] Rust module: `paths::openclaw_dir()` returns `~/.openclaw/` (macOS) or `%LOCALAPPDATA%\OpenClaw\` (Windows)
- [x] Rust module: `paths::node_download_url()` builds correct URL from OS + architecture (macOS Intel/ARM, Windows x64/ARM)

**Abort & rollback:**
- [x] Rust module: `setup-manifest.json` — tracks each completed setup step with paths/PIDs
- [x] Rust module: `rollback()` — reads manifest, undoes steps in reverse order, deletes manifest
- [x] Rust module: abort signal — cancellation token passed through setup pipeline, checked between steps
- [x] React: Cancel button on setup screen with confirmation dialog
- [x] React: "Setup cancelled. Everything has been cleaned up." screen

**Complete uninstall:**
- [x] Rust module: `uninstall()` — stop gateway, remove OpenClaw, delete config, delete runtime, delete Alcove data, remove keychain entry, remove auto-start
- [x] Tauri command: `uninstall_all` — frontend triggers full cleanup
- [x] React: Uninstall screen in dashboard settings with confirmation + progress
- [x] React: Post-uninstall screen with "Set Up Again" or "Close Alcove" options

**Docker runtime:**
- [x] Rust module: detect Docker availability (`docker info`)
- [x] Rust module: `docker pull openclaw/openclaw:latest` with progress reporting
- [x] Rust module: `docker run` with port mapping, config volume mount, env vars for API keys
- [x] Rust module: `docker stop/start/restart/rm` for container lifecycle
- [x] Rust module: `docker logs --tail` for log viewer
- [x] Rust module: `docker pull` for updates (compare image digest to detect new versions)
- [x] Rust module: Docker uninstall — stop container, remove container, remove image
- [x] React: runtime picker step — "Run in a container (recommended)" vs "Run directly on this machine"
- [x] React: Docker not found screen — explains containers in plain English, links to Docker Desktop download, "Check again" button, "Skip" option
- [x] React: Docker pull progress bar during first-run setup
- [x] React: dashboard settings — switch between Docker/native runtime (with migration)

**Native runtime:**
- [x] Rust module: download Node.js 22+ to `{base_dir}/runtime/` (platform-specific binary from nodejs.org)
- [x] Rust module: check if private Node runtime already exists, skip download if so
- [x] Rust module: `npm install -g openclaw@latest` using private Node runtime
- [x] Rust module: generate OpenClaw JSON5 config from wizard answers
- [x] Rust module: map dual model selection to `model.primary` (heartbeat) + `model.fallbacks` (deep thinking)
- [x] Rust module: start/stop/restart OpenClaw gateway as managed subprocess
- [x] Rust module: health check (poll `GET /health`, return status)
- [x] Rust module: store API key in OS keychain via keyring crate
- [x] Rust module: recovery agent — wrap `openclaw doctor` with escalation: `--non-interactive` → `--repair` → `--repair --force` (with user consent)
- [x] Rust module: parse `openclaw status --all` output into structured health data for dashboard
- [x] Rust module: run `openclaw doctor --deep` on first launch to detect conflicting installations
- [x] Rust module: WebSocket RPC client for gateway control (sessions, agents, skills, channels)
- [x] Tauri commands: setup_runtime, install_openclaw, start_gateway, stop_gateway, get_status
- [x] React: first-run setup screen with step-by-step progress (download → install → configure → start)
- [x] React hooks: useSetup, useGateway, useStatus
- [x] Wire wizard "Launch" step to real setup + start sequence
- [x] Build dashboard: status indicator, start/stop controls, log viewer
- [x] Dashboard: show which models are active (heartbeat vs deep thinking) with usage/cost indicators
- [x] Write integration test: download runtime → install → start → health check → stop
- [x] Write integration test: abort mid-setup → verify rollback cleans up completely
- [x] Write integration test: full uninstall → verify zero files remain
- [x] Verify: cross-platform tests pass (path conventions, binary names, download URLs, config format)
- [ ] Verify: end-to-end on real Windows machine (deferred until Windows CI available)

## Phase 3: Channel Pairing (Week 5-6)
> Goal: WhatsApp, Telegram, Discord actually pair through the UI

- [x] Research OpenClaw's channel pairing mechanisms (QR for WhatsApp, bot token for Telegram, OAuth for Discord)
- [x] Rust/webview: WhatsApp QR code display + pairing status polling
- [x] Telegram: bot token input + verification call
- [x] Discord: bot token with verification
- [x] Signal: linking flow (QR-based, similar to WhatsApp)
- [x] Channel status indicators in dashboard (connected/disconnected dots per channel)
- [x] Write test: mock pairing flow for each channel (4 channel E2E tests)
- [ ] Verify: at least WhatsApp + Telegram pair successfully (requires live OpenClaw gateway)

## Phase 4: Skill Store (ClawHub) & Polish (Week 7-8)
> Goal: live skill marketplace via ClawHub, app feels production-ready

### ClawHub Integration
ClawHub (clawhub.ai) is OpenClaw's public skill registry with 13,700+ community-built skills, semantic search, versioning, and security scanning (SHA-256 + VirusTotal). Alcove wraps it into a native desktop experience.

**How skills work:** Each skill is a SKILL.md file with YAML frontmatter (name, description, required binaries, env vars) and natural language instructions the agent follows.

### Tasks
- [x] Rust module: query ClawHub API — semantic search, browse by category, fetch skill metadata
- [x] Rust module: install skills via `openclaw skills install <slug>` using private Node runtime
- [x] Rust module: remove skills via `openclaw skills remove <slug>`
- [x] Rust module: check for skill updates via `openclaw skills update --all`
- [x] Rust module: read installed skills list from `openclaw skills list`
- [x] React: Skill Store screen — search bar with semantic search, category filters, skill cards
- [x] Skill cards: name, description, author, downloads, stars, safety rating, version, install/remove button
- [x] Safety rating display: parse SKILL.md frontmatter for required binaries/permissions → map to high/medium/low
- [x] Installed skills tab: show what's active, update available badge, remove option
- [x] Skill detail view: full description, changelog, author info, safety breakdown
- [x] Cost tracker: estimate monthly API spend from usage patterns (broken down by quick replies vs deep thinking)
- [x] Auto-updater: check for new Alcove + OpenClaw versions
- [x] Error handling pass: every failure shows a human-readable message (no stack traces, no jargon)
- [x] Accessibility pass: keyboard nav, screen reader labels
- [x] Write comprehensive E2E test suite
- [ ] Verify: full flow on macOS, Windows, Linux

## Phase 5: Open Source & Ship (Week 9-10)
> Goal: public repo, first release, community feedback

- [ ] Split repo: open-source core (MIT) vs proprietary managed services
- [ ] README with screenshots, quick start, contributing guide
- [ ] GitHub Actions CI: build + test on macOS, Windows, Linux
- [ ] Create GitHub releases with signed binaries
- [ ] Landing page (can reuse/adapt prototype)
- [ ] Post to OpenClaw Discord, Reddit, Hacker News, LinkedIn
- [ ] Collect feedback, triage issues, iterate
