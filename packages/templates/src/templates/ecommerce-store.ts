/**
 * E-commerce Store template - React 18 + Vite + TypeScript + Tailwind CSS
 */

import type { Template } from "../types.js";

export const ecommerceTemplate: Template = {
  id: "ecommerce-store",
  name: "E-Commerce Store",
  slug: "ecommerce-store",
  description:
    "Full-featured e-commerce store with product catalog, shopping cart, checkout flow, and Tailwind CSS UI.",
  category: "app",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["ecommerce", "store", "shop", "react", "tailwind", "cart"],
  variables: [
    {
      name: "name",
      description: "Project name",
      type: "string",
      default: "ecommerce-store",
    },
    {
      name: "appName",
      description: "Store name",
      type: "string",
      default: "Awesome Shop",
    },
  ],
  dependencies: {
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.469.0",
  },
  devDependencies: {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    typescript: "^5.6.3",
    vite: "^6.0.3",
    tailwindcss: "^3.4.16",
    autoprefixer: "^10.4.20",
    postcss: "^8.4.49",
  },
  files: [
    {
      path: "package.json",
      content: `{
  "name": "{{kebabCase name}}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.469.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.6.3",
    "vite": "^6.0.3"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  }
}
`,
    },
    {
      path: "vite.config.ts",
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`,
    },
    {
      path: "index.html",
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{appName}}</title>
  </head>
  <body class="bg-slate-50 text-slate-900">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
    {
      path: "src/main.tsx",
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
    },
    {
      path: "src/index.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
    },
    {
      path: "src/App.tsx",
      content: `import React, { useState } from 'react';
import { ShoppingBag, Star, Trash2, CheckCircle2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
}

const PRODUCTS: Product[] = [
  { id: 1, name: "Minimalist Wireless Headphones", price: 129.99, rating: 4.8, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60" },
  { id: 2, name: "Ergonomic Mechanical Keyboard", price: 89.99, rating: 4.9, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60" },
  { id: 3, name: "Smart Fitness Watch", price: 199.99, rating: 4.7, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60" },
  { id: 4, name: "Premium Leather Backpack", price: 149.99, rating: 4.6, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60" },
];

export default function App() {
  const [cart, setCart] = useState<Product[]>([]);
  const [isCheckout, setIsCheckout] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const addToCart = (product: Product) => setCart([...cart, product]);
  const removeFromCart = (index: number) => setCart(cart.filter((_, i) => i !== index));
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-black text-indigo-600">{{appName}}</h1>
        <button onClick={() => setIsCheckout(true)} className="relative flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
          <ShoppingBag className="w-4 h-4" />
          <span>Cart ({cart.length})</span>
        </button>
      </header>

      <main className="flex-1 max-w-6xl mx-auto p-6 w-full">
        {ordered ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md mx-auto">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-slate-600 mb-6">Thank you for shopping with us. Your order is on its way.</p>
            <button onClick={() => { setOrdered(false); setCart([]); }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700">Continue Shopping</button>
          </div>
        ) : isCheckout ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Checkout</h2>
            <div className="divide-y divide-slate-100 mb-6 max-h-60 overflow-y-auto">
              {cart.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-sm">
                  <span>{item.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">\${item.price.toFixed(2)}</span>
                    <button onClick={() => removeFromCart(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg mb-6 pt-4 border-t border-slate-200">
              <span>Total:</span>
              <span>\${total.toFixed(2)}</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsCheckout(false)} className="flex-1 border border-slate-300 py-2.5 rounded-xl font-semibold hover:bg-slate-50">Back to Shop</button>
              <button onClick={() => setOrdered(true)} disabled={cart.length === 0} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50">Place Order</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">Featured Products</h2>
              <p className="text-slate-500">Discover our curated collection of high quality products.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRODUCTS.map(product => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col group hover:shadow-md transition">
                  <div className="h-48 overflow-hidden bg-slate-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1 text-amber-500 text-xs mb-1 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{product.rating}</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2 flex-1">{product.name}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-lg">\${product.price.toFixed(2)}</span>
                      <button onClick={() => addToCart(product)} className="bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
`,
    },
  ],
};
