import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch } from "../api/client";
import { ORDER_STATUS_STEPS } from "../constants/orderStatus";
import { getSocket } from "../realtime/socket";
import type { Order, OrderStatus } from "../types";

function nextStatus(current: OrderStatus): OrderStatus | null {
  const i = ORDER_STATUS_STEPS.indexOf(current);
  if (i < 0 || i >= ORDER_STATUS_STEPS.length - 1) return null;
  return ORDER_STATUS_STEPS[i + 1] ?? null;
}

export function AdminPage(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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
  }, []);

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
  }, []);

  async function advance(order: Order): Promise<void> {
    const next = nextStatus(order.status);
    if (!next) return;
    setBusyId(order.id);
    try {
      await apiPatch<Order>(`/api/orders/${order.id}/status`, { status: next });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <p className="text-slate-600">Loading kitchen board…</p>;
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Kitchen / admin</h1>
      <p className="mb-6 text-slate-600">
        Live order list. Use &quot;Next status&quot; to advance one step (also cancels auto
        timers for that order).
      </p>
      {error ? (
        <p className="mb-4 rounded bg-red-50 p-3 text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {orders.length === 0 ? (
        <p className="text-slate-600">No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const next = nextStatus(o.status);
            return (
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
                </div>
                {next ? (
                  <button
                    type="button"
                    className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:bg-slate-400"
                    disabled={busyId === o.id}
                    onClick={() => void advance(o)}
                  >
                    Next: {next}
                  </button>
                ) : (
                  <span className="text-sm text-emerald-700">Delivered</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
