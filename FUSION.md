# AIForEveryone — fusion notes

This app is the **shell** (pixel OS UI, marketing site, onboarding). The autonomous
**engine** is the cloned `agenticdenoob` command-centre. The shell reads engine state
over HTTP and writes only through the engine API. The engine stays the single source
of truth for execution.

## Run it locally

Two servers:

1. **Engine** (in the `agenticdenoob` workspace):
   ```
   node scripts/next-run.cjs dev      # PORT=3100
   ```
   On boot it writes its live port to `.command-centre/port`, which the shell reads.

2. **Shell** (this repo):
   ```
   npm run dev                        # http://localhost:3000
   ```

The shell finds the engine through `<agenticdenoob>/.command-centre/port`. Override with
`AGENTIC_OS_DIR` (engine workspace path) or `AGENTIC_OS_ENGINE_URL` (full base URL) if
the layout differs. Everything degrades to an "offline" state when the engine is down.

## What each dashboard window does

- **Runs** — launch a goal, watch the live event feed, approve/deny tool use, answer
  agent questions, stop a task, and click any task to inspect its real output + files.
  Model picker defaults to **Auto** (cheap-first routing: haiku/sonnet/opus by complexity).
- **Livrables** — engine projects with progress, and recently produced files with preview.
- **Skills** — the 49 engine skills; click one to read its SKILL.md.
- **Planifié** — real cron jobs (create, run now, pause).
- **Mémoire** — the engine's living memory (MEMORY.md, today's log, learnings, SOUL).
- **Usage** — real cost / tokens, per-model and per-status bar charts.
- **Audit** — task activity log.
- **Chat** — ask a fast question, or launch the message as an autonomous task.
- **Mission** — live engine KPIs (clickable), plus the product agent board.

The menu-bar **bell** shows how many tasks are waiting on you; click it to jump to Runs.
The onboarding form launches a real brand-foundation agent and deep-links to its task.

## Permission modes

Runs defaults to **Validation requise** (`default`): every tool call is gated through the
approval cards. Toggle to **Mode autonome** (`bypassPermissions`) to let it run unattended.
The onboarding-launched task uses `acceptEdits` so its markdown writes complete without a
gate the visitor cannot clear.

## Notes for hosting later

The engine is localhost-only and unauthenticated. Before any public deploy, add an
auth/tenant layer — today any visitor who reaches the funnel could trigger real engine
work. That auth boundary is the main thing between this and a hostable product.
