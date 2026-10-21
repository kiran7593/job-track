
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { getApplications } from "../services/api";
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
});
