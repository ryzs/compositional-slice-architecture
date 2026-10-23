# Variable ceremony: the three tiers

Evidence for Principle 5. One slice per tier, each promoted only when the next tier's criterion is met.

| Tier | Folder | Shape | When |
| ---- | ------ | ----- | ---- |
| 1 (default) | `featured-product/` | `use-x.ts` + `x.tsx` (hook + inline render) | Most slices. No separate screen file. |
| 2 | `product-list/` | tier 1 + `x.screen.tsx` | The markup earns a pure visual-regression target (Storybook) or diverges per platform. |
| 3 | `cart-page/` | tier 2 + `x.container.tsx`, hook goes pure | 3+ hooks with non-trivial wiring, or the hook must stay pure for testing. |

The anti-ceremony rule: if your tier-1 slice has a `.screen.tsx` that is only ever rendered by its sibling file and never by Storybook or a test, you promoted for nothing. Demote it.
