import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Layout } from "../components/Layout";
import { CartProvider } from "../context/CartContext";
import { CartPage } from "./CartPage";
import { MenuPage } from "./MenuPage";

const sampleMenu = [
  {
    id: "m1",
    name: "Test Pizza",
    description: "Yum",
    price: 10,
    image: "https://example.com/p.jpg",
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("MenuPage", () => {
  it("renders menu from API and add-to-cart updates badge and subtotal", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => sampleMenu,
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

    expect(await screen.findByText("Test Pizza")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(await screen.findByTestId("cart-badge")).toHaveTextContent("1");

    await user.click(screen.getByRole("link", { name: /cart/i }));
    expect(await screen.findByTestId("cart-subtotal")).toHaveTextContent("Subtotal: $10.00");
  });
});
