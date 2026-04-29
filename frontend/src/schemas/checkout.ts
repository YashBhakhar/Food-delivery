import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone is required")
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Invalid phone format")
  .refine((s) => s.replace(/\D/g, "").length >= 10, "Phone must contain at least 10 digits");

export const checkoutFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  address: z.string().trim().min(1, "Address is required"),
  phone: phoneSchema,
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
