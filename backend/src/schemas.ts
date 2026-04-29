import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone is required")
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Invalid phone format")
  .refine((s) => s.replace(/\D/g, "").length >= 10, "Phone must contain at least 10 digits");

export const placeOrderBodySchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1, "Menu item id is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "Cart cannot be empty"),
  delivery: z.object({
    name: z.string().trim().min(1, "Name is required"),
    address: z.string().trim().min(1, "Address is required"),
    phone: phoneSchema,
  }),
});

export type PlaceOrderBody = z.infer<typeof placeOrderBodySchema>;

export const updateStatusBodySchema = z.object({
  status: z.enum([
    "Order Received",
    "Preparing",
    "Out for Delivery",
    "Delivered",
  ]),
});

export type UpdateStatusBody = z.infer<typeof updateStatusBodySchema>;
