import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { resetOrdersStore } from "../store/orders.js";

const app = createApp();

const validOrderPayload = {
  items: [{ id: "menu-fries", quantity: 2 }],
  delivery: {
    name: "Jane Doe",
    address: "123 Main St",
    phone: "+1 555 123 4567",
  },
};

beforeEach(() => {
  resetOrdersStore();
  vi.useRealTimers();
});

describe("POST /api/orders", () => {
  it("201 with Order Received and totals", async () => {
    const res = await request(app).post("/api/orders").send(validOrderPayload).expect(201);
    expect(res.body.status).toBe("Order Received");
    expect(res.body.total).toBe(9);
    expect(res.body.delivery.name).toBe("Jane Doe");
    expect(res.body.items[0].quantity).toBe(2);
  });

  it("400 on empty cart", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [],
        delivery: validOrderPayload.delivery,
      })
      .expect(400);
    expect(res.body.error).toBeDefined();
  });

  it("400 on missing delivery fields", async () => {
    await request(app)
      .post("/api/orders")
      .send({
        items: validOrderPayload.items,
        delivery: { name: "", address: "a", phone: "1234567890" },
      })
      .expect(400);
  });

  it("400 on invalid phone", async () => {
    await request(app)
      .post("/api/orders")
      .send({
        items: validOrderPayload.items,
        delivery: { ...validOrderPayload.delivery, phone: "123" },
      })
      .expect(400);
  });

  it("400 on unknown menu item id", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ id: "not-a-real-menu-id", quantity: 1 }],
        delivery: validOrderPayload.delivery,
      })
      .expect(400);
    expect(res.body.error).toMatch(/Unknown menu item/);
  });
});

describe("GET /api/orders/:id", () => {
  it("404 when missing", async () => {
    await request(app).get("/api/orders/00000000-0000-0000-0000-000000000000").expect(404);
  });

  it("200 after create", async () => {
    const created = await request(app).post("/api/orders").send(validOrderPayload).expect(201);
    const id = created.body.id as string;
    const res = await request(app).get(`/api/orders/${id}`).expect(200);
    expect(res.body.id).toBe(id);
  });
});

describe("PATCH /api/orders/:id/status", () => {
  it("400 on invalid transition", async () => {
    const created = await request(app).post("/api/orders").send(validOrderPayload).expect(201);
    const id = created.body.id as string;
    await request(app)
      .patch(`/api/orders/${id}/status`)
      .send({ status: "Delivered" })
      .expect(400);
  });

  it("allows idempotent same status", async () => {
    const created = await request(app).post("/api/orders").send(validOrderPayload).expect(201);
    const id = created.body.id as string;
    const res = await request(app)
      .patch(`/api/orders/${id}/status`)
      .send({ status: "Order Received" })
      .expect(200);
    expect(res.body.status).toBe("Order Received");
  });

  it("advances one step", async () => {
    const created = await request(app).post("/api/orders").send(validOrderPayload).expect(201);
    const id = created.body.id as string;
    const res = await request(app)
      .patch(`/api/orders/${id}/status`)
      .send({ status: "Preparing" })
      .expect(200);
    expect(res.body.status).toBe("Preparing");
  });
});

describe("DELETE /api/orders/:id", () => {
  it("404 when missing", async () => {
    await request(app).delete("/api/orders/00000000-0000-0000-0000-000000000000").expect(404);
  });

  it("204 after create", async () => {
    const created = await request(app).post("/api/orders").send(validOrderPayload).expect(201);
    const id = created.body.id as string;
    await request(app).delete(`/api/orders/${id}`).expect(204);
    await request(app).get(`/api/orders/${id}`).expect(404);
  });
});

describe("GET /api/orders", () => {
  it("lists orders", async () => {
    await request(app).post("/api/orders").send(validOrderPayload);
    const res = await request(app).get("/api/orders").expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

describe("status simulator", () => {
  it("auto-advances order status on schedule", async () => {
    vi.useFakeTimers();
    const created = await request(app).post("/api/orders").send(validOrderPayload).expect(201);
    const id = created.body.id as string;

    await vi.advanceTimersByTimeAsync(10_000);
    let r = await request(app).get(`/api/orders/${id}`);
    expect(r.body.status).toBe("Preparing");

    await vi.advanceTimersByTimeAsync(15_000);
    r = await request(app).get(`/api/orders/${id}`);
    expect(r.body.status).toBe("Out for Delivery");

    await vi.advanceTimersByTimeAsync(20_000);
    r = await request(app).get(`/api/orders/${id}`);
    expect(r.body.status).toBe("Delivered");
  });

  it("PATCH cancels pending auto steps", async () => {
    vi.useFakeTimers();
    const created = await request(app).post("/api/orders").send(validOrderPayload).expect(201);
    const id = created.body.id as string;

    await vi.advanceTimersByTimeAsync(5_000);
    await request(app).patch(`/api/orders/${id}/status`).send({ status: "Preparing" }).expect(200);

    await vi.advanceTimersByTimeAsync(1_000_000);
    const r = await request(app).get(`/api/orders/${id}`);
    expect(r.body.status).toBe("Preparing");
  });
});
