import { describe, expect, it } from "vitest";
import { checkoutFormSchema } from "./checkout";

describe("checkoutFormSchema", () => {
  it("rejects short phone digit count", () => {
    const r = checkoutFormSchema.safeParse({
      name: "A",
      address: "B",
      phone: "123",
    });
    expect(r.success).toBe(false);
  });

  it("accepts valid delivery fields", () => {
    const r = checkoutFormSchema.safeParse({
      name: "Jane",
      address: "1 Main",
      phone: "1234567890",
    });
    expect(r.success).toBe(true);
  });
});
