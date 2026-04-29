import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import { MenuItemCard } from "../components/MenuItemCard";
import { useCart } from "../context/CartContext";
import type { MenuItem } from "../types";

export function MenuPage(): JSX.Element {
  const { addItem } = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<MenuItem[]>("/api/menu");
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load menu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-slate-600">Loading menu…</p>;
  }
  if (error) {
    return (
      <p className="rounded-md bg-red-50 p-4 text-red-800" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Menu</h1>
      <p className="mb-6 text-slate-600">
        Browse items and add them to your cart.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onAddToCart={(m, q) => addItem(m, q)}
          />
        ))}
      </div>
    </div>
  );
}
