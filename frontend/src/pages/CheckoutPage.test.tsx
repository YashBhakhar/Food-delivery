import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Layout } from "../components/Layout";
import { CartProvider } from "../context/CartContext";
import { CartPage } from "./CartPage";
import { CheckoutPage } from "./CheckoutPage";
import { MenuPage } from "./MenuPage";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("CheckoutPage", () => {
  it("submit disabled until form is valid; success navigates to order", async () => {
    const orderId = "11111111-1111-1111-1111-111111111111";

    globalThis.fetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/menu")) {
        return {
          ok: true,
          json: async () => [
            {
              id: "item-1",
              name: "Fries",
              description: "d",
              price: 2,
              image: "https://example.com/f.jpg",
            },
          ],
        };
      }
      if (url.endsWith("/api/orders") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            id: orderId,
            sequence: 1,
            status: "Order Received",
            items: [
              {
                menuItemId: "item-1",
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
          }),
        };
      }
      return { ok: false, json: async () => ({}) };
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route
                path={`/orders/${orderId}`}
                element={<div data-testid="order-track">Tracking</div>}
              />
            </Route>
          </Routes>
        </CartProvider>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole("button", { name: /add to cart/i }));
    await user.click(screen.getByRole("link", { name: /cart/i }));
    await user.click(screen.getByRole("link", { name: /proceed to checkout/i }));

    const submit = screen.getByRole("button", { name: /place order/i });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(/name/i), "Jane");
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText(/^address/i), "1 Main St");
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText(/^phone/i), "1234567890");
    expect(submit).not.toBeDisabled();

    await user.click(submit);
    await waitFor(() => {
      expect(screen.getByTestId("order-track")).toBeInTheDocument();
    });
  });

  it("surfaces server error on failed place order", async () => {
    globalThis.fetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/menu")) {
        return {
          ok: true,
          json: async () => [
            {
              id: "item-1",
              name: "Fries",
              description: "d",
              price: 2,
              image: "https://example.com/f.jpg",
            },
          ],
        };
      }
      if (url.endsWith("/api/orders") && init?.method === "POST") {
        return {
          ok: false,
          status: 400,
          json: async () => ({ error: "Bad order" }),
        };
      }
      return { ok: false, json: async () => ({}) };
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole("button", { name: /add to cart/i }));
    await user.click(screen.getByRole("link", { name: /cart/i }));
    await user.click(screen.getByRole("link", { name: /proceed to checkout/i }));

    await user.type(screen.getByLabelText(/name/i), "Jane");
    await user.type(screen.getByLabelText(/^address/i), "1 Main St");
    await user.type(screen.getByLabelText(/^phone/i), "1234567890");
    await user.click(screen.getByRole("button", { name: /place order/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Bad order");
  });
});
