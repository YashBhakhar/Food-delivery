import { useState } from "react";
import type { MenuItem } from "../types";

interface Props {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

export function MenuItemCard({ item, onAddToCart }: Props): JSX.Element {
  const [qty, setQty] = useState(1);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <img
        src={item.image}
        alt=""
        className="h-40 w-full object-cover"
        loading="lazy"
      />
      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
        <p className="mt-1 flex-1 text-sm text-slate-600">{item.description}</p>
        <p className="mt-3 text-lg font-bold text-orange-600">
          ${item.price.toFixed(2)}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`qty-${item.id}`}>
            Quantity
          </label>
          <input
            id={`qty-${item.id}`}
            type="number"
            min={1}
            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          />
          <button
            type="button"
            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            onClick={() => onAddToCart(item, qty)}
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
