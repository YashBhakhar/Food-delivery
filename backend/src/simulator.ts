import { emitOrderStatus } from "./realtime.js";
import { getOrder, updateOrderStatus } from "./store/orders.js";
import type { OrderStatus } from "./types.js";
import { nextStatus } from "./types.js";

const pendingTimeouts = new Map<string, ReturnType<typeof setTimeout>[]>();

/** Cumulative from order creation: T+10s Preparing, T+25s Out, T+45s Delivered. */
const AUTO_PIPELINE: { targetStatus: OrderStatus; atMs: number }[] = [
  { targetStatus: "Preparing", atMs: 10_000 },
  { targetStatus: "Out for Delivery", atMs: 25_000 },
  { targetStatus: "Delivered", atMs: 45_000 },
];

export function scheduleOrderStatusAutomation(orderId: string): void {
  cancelOrderStatusAutomation(orderId);
  const handles: ReturnType<typeof setTimeout>[] = [];

  for (const step of AUTO_PIPELINE) {
    const handle = setTimeout(() => {
      const order = getOrder(orderId);
      if (!order) return;
      if (nextStatus(order.status) !== step.targetStatus) return;

      const updated = updateOrderStatus(orderId, step.targetStatus);
      if (updated) {
        emitOrderStatus(orderId, updated.status, updated.updatedAt);
      }
    }, step.atMs);
    handles.push(handle);
  }

  pendingTimeouts.set(orderId, handles);
}

export function cancelOrderStatusAutomation(orderId: string): void {
  const handles = pendingTimeouts.get(orderId);
  if (!handles) return;
  for (const h of handles) {
    clearTimeout(h);
  }
  pendingTimeouts.delete(orderId);
}
