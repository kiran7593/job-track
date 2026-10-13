import type { JobApplication } from "../types/JobApplication";
import ActivityHistory from "./ActivityHistory";

type ApplicationDetailsProps = {
    application: JobApplication;
    onClose: () => void;
};

function ApplicationDetails({
    application,
    onClose,
}: ApplicationDetailsProps) {
    return (
        <section className="form-section">
            <h2>Application Details</h2>

            <p>
                <strong>Company:</strong> {application.company}
            </p>

            <p>
                <strong>Position:</strong> {application.position}
            </p>

            <p>
                <strong>Location:</strong> {application.location}
            </p>

            <p>
                <strong>Work type:</strong> {application.workType}
            </p>

            <p>
                <strong>Date applied:</strong> {application.dateApplied}
            </p>

            {application.followUpDate && (
                <p>
                    <strong>Follow-up Date:</strong> {application.followUpDate}
                </p>
            )}

            {application.followUpNote && (
                <p>
                    <strong>Follow-up Note:</strong>{" "}
                    {application.followUpNote}
                </p>
            )}

            {application.updatedAt && (
                <p>
                    <strong>Last updated:</strong>{" "}
                    {new Date(application.updatedAt).toLocaleString()}
                </p>
            )}

            <p>
                <strong>Status:</strong>{" "}
                <span
                    className={`status-badge status-${application.status.toLowerCase()}`}
                >
                    {application.status}
                </span>
            </p>

            {application.salary !== undefined && (
                <p>
                    <strong>Salary:</strong> $
                    {application.salary.toLocaleString()}
                </p>
            )}

            {application.notes && (
                <p>
                    <strong>Notes:</strong> {application.notes}
                </p>
            )}

            {application.jobUrl && (
                <p>
                    <strong>Job posting:</strong>{" "}
                    <a
                        href={application.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View Job Posting
                    </a>
                </p>
            )}

            <ActivityHistory events={application.activityHistory ?? []} />

            <button
                type="button"
                className="cancel-button"
                onClick={onClose}
            >
                Close
            </button>
        </section>
    );
}

export default ApplicationDetails;