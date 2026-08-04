import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import InvoiceList from "../InvoiceList";

vi.mock("../../api", () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: {
          invoices: [],
        },
      })
    ),
  },
}));

describe("InvoiceList", () => {
  it("renders the Invoice List page", () => {
    render(<InvoiceList />);

    expect(
  screen.getByText(/Synchronizing accounts receivables/i)
).toBeInTheDocument();
  });
});