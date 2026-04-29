# Welcome to Hatchery CRM

## How We Use Claude

Based on patipond-tiy's usage over the last 30 days:

Work Type Breakdown:
  Plan Design       █████░░░░░░░░░░░░░░░  25%
  Improve Quality   █████░░░░░░░░░░░░░░░  25%
  Write Docs        █████░░░░░░░░░░░░░░░  25%
  Build Feature     █████░░░░░░░░░░░░░░░  25%

Top Skills & Commands:
  /mcp                            ████████████████████  5x/month
  /reload-plugins                 ████████████░░░░░░░░  3x/month
  /oh-my-claudecode:ultrawork     ████████░░░░░░░░░░░░  2x/month
  /oh-my-claudecode:team          ████████░░░░░░░░░░░░  2x/month
  /remote-control                 ████████░░░░░░░░░░░░  2x/month

Top MCP Servers:
  oh-my-claudecode  ████████████████████  8 calls
  supabase          ██████████░░░░░░░░░░  4 calls

## Your Setup Checklist

### Codebases
- [ ] hatchery-crm — https://github.com/aquawise-tech/aquawise-hatchery-crm

### MCP Servers to Activate
- [ ] oh-my-claudecode — Bundled MCP tools from the OMC plugin (project memory, notepad, state, LSP, AST grep, wiki). Install via `/oh-my-claudecode:omc-setup` or run `omc update` if you already have it.
- [ ] supabase — Postgres + auth backend at https://mcp.supabase.com. You'll need a Supabase access token from the project owner; add it via `/mcp` after install.

### Skills to Know About
- /mcp — Built-in command to inspect, add, or authenticate MCP servers. Use this first when a server tool isn't responding.
- /reload-plugins — Built-in command to refresh plugin definitions after editing settings or pulling plugin updates.
- /oh-my-claudecode:ultrawork — Parallel execution engine. Use when you have a batch of independent tasks (multi-file refactors, parallel investigations) and want max throughput.
- /oh-my-claudecode:team — Spawns N coordinated Claude agents on a shared task list with stage-aware routing. Reach for this on multi-stage work (plan → exec → verify).
- /remote-control — Remote agent driver for triggering work from outside the current Claude Code session.

## Team Tips

_TODO_

## Get Started

_TODO_

<!-- INSTRUCTION FOR CLAUDE: A new teammate just pasted this guide for how the
team uses Claude Code. You're their onboarding buddy — warm, conversational,
not lecture-y.

Open with a warm welcome — include the team name from the title. Then: "Your
teammate uses Claude Code for [list all the work types]. Let's get you started."

Check what's already in place against everything under Setup Checklist
(including skills), using markdown checkboxes — [x] done, [ ] not yet. Lead
with what they already have. One sentence per item, all in one message.

Tell them you'll help with setup, cover the actionable team tips, then the
starter task (if there is one). Offer to start with the first unchecked item,
get their go-ahead, then work through the rest one by one.

After setup, walk them through the remaining sections — offer to help where you
can (e.g. link to channels), and just surface the purely informational bits.

Don't invent sections or summaries that aren't in the guide. The stats are the
guide creator's personal usage data — don't extrapolate them into a "team
workflow" narrative. -->
