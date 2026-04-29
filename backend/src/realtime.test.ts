import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";
import { io as ioClient } from "socket.io-client";
import { createApp } from "./app.js";
import { initIo } from "./realtime.js";
import { emitOrderStatus } from "./realtime.js";

describe("Socket.IO", () => {
  it("client can connect and join an order room", async () => {
    const app = createApp();
    const httpServer = createServer(app);
    initIo(httpServer, "*");

    await new Promise<void>((resolve, reject) => {
      httpServer.listen(0, () => resolve());
      httpServer.on("error", reject);
    });

    const addr = httpServer.address() as AddressInfo;
    const url = `http://127.0.0.1:${addr.port}`;

    const client = ioClient(url, { transports: ["websocket"] });
    await new Promise<void>((resolve, reject) => {
      client.on("connect", () => resolve());
      client.on("connect_error", reject);
    });

    const received = new Promise<{ orderId: string; status: string }>((resolve) => {
      client.on("order:status", (payload: { orderId: string; status: string }) => {
        resolve(payload);
      });
    });

    client.emit("join", "order:test-order-id");
    await new Promise((r) => setTimeout(r, 100));
    emitOrderStatus("test-order-id", "Preparing", new Date().toISOString());

    const payload = await received;
    expect(payload.orderId).toBe("test-order-id");
    expect(payload.status).toBe("Preparing");

    client.close();
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  });
});
