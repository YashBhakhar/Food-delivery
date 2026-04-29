import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { resetOrdersStore } from "../store/orders.js";

const app = createApp();

beforeEach(() => {
  resetOrdersStore();
});

describe("GET /api/menu", () => {
  it("returns seeded menu items", async () => {
    const res = await request(app).get("/api/menu").expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    const first = res.body[0];
    expect(first).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      price: expect.any(Number),
      image: expect.any(String),
    });
  });
});

describe("GET /api/menu/:id", () => {
  it("returns 404 for unknown id", async () => {
    await request(app).get("/api/menu/unknown-id-xyz").expect(404);
  });

  it("returns a single item", async () => {
    const list = await request(app).get("/api/menu");
    const id = list.body[0].id as string;
    const res = await request(app).get(`/api/menu/${id}`).expect(200);
    expect(res.body.id).toBe(id);
  });
});
