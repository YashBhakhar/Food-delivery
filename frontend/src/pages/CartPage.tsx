import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export function CartPage(): JSX.Element {
  const { cartItems, subtotal, setQuantity, removeLine } = useCart();

  if (cartItems.length === 0) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">Your cart</h1>
        <p className="text-slate-600">Your cart is empty.</p>
        <Link
          to="/"
          className="mt-4 inline-block text-orange-600 underline hover:text-orange-800"
        >
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Your cart</h1>
      <ul className="space-y-4">
        {cartItems.map((line) => (
          <li
            key={line.menuItem.id}
            className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"
          >
            <img
              src={line.menuItem.image}
              alt=""
              className="h-16 w-16 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{line.menuItem.name}</p>
              <p className="text-sm text-slate-500">
                ${line.menuItem.price.toFixed(2)} each
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              Qty
              <input
                type="number"
                min={1}
                className="w-16 rounded border border-slate-300 px-2 py-1"
                value={line.quantity}
                onChange={(e) =>
                  setQuantity(line.menuItem.id, Number(e.target.value) || 1)
                }
              />
            </label>
            <p className="font-semibold">
              ${(line.menuItem.price * line.quantity).toFixed(2)}
            </p>
            <button
              type="button"
              className="text-sm text-red-600 hover:underline"
              onClick={() => removeLine(line.menuItem.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
        <p className="text-lg font-semibold" data-testid="cart-subtotal">
          Subtotal: ${subtotal.toFixed(2)}
        </p>
        <Link
          to="/checkout"
          className="rounded-md bg-orange-600 px-5 py-2.5 font-medium text-white hover:bg-orange-700"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
