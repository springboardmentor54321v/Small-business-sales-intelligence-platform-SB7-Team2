import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Notifications from "../Notifications";

vi.mock("../../api", () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: {
          notifications: [],
        },
      })
    ),
  },
}));

describe("Notifications", () => {
  it("renders the Notifications page", () => {
    render(<Notifications />);

    expect(
      screen.getByText(/Loading notifications/i)
    ).toBeInTheDocument();
  });
});
