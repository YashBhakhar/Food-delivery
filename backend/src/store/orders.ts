import { randomUUID } from "crypto";
import type { DeliveryDetails, Order, OrderLineItem, OrderStatus } from "../types.js";
import { getMenuItemById } from "./menu.js";

const orders = new Map<string, Order>();
let nextSequence = 0;

export function resetOrdersStore(): void {
  orders.clear();
  nextSequence = 0;
}

export function createOrder(
  lineInputs: { menuItemId: string; quantity: number }[],
  delivery: DeliveryDetails,
): Order {
  const items: OrderLineItem[] = [];
  let total = 0;

  for (const input of lineInputs) {
    const menu = getMenuItemById(input.menuItemId);
    if (!menu) {
      throw new Error(`Unknown menu item: ${input.menuItemId}`);
    }
    const lineTotal = menu.price * input.quantity;
    total += lineTotal;
    items.push({
      menuItemId: menu.id,
      name: menu.name,
      description: menu.description,
      price: menu.price,
      image: menu.image,
      quantity: input.quantity,
    });
  }

  const now = new Date().toISOString();
  const order: Order = {
    id: randomUUID(),
    sequence: ++nextSequence,
    status: "Order Received",
    items,
    delivery,
    total: Math.round(total * 100) / 100,
    createdAt: now,
    updatedAt: now,
  };
  orders.set(order.id, order);
  return order;
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id);
}

export function listOrders(): Order[] {
  return [...orders.values()].sort((a, b) => b.sequence - a.sequence);
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
  const order = orders.get(id);
  if (!order) return undefined;
  const prevMs = new Date(order.updatedAt).getTime();
  const updatedAt = new Date(Math.max(Date.now(), prevMs + 1)).toISOString();
  const updated: Order = {
    ...order,
    status,
    updatedAt,
  };
  orders.set(id, updated);
  return updated;
}

export function deleteOrder(id: string): boolean {
  return orders.delete(id);
}
