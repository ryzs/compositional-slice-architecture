# Cross-slice sharing: shared slices via the barrel

Evidence for the v0.2 resolution of "a slice may not import another slice".

The rule becomes: a slice may not import a **sibling** slice directly. When a second slice needs the same stateful unit, that unit is promoted to `shared/slices/` and both consumers import it **through the `shared/` barrel only**.

```
cross-slice-sharing/
├── shared/
│   ├── slices/add-to-cart-button/   # the promoted shared slice
│   └── index.ts                     # the ONLY legal import path
├── deals-rail/                      # consumer slice #1
└── (product-list in ../container-hook-screen is consumer #2)
```

The three guards that keep this from becoming a dumping ground:

1. **Demand-driven promotion.** `AddToCartButton` started inside one slice. It moved to `shared/` when the second consumer appeared, not before.
2. **`shared/` is a leaf.** Nothing in `shared/` imports from a sub-feature. The graph stays acyclic by construction.
3. **Self-contained contract.** A shared slice owns its own data and side effects. Consumers pass identity props only (`productId`). If a consumer needs to control its behavior, it isn't a shared slice — demote it to a stateless feature organism that takes props.
