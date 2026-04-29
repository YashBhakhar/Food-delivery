import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminPage } from "./AdminPage";

const { adminFakeSocket } = vi.hoisted(() => ({
  adminFakeSocket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

vi.mock("../realtime/socket", () => ({
  getSocket: () => adminFakeSocket,
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("AdminPage", () => {
  it("next status triggers PATCH", async () => {
    const oid = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
    const orderRow = {
      id: oid,
      sequence: 1,
      status: "Order Received" as const,
      items: [],
      delivery: { name: "C", address: "D", phone: "1234567890" },
      total: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    globalThis.fetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/api/orders") && (!init || !init.method)) {
        return { ok: true, json: async () => [orderRow] };
      }
      if (url.includes(oid) && init?.method === "PATCH") {
        return {
          ok: true,
          json: async () => ({ ...orderRow, status: "Preparing" }),
        };
      }
      return { ok: true, json: async () => [] };
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AdminPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("C")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /next: preparing/i }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/orders/${oid}/status`),
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });
});
