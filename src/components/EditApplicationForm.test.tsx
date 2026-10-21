
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditApplicationForm from "./EditApplicationForm";
import type { JobApplication } from "../types/JobApplication";

const mockApplication: JobApplication = {
    id: 1,
    company: "Example Company",
    position: "Frontend Developer",
    location: "Remote",
    workType: "Remote",
    dateApplied: "2026-10-20",
    status: "Applied",
    salary: 90000,
    notes: "Initial notes",
    jobUrl: "https://example.com/jobs/1",
    followUpDate: "2026-10-25",
    followUpNote: "Contact recruiter",
    updatedAt: "2026-10-20T12:00:00.000Z",
    activityHistory: [],
};

describe("EditApplicationForm", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("displays the existing application details", () => {
        render(
            <EditApplicationForm
                application={mockApplication}
                onSave={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        expect(screen.getByRole("heading", {
            name: "Edit Application",
        })).toBeInTheDocument();

        expect(screen.getByLabelText("Company")).toHaveValue(
            "Example Company"
        );
        expect(screen.getByLabelText("Position")).toHaveValue(
            "Frontend Developer"
        );
        expect(screen.getByLabelText("Location")).toHaveValue("Remote");
        expect(screen.getByLabelText("Work type")).toHaveValue("Remote");
        expect(screen.getByLabelText("Status")).toHaveValue("Applied");
        expect(screen.getByLabelText("Annual salary (optional)")).toHaveValue(
            90000
        );
        expect(screen.getByLabelText("Notes (optional)")).toHaveValue(
            "Initial notes"
        );
    });

    it("calls onSave with the updated application when submitted", async () => {
        const user = userEvent.setup();
        const onSave = vi.fn();

        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "test-activity-id" as `${string}-${string}-${string}-${string}-${string}`
        );

        render(
            <EditApplicationForm
                application={mockApplication}
                onSave={onSave}
                onCancel={vi.fn()}
            />
        );

        await user.clear(screen.getByLabelText("Company"));
        await user.type(screen.getByLabelText("Company"), "New Company");

        await user.clear(screen.getByLabelText("Position"));
        await user.type(screen.getByLabelText("Position"), "React Developer");

        await user.click(screen.getByRole("button", {
            name: "Save Changes",
        }));

        expect(onSave).toHaveBeenCalledTimes(1);

        const savedApplication = onSave.mock.calls[0][0];

        expect(savedApplication.company).toBe("New Company");
        expect(savedApplication.position).toBe("React Developer");
        expect(savedApplication.id).toBe(mockApplication.id);
        expect(savedApplication.activityHistory).toHaveLength(1);
        expect(savedApplication.activityHistory[0].action).toBe(
            "Application edited"
        );
        expect(savedApplication.activityHistory[0].id).toBe(
            "test-activity-id"
        );
    });

    it("records a status change in the activity history", async () => {
        const user = userEvent.setup();
        const onSave = vi.fn();

        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "test-status-id" as `${string}-${string}-${string}-${string}-${string}`
        );

        render(
            <EditApplicationForm
                application={mockApplication}
                onSave={onSave}
                onCancel={vi.fn()}
            />
        );

        await user.selectOptions(
            screen.getByLabelText("Status"),
            "Interview"
        );

        await user.click(screen.getByRole("button", {
            name: "Save Changes",
        }));

        const savedApplication = onSave.mock.calls[0][0];

        expect(savedApplication.status).toBe("Interview");
        expect(savedApplication.activityHistory[0].action).toBe(
            "Status changed"
        );
        expect(savedApplication.activityHistory[0].details).toBe(
            "Status changed from Applied to Interview."
        );
    });

    it("calls onCancel when Cancel is clicked", async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();

        render(
            <EditApplicationForm
                application={mockApplication}
                onSave={vi.fn()}
                onCancel={onCancel}
            />
        );

        await user.click(screen.getByRole("button", {
            name: "Cancel",
        }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("trims optional fields and removes empty optional values", async () => {
        const user = userEvent.setup();
        const onSave = vi.fn();

        render(
            <EditApplicationForm
                application={mockApplication}
                onSave={onSave}
                onCancel={vi.fn()}
            />
        );

        await user.clear(screen.getByLabelText("Annual salary (optional)"));
        await user.clear(screen.getByLabelText("Job URL (optional)"));
        await user.clear(screen.getByLabelText("Notes (optional)"));
        await user.clear(screen.getByLabelText("Follow-up Note (optional)"));

        await user.type(
            screen.getByLabelText("Notes (optional)"),
            "  Updated notes  "
        );
        await user.type(
            screen.getByLabelText("Follow-up Note (optional)"),
            "  Follow up soon  "
        );

        await user.click(screen.getByRole("button", {
            name: "Save Changes",
        }));

        const savedApplication = onSave.mock.calls[0][0];

        expect(savedApplication.salary).toBeUndefined();
        expect(savedApplication.jobUrl).toBeUndefined();
        expect(savedApplication.notes).toBe("Updated notes");
        expect(savedApplication.followUpNote).toBe("Follow up soon");
    });
});
