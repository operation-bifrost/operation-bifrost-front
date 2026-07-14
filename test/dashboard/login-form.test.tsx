import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "@/components/dashboard/login-form";
import { dashboardContent } from "@/data/dashboard";

describe("LoginForm", () => {
  it("surfaces the invalid-credentials copy on a 401", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 401 }));
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(dashboardContent.login.prompt), {
      target: { value: "nope" },
    });
    fireEvent.click(screen.getByRole("button", { name: dashboardContent.login.submitLabel }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(dashboardContent.login.errorInvalid),
    );
    vi.restoreAllMocks();
  });

  it("disables submit until a password is entered", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: dashboardContent.login.submitLabel })).toBeDisabled();
  });
});
