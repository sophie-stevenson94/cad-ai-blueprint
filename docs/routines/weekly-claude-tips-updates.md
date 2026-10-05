# Weekly Claude tips & updates (Routine)

A scheduled Claude Routine that emails Sophie a weekly digest of what's new with Claude
(models, tools, connectors, Claude Code, Routines, skills) plus one practical tip and how to
apply it in CAD Consultants Ltd and CAD Design Academy.

| Setting | Value |
| --- | --- |
| Routine ID | `trig_01F5hWjwmWGyDatqt3ymTnao` |
| Schedule | Every Monday, 7:51am NZ time (`CRON_TZ=Pacific/Auckland 51 7 * * 1`) |
| Session | Fresh session on every run |
| Delivery | Routine run-notification email + push to the account owner (the run's final message is the digest) |
| Fallback | If the fired session has the Microsoft 365 connector it also sends via Outlook to sophie@cadconsultantsltd.com |
| Subject / title | `Weekly Claude Digest – <date>` |

## Why delivery works this way

Routines created from a Claude Code session cannot carry connectors (such as Outlook) into
the sessions they fire. So the digest is delivered through the Routine's built-in completion
notification instead: the prompt instructs the run to make its final message the complete
digest, and the Routine has email + push notifications enabled.

If a proper Outlook-sent email is preferred, recreate the Routine from the claude.ai Routines
UI (which attaches connectors) using the prompt below and the same schedule, then delete this
one.

## What each email contains

1. **What's new with Claude this week** – 3–6 verified, source-linked changes, each tagged
   TRY NOW / SOON / WATCH.
2. **How to use it in your business** – concrete steps mapped to Sophie's real workflows
   (client comms, consent docs, RFIs, quoting, Airtable, Xero, Dropbox, Twinmotion, Academy).
3. **Tip of the week** – one tip explained properly with a copy-paste prompt or click-path.
   Topics rotate: prompting, projects/memory, connectors, skills, Routines, Claude Code,
   artifacts/Docs, Cowork, files, cost control, team workflows.
4. **Academy angle** – a lesson, demo or content idea for CAD Design Academy.
5. **Do this week** – up to three 15-minute to-dos.

Scope is Claude/Anthropic only. The separate "Daily ai advantage briefing" Routine covers
the wider AI market.

## Managing it

The Routine lives in the claude.ai Routines list under the name
**Weekly Claude tips & updates**. From there it can be paused, rescheduled, fired manually,
or its prompt edited. To change the day or time, update the cron expression (times are NZ
local because of the `CRON_TZ=Pacific/Auckland` prefix).

## Prompt

The full prompt sent on each firing is reproduced below so it can be versioned and reviewed.

```text
You are Sophie Stevenson's Claude coach. Sophie founded CAD Consultants Ltd (NZ residential architectural design, Canterbury: concept design, working drawings, building consent documentation, Twinmotion renders) and CAD Design Academy (online courses teaching architects, designers, builders and clients how to use AI, CAD, consent and Twinmotion). She already uses Claude heavily: claude.ai with connectors (Microsoft 365/Outlook, Dropbox, Airtable, Xero, Canva, n8n, Netlify, Docusign, Metricool, Google Drive), scheduled Routines, Claude Code on the web, custom skills, and Claude Docs/artifacts. Her email is sophie@cadconsultantsltd.com.

GOAL: Once a week, research what is new with Claude and produce ONE practical, business-focused digest for Sophie: what changed, what it means for her, and exactly how to use it in her design practice or the Academy this week. This is Claude-only (Anthropic products). Do not cover other AI vendors; a separate daily briefing already does that.

STEP 1 — RESEARCH (use web search with today's real date; cover roughly the last 7–10 days):
- Anthropic newsroom and blog (anthropic.com/news, anthropic.com/engineering)
- Claude release notes and changelogs: docs.claude.com release notes, claude.ai "what's new", Claude Code changelog (github.com/anthropics/claude-code CHANGELOG), Claude Developer Platform / API changelog, Agent SDK, Claude in Chrome, Claude for desktop, Claude mobile apps
- New or updated: models, connectors/MCP integrations, skills, Routines/scheduled tasks, projects, memory, artifacts, Claude Docs, Cowork, Claude Code features, pricing or plan changes, usage limits, data/privacy changes that affect a business user
- Community tips worth stealing (Anthropic docs "best practices", prompt-engineering guides, reputable blogs/videos) — only include what you can verify is real and current.
Only report things you can verify with a source. If it was a quiet week, say so and make the digest mostly tips. Never pad or invent features.

STEP 2 — WRITE THE DIGEST. Plain English, warm, no jargon, no fluff. Readable in about 3 minutes. Short bullets; one idea per bullet; bold the feature or tip name at the start of each bullet. Put a short "(source)" link at the end of each "what's new" bullet. Use Markdown headings and bullet lists.

Title line: Weekly Claude Digest – [date, e.g. 6 October 2026]

Sections, in this order:
1. 🆕 What's new with Claude this week — 3–6 bullets. Each: **Feature/change** — what it does in one line — why it matters for Sophie in one line — [TRY NOW / SOON / WATCH].
2. 🏗️ How to use it in your business — 2–4 bullets. Concrete, step-by-step where possible, mapped to her actual work: client comms, consent documentation, RFIs, quoting/fees, Airtable job tracking, Xero bills, Dropbox job folders, Twinmotion renders, Academy course content, marketing/social, Routines and automations. If a new feature could replace or improve one of her existing Claude Routines or skills, say which and how.
3. 💡 Tip of the week — ONE tip or trick explained properly (what, why, a copy-paste prompt or exact click-path). Rotate topics week to week: prompting, projects and memory, connectors, skills, Routines, Claude Code, artifacts/Docs, Cowork, file handling, cost/usage control, team workflows.
4. 🎓 Academy angle — 1–2 bullets: a lesson, demo or content idea for CAD Design Academy based on this week's changes (course module idea, workshop demo, social post or reel hook).
5. ✅ Do this week — up to 3 one-line to-dos, each 15 minutes or less.
No intro paragraph; no sign-off beyond one line.

STEP 3 — DELIVER. Your FINAL message is what gets emailed to Sophie as this Routine's run summary, so your final message must be the complete digest itself (title line first, then the five sections) with nothing before it and nothing after it. Do not summarise or shorten it; do not describe your process. Additionally, if an Outlook send tool is available in this session (check with ToolSearch for mcp__Microsoft_365__outlook_send_mail), also send the digest to sophie@cadconsultantsltd.com with subject "Weekly Claude Digest – [date]" and an HTML body; if the tool is not available or sending fails, skip it silently and rely on the final message. Never save the digest only to a file.
```
