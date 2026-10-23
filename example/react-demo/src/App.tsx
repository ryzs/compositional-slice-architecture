import { useState } from 'react';
import { FeaturedProduct } from './container-hook-screen/featured-product/featured-product';
import { ProductList } from './container-hook-screen/product-list/product-list';
import { CartPage } from './container-hook-screen/cart-page/cart-page.container';
import { DealsRail } from './cross-slice-sharing/deals-rail/deals-rail';
import { CartIndicator } from './sibling-state/cart-indicator/cart-indicator';

type Tab = 'ceremony' | 'sharing' | 'sibling-state';

// Plays the role of the app layer: pages composing slices, owning layout.
// (In a real CSA repo these imports go through each sub-feature's index.ts;
// the demo keeps direct paths so each file maps 1:1 to the folder you're reading.)
export function App() {
  const [tab, setTab] = useState<Tab>('ceremony');

  return (
    <div className="app">
      <header>
        <h1>CSA React Demo</h1>
        <p>
          Each tab is evidence for one spec claim. Folder names in <code>src/</code> match the tabs.
        </p>
      </header>

      <nav>
        <button className={`tab ${tab === 'ceremony' ? 'active' : ''}`} onClick={() => setTab('ceremony')}>
          1 · Variable ceremony
        </button>
        <button className={`tab ${tab === 'sharing' ? 'active' : ''}`} onClick={() => setTab('sharing')}>
          2 · Cross-slice sharing
        </button>
        <button
          className={`tab ${tab === 'sibling-state' ? 'active' : ''}`}
          onClick={() => setTab('sibling-state')}
        >
          3 · Sibling state
        </button>
      </nav>

      {tab === 'ceremony' && (
        <>
          <section>
            <h2>Tier 1 — hook + inline render (the default)</h2>
            <p>
              <code>featured-product/</code>: two files, no <code>.screen.tsx</code>. Promoting this
              would be ceremony.
            </p>
            <FeaturedProduct />
          </section>
          <section>
            <h2>Tier 2 — screen split</h2>
            <p>
              <code>product-list/</code>: markup earns a pure screen file (visual-regression target,
              loading/empty/data variants).
            </p>
            <ProductList />
          </section>
          <section>
            <h2>Tier 3 — container promotion</h2>
            <p>
              <code>cart-page/</code>: three sibling hooks with non-trivial wiring (promo feeds
              totals, totals gate checkout). Business hooks stay pure.
            </p>
            <CartPage />
          </section>
        </>
      )}

      {tab === 'sharing' && (
        <>
          <section>
            <h2>Shared slice: <code>AddToCartButton</code></h2>
            <p>
              A stateful slice promoted to <code>shared/slices/</code>, consumed by two sibling
              slices through the barrel. It owns its own mutation; consumers pass{' '}
              <code>productId</code> only.
            </p>
          </section>
          <section>
            <h2>Consumer #1 — <code>ProductList</code></h2>
            <ProductList />
          </section>
          <section>
            <h2>Consumer #2 — <code>DealsRail</code></h2>
            <DealsRail />
          </section>
        </>
      )}

      {tab === 'sibling-state' && (
        <>
          <section>
            <h2>Declared channel: <code>shared/state/cart-signal.ts</code></h2>
            <p>
              Writer and reader can't import each other. They synchronize through one declared
              module — the coupling is visible as two imports of one file. Add items on the left;
              the indicator updates live.
            </p>
          </section>
          <div className="two-col">
            <section>
              <h2>Writer — <code>DealsRail</code> (via AddToCartButton)</h2>
              <DealsRail />
            </section>
            <section>
              <h2>Reader — <code>CartIndicator</code></h2>
              <CartIndicator />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
