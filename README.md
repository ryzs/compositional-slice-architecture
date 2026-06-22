# Compositional Slice Architecture (CSA)

A frontend architecture pattern that pairs Atomic Design with stateful feature slices, joined by adapter ports and an explicit screen-props contract.

> **Status: Draft v0.1.** This is a working seed for a future public spec. Feedback, pushback, and PRs welcome.

---

## TL;DR

Most frontend architecture patterns pick **one taxonomy** and force everything into it. Atomic Design organizes by visual composition (atoms → templates) and intentionally ignores state. Feature-Sliced Design organizes by feature responsibility (entities → features → widgets → pages) and absorbs UI into its layers.

**CSA argues that frontend code has two natural axes**, and you serve both better by keeping them as parallel taxonomies that compose:

- A **UI taxonomy** (atomic-design-style) that builds stateless visual units.
- A **Feature taxonomy** that builds stateful units called **slices**.

Slices use UI organisms; UI organisms know nothing about features. The two stacks meet at the slice's render boundary, governed by an explicit **screen-props contract**. Side effects on platforms (navigation, toast, analytics) flow through **adapter ports** so slices stay platform-agnostic and testable.

CSA gives you:

- Reusable feature units (slices) that move with their data + side effects.
- A UI library that's free of business-logic gravity.
- A clear rule for what belongs where, including when to NOT promote to a higher layer.

It's not a new framework, just a structured way to organize a React/React-Native codebase that tends to drift into one of two bad shapes: organism components that secretly own GraphQL queries, or feature folders that re-invent visual primitives nobody else can reuse.

> **Repo-shape neutral.** CSA describes logical layers and dependency rules. It doesn't require a monorepo — you can implement it as folder boundaries inside a single repo, or as separate published packages. Monorepos are recommended for the case CSA was designed against (multiple apps sharing UI + features), but the pattern itself is independent of how you physically organize files. See [Reference Architecture → Repo organization](#repo-organization-recommended-monorepo-but-not-required) for trade-offs.

---

## Table of Contents

