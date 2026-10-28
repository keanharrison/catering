# Pearl Island2GO Prototype App

Assumption-based catering prototype for customer ordering and staff review. See [`../PRD.md`](../PRD.md) for requirements and [`../SOUL.md`](../SOUL.md) for product and design principles.

```
npm run dev        # dev server
npm run build      # type check and production build
npm test           # unit tests
npm run lint       # lint
```

Layout: `src/data` (illustrative menu, rules, and scenarios), `src/engine` (pure calculations and rule checks), `src/state` (browser-persisted demo workflow), `src/views` (customer, staff, and handoff), and `src/components` (shared UI). Design tokens live in `src/index.css`; there is no backend or live external integration.
