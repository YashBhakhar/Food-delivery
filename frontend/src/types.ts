export type OrderStatus =
  | "Order Received"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface OrderLineItem {
  menuItemId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

export interface DeliveryDetails {
  name: string;
  address: string;
  phone: string;
}

export interface Order {
  id: string;
  sequence: number;
  status: OrderStatus;
  items: OrderLineItem[];
  delivery: DeliveryDetails;
  total: number;
  createdAt: string;
  updatedAt: string;
}
