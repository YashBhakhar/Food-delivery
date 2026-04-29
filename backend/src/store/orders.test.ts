import { describe, expect, it, beforeEach } from "vitest";
import {
  createOrder,
  deleteOrder,
  getOrder,
  listOrders,
  resetOrdersStore,
  updateOrderStatus,
} from "./orders.js";

beforeEach(() => {
  resetOrdersStore();
});

describe("orders store", () => {
  it("creates an order with Order Received status and computed total", () => {
    const order = createOrder(
      [{ menuItemId: "menu-fries", quantity: 2 }],
      { name: "A", address: "1 St", phone: "+1 555 123 4567" },
    );
    expect(order.status).toBe("Order Received");
    expect(order.items).toHaveLength(1);
    expect(order.total).toBe(9);
    expect(getOrder(order.id)).toEqual(order);
  });

  it("throws on unknown menu item", () => {
    expect(() =>
      createOrder([{ menuItemId: "nope", quantity: 1 }], {
        name: "A",
        address: "1",
        phone: "1234567890",
      }),
    ).toThrow("Unknown menu item");
  });

  it("updates status", () => {
    const o = createOrder(
      [{ menuItemId: "menu-caesar", quantity: 1 }],
      { name: "B", address: "2 Ave", phone: "0987654321" },
    );
    const u = updateOrderStatus(o.id, "Preparing");
    expect(u?.status).toBe("Preparing");
    expect(getOrder(o.id)?.updatedAt).not.toBe(o.updatedAt);
  });

  it("returns undefined for missing order on get/update", () => {
    expect(getOrder("missing")).toBeUndefined();
    expect(updateOrderStatus("missing", "Preparing")).toBeUndefined();
  });

  it("lists orders newest first", () => {
    const a = createOrder(
      [{ menuItemId: "menu-fries", quantity: 1 }],
      { name: "A", address: "a", phone: "1111111111" },
    );
    const b = createOrder(
      [{ menuItemId: "menu-fries", quantity: 1 }],
      { name: "B", address: "b", phone: "2222222222" },
    );
    const ids = listOrders().map((x) => x.id);
    expect(ids[0]).toBe(b.id);
    expect(ids[1]).toBe(a.id);
  });

  it("deletes an order", () => {
    const o = createOrder(
      [{ menuItemId: "menu-fries", quantity: 1 }],
      { name: "A", address: "a", phone: "3333333333" },
    );
    expect(deleteOrder(o.id)).toBe(true);
    expect(getOrder(o.id)).toBeUndefined();
    expect(deleteOrder(o.id)).toBe(false);
  });
});
