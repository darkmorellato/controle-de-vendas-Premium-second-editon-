# AGENTS.md — Miplace Premium Sales Control

> React 19 + Vite 8 + Tailwind v4 + Firebase v12 + Vitest

## Commands

```bash
npm run dev           # Dev server (localhost)
npm run build         # Production build → dist/
npm run preview       # Preview production build
npm run lint          # ESLint flat config
npm test              # Vitest watch mode
npm run test:run      # Run all tests once
npm run test:coverage # Run tests with coverage (v8)

# Run a single test file
npx vitest run src/utils.test.js
npx vitest run src/components/__tests__/SomeComponent.test.jsx

# Run tests matching a pattern
npx vitest run -t "validateCPF"
```

## Architecture

```
src/
├── App.jsx              # Root component (865 lines — needs decomposition)
├── main.jsx             # Entry point
├── firebase.js          # Firebase init (Firestore, Auth, Storage)
├── constants.js         # App constants (sellers, categories, payment methods)
├── utils.js             # Pure utilities (CPF, masks, currency, dates)
├── contexts/            # React contexts (Sales, Client, UI, Auth, SalesForm, App)
├── hooks/               # 38 custom hooks (.js + .ts mixed)
├── services/            # Firebase service layer (auth, sales, client, backup, storage)
├── components/          # UI components, views, modals, layout
├── schemas/             # Validation schemas
├── types/               # TypeScript type definitions
├── lib/                 # Shared libraries
├── assets/              # Static assets
└── styles/              # Sass stylesheets
```

## Code Style

### Imports
- Use `.jsx` extension for React components, `.js` for utilities, `.ts` for typed modules
- Path alias: `@/*` maps to `./src/*` (configured in tsconfig.json)
- Group imports: React → third-party → local (`./`, `../`)
- Firebase imports from `firebase/firestore`, `firebase/auth`, `firebase/storage`

### Naming
- Components: PascalCase (`SalesForm`, `ClientSearchModal`)
- Hooks: camelCase with `use` prefix (`useApp`, `useSalesContext`)
- Services: camelCase with `Service` suffix (`salesService`, `clientService`)
- Constants: UPPER_SNAKE_CASE (`SELLERS_LIST`, `PAYMENT_METHODS`)
- Contexts: `useXxxContext` pattern (`useSalesContext`, `useClientContext`)

### State Management
- 6 React contexts for global state (Sales, Client, UI, Auth, SalesForm, App)
- Custom hooks encapsulate domain logic
- Prefer `useMemo`/`useCallback` for expensive computations
- Lazy-load modals and views with `React.lazy` + `Suspense`

### Error Handling
- Show user-facing errors via `showToast(message, 'error')`
- Log technical errors with `console.error()`
- Service methods return Promises — always `.catch()` and show toast
- `ErrorBoundary.jsx` component for React error boundaries

### Formatting
- ESLint flat config (`eslint.config.js`) — extends `@eslint/js`, `react-hooks`, `react-refresh`
- Relaxed rules: `no-undef: off`, `no-empty: off`, `no-useless-escape: off`
- Unused vars: warn (ignore `^_`, `^[A-Z_]`, `^e$`, `^i$`, `^idx$`)
- Tailwind CSS v4 with CSS-first configuration via `@tailwindcss/vite`

### TypeScript
- `strict: true`, `checkJs: false` — TS types available but JS not type-checked
- `allowJs: true` — mixed JS/TS codebase
- Gradual migration target: enable `checkJs: true` over time

## Testing

- Framework: Vitest with jsdom environment
- Setup: `src/test-setup.js` (Testing Library matchers)
- Pattern: `src/**/*.{test,spec}.{js,jsx,ts,tsx}`
- Coverage: v8 provider, targets `src/utils.js` and `src/services/**/*.js`
- Currently minimal coverage — only `utils.test.js` exists

## Key Constraints

- **PWA**: Service worker with runtime caching for fonts, Firebase API, Firestore
- **Offline**: Firebase offline persistence enabled (auto in v12)
- **Brazilian locale**: CPF validation, BRL currency formatting, pt-BR dates
- **Firebase v12**: No manual IndexedDB persistence needed
- **Environment**: `.env` with `VITE_FIREBASE_*` variables

## Recommended Agents for This Project

| Agent | Purpose |
|---|---|
| `react-patterns` | Modern React patterns, component composition |
| `react-state-management` | Refactor/improve context architecture |
| `code-refactoring-refactor-clean` | Decompose App.jsx (865 lines) |
| `testing-patterns` | Expand test coverage |
| `e2e-testing-patterns` | Add Playwright E2E tests |
| `typescript-advanced-types` | Gradual TS migration |
| `firebase` | Firebase v12 best practices |
| `tailwind-patterns` | Tailwind v4 patterns |
| `security-audit` | Audit CPF/password/data handling |
| `performance-optimizer` | Optimize renders and bundle split |
| `code-simplifier` | Simplify complex handler logic |
| `frontend-dev-guidelines` | Frontend architecture guidelines |
