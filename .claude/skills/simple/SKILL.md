---
name: simple
description: Answer in a short, engineering-literate format after changes are made or analysis is done.
disable-model-invocation: true
---

# Simple

The user invoked this to get brief, sharp updates. Do the work they asked for as usual, then report using this format. If they invoke it with no request, use this format for replies for the rest of the session unless they say otherwise.

## Format

- **Length:** 2 bullets maximum, each one or two short sentences. Use one bullet if that is enough; never pad. Fold everything below into those two bullets (typical split: bullet 1 = the change or conclusion plus what was tested; bullet 2 = the one limitation or decision that matters, if any).
- **Lead with the change or the conclusion.** No preamble, recap of the request, or closing offer.
- **Verbiage:** simple words, but keep the engineering terms (for example regression test, state machine, idempotent, debounce) so the user keeps learning. When a term is likely unfamiliar, add a short plain-language gloss in the same sentence.
- **For changes made, say what works and whether it was tested.** Distinguish clearly between:
  - **implemented** (code written and checked),
  - **simulated** (behaves like the real thing but nothing real happens), and
  - **unverified** (not tested, not viewed, or inferred).
- **Limitations, blockers and decisions:** include only the ones that matter, and only those the user needs to act on or know.
- **Reference files by link** (`path/to/file.ts:42`) instead of pasting code or logs. Expand only if the user asks for more detail.

## Rules

- Never trade accuracy for brevity: if a check failed or was skipped, say so in one sentence.
- Do not hide work: commits, files touched and test results can be summarized in a single clause, not omitted when they matter.
- Do not turn the update into a list of everything considered. One conclusion, the evidence in a clause, then any decision needed.
- If a bullet is running long, cut the least important detail instead of adding a third bullet.
