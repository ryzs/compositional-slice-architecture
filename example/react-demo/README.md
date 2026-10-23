# CSA React Demo

Minimal evidence implementations for the [CSA spec](../../README.md). One folder per claim, so the spec's shapes exist as running code rather than prose.

## Run

```bash
npm install
npm run dev
```

## Map: folder → spec claim

| Folder | Claim it demonstrates |
| ------ | --------------------- |
| `src/ui/` | The UI taxonomy: stateless, feature-ignorant components behind a barrel. Nothing in `ui/` imports from a feature folder. |
| `src/core/` | Shared infra: a fake API plus a tiny `useAsync` hook standing in for a server-state library. No Apollo/TanStack dependency, because the spec is data-library-agnostic. |
| `src/container-hook-screen/` | Variable ceremony (Principle 5). Tier 1: hook + inline render, no screen file. Tier 2: screen split with a pure `.screen.tsx` as the visual-regression target. Tier 3: container promotion with a pure business hook. |
| `src/cross-slice-sharing/` | Shared slices: the resolution to "slices may not import slices". A stateful `AddToCartButton` promoted to `shared/slices/`, embedded by two sibling slices, imported only through the `shared/` barrel. |
| `src/sibling-state/` | Explicit cross-slice state: a writer slice and a reader slice synchronized through a store in `shared/state/`. The coupling is two imports of one module, visible in the import graph. |

## What is deliberately absent

- **No adapter layer.** This is a single-platform app. Per the revised Principle 4, adapters only earn their cost when a second platform appears, so the tier-3 container calls the platform directly.
- **No GraphQL client.** Data wrappers would live in an `api/` folder per sub-feature; the demo's `core/api/fake-api.ts` stands in for that boundary.
- **No lint enforcement.** The import rules are stated in comments where they apply; wiring `eslint-plugin-boundaries` is listed in the spec but out of scope for a minimal demo.
