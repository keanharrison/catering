# Color plan

Status: the semantic colors below are applied (tokens `--success`, `--warning`, `--info`, `--destructive` in `app/src/index.css`): order status badges and dots, Draft saved, the notification dot, and the Dashboard's waiting-on-you line. The brand accent is still undecided. The app is neutral otherwise; color is added only where it carries meaning.

| Where | Color | Notes |
|---|---|---|
| Draft saved check, Accepted orders | Green, about `#12794A` on a `#E8F5EE` tint | Success |
| Needs your reply, Needs review | Amber, about `#9A5B00` on a `#FFF4E0` tint | Waiting on someone |
| Awaiting your approval, notification dot, links | Blue, about `#0A59D2` on a `#EAF2FF` tint | Active or new |
| Errors, Declined | Red, about `#C8102E` | Current red is bright for small text |
| Order status chips | Gray, amber, blue, green, red tints | One set shared by Current orders, Past orders, Dashboard, staff pages |
| Brand accent | Undecided | The assistant orb was tried and dropped: it is not catering-related. Revisit when there is a restaurant-specific brand element worth coloring |

Keep Continue buttons and the stepper black, as ElevenLabs does. Check contrast on every tint before shipping.
