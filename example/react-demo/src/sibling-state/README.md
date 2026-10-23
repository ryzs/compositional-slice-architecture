# Sibling state: declared cross-slice coupling

Evidence for the v0.2 resolution of invisible coupling between sibling slices.

Two slices that can't import each other often still need to stay in sync (a product list and a cart indicator both care about "item was added"). Pretending they're decoupled just pushes the coupling into an invisible channel: the data cache's normalized shape, a DOM event, a context smuggled through a parent.

The v0.2 rule: **coupling is allowed, hiding it is not.** Cross-slice state lives in a module under `shared/state/`, and every participant imports that module through the shared barrel. The coupling becomes two visible imports of one file:

```
shared/state/cart-signal.ts   ← the declared channel
       ↑                ↑
AddToCartButton    CartIndicator
   (writer)          (reader)
```

`grep -r "cart-signal" src/` returns the complete list of participants. That's the property the import-graph rules were always buying; this extends it to state.

The anti-rule, stated in `cart-signal.ts`: no hidden channels. If two slices coordinate through the incidental shape of a cache, through DOM events, or through a parent ferrying callbacks between them, the coupling exists but can't be audited. Declare it or remove it.
