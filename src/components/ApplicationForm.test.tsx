
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplicationForm from "./ApplicationForm";
import { createApplication } from "../services/api";
import type { JobApplication } from "../types/JobApplication";

vi.mock("../services/api", () => ({
  createApplication: vi.fn(),
}));

const mockCreateApplication = vi.mocked(createApplication);

describe("ApplicationForm", () => {
  const onAddApplication = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the application form fields", () => {
    render(<ApplicationForm onAddApplication={onAddApplication} />);

    expect(
      screen.getByRole("heading", { name: /add an application/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Company")).toBeInTheDocument();
    expect(screen.getByLabelText("Position")).toBeInTheDocument();
    expect(screen.getByLabelText("Location")).toBeInTheDocument();
    expect(screen.getByLabelText("Work type")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add application/i })
    ).toBeInTheDocument();
  });

  it("shows an error when company is missing", async () => {
    const user = userEvent.setup();

    render(<ApplicationForm onAddApplication={onAddApplication} />);

    screen.getByLabelText("Location").removeAttribute("required");

    await user.click(
      screen.getByRole("button", { name: /add application/i })
    );

    expect(
      await screen.findByText("Company name is required.")
    ).toBeInTheDocument();

    expect(mockCreateApplication).not.toHaveBeenCalled();
  });

  it("shows an error when position is missing", async () => {
    const user = userEvent.setup();

    render(<ApplicationForm onAddApplication={onAddApplication} />);

    screen.getByLabelText("Location").removeAttribute("required");

    await user.type(screen.getByLabelText("Company"), "Example Company");
    await user.click(
      screen.getByRole("button", { name: /add application/i })
    );

    expect(
      await screen.findByText("Position is required.")
    ).toBeInTheDocument();

    expect(mockCreateApplication).not.toHaveBeenCalled();
  });

  it("rejects a salary that is zero or negative", async () => {
    const user = userEvent.setup();

    render(<ApplicationForm onAddApplication={onAddApplication} />);

    screen.getByLabelText("Location").removeAttribute("required");
    screen.getByLabelText("Salary").removeAttribute("min");

    await user.type(screen.getByLabelText("Company"), "Example Company");
    await user.type(screen.getByLabelText("Position"), "Frontend Developer");
    await user.type(screen.getByLabelText("Location"), "Remote");
    await user.type(screen.getByLabelText("Salary"), "0");

    await user.click(
      screen.getByRole("button", { name: /add application/i })
    );

    expect(
      await screen.findByText("Salary must be a positive number.")
    ).toBeInTheDocument();

    expect(mockCreateApplication).not.toHaveBeenCalled();
  });

  it("rejects an invalid job URL", async () => {
    const user = userEvent.setup();

    render(<ApplicationForm onAddApplication={onAddApplication} />);

    await user.type(screen.getByLabelText("Company"), "Example Company");
    await user.type(screen.getByLabelText("Position"), "Frontend Developer");
    await user.type(screen.getByLabelText("Location"), "Remote");
    await user.type(
      screen.getByLabelText(/job url/i),
      "not-a-valid-url"
    );

    await user.click(
      screen.getByRole("button", { name: /add application/i })
    );

    expect(
      await screen.findByText("Please enter a valid URL.")
    ).toBeInTheDocument();

    expect(mockCreateApplication).not.toHaveBeenCalled();
  });

  it("saves a valid application and calls onAddApplication", async () => {
    const user = userEvent.setup();

    const savedApplication = {
      id: 1,
      company: "Example Company",
      position: "Frontend Developer",
      location: "Remote",
      workType: "Remote",
      dateApplied: new Date().toISOString().slice(0, 10),
      status: "Applied",
      updatedAt: new Date().toISOString(),
      activityHistory: [],
    } as JobApplication;

    mockCreateApplication.mockResolvedValue(savedApplication);

    render(<ApplicationForm onAddApplication={onAddApplication} />);

    await user.type(screen.getByLabelText("Company"), "Example Company");
    await user.type(screen.getByLabelText("Position"), "Frontend Developer");
    await user.type(screen.getByLabelText("Location"), "Remote");

    await user.click(
      screen.getByRole("button", { name: /add application/i })
    );

    await waitFor(() => {
      expect(mockCreateApplication).toHaveBeenCalledOnce();
      expect(onAddApplication).toHaveBeenCalledWith(savedApplication);
    });

    expect(screen.getByLabelText("Company")).toHaveValue("");
    expect(screen.getByLabelText("Position")).toHaveValue("");
  });

  it("displays an error when saving fails", async () => {
    const user = userEvent.setup();

    mockCreateApplication.mockRejectedValue(
      new Error("Server unavailable")
    );

    render(<ApplicationForm onAddApplication={onAddApplication} />);

    await user.type(screen.getByLabelText("Company"), "Example Company");
    await user.type(screen.getByLabelText("Position"), "Frontend Developer");
    await user.type(screen.getByLabelText("Location"), "Remote");

    await user.click(
      screen.getByRole("button", { name: /add application/i })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Server unavailable"
    );

    expect(onAddApplication).not.toHaveBeenCalled();
  });
});
