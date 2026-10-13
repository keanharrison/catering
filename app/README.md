# Pearl Island2GO Prototype App

Assumption-based catering prototype. See `../PRD` and `../BUILD_PLAN.md`.

```
npm run dev        # dev server
npm run build      # type check and production build
npm test           # unit tests
npm run lint       # lint
```

Layout: `src/data` (menu, rules, scenarios), `src/engine` (pure rule functions), `src/state` (store), `src/views` (customer, staff, handoff), `src/components` (shared UI). Design tokens live in `src/index.css`.
