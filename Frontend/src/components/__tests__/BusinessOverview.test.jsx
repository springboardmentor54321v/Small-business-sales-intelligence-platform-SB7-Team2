import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BusinessOverview from "../BusinessOverview";

// Mock API
vi.mock("../../api", () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: {
          dashboard: {
            totalRevenue: 100000,
            totalInvoices: 25,
            totalCustomers: 15,
            lowStockProducts: 3,
          },
          monthlyRevenue: [],
          topSellingProducts: [],
        },
      })
    ),
  },
}));

describe("BusinessOverview", () => {
  it("renders the Business Overview page", () => {
    render(<BusinessOverview />);

    expect(
      screen.getByText(/Loading dashboard/i)
    ).toBeInTheDocument();
  });
});