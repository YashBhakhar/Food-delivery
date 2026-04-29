import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { Layout } from "../components/Layout";
import { CartProvider } from "../context/CartContext";
import { CartPage } from "./CartPage";
import { MenuPage } from "./MenuPage";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("CartPage", () => {
  it("qty change updates subtotal and remove clears", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => [
        {
          id: "x",
          name: "Burger",
          description: "d",
          price: 5,
          image: "https://example.com/b.jpg",
        },
      ],
    })) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole("button", { name: /add to cart/i }));
    await user.click(screen.getByRole("link", { name: /cart/i }));

    const qtyInput = await screen.findByDisplayValue("1");
    fireEvent.change(qtyInput, { target: { value: "3" } });

    expect(screen.getByTestId("cart-subtotal")).toHaveTextContent("Subtotal: $15.00");

    await user.click(screen.getByRole("button", { name: /remove/i }));
    expect(screen.getByText(/cart is empty/i)).toBeInTheDocument();
  });
});
