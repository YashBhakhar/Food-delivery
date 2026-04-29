import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import type { OrderStatus } from "./types.js";

let io: Server | null = null;

export function initIo(httpServer: HttpServer, corsOrigin: boolean | string | string[]): Server {
  io = new Server(httpServer, {
    cors: { origin: corsOrigin, methods: ["GET", "POST"] },
  });
  io.on("connection", (socket) => {
    socket.on("join", (room: unknown) => {
      if (
        typeof room === "string" &&
        (room.startsWith("order:") || room === "orders:all")
      ) {
        void socket.join(room);
      }
    });
  });
  return io;
}

export function getIo(): Server | null {
  return io;
}

export function emitOrderStatus(
  orderId: string,
  status: OrderStatus,
  updatedAt: string,
): void {
  if (!io) return;
  const payload = { orderId, status, updatedAt };
  io.to(`order:${orderId}`).emit("order:status", payload);
  io.to("orders:all").emit("order:status", payload);
}
