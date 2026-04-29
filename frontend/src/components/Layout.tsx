import { Link, NavLink, Outlet } from "react-router-dom";
import { useCart } from "../context/CartContext";

export function Layout(): JSX.Element {
  const { itemCount } = useCart();

  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    [
      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-orange-600 text-white"
        : "text-slate-700 hover:bg-slate-200",
    ].join(" ");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-lg font-semibold text-orange-600">
            FoodDelivery
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" className={linkClass} end>
              Menu
            </NavLink>
            <NavLink to="/cart" className={linkClass}>
              Cart
              {itemCount > 0 ? (
                <span
                  className="ml-1 inline-flex min-w-[1.25rem] justify-center rounded-full bg-orange-100 px-1 text-xs font-bold text-orange-800"
                  data-testid="cart-badge"
                >
                  {itemCount}
                </span>
              ) : null}
            </NavLink>
            <NavLink to="/orders" className={linkClass}>
              Orders
            </NavLink>
            <NavLink to="/admin" className={linkClass}>
              Kitchen
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500">
        Order management demo - in-memory store, Socket.io live status.
      </footer>
    </div>
  );
}
