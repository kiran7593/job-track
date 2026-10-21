
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "./Dashboard";
import { deleteApplication, getApplications } from "../services/api";
import type { JobApplication } from "../types/JobApplication";

vi.mock("../services/api", () => ({
    createApplication: vi.fn(),
    deleteApplication: vi.fn(),
    getApplications: vi.fn(),
    updateApplication: vi.fn(),
}));

vi.mock("./Analytics", () => ({
    default: () => <div>Analytics</div>,
}));

vi.mock("./FollowUpReminders", () => ({
    default: () => <div>Follow-up Reminders</div>,
}));

vi.mock("./KanbanBoard", () => ({
    default: () => <div>Kanban Board</div>,
}));

vi.mock("./CalendarView", () => ({
    default: () => <div>Application Calendar</div>,
}));

vi.mock("./ApplicationDetails", () => ({
    default: () => <div>Application Details</div>,
}));

vi.mock("./EditApplicationForm", () => ({
    default: () => <div>Edit Application Form</div>,
}));

vi.mock("./ApplicationForm", () => ({
    default: () => <div>Add an Application</div>,
}));

const mockGetApplications = vi.mocked(getApplications);

const mockDeleteApplication = vi.mocked(deleteApplication);

describe("Dashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("shows a loading message while applications are loading", () => {
        mockGetApplications.mockReturnValue(new Promise(() => {}));

        render(
            <Dashboard
                isDarkMode={false}
                onThemeToggle={vi.fn()}
            />
        );

        expect(screen.getByRole("status")).toHaveTextContent(
            "Loading applications..."
        );
    });

    it("displays applications returned by the API", async () => {
        const applications = [
            {
                id: 1,
                company: "Example Company",
                position: "Frontend Developer",
                location: "Remote",
                workType: "Remote",
                dateApplied: "2026-10-20",
                status: "Applied",
                updatedAt: "2026-10-20T12:00:00.000Z",
                activityHistory: [],
            },
        ] as JobApplication[];

        mockGetApplications.mockResolvedValue(applications);

        render(
            <Dashboard
                isDarkMode={false}
                onThemeToggle={vi.fn()}
            />
        );

        expect(
            await screen.findByRole("heading", {
                name: "Frontend Developer",
            })
        ).toBeInTheDocument();

        expect(screen.getByText("Example Company")).toBeInTheDocument();

        await waitFor(() => {
            expect(
                screen.getByText("Total Applications")
            ).toBeInTheDocument();

            expect(screen.getByText("Interviews")).toBeInTheDocument();
        });

        expect(screen.getByText("Applications (1)")).toBeInTheDocument();
    });

    it("keeps the application when deletion is cancelled", async () => {
        const user = userEvent.setup();

        mockGetApplications.mockResolvedValue([
            {
                id: 1,
                company: "Example Company",
                position: "Frontend Developer",
                location: "Remote",
                workType: "Remote",
                dateApplied: "2026-10-20",
                status: "Applied",
                updatedAt: "2026-10-20T12:00:00.000Z",
                activityHistory: [],
            },
        ] as JobApplication[]);

        vi.spyOn(window, "confirm").mockReturnValue(false);

        render(
            <Dashboard
                isDarkMode={false}
                onThemeToggle={vi.fn()}
            />
        );

        await screen.findByRole("heading", {
            name: "Frontend Developer",
        });

        await user.click(screen.getByRole("button", { name: "Delete" }));

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to delete this application?"
        );
        expect(mockDeleteApplication).not.toHaveBeenCalled();
        expect(screen.getByText("Example Company")).toBeInTheDocument();
    });

    it("deletes the application after confirmation", async () => {
        const user = userEvent.setup();

        mockGetApplications.mockResolvedValue([
            {
                id: 1,
                company: "Example Company",
                position: "Frontend Developer",
                location: "Remote",
                workType: "Remote",
                dateApplied: "2026-10-20",
                status: "Applied",
                updatedAt: "2026-10-20T12:00:00.000Z",
                activityHistory: [],
            },
        ] as JobApplication[]);

        vi.spyOn(window, "confirm").mockReturnValue(true);
        mockDeleteApplication.mockResolvedValue(undefined);

        render(
            <Dashboard
                isDarkMode={false}
                onThemeToggle={vi.fn()}
            />
        );

        await screen.findByRole("heading", {
            name: "Frontend Developer",
        });

        await user.click(screen.getByRole("button", { name: "Delete" }));

        await waitFor(() => {
            expect(mockDeleteApplication).toHaveBeenCalledWith(1);
            expect(
                screen.queryByRole("heading", {
                    name: "Frontend Developer",
                })
            ).not.toBeInTheDocument();
        });
    });

    it("keeps the application and shows an alert when deletion fails", async () => {
        const user = userEvent.setup();

        mockGetApplications.mockResolvedValue([
            {
                id: 1,
                company: "Example Company",
                position: "Frontend Developer",
                location: "Remote",
                workType: "Remote",
                dateApplied: "2026-10-20",
                status: "Applied",
                updatedAt: "2026-10-20T12:00:00.000Z",
                activityHistory: [],
            },
        ] as JobApplication[]);

        vi.spyOn(window, "confirm").mockReturnValue(true);
        vi.spyOn(window, "alert").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});

        mockDeleteApplication.mockRejectedValue(
            new Error("Server error")
        );

        render(
            <Dashboard
                isDarkMode={false}
                onThemeToggle={vi.fn()}
            />
        );

        await screen.findByRole("heading", {
            name: "Frontend Developer",
        });

        await user.click(screen.getByRole("button", { name: "Delete" }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Server error");
        });

        expect(screen.getByRole("heading", {
            name: "Frontend Developer",
        })).toBeInTheDocument();

        expect(mockDeleteApplication).toHaveBeenCalledWith(1);
    });

    it("filters applications by company or position", async () => {
        const user = userEvent.setup();

        mockGetApplications.mockResolvedValue([
            {
                id: 1,
                company: "Acme Corporation",
                position: "Frontend Developer",
                location: "Remote",
                workType: "Remote",
                dateApplied: "2026-10-20",
                status: "Applied",
                updatedAt: "2026-10-20T12:00:00.000Z",
                activityHistory: [],
            },
            {
                id: 2,
                company: "Bright Labs",
                position: "Backend Engineer",
                location: "New York",
                workType: "Hybrid",
                dateApplied: "2026-10-19",
                status: "Interview",
                updatedAt: "2026-10-19T12:00:00.000Z",
                activityHistory: [],
            },
        ] as JobApplication[]);

        render(
            <Dashboard
                isDarkMode={false}
                onThemeToggle={vi.fn()}
            />
        );

        await screen.findByRole("heading", {
            name: "Frontend Developer",
        });

        const searchInput = screen.getByPlaceholderText(
            "Search company or position..."
        );

        await user.type(searchInput, "Bright");

        expect(
            screen.getByRole("heading", { name: "Backend Engineer" })
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("heading", { name: "Frontend Developer" })
        ).not.toBeInTheDocument();

        expect(screen.getByText("Applications (1)")).toBeInTheDocument();

        await user.clear(searchInput);
        await user.type(searchInput, "Frontend Developer");

        expect(
            screen.getByRole("heading", { name: "Frontend Developer" })
        ).toBeInTheDocument();

	expect(
    	    screen.queryByRole("heading", { name: "Backend Engineer" })
	).not.toBeInTheDocument();

	expect(screen.getByText("Applications (1)")).toBeInTheDocument();
    });
});
