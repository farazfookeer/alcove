# Building Alcove with Claude Code — Workflow Guide

## Setup (do once)

```bash
# 1. Install Claude Code if you haven't
npm install -g @anthropic-ai/claude-code

# 2. Create the project directory
mkdir alcove && cd alcove

# 3. Copy CLAUDE.md and plan.md into the root
# (you already have these files)

# 4. Open Claude Code
claude
```

## How to Work Phase by Phase

### Starting each session

```
> I'm working on Alcove. Read CLAUDE.md and plan.md, then tell me 
  where we left off and what's next.
```

### Phase 1 kickoff prompt (use plan mode first: Shift+Tab twice)

```
> Plan the Tauri 2.0 project scaffold for Alcove. 
  I need: React 18 + TypeScript + Tailwind frontend, Rust backend 
  with the folder structure from CLAUDE.md. 
  Don't write code yet. Show me the plan, list every file you'll 
  create, and confirm the Tauri plugin dependencies.
```

Then once you approve the plan:

```
> Execute the scaffold plan. Initialise the Tauri project, install 
  dependencies, set up Tailwind with our custom palette from 
  CLAUDE.md, and create the folder structure. Verify it compiles 
  with `pnpm tauri dev`.
```

### Porting the wizard UI

```
> I have an existing React prototype of the wizard in 
  alcove-installer.jsx. Port it into the Tauri app at 
  src/components/wizard/. Convert to TypeScript, split into 
  one component per step, use Tailwind instead of inline styles, 
  and create a Zustand store for wizard state. Keep the exact 
  same visual design — DM Serif Display wordmark, amber palette, 
  dark theme, SVG arch logo.
```

### Building Rust backend modules

```
> Create the OpenClaw process manager module at 
  src-tauri/src/openclaw/. It needs:
  - detect_node() — check if Node 22+ exists on PATH
  - install_openclaw() — run npm install -g openclaw@latest
  - start_gateway(config) — spawn openclaw gateway as child process
  - stop_gateway() — kill the child process
  - health_check() — HTTP GET to localhost:18789/health
  All functions return Result<T, AlcoveError>.
  Use tauri::command to expose each as an IPC command.
  Write unit tests for detect_node and health_check.
```

### Key prompting patterns

**Be specific about files and locations:**
Bad:  "Add VPS support"
Good: "Create src-tauri/src/vps/digitalocean.rs with a client 
       that calls POST /v2/droplets to provision a droplet. 
       Use reqwest. Accept API token, region, and size as params."

**Ask for tests alongside code:**
"Write the Tauri command and its unit test in the same response."

**Use /clear between major tasks:**
Finished the wizard UI? `/clear` before starting Rust backend work. 
This prevents context degradation.

**Checkpoint after each sub-phase:**
"Run `pnpm tauri dev` and `cargo test` — report any errors."

## Session Management

- `/clear` — reset context (use between phases or when things feel off)
- `/compact` — manually compact if session is getting long (do at ~50% context)
- `/model` — check/switch model (use Opus for architecture, Sonnet for implementation)
- Plan mode (Shift+Tab twice) — for architecture decisions before coding

## Useful Custom Commands

Save these in `.claude/commands/` early on:

### .claude/commands/check.md
```
Run all checks for the Alcove project:
1. pnpm lint (frontend)
2. cd src-tauri && cargo clippy (backend)  
3. pnpm test (frontend tests)
4. cd src-tauri && cargo test (backend tests)
5. pnpm tauri dev --exit (verify it compiles and launches)
Report results as a checklist.
```

### .claude/commands/status.md
```
Read plan.md and report:
1. Current phase and its completion percentage
2. Next 3 unchecked tasks
3. Any blockers or decisions needed
```

## Tips From Experience

1. **Start each phase in plan mode.** Let Claude read the codebase, 
   understand what exists, and propose before writing.

2. **Don't let sessions run too long.** After ~30 minutes of active 
   coding, /compact or /clear. Context degradation is the #1 failure mode.

3. **Commit after each working milestone.** `git add -A && git commit -m "feat: wizard step 3 provider picker"`. 
   You can ask Claude to do this.

4. **Rust will be the slow part.** If you haven't written Rust before, 
   lean on Claude heavily for the Tauri backend but always read what it 
   produces. Ask it to explain any Rust pattern you don't understand.

5. **Test on a clean machine early.** Phase 2's "install OpenClaw" flow 
   needs to work on a fresh system, not just your dev machine. Use a 
   VM or fresh user account.
