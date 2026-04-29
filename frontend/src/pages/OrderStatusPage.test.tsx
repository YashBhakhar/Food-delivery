import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderStatusPage } from "./OrderStatusPage";

const orderId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

const initialOrder = {
  id: orderId,
  sequence: 1,
  status: "Order Received" as const,
  items: [
    {
      menuItemId: "x",
      name: "Fries",
      description: "d",
      price: 2,
      image: "https://example.com/f.jpg",
      quantity: 1,
    },
  ],
  delivery: { name: "N", address: "A", phone: "1234567890" },
  total: 2,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const { fakeSocket, statusListeners } = vi.hoisted(() => {
  const listeners = new Set<(p: {
    orderId: string;
    status: string;
    updatedAt: string;
  }) => void>();
  const socket = {
    emit: vi.fn(),
    on: vi.fn((ev: string, fn: (p: unknown) => void) => {
      if (ev === "order:status") listeners.add(fn as (p: { orderId: string; status: string; updatedAt: string;}) => void);
    }),
    off: vi.fn((ev: string, fn: (p: unknown) => void) => {
      if (ev === "order:status") listeners.delete(fn as (p: { orderId: string; status: string; updatedAt: string;}) => void);
    }),
  };
  return { fakeSocket: socket, statusListeners: listeners };
});

vi.mock("../realtime/socket", () => ({
  getSocket: () => fakeSocket,
}));

beforeEach(() => {
  statusListeners.clear();
  fakeSocket.emit.mockClear();
  fakeSocket.on.mockClear();
  fakeSocket.off.mockClear();
});

describe("OrderStatusPage", () => {
  it("updates stepper when socket emits order:status", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => initialOrder,
    })) as unknown as typeof fetch;

    render(
      <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
        <Routes>
          <Route path="/orders/:id" element={<OrderStatusPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Order Received")).toBeInTheDocument();

    const updatedAt = new Date().toISOString();
    await act(async () => {
      statusListeners.forEach((fn) =>
        fn({ orderId, status: "Preparing", updatedAt }),
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("status-current")).toHaveTextContent("Preparing");
    });
  });
});