1. [The Gap](#the-gap)
2. [Related Work](#related-work)
3. [Core Vocabulary](#core-vocabulary)
4. [The Dual-Taxonomy Insight](#the-dual-taxonomy-insight)
5. [Six Principles](#six-principles)
6. [Reference Architecture](#reference-architecture)
7. [Loading, Empty, and Error States](#loading-empty-and-error-states)
8. [Storybook and Adapter Mocking](#storybook-and-adapter-mocking)
9. [Worked Example](#worked-example)
10. [Trade-offs and When NOT to Use CSA](#trade-offs-and-when-not-to-use-csa)
11. [Adopting CSA in an Existing Codebase](#adopting-csa-in-an-existing-codebase)
12. [Open Questions](#open-questions)
13. [Acknowledgments and References](#acknowledgments-and-references)

---

## The Gap

Two architectural styles dominate frontend conversations:

- **Atomic Design** (Brad Frost, 2013) — pure UI taxonomy. A `Button` is an atom; a `FormField` is a molecule; a `LoginForm` is an organism. Stateless components, designed for visual composition.
- **Feature-Sliced Design** (FSD, ~2021 onward) — full-stack-of-frontend taxonomy. Layers `shared / entities / features / widgets / pages / app`, each with strict import direction, all UI absorbed into the layers.

Both work. Both have a real argument. But neither answers a question that comes up the moment you build a non-trivial product:

> Where does a piece of UI **with business logic baked in** go?

A `<ContactForm>` that owns its mutation, validates inputs, fires analytics, navigates back on success — what is it?

- In Atomic Design, it's an organism. But Atomic Design refuses to talk about state, so the answer is incomplete: yes it's an organism, but where does the data fetching live? Where does the navigation call live? Atomic Design shrugs.
- In FSD, it's a feature (or a widget if it composes other features). But FSD also wants the visual primitives inside `shared/ui`. So you end up rebuilding atomic-design vocabulary inside FSD's bottom layer, or importing it from a separate library and bridging.

What's missing is an explicit story for the **stateful unit of feature reuse**, sitting on top of a UI library that stays stateless.

CSA is that story.

---

## Related Work

CSA is not new in spirit. It's a synthesis of patterns that already exist, with a small original contribution (the dual-taxonomy framing + the variable-ceremony slice composition). Direct ancestors:

| Pattern | What it gives | What CSA borrows |
| ------- | ------------- | ---------------- |
| **Atomic Design** (Frost, 2013) | A clean visual taxonomy: atoms, molecules, organisms, templates, pages. | Names the UI layer. CSA preserves Atomic Design as the **UI side** of the architecture. |
| **Feature-Sliced Design** (feature-sliced.design) | The term *slice*; explicit layer-by-feature folders; strict import-direction rules. | Names the unit of feature reuse. CSA narrows "slice" to mean a stateful unit that composes UI from outside the slice taxonomy. |
| **Container / Presentational** (Dan Abramov, 2015 — and later disclaimed) | Separating data-fetching from rendering. | Justifies the screen-props contract. CSA treats it as opt-in, not mandatory; the slice file IS the container in simple cases. |
| **Hexagonal Architecture / Ports & Adapters** (Cockburn, 2005) | Push platform/IO concerns behind ports so the core stays testable. | The **adapter** layer. CSA borrows ports-and-adapters wholesale for navigation, toast, analytics, storage, i18n. |
| **MVVM** (Microsoft, 2005) | A typed contract between business logic and view. | The view-model concept, redefined as the screen's props type rather than a wrapper object. |
| **Clean Architecture** (Martin, 2012) | Dependency rule (inner layers don't depend on outer). | The dependency arrow `core → ui → features → app`. |
| **Domain-Driven Design** (Evans, 2003) | Bounded contexts. | The sub-feature folder boundary inside a feature package. |

CSA's contribution on top of all these:

1. **The dual-taxonomy framing.** Most patterns pick one axis (visual or feature) and absorb the other. CSA explicitly keeps both.
2. **The two-role slice.** A slice is either a *page-slice* (owns its full-screen layout shell) or a *section-slice* (rendered alongside siblings). Same primitive, two declared roles, no `chrome` prop branching.
3. **Variable ceremony.** The slice has a default 2-file shape (hook + screen) and an opt-in 3-file shape (hook + screen + container) with an explicit promotion rule. Most patterns make the heavier shape mandatory.
4. **Adapter shape rule.** Adapters are either declarative singletons or React hooks, chosen by whether they have React context dependency. No useless `useFoo()` wrappers around stateless APIs.

If any of these is older than I think, please open an issue — I'd rather cite prior art than reinvent.

---

## Core Vocabulary

CSA's vocabulary is small and precise.

| Term | Definition |
| ---- | ---------- |
| **Route** | A URL → file mapping. Renders one Page. No logic. |
| **Page** | App-level composition. Owns layout, wires page-level concerns (refresh, page-view analytics), renders one or more slices. No business logic, no GraphQL. |
| **Slice** | A self-contained, stateful feature unit. Owns data, business logic, side effects, and rendering. Composes UI organisms from a UI library it does not own. **The smallest unit of feature reuse.** |
| **Page-slice** | A slice designed to occupy a full screen. Owns its own layout shell. The corresponding page file becomes a 3-line wrapper. |
| **Section-slice** | A slice designed to be one of many siblings inside a page. No layout shell. The page owns the layout shell and arranges sections. |
| **Feature organism** | Stateless composed UI that's too feature-specific for the shared UI library but too reusable to inline in one slice. Takes data and handlers via props. Lives in the feature package. |
| **Adapter** | Cross-platform abstraction for a side effect (navigation, toast, analytics, storage, i18n, reporting, permissions). Slices consume adapters; never platform-specific APIs directly. |
| **View-model** | The shape of data flowing from a hook to a screen. **In CSA this is the screen's props type — there is no `viewModel` wrapper prop.** Slice files map hook outputs to screen props one by one. |
| **Hook** | Owns data, business logic, and side effects. Returns the values the screen needs. |
| **Screen** | Pure presentational component. Receives explicit props (no `viewModel` wrapping). No hooks beyond local UI state. |

Note what's NOT in the vocabulary: "container" is mentioned later as an opt-in promotion of the slice file, but it's not a primary vocabulary term — most slices don't have one.

---

## The Dual-Taxonomy Insight

This is the centerpiece of CSA. Most frontend architectures pick one taxonomy:

- **Atomic Design picks UI.** Everything is an atom, molecule, or organism. Where state lives is "out of scope" — typically pushed into a sibling system the architecture doesn't name.
- **Feature-Sliced Design picks features.** Everything is shared / entity / feature / widget / page. UI primitives live as part of the bottom layer, alongside business helpers.

Both choices are reasonable. Both also produce a recurring frustration:

- Atomic Design users feel they're "missing the data layer" and bolt on Redux/Apollo/Zustand without architectural integration.
- FSD users feel they're "rebuilding Storybook inside the architecture" and end up with both a UI library and `shared/ui`, confusingly.

CSA's claim: **frontend code has two natural axes, and you serve both better by keeping them as parallel taxonomies that compose.**

```
┌─────────────────────────────────────────────────────────────────┐
│                       FEATURE TAXONOMY                          │
│                                                                 │
│   apps/<app>/    ←  Pages (compose slices, own layout)          │
│       ↑                                                         │
│   <app-feature-package>/<sub-feature>/<slice>/                  │
│       ↑                                                         │
│   <app-feature-package>/<sub-feature>/components/               │
│       ↑   (feature organisms — stateless, feature-specific)     │
│       │                                                         │
│       │  composes ─────────────────────────────┐                │
│       │                                        ▼                │
│  ─────────────────────────────────────────────────────────      │
│                          UI TAXONOMY                            │
│                                                                 │
│   ui/templates/    ←  Layout shells                             │
│   ui/organisms/    ←  App-generic composed UI                   │
│   ui/molecules/    ←  Composed atoms                            │
│   ui/atoms/        ←  Single-purpose UI                         │
│   ui/primitives/   ←  Cross-platform building blocks            │
└─────────────────────────────────────────────────────────────────┘

   ↑                                                  ↑
   │                                                  │
core/adapters/  ←  Side-effect ports (navigation, toast, analytics, ...)
core/hooks/, core/utils/, core/types/  ←  Cross-platform shared infra
```

Two taxonomies, neither subsuming the other. The contract between them is explicit:

- A slice MAY import any UI element (primitive, atom, molecule, organism, template).
- A UI element MAY NOT import a slice. This is the dependency arrow.
- A slice MAY NOT import another slice. Cross-slice sharing happens in `<app-feature-package>/shared/` (for things that belong to one app's domain) or `core/` (for things shared across apps).
- A slice MAY import any adapter from `core/adapters/`.
- A page MAY import any slice. A page imports adapters too, for page-level concerns (refresh, page-view analytics).

That's the whole topology. From those rules, the rest of CSA falls out.

---

## Six Principles

CSA's architecture comes from six principles. Each is a constraint that keeps the codebase from drifting.

### 1. Locality

Each unit owns everything it needs to do its job. A slice's hook, its screen, its types, its sub-components, its tests — all colocated in one folder. Moving the slice is a single `mv`.

The opposite is "type-first" or "layer-first" organization (`hooks/`, `types/`, `components/` at the package root with everything inside). Type-first organization optimizes for "I'm looking for all hooks" and pessimizes for "I'm looking for everything that contributes to ContactForm." CSA chooses locality because the second question is asked far more often.

### 2. Composition over inheritance

Bigger units are assembled from smaller ones. Never extended. Never modified.

A slice composes organisms. A page composes slices. A section-slice cannot inherit from a page-slice; if you find yourself wanting to, you have two distinct exports masquerading as one.

This is straightforward in React land — there's no class extension to fight against — but it's worth stating because the temptation to "add a `mode` prop" creeps in. CSA treats `mode`-prop branching as a smell: prefer two named exports.

### 3. Boundary by default

Cross-slice imports are forbidden. Sub-features inside a feature package may not import each other.

If two sub-features need the same thing, they share through `<app-feature-package>/shared/` (one explicit step up) or `core/` (one more step). The promotion is one-way: code starts inside the most-owning sub-feature, gets promoted only when a second consumer appears.

This is more restrictive than FSD's "import direction" rule, which allows imports from lower layers freely. CSA's stricter default is the cost you pay for the dual taxonomy: with two stacks of layers, you can't afford ambiguous import paths.

### 4. Adapter mediation

Slices know about *contracts*, never about platforms.

Every side effect that touches a platform — navigation, toast, analytics, storage, deep links, i18n, reporting — goes through an adapter port in `core/adapters/`. The slice imports `useNavigation()` or `analytics`; never `useRouter` from `expo-router` or `posthog.track` directly.

Adapters come in two shapes, chosen by whether they need React state/context:

- **Declarative singleton** (`analytics`, `toast`, `linking`) — stateless, fire-and-forget. Imported and called.
- **Hook** (`useNavigation`, `useTranslate`, `useBreakpoint`) — stateful or context-dependent. Called inside React.

Don't wrap a singleton in a useless `useFoo()` hook just for symmetry. The import is the API.

### 5. Variable ceremony

The slice has a minimum mandatory shape and an optional promoted shape. Most slices stop at the minimum.

- **Default (2 files):** `<slice>.tsx` (the slice — calls hook, maps to screen props) + `<slice>.screen.tsx` (the pure UI). Plus `use-<slice>.ts` for the hook. So 3 files total in the folder, but only 2 of them concern the "slice composition" itself.
- **Promoted (3 files):** When the slice composes 3+ hooks AND the wiring is non-trivial, OR the wiring exceeds ~40 lines, OR the hook needs to stay pure for testing reasons, you replace `<slice>.tsx` with `<slice>.container.tsx`. The container owns side-effect wiring; the hook becomes pure.

The promotion criterion is explicit: **don't promote for ceremony.** Most slices don't earn the third file. If you're using the heavier shape just because it "feels more architectural," you're paying for nothing.

This contrasts with patterns that mandate Container-Presentational always, or never. CSA gives you a rule.

### 6. Dual taxonomy

This is the meta-principle. UI and features compose differently and deserve different shapes. Don't force one taxonomy to absorb the other.

UI is fractal — atoms compose into molecules compose into organisms. Each level is stateless; visual decomposition is the only logic.

Features are not fractal. A feature is stateful and bounded; sub-features don't compose into a "super-feature" that feels natural. Slices are flat by intent.

Conflating these is what causes the recurring drift in single-taxonomy architectures: organisms grow Apollo queries (Atomic Design's failure mode) or feature folders sprout `ui/` subfolders (FSD's failure mode). CSA keeps them parallel.

---

## Reference Architecture

CSA describes **logical layers**, not a specific repo shape. The layers are: a UI library, one or more feature packages, one or more app shells, and a shared core. How you physically organize them is an orthogonal decision.

### Repo organization (recommended: monorepo, but not required)

CSA's dependency arrow `core → ui → feature → app` is what matters. Two valid physical layouts:

**Layout A — Monorepo (recommended).** Each layer is its own package. Boundaries are enforced by `package.json` exports + import-linting rules.

- Best when: multiple apps consume the same UI + features (B2C app, B2B app, worker app); cross-platform work (web + native); team of 5+; long-lived codebase.
- Trade-off: tooling overhead (workspace setup, build orchestration, codegen-per-package).

**Layout B — Single repo, folder-only separation.** All layers are folders inside one repo. Boundaries are enforced by lint rules (e.g. `eslint-plugin-import` zones) and code-review discipline.

- Best when: a single app, no plan for cross-app code reuse; small team; short-lived or experimental codebase.
- Trade-off: easier to violate the dependency arrow accidentally; harder to extract a feature later if the codebase grows.

```
src/
├── ui/                          # what would be packages/ui/
├── core/                        # what would be packages/core/
├── features/
│   └── shop/                    # what would be packages/shop/
└── app/                         # what would be apps/web/
```

**Layout C — Multi-repo with published packages.** UI library is a separate repo published to npm; feature packages are separate repos; apps consume them as dependencies.

- Best when: open-source distribution; org-level shared libraries across many independent products.
- Trade-off: heaviest tooling, version-coordination overhead. CSA doesn't care, but you'll feel it.

The rest of this section uses **monorepo terms** (`packages/`, `apps/`) for concreteness, but the structural patterns translate to any of the three layouts. Mentally substitute "package" with "folder boundary" or "repo" as needed.

### Canonical structure (monorepo example)

```
packages/
├── ui/                          # UI taxonomy (atoms → templates)
│   └── src/
│       ├── primitives/
│       ├── atoms/
│       ├── molecules/
│       ├── organisms/
│       └── templates/
│
├── core/                        # cross-cutting platform-abstracted infra
│   └── src/
│       ├── adapters/            # ports for side effects
│       │   ├── navigation/      # hook adapter
│       │   ├── analytics/       # declarative singleton
│       │   ├── toast/           # declarative singleton
│       │   ├── storage/         # hybrid
│       │   ├── linking/         # declarative singleton
│       │   ├── i18n/            # hook adapter
│       │   ├── reporting/       # declarative singleton
│       │   └── permissions/     # declarative singleton
│       ├── apollo/              # Apollo Client factory + links
│       ├── hooks/               # cross-platform React hooks
│       ├── types/               # shared domain types
│       ├── utils/               # pure helpers
│       └── constants/
│
├── customer-app/                # one feature package per audience
│   └── src/
│       ├── client-contact/      # sub-feature
│       │   ├── contact-list/    # slice (page-slice)
│       │   │   ├── contact-list.screen.tsx
│       │   │   ├── contact-list.screen.native.tsx   # only when divergent
│       │   │   ├── contact-list.tsx                 # the slice itself
│       │   │   ├── use-contact-list.ts              # business hook
│       │   │   └── contact-list.types.ts
│       │   ├── contact-form/    # slice
│       │   ├── components/      # feature organisms (stateless, shared by 2+ slices)
│       │   ├── gqlhooks/        # GraphQL operation wrappers
│       │   ├── hooks/           # cross-screen business hooks (rare)
│       │   ├── lib.ts           # validators, formatters
│       │   ├── types.ts         # sub-feature-wide types
│       │   └── index.ts         # public API barrel — slices only
│       ├── client-profile/
│       ├── service-packages/
│       └── shared/              # cross-sub-feature types + helpers + components
│
└── apps/
    ├── consumer-web/            # one app shell per deployment target
    └── consumer-mobile/
```

### File conventions

- `.tsx` = web (default). Bundlers like Vite pick this up.
- `.native.tsx` = native override. Metro picks this up. Never create `.web.tsx`.
- `.screen.tsx` suffix marks a screen entry point. Other components in the same folder (sub-rows, empty states) drop the suffix.
- Single `.screen.tsx` by default; split to `.screen.native.tsx` only when the layout is structurally different. Tailwind-style responsive classes handle minor styling divergence in a single file.

### Public API rule

Each sub-feature's `index.ts` exports only **slices** (the slice file or its container variant). Internal hooks, screens, types, validators, and gqlhooks are implementation details. The package's root barrel re-exports each sub-feature's surface.

This rule has teeth: if a route file imports anything other than a slice, it's bypassing the architecture.

### Dependency arrow

```
core   ←  ui   ←  feature-package   ←  app
```

- `core` may not import from anything in this monorepo.
- `ui` may import from `core`.
- A feature package may import from `core` and `ui`, never from another feature package, never from `apps/*`.
- `apps/*` may import from any of the above.

### Lint enforcement of the dependency arrow

The dependency arrow is only as strong as the lint that catches violations. CSA doesn't mandate a specific tool, but a few that work well:

- **`eslint-plugin-boundaries`** — define each layer as a "type" and forbid imports against the arrow.
- **`eslint-plugin-import` with `no-restricted-paths`** (or its `import/no-internal-modules` rule) — file-pattern-based zones.
- **`dependency-cruiser`** — separate from ESLint, runs in CI; powerful rule DSL.
- **NX / Turborepo built-in tags** — if you're using one of those monorepo orchestrators, their tag-based dependency rules cover this.

Pick one and wire it on day one. Architecture rules people can violate by accident will be violated.

### Form state

CSA is form-library-agnostic. The rule is just: **form state lives in the screen's hook, never in a global store.** Practical guidance:

- For most React projects, `react-hook-form` integrates cleanly — call its hooks inside `use-<screen>.ts` and pass the registered field props through the screen-props contract.
- For React Native, the same applies. `react-hook-form` works on RN; alternatives (formik, native `useReducer`) are fine if simpler.
- A global form store (Zustand, Redux) is almost always wrong. Forms are screen-local by definition.

The slice's hook returns whatever shape the screen needs (`fields`, `isSubmitting`, `onSubmit`); the form library's internals stay inside the hook. Swapping form libraries doesn't change the screen's contract.

---

## Loading, Empty, and Error States

Every slice has three render paths beyond the happy path: data is loading, data arrived but is empty, or something went wrong. CSA's stance:

- **The slice's hook returns each state explicitly** — `isLoading`, `isEmpty`, `error` (Apollo `error`, not domain errors). The screen renders one of four branches: loading / empty / error / data.
- **Fallback components for the trio live in the UI library** as molecules: `<LoadingState />`, `<EmptyState illustration message />`, `<ErrorState onRetry />`. They're styled with the design system and consistent across the app.
- **Per-slice illustrations and copy** are passed as props to the generic fallbacks. The "no contacts yet" empty state and the "no invoices yet" empty state share a component but differ in their illustration + message + CTA.
- **Domain errors (`expectedErrors` from a mutation) DO NOT use the generic `<ErrorState />`** — they're rendered inline at the offending field, or as a toast, per the error-handling philosophy. The generic error component is for unexpected errors only.

Treat loading / empty / error as first-class screen variants in Storybook. Each is a story.

## Storybook and Adapter Mocking

A pure screen is trivial to render in Storybook — pass mock props and you're done. A slice (with its hook + adapter calls) is harder, because the hook fires `analytics.track`, the screen calls `useNavigation`, and Apollo expects a provider.

CSA's pattern:

- **Storybook stories for the SCREEN, not the slice.** Import `<ContactFormScreen>` directly; pass mocked props per the screen-props contract. This is the primary visual-regression target — no Apollo, no adapters, no surprises.
- **Adapter mock factories** ship from the core library: `createMockNavigation()`, `createMockToast()`, etc. Each returns a mock that matches the adapter's interface.
- **Slice-level integration stories (optional)** mount the full slice with mocked adapters via Storybook's `decorators`. Useful for demos or when you want to exercise the hook's behavior; not required for visual regression coverage.
- **Apollo provider in Storybook** uses `MockedProvider` from `@apollo/client/testing`. Mock the operations the slice's gqlhooks call.

The default ratio: 80% pure-screen stories, 20% slice-integration stories. The pure screens cover visual regression cheaply; the integration stories cover the rare cases where you want the hook in the loop.

## Worked Example

A small e-commerce slice: showing a product list and adding items to a cart. Two pages, one feature package.

### The pages

```tsx
// apps/web/src/app/products/index.tsx (composition page — owns ScreenLayout, renders multiple slices)
import { ScreenLayout } from '@example/ui';
import { ProductList, MiniCartPreview } from '@example/shop';
import { useTrackPageView } from '@example/core/hooks';

export default function ProductsPage() {
  useTrackPageView('products');
  return (
    <ScreenLayout>
      <ScreenLayout.Header title="Products" />
      <ScreenLayout.Body scrollable>
        <ProductList />
        <MiniCartPreview />
      </ScreenLayout.Body>
    </ScreenLayout>
  );
}

// apps/web/src/app/cart/index.tsx (single-feature page — slice owns its own ScreenLayout)
import { CartPage } from '@example/shop';

export default function CartRoute() {
  return <CartPage />;
}
```

`ProductList` and `MiniCartPreview` are **section-slices**. `CartPage` is a **page-slice**. The route file is a 3-line wrapper for the page-slice and a layout host for the section-slices.

### The section-slice

```tsx
// packages/shop/src/products/product-list/product-list.screen.tsx
export type ProductListScreenProps = {
  products: Product[];
  isLoading: boolean;
  isEmpty: boolean;
  onAddToCart: (productId: string) => void;
};

export function ProductListScreen({ products, isLoading, isEmpty, onAddToCart }: ProductListScreenProps) {
  if (isLoading) return <Spinner />;
  if (isEmpty) return <Text>No products available.</Text>;
  return (
    <View>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={() => onAddToCart(p.id)} />
      ))}
    </View>
  );
}
```

```tsx
// packages/shop/src/products/product-list/use-product-list.ts
import { analytics } from '@example/core/adapters';
import { toast } from '@example/core/adapters';
import { useListProductsQuery, useAddToCartMutation } from '../gqlhooks';

export function useProductList() {
  const { products, isEmpty, loading } = useListProductsQuery();
  const [addToCart] = useAddToCartMutation();

  const onAddToCart = async (productId: string) => {
    analytics.track('product_add_to_cart_clicked', { productId });
    try {
      await addToCart({ variables: { productId } });
      analytics.track('product_added_to_cart', { productId });
      toast.success('Added to cart');
    } catch {
      toast.error('Could not add to cart');
    }
  };

  return { products, isLoading: loading, isEmpty, onAddToCart };
}
```

```tsx
// packages/shop/src/products/product-list/product-list.tsx (the slice)
import { ProductListScreen } from './product-list.screen';
import { useProductList } from './use-product-list';

export function ProductList() {
  const { products, isLoading, isEmpty, onAddToCart } = useProductList();

  return (
    <ProductListScreen
      products={products}
      isLoading={isLoading}
      isEmpty={isEmpty}
      onAddToCart={onAddToCart}
    />
  );
}
```

This is the **default 2-file slice composition**. The hook owns data + side effects (analytics, toast). The screen is pure. The slice file maps hook outputs to screen props one by one — explicit, not spread, because the boundary between hook and screen is where you want type errors to surface.

### When the cart page promotes to a container

The cart page composes more concerns: cart line items, totals, promo codes, checkout navigation, optimistic updates on quantity changes. Five hooks deep with non-trivial wiring. CSA says: promote.

```tsx
// packages/shop/src/cart/cart-page/cart-page.container.tsx
import { useNavigation } from '@example/core/adapters';
import { analytics } from '@example/core/adapters';
import { toast } from '@example/core/adapters';
import { useCart } from './use-cart';
import { useCartTotals } from './use-cart-totals';
import { usePromoCode } from './use-promo-code';
import { CartPageScreen } from './cart-page.screen';

export function CartPage() {
  const navigation = useNavigation();
  const cart = useCart();
  const totals = useCartTotals(cart.items);
  const promo = usePromoCode();

  const onCheckout = async () => {
    analytics.track('checkout_clicked');
    if (cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    navigation.push('/checkout');
  };

  return (
    <CartPageScreen
      items={cart.items}
      totals={totals}
      promo={promo.value}
      onApplyPromo={promo.apply}
      onCheckout={onCheckout}
      onRemoveItem={cart.removeItem}
      onChangeQuantity={cart.changeQuantity}
    />
  );
}
```

The hook (`useCart`) stays pure — it returns cart state and methods. The container wires app-level concerns (navigation, analytics) and composes sibling hooks (`useCartTotals`, `usePromoCode`). This is the **opt-in 3-file shape**: hook + screen + container.

If you find yourself promoting routinely for slices that don't meet the criteria, your team is over-architecting. If you find yourself never promoting even when slices exceed the threshold, your team is under-architecting. CSA gives you the line.

---

## Trade-offs and When NOT to Use CSA

CSA is opinionated. The opinions earn their keep on real product codebases. They overshoot in some contexts.

### CSA is overkill for

- **A single small app** without cross-app code reuse and no plan for one. The dependency arrow `core → ui → feature → app` adds friction without payoff.
- **A static marketing site** — no slices, no business logic to encapsulate.
- **A very early prototype** where the team is still discovering the domain. CSA assumes you have enough domain knowledge to draw sub-feature boundaries; if not, draw them with pencil and erase often.
- **Teams with no React-component-architecture experience.** CSA expects developers to be comfortable with hook composition, separation of presentation from logic, and refactoring across folders. A team learning React on the job will be fighting the architecture instead of using it.

### CSA's costs

- **More folders.** A slice has at minimum 2 files in its own folder (sometimes 3); the sub-feature has `gqlhooks/`, `components/`, `lib.ts`, `types.ts`, `index.ts`. This is more nesting than a flat `containers/` folder.
- **Naming discipline required.** Slice vs page-slice vs section-slice; hook vs business hook vs gqlhook; adapter singleton vs adapter hook. Teams that don't internalize the vocabulary drift back to mush.
- **Adapter porting effort.** Each platform side-effect needs a port + implementation. Up-front cost paid once per adapter; pay-off accrues over time as the codebase scales.
- **Promotion criteria are judgment calls.** "3+ hooks AND non-trivial wiring" is not a hard line. Teams will argue over whether a specific slice should promote. CSA accepts this as part of the deal — the alternative is rigid rules that produce ceremony or pile-ups.

### Where CSA is a strong fit

- **Multi-app monorepos** sharing UI + features (e.g. a B2C app, a B2B app, a worker app, all consuming a shared design system + shared business logic).
- **Cross-platform codebases** (React + React Native via Expo, or web + Electron) where the adapter layer pays off immediately.
- **Teams of 10+ engineers** where consistent conventions reduce review friction.
- **Products with long-lived features** that get rewritten or extracted multiple times. CSA's slice boundary is a re-architectable unit.

---

## Adopting CSA in an Existing Codebase

CSA assumes a greenfield. Most teams considering it have an existing codebase. A practical migration path:

### Phase 0 — Pre-work

- **Audit your dependency graph.** Where do imports cross what would be CSA layer boundaries? Most pre-CSA codebases have UI components reaching into business logic and feature folders importing each other freely. List the worst offenders.
- **Pick one feature to extract first.** Smallest, lowest-risk feature you have. Form-heavy is good (validates the form-state rule). The first extraction will hurt; you want it to be cheap.
- **Stand up the layer scaffolding.** Create `ui/`, `core/`, `<feature-package>/`, `app/` boundaries (folders or packages, your call). Empty.

### Phase 1 — Lift the UI library

- Move primitives, atoms, and molecules into `ui/`. They're typically already stateless; the move is mostly mechanical.
- Set up Storybook against `ui/`. Catches regressions during the rest of the migration.
- Lock the dependency arrow with lint rules immediately. Don't trust convention.

### Phase 2 — Extract the first feature

Take the feature you picked in Phase 0:

1. Create the sub-feature folder in your feature package.
2. Move the screens — replace any UI imports with `ui/` equivalents.
3. Introduce the hook + screen split for each screen.
4. Move GraphQL operations + their wrapper hooks into `gqlhooks/`.
5. Wire the public API (`index.ts` exports slices only).
6. Update routes to import from the feature package.
7. Smoke-test on every platform you ship.
8. Delete the old code.

This is the slow part. The first feature takes longer than you'd guess because you're also building muscle memory for the conventions. The second feature is twice as fast. The fifth feature is routine.

### Phase 3 — Adapter ports

In parallel with Phase 2, replace direct platform imports with adapters:

- `import { useRouter } from 'next/router'` → `import { useNavigation } from 'core/adapters/navigation'`
- `toast.success(...)` from your toast library → `import { toast } from 'core/adapters/toast'`
- `analytics.track(...)` → ditto

Each adapter is its own small refactor. Touchable in a single PR per adapter.

### Phase 4 — Migrate remaining features

With patterns established, the rest is iterative. Track migration progress visibly (a checklist, not a vague "we're doing CSA"). Resist the urge to "fully convert" everything at once — partial migration is normal and the dependency arrow lint catches the worst regressions.

### What to avoid

- **Don't rename without restructuring.** Just renaming `containers/` to `slices/` is cosmetic. The locality + boundary principles are what matter.
- **Don't try to perfect the architecture before any extraction.** The first feature exposes assumptions you didn't know you had. Extract, then refine.
- **Don't promote every slice to the 3-file container shape upfront.** Variable ceremony exists for a reason. Default to 2-file; promote when warranted.

A typical mid-sized codebase (50–100 components, 10–20 routes) takes 2–4 months of part-time migration work to fully transition. Don't promise less.

---

## Open Questions

CSA is v0.1. Things I'd like community pushback on:

1. **Slice testing strategy.** The hook + screen + slice three-file shape suggests three test surfaces (hook unit tests, screen visual tests, slice integration tests). Is that the right split, or should integration tests subsume the others?
2. **Slice public API for consumers OUTSIDE the architecture.** What if a slice from `@example/shop` is consumed by a third party? CSA assumes consumers know the architecture; for OSS distribution, a thinner public API may be needed.
3. **Server-rendered slices.** CSA was developed in a CSR context (Vite + Expo). RSC and SSR raise questions about where adapter ports live (server vs client) and whether slices can be partially server-rendered.
4. **Slice composition across feature packages.** What if `customer-app` wants to render a slice from `worker-app`? The current rule forbids cross-package slice imports, but real products sometimes need it (e.g. a customer view of a worker's profile). The escape hatch is unclear.
5. **State management beyond Apollo + Zustand.** CSA's data-layer recommendation is Apollo for server state, Zustand for cross-screen UI state, local for everything else. Teams using TanStack Query, Redux Toolkit, Jotai, etc. need adaptation guidance.
6. **i18n adapter contract.** Locale-switching mid-session across a hook adapter requires careful invalidation. Worth a dedicated mini-spec.
7. **Optimistic updates pattern.** Optimistic mutations cross the hook (returns optimistic data), the screen (shows pending state), and the Apollo cache (rollback on error). The full pattern needs articulation, especially for slices that mutate from inside lists.
8. **Permissions / role-based gating at slice boundaries.** Where does "this slice only renders for admins" live? Page-level seems right, but slice-internal gating (e.g. a CTA visible only to certain roles) is unspoken.
9. **State machine integration.** Slices with complex lifecycles (multi-step wizards, payment flows) benefit from XState or similar. Where does the machine live — inside the hook, alongside it, or as a separate module?
10. **Theme reactivity across the layer boundary.** Themes (dark mode, brand variants) live in the UI library. Slices may need to react to theme changes — opening color pickers, computing contrasts. The pattern for slice → theme communication isn't articulated.
11. **Animation and motion ownership.** Most animation lives in UI organisms (button presses, card flips). Page-transition animation crosses the slice boundary. Worth a dedicated section once a clear pattern emerges.
12. **Real-time data via subscriptions inside a slice.** Apollo subscriptions can update a slice's data in real time. The hook pattern (subscribe-on-mount, unsubscribe-on-unmount, merge into cache) is doable but needs explicit treatment.
13. **Slice versioning across feature packages.** When `feature-A` exposes a slice that `feature-B` consumes, breaking the slice's prop contract is a cross-package break. Versioning strategy (semver inside the monorepo? changesets?) is open.

PRs welcome on each of these.

---

## Acknowledgments and References

CSA exists because of years of work by other people. Direct intellectual debts:

- **Brad Frost** — *Atomic Design* (2013, 2016 book). The UI side of CSA is unchanged from atomic design.
- **Feature-Sliced Design contributors** — feature-sliced.design. The term "slice" and the import-direction rules are theirs.
- **Dan Abramov** — the original Container/Presentational article (2015) and his later disclaimer (2019). CSA's variable-ceremony rule is partly a response to that arc.
- **Alistair Cockburn** — *Hexagonal Architecture* (2005). Adapters are his invention.
- **Eric Evans** — *Domain-Driven Design* (2003). Bounded contexts inform the sub-feature boundary.
- **Martin Fowler** — too many essays to list. *Mocks Aren't Stubs*, *PoEAA*, the MVVM articles.

Software architecture is layered cake. CSA adds one thin layer on top of these foundations: the explicit dual-taxonomy framing, the two-role slice, and the variable-ceremony promotion rule. Everything else is paraphrasing.

---

## Versioning and Contributing

This document is v0.1. Major-version bumps for incompatible changes; minor for additions; patch for clarifications.

Issues, PRs, and pushback are welcome. Specific things I'd love help with:

- A reference implementation in a public template repo
- Adapter spec docs for each adapter type (port shape + implementation guidance)
- A dual-taxonomy diagram that's better than the ASCII one above
- Translations of this doc

---

_Draft v0.1 — 2026-05-06_
