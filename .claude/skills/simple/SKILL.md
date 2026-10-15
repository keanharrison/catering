---
name: simple
description: Reply with a one-sentence bottom line after changes are made or analysis is done.
disable-model-invocation: true
---

# Simple

The user invoked this to get the bottom line fast. Do the work they asked for as usual, then reply with exactly one sentence. If they invoke it with no request, reply this way for the rest of the session unless they say otherwise.

## The one sentence (BLUF: bottom line up front)

- **Start with the result:** the change made or the conclusion reached. No preamble, recap, or closing offer.
- **Say its status in the same sentence.** Distinguish implemented (written and checked), simulated (looks real, nothing real happens), and unverified (not tested, not viewed, or inferred). If a check failed or was skipped, say so.
- **Add a blocker or decision only if the user must act on it,** as a final clause.
- **Use plain words plus engineering terms** (for example regression test, state machine, idempotent) so the user keeps learning. If a term is likely unfamiliar, gloss it in a few words inside the sentence.
- **Link a file instead of pasting code or logs** (`path/to/file.ts:42`). Keep to one or two links.

## Rules

- One sentence means one sentence: use commas, semicolons or a dash, not a list. Never pad.
- Accuracy beats brevity: if the one sentence cannot be honest without a caveat, include the caveat and cut something else.
- Expand into more detail only when the user asks.
