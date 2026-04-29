import type { MenuItem } from "../types.js";

const MENU_ITEMS: MenuItem[] = [
  {
    id: "menu-margherita",
    name: "Margherita Pizza",
    description: "Classic tomato, mozzarella, and fresh basil on a thin crust.",
    price: 12.99,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
  },
  {
    id: "menu-cheeseburger",
    name: "Cheeseburger",
    description: "Beef patty, cheddar, lettuce, tomato, and house sauce on a brioche bun.",
    price: 10.5,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
  },
  {
    id: "menu-caesar",
    name: "Caesar Salad",
    description: "Romaine, parmesan, croutons, and creamy Caesar dressing.",
    price: 8.25,
    image:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
  },
  {
    id: "menu-fries",
    name: "Seasoned Fries",
    description: "Crispy fries with sea salt and paprika seasoning.",
    price: 4.5,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop",
  },
];

export function getMenu(): MenuItem[] {
  return [...MENU_ITEMS];
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((m) => m.id === id);
}
