export type OrderStatus =
  | "Order Received"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface OrderLineItem {
  menuItemId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

export interface DeliveryDetails {
  name: string;
  address: string;
  phone: string;
}

export interface Order {
  id: string;
  /** Monotonic per server run; newer orders have higher values (for stable listing). */
  sequence: number;
  status: OrderStatus;
  items: OrderLineItem[];
  delivery: DeliveryDetails;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "Order Received",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

export function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_SEQUENCE.indexOf(current);
  if (idx < 0 || idx >= ORDER_STATUS_SEQUENCE.length - 1) return null;
  return ORDER_STATUS_SEQUENCE[idx + 1] ?? null;
}

/** Allows same status (idempotent) or exactly the next step in the pipeline. */
export function isAllowedStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return nextStatus(from) === to;
}
