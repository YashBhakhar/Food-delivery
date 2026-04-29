import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api/client";
import { getSocket } from "../realtime/socket";
import type { Order } from "../types";

export function OrdersListPage(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<Order[]>("/api/orders");
      setOrders(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join", "orders:all");
    const onStatus = (): void => {
      void load();
    };
    socket.on("order:status", onStatus);
    return () => {
      socket.off("order:status", onStatus);
    };
  }, [load]);

  if (loading) {
    return <p className="text-slate-600">Loading your orders…</p>;
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Your orders</h1>
      <p className="mb-6 text-slate-600">
        View all placed orders and jump to live tracking for each.
      </p>

      {error ? (
        <p className="mb-4 rounded bg-red-50 p-3 text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {orders.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-slate-600">No orders yet.</p>
          <Link to="/" className="mt-3 inline-block text-orange-600 underline">
            Browse menu
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-mono text-xs text-slate-500">{o.id}</p>
                <p className="font-medium">{o.delivery.name}</p>
                <p className="text-sm text-slate-600">
                  {o.status} · ${o.total.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(o.createdAt).toLocaleString()}
                </p>
              </div>
              <Link
                to={`/orders/${o.id}`}
                className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
              >
                Track order
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
