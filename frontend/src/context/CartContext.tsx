import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MenuItem } from "../types";

export interface CartLine {
  menuItem: MenuItem;
  quantity: number;
}

interface CartContextValue {
  cartItems: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (item: MenuItem, quantity?: number) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  removeLine: (menuItemId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "food-delivery-cart";

export function CartProvider({ children }: { children: ReactNode }): JSX.Element {
  const [cartItems, setCartItems] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed as CartLine[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = useCallback((item: MenuItem, quantity = 1) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((l) => l.menuItem.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        const line = next[idx]!;
        next[idx] = { ...line, quantity: line.quantity + quantity };
        return next;
      }
      return [...prev, { menuItem: item, quantity }];
    });
  }, []);

  const setQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity < 1) {
      setCartItems((prev) => prev.filter((l) => l.menuItem.id !== menuItemId));
      return;
    }
    setCartItems((prev) =>
      prev.map((l) =>
        l.menuItem.id === menuItemId ? { ...l, quantity } : l,
      ),
    );
  }, []);

  const removeLine = useCallback((menuItemId: string) => {
    setCartItems((prev) => prev.filter((l) => l.menuItem.id !== menuItemId));
  }, []);

  const clear = useCallback(() => setCartItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = cartItems.reduce(
      (sum, l) => sum + l.menuItem.price * l.quantity,
      0,
    );
    const itemCount = cartItems.reduce((sum, l) => sum + l.quantity, 0);
    return {
      cartItems,
      itemCount,
      subtotal: Math.round(subtotal * 100) / 100,
      addItem,
      setQuantity,
      removeLine,
      clear,
    };
  }, [cartItems, addItem, setQuantity, removeLine, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
