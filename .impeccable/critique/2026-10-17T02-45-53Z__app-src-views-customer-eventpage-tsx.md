---
target: customer Event Details page
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/Users/keanharrison/restaurant_demo/app/src/views/customer/EventPage.tsx"
target_fingerprint: "sha256:1b6d157761a428082e3e144e64f5774243440f1226c59693d585293b53926e47"
target_path: /Users/keanharrison/restaurant_demo/app/src/views/customer/EventPage.tsx
timestamp: 2026-10-17T02-45-53Z
slug: app-src-views-customer-eventpage-tsx
closed: true
---
Method: dual-agent (A: `/root/event_design_assessment` · B: `/root/event_evidence_assessment`)

### Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3/4 | Progress is visible; automatic draft saves have no confirmation. |
| 2 | Match System / Real World | 3/4 | Catering-specific questions fit the task; “Budget” could be mistaken for total event spend. |
| 3 | User Control and Freedom | 3/4 | Answers persist while the tab remains open, and the journey supports revisiting steps. |
| 4 | Consistency and Standards | 3/4 | Shared shadcn controls and labels create a consistent base. |
| 5 | Error Prevention | 3/4 | Validation and date restrictions exist; required status and the hidden time check need clearer cues. |
| 6 | Recognition Rather Than Recall | 3/4 | Field labels and hints help; allergy-sensitive customers lack an evident next step. |
| 7 | Flexibility and Efficiency | 2/4 | Optional answers can be left blank, but draft-saving and exit behavior are not surfaced. |
| 8 | Aesthetic and Minimalist Design | 3/4 | The page is focused, though its neutral component styling feels generic for Pearl Island. |
| 9 | Error Recovery | 2/4 | Errors are field-level and focus moves to the first invalid field; there is no summary of multiple errors. |
| 10 | Help and Documentation | 2/4 | Some fields have guidance, but allergy support and date/time constraints are unexplained. |
| **Total** |  | **27/40** | **Acceptable; one point below Good.** |

### Design Specificity Verdict

The content is specific to catering, and the shared header, Pearl Island logo, sidebar, and five-step progress indicator give the flow some identity. The Event Details card itself relies on a familiar shadcn form structure and mostly neutral styling, so Pearl Island’s character is still light.

The detector reported **0 findings** for `EventPage.tsx`. The design review incorrectly thought the page lacked progress orientation; the progress indicator is in the shared `AppShell`, and the browser review confirmed it is visible.

### Overall Impression

This is a clear, usable starting step with helpful defaults and careful dietary wording. The biggest opportunity is to make the constraints and recovery path as clear as the form itself, especially for allergy-sensitive customers and anyone who selects today’s date.

### What’s Working

- The five-step progress indicator orients customers in the larger journey.
- “An estimate is fine” and “You can change these details later” reduce pressure to provide perfect answers.
- The dietary note avoids presenting preferences as allergy or nutrition guarantees.

### Priority Issues

1. **[P1] Allergy-sensitive customers have no next step.** The form correctly avoids promising allergy safety, but provides no contact route for discussing a safety-critical restriction. Add a verified contact path or truthful instruction for reaching staff; don’t imply the prototype sends a live request. **Suggested command:** `$impeccable clarify`
2. **[P2] Required status is not explicit.** Event type and guest count are validated as required, and the date is required by custom validation, but the labels do not say so; the date button also lacks a required state. Mark required fields visibly and expose the date control’s required state to assistive technology. **Suggested command:** `$impeccable clarify`
3. **[P2] Several mobile controls are only 32px tall.** The select, guest input, and date picker are below the 44px touch target used by the updated primary button. Increase their hit areas while preserving the selected shadcn patterns. **Suggested command:** `$impeccable adapt`
4. **[P2] The date picker can allow a date that fails a hidden time check.** The picker allows today, while validation checks the event date plus an existing/default time that is not collected on this step. A customer can select today and then be told to choose a future date and time without seeing a time field. Align the picker and validation, or explain the same-day constraint. **Suggested command:** `$impeccable harden`
5. **[P2] Multiple invalid answers have no summary.** Focusing the first invalid field is useful, and each field has its own message, but customers must discover other errors by scanning. Add a concise error summary on submit and retain the current focus behavior. **Suggested command:** `$impeccable harden`

### Cognitive Load and Emotional Journey

The form asks six manageable decisions, with no visible control showing more than four choices at once. Two friction points remain: required basics and optional preferences sit in one continuous card, and “Budget” may sound like total event spend even though the hint says it covers food only. The opening copy reassures customers that answers can change; allergy caveats and same-day date validation can then create uncertainty without a clear recovery path.

### Persona Red Flags

- **Jordan, first-time customer:** The estimate hint helps, but Jordan may not know whether budget means total event spend or how to get help with an allergy requirement.
- **Sam, keyboard or screen-reader user:** Labels and field errors are present. The date control’s required state and the calendar interaction still need explicit verification with assistive technology.
- **Casey, mobile customer:** The primary CTA now has a 44px target, but the select, guest input, and date control remain 32px tall; the form is also a long scroll.

### Minor Observations

- “Total for food, in dollars” narrows budget scope but does not say how the budget affects menu suggestions or the estimate.
- Draft values use tab-scoped session storage; there is no visible “Save and exit” action or confirmation.
- Optional dietary and budget fields could be visually grouped apart from the essential event details.

### Questions to Consider

- What verified contact path should allergy-sensitive customers use?
- Should we prioritize the touch-target and date-validation fixes, or the allergy guidance and error summary?
- Should the next pass address the top three issues or all five?
