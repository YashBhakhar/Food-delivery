import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders menu heading", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => [],
    })) as unknown as typeof fetch;

    render(<App />);
    expect(await screen.findByText("Menu")).toBeInTheDocument();
  });
});
