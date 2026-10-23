// Stand-in for the per-sub-feature api/ boundary (GraphQL wrappers, REST
// clients, etc). CSA is data-library-agnostic; the demo only needs latency.
export type Product = {
  id: string;
  name: string;
  price: number;
  tag?: string;
};

const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Field Jacket', price: 128 },
  { id: 'p2', name: 'Canvas Tote', price: 42 },
  { id: 'p3', name: 'Wool Beanie', price: 28, tag: 'deal' },
  { id: 'p4', name: 'Trail Boots', price: 180 },
  { id: 'p5', name: 'Thermal Flask', price: 35, tag: 'deal' },
  { id: 'p6', name: 'Rain Shell', price: 96 },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fakeApi = {
  async listProducts(): Promise<Product[]> {
    await delay(600);
    return PRODUCTS;
  },

  async getFeaturedProduct(): Promise<Product> {
    await delay(400);
    return PRODUCTS[3];
  },

  async listDeals(): Promise<Product[]> {
    await delay(800);
    return PRODUCTS.filter((p) => p.tag === 'deal');
  },

  async addToCart(productId: string): Promise<{ ok: true; productId: string }> {
    await delay(500);
    return { ok: true, productId };
  },
};
