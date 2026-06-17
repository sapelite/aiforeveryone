# Fusion notes — the three-layer Business Growth OS

One product, three roles, no duplicated runtimes:

```text
   Telegram · WhatsApp · Voice · Slack · Gmail
                    │
          ┌─────────▼─────────┐
          │   CLAUDECLAW OS   │  ENTRY / NERVOUS SYSTEM   (claudeclaw-os-main, :3141)
          │  Hono HTTP + SSE  │  routes channels, hosts integrations + agents
          └─────────┬─────────┘  forwards real work to the engine; doesn't do it itself
                    │ POST /api/chat/message  (the actual work)
          ┌─────────▼─────────┐
          │  AGENTIC OS ENGINE│  BRAIN / RUNTIME  (agenticdenoob/command-centre, :3100)
          │ tasks·skills·brand│  single source of truth for execution + memory
          │  ·memory·cron     │  all production runs here as headless `claude -p`
          └─────────┬─────────┘
              GET /api/events (SSE) ── subscribed by BOTH ClaudeClaw and the shell
                    │
          ┌─────────▼─────────┐
          │   AIFOREVERYONE   │  FACE  (this repo, :3000)
          │  pixel desktop OS │  renders state + forwards actions; zero business logic
          └───────────────────┘
```

The decision: the **engine is the brain-of-record**. ClaudeClaw is the omni-channel
front door. The pixel shell is the window. There is one task table, one memory of
record, one SSE truth stream — the seam between apps is **HTTP + SSE**, never a shared DB.

## Run it locally (three processes)

1. **Engine** — in `agenticdenoob/command-centre`:
   ```
   PORT=3100  AGENTIC_OS_DIR=<...>/agenticdenoob  node scripts/next-run.cjs dev
   ```
   Writes its live port to `<agenticdenoob>/.command-centre/port` (the shell reads it).

2. **ClaudeClaw** — in `claudeclaw-os-main` (its `.env` sets `DASHBOARD_PORT=3141`,
   `DASHBOARD_TOKEN`, `TELEGRAM_BOT_TOKEN`, and `AGENTIC_OS_ENGINE_URL=http://127.0.0.1:3100`):
   ```
   node dist/index.js        # rebuild after src edits: npm run build:server
   ```

3. **Shell** (this repo) — `.env.local` holds `CLAUDECLAW_URL=http://127.0.0.1:3141`
   and `CLAUDECLAW_TOKEN=<DASHBOARD_TOKEN>`:
   ```
   npm run dev               # http://localhost:3000
   ```

Engine discovery: port file, or `AGENTIC_OS_DIR` / `AGENTIC_OS_ENGINE_URL`. The shell
reaches ClaudeClaw via `CLAUDECLAW_URL` + `CLAUDECLAW_TOKEN` (token injected
**server-side only** in the `/api/claw/*` proxies — never sent to the browser). Every
surface degrades to an "offline" state when its backend is down.

## The headline flow

`/agentic <but>` on **Telegram** → ClaudeClaw forwards it to the engine → the **same run**
appears live in the pixel OS (**Runs**) → on completion the result text + files come back
to Telegram. One run, three faces. (ClaudeClaw command: `src/engine-bridge.ts` +
`/agentic` in `src/bot.ts`.)

## Windows

Engine-backed (via `src/lib/engine.ts` + `/api/engine/*`):
- **Runs** — launch a goal, live SSE feed, approve/deny tools, reply, stop, inspect output.
  Model picker defaults to **Auto** (cheap-first haiku/sonnet/opus).
- **Tableau** — kanban of tasks by column. **Livrables** — projects + produced files (preview + download).
- **Historique** — filterable/sortable task history. **Skills** — 49 engine skills (read SKILL.md).
- **Planifié** — engine cron (create/run/pause). **Mémoire** / **Contexte** — living memory + context files.
- **Marque** — brand foundation status (voice/positioning/icp). **Usage** — cost/tokens + eco share.
- **Hive Mind** — a live graph woven from the engine brain (skills/projects/tasks/memory); click a node to zoom + inspect.

ClaudeClaw-backed (via `src/lib/claw.ts` + `/api/claw/*`, token server-side):
- **Inbox** — Telegram/WhatsApp/Slack threads live + reply (arrives on your phone too).
- **War Room** — the real ClaudeClaw multi-agent meeting, streamed; promote any reply to an engine task.
- **Agents** — the real ClaudeClaw roster (running state, model, today turns/cost).

Menu bar: **?** tutorial · pending-approval **bell** · **STOP** (global kill-switch:
cancels all running engine tasks + aborts ClaudeClaw) · engine status pill.

## Ops loop

- **Kill-switch**: the STOP button halts all autonomy across both backends.
- **Cron notifications**: ClaudeClaw subscribes to the engine SSE and pings Telegram with
  a summary + files when a **scheduled (cron)** task finishes (`src/engine-notifier.ts`).
  Cron-only, so interactive `/agentic` runs are not double-notified.
- Two schedulers stay separate by design (they own different jobs); the engine cron is the
  canonical one shown in **Planifié**.

## Permission modes

Runs defaults to **Validation requise** (`default`) — every tool call is gated.
Toggle **Mode autonome** (`bypassPermissions`) to run unattended. Onboarding uses
`acceptEdits`. `/agentic` forwards use `bypassPermissions` so headless runs complete.

## Not done / notes for hosting

- **Single send-path** (anti double-email): engine tasks that send email/Slack should route
  through ClaudeClaw rather than sending directly. Deep engine-MCP work, only relevant once
  outbound email is wired. Left out.
- Both backends are **localhost-only and unauthenticated** (ClaudeClaw is token-gated;
  the engine assumes local trust). Before any public deploy, add an auth/tenant boundary —
  today any visitor who reaches the funnel could trigger real engine work.
- ClaudeClaw is under a local git baseline (downloaded without `.git`); shell + engine are
  their own repos. All fusion changes are committed and revertible.
