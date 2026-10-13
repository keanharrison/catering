# Wireframes: Pearl Island2GO Prototype

Draft | October 13, 2026 | Low-fidelity layouts. Visual style follows PRD section 8 and `fin_marketing_reference_report.md`. Content is illustrative.

## Executive summary

Seven screens in three groups: customer (4), staff (2), handoff (1), plus a global demo bar. The customer flow is mobile-first; staff and handoff views are desktop-first. Each screen maps to a PRD journey step. Fin patterns used: eyebrow labels, tab/step list with orange progress bar, product-style cards with status pills and action rows, large-number summary card, corner squares.

## Global shell

```
+------------------------------------------------------------------+
| PEARL ISLAND2GO   [Customer | Staff]   Scenario: [Routine v] [Reset]|
| PROTOTYPE - ILLUSTRATIVE DATA                                      |
+------------------------------------------------------------------+
```

The demo bar sits above every view. It holds the role switch, scenario loader and reset.

## Customer

### C1 Intake (journey step 1)

```
EVENT DETAILS                         Step 2 of 5 [====-----]
Tell us about your event.
+-----------------------------+  +-----------------------+
| Event type  [Corporate  v]  |  | Why we ask            |
| Guests      [ 40 ]          |  | Headcount sets portion|
| Date/time   [ ........ ]    |  | sizes. (illustrative) |
| Pickup/Delivery (o) ( )     |  +-----------------------+
| Dietary     [x] Vegan [ ] GF|
| Budget      [ optional ]    |
+-----------------------------+
[Back]                    [Continue]
```

### C2 Recommendation with chatbot (steps 2 and 3)

```
RECOMMENDED FOR 40 GUESTS
+--------------------------------------+ +-------------------+
| Item           Qty   Servings   Cost | | ASK ABOUT THIS    |
| Jerk chicken   3 tr  36         $..  | | MENU              |
|  Why: 1 tray feeds ~12 (assumption)  | | (scripted)        |
| Rice + peas    3 tr  36         $..  | | [How much food?]  |
| Kale salad     2 tr  24         $..  | | [Lead time?]      |
| [ - ] [ + ] on each row              | | > type a question |
+--------------------------------------+ +-------------------+
 Est. total  $....   Servings 40+   [!] Flag: short notice
[Back]                              [Review order]
```

### C3 Review and submit (step 4)

Large-number estimate card, event summary, selections, notes, and the line "Submitting sends a request. It is not accepted yet." Primary action: Submit request.

### C4 Status (steps 4-6, customer side)

```
Status:  Submitted > Needs review > Awaiting your approval > Confirmed
                         ^ active (orange bar)
Message from staff: "Can we swap one tray for ...?"
[Approve changes]   [Reply]
```

## Staff

### S1 Queue (step 5)

```
REQUESTS NEEDING ATTENTION
+--------------------------------------------------------------+
| Corporate lunch, 40   [Submitted]   Routine                   |
| Wedding drop-off, 150 [Needs review] Reason: large + short notice|
+--------------------------------------------------------------+
```

### S2 Request detail (steps 5 and 6)

Product-card layout, modeled on the Fin Guidance card.

```
Wedding drop-off, 150 guests      [Needs review]
Reason: large order; short notice; custom request
Event details | Customer selections | Internal notes
+---------------------------------------------------------+
| Proposal (editable rows, totals update)                 |
+---------------------------------------------------------+
[Request clarification] [Edit proposal] [Reject]  [Accept]
Accept is disabled until required review and customer approval are done.
```

## Handoff

### H1 Handoff preview (step 6)

Tabs: Order summary | Calendar event | Kitchen prep sheet. All three render from the same order object. Each carries a "Preview - not a live integration" tag.

```
Kitchen prep sheet   Fri 11:30 pickup   Wedding drop-off
Make: jerk chicken x 12 trays ...   Notes: ...   Exceptions: ...
```

## Screen to PRD step map

| Screen | PRD step |
|---|---|
| C1 | 1 Describe the event |
| C2 | 2 Review a recommendation, 3 Adjust the proposal |
| C3 | 4 Submit the request |
| C4 | 4-6 customer approval |
| S1, S2 | 5 Review exceptions |
| H1 | 6 Accept and hand off |

## Open questions

- Does the chatbot sit beside the recommendation (desktop) and as a bottom sheet (mobile)? Proposed: yes.
- Should the status view (C4) be its own screen or a panel on C3 after submit? Proposed: its own screen.
