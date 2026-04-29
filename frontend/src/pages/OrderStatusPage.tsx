import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { StatusStepper } from "../components/StatusStepper";
import { getSocket } from "../realtime/socket";
import type { Order, OrderStatus } from "../types";

export function OrderStatusPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<Order>(`/api/orders/${id}`);
        if (!cancelled) setOrder(data);
      } catch {
        if (!cancelled) {
          setOrder(null);
          setError("Order not found");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    const room = `order:${id}`;
    socket.emit("join", room);

    const onStatus = (payload: {
      orderId: string;
      status: OrderStatus;
      updatedAt: string;
    }) => {
      if (payload.orderId !== id) return;
      setOrder((prev) =>
        prev
          ? { ...prev, status: payload.status, updatedAt: payload.updatedAt }
          : prev,
      );
    };

    socket.on("order:status", onStatus);
    return () => {
      socket.off("order:status", onStatus);
    };
  }, [id]);

  if (!id) {
    return <p>Missing order id.</p>;
  }
  if (loading) {
    return <p className="text-slate-600">Loading order…</p>;
  }
  if (error || !order) {
    return (
      <div>
        <p className="text-red-700">{error ?? "Not found"}</p>
        <Link to="/" className="mt-4 inline-block text-orange-600 underline">
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Order status</h1>
      <p className="mb-1 text-slate-600">
        Order <span className="font-mono text-sm">{order.id}</span>
      </p>
      <p className="mb-6 text-sm text-slate-500">
        Last updated: {new Date(order.updatedAt).toLocaleString()}
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Progress</h2>
        <StatusStepper current={order.status} />
      </div>

      <div className="mt-8">
        <h2 className="mb-2 font-semibold">Items</h2>
        <ul className="space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={`${i.menuItemId}-${i.name}`}>
              {i.quantity}× {i.name} — ${(i.price * i.quantity).toFixed(2)}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-semibold">Total: ${order.total.toFixed(2)}</p>
        <p className="mt-2 text-sm text-slate-600">
          Deliver to: {order.delivery.name}, {order.delivery.address}
        </p>
      </div>

      <Link to="/" className="mt-8 inline-block text-orange-600 underline">
        Order more
      </Link>
    </div>
  );
}
