import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocketUrl(): string {
  const env = import.meta.env.VITE_API_URL;
  if (env && env.length > 0) return env.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:3000";
  return window.location.origin;
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getSocketUrl(), { transports: ["websocket", "polling"] });
  }
  return socket;
}

export function resetSocketForTests(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.close();
    socket = null;
  }
}
