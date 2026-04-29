import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api/client";
import { useCart } from "../context/CartContext";
import { checkoutFormSchema, type CheckoutFormValues } from "../schemas/checkout";
import type { Order } from "../types";

export function CheckoutPage(): JSX.Element {
  const navigate = useNavigate();
  const { cartItems, clear } = useCart();
  const [values, setValues] = useState<CheckoutFormValues>({
    name: "",
    address: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CheckoutFormValues, string>>
  >({});

  const formValid = checkoutFormSchema.safeParse(values).success;
  const canSubmit = cartItems.length > 0 && formValid && !submitting;

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    const parsed = checkoutFormSchema.safeParse(values);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name: flat.name?.[0],
        address: flat.address?.[0],
        phone: flat.phone?.[0],
      });
      return;
    }

    if (cartItems.length === 0) return;

    setSubmitting(true);
    try {
      const order = await apiPost<Order>("/api/orders", {
        items: cartItems.map((l) => ({
          id: l.menuItem.id,
          quantity: l.quantity,
        })),
        delivery: parsed.data,
      });
      clear();
      navigate(`/orders/${order.id}`);
    } catch (err: unknown) {
      const e = err as { status?: number; body?: { error?: string } };
      setServerError(e.body?.error ?? (err instanceof Error ? err.message : "Order failed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">Checkout</h1>
        <p className="text-slate-600">Your cart is empty.</p>
        <Link to="/" className="mt-4 inline-block text-orange-600 underline">
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Checkout</h1>
      <p className="mb-6 text-slate-600">Enter delivery details for your order.</p>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {serverError ? (
          <p className="rounded bg-red-50 p-3 text-sm text-red-800" role="alert">
            {serverError}
          </p>
        ) : null}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
          {fieldErrors.name ? (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-slate-700">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={values.address}
            onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
          />
          {fieldErrors.address ? (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          />
          {fieldErrors.phone ? (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full rounded-md bg-orange-600 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </form>
    </div>
  );
}
