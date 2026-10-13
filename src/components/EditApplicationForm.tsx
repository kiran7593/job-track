import { useState } from "react";
import type { FormEvent } from "react";
import type { JobApplication, JobStatus } from "../types/JobApplication";

type EditApplicationFormProps = {
    application: JobApplication;
    onSave: (updatedApplication: JobApplication) => void;
    onCancel: () => void;
};

function EditApplicationForm({
    application,
    onSave,
    onCancel,
}: EditApplicationFormProps) {
    const [company, setCompany] = useState(application.company);
    const [position, setPosition] = useState(application.position);
    const [location, setLocation] = useState(application.location);
    const [workType, setWorkType] =
        useState<JobApplication["workType"]>(application.workType);
    const [dateApplied, setDateApplied] = useState(application.dateApplied);
    const [followUpDate, setFollowUpDate] = useState(
        application.followUpDate ?? ""
    );
    const [followUpNote, setFollowUpNote] = useState(
        application.followUpNote ?? ""
    );
    const [status, setStatus] = useState<JobStatus>(application.status);
    const [salary, setSalary] = useState(
        application.salary?.toString() ?? ""
    );
    const [notes, setNotes] = useState(application.notes ?? "");
    const [jobUrl, setJobUrl] = useState(application.jobUrl ?? "");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const updatedApplication: JobApplication = {
            ...application,
            company,
            position,
            location,
            workType,
            dateApplied,
            ...(followUpDate.trim() !== "" ? { followUpDate } : {}),
            ...(followUpNote.trim() !== "" ? { followUpNote: followUpNote.trim() } : {}),
            status,
            updatedAt: new Date().toISOString(),
            activityHistory: [
                ...(application.activityHistory ?? []),
                {
                    id: crypto.randomUUID(),
                    date: new Date().toISOString(),
                    action:
                        status !== application.status
                            ? "Status changed"
                            : "Application edited",
                    details:
                        status !== application.status
                            ? `Status changed from ${application.status} to ${status}.`
                            : "Application details were updated.",
                },
            ],
            ...(salary.trim() !== "" ? { salary: Number(salary) } : {}),
            ...(salary.trim() === "" ? { salary: undefined } : {}),
            ...(notes.trim() !== "" ? { notes: notes.trim() } : {}),
            ...(notes.trim() === "" ? { notes: undefined } : {}),
            ...(jobUrl.trim() !== "" ? { jobUrl: jobUrl.trim() } : {}),
            ...(jobUrl.trim() === "" ? { jobUrl: undefined } : {}),
        };

        onSave(updatedApplication);
    }

    return (
        <section className="form-section">
            <h2>Edit Application</h2>

            <form className="application-form" onSubmit={handleSubmit}>
                <label>
                    Company
                    <input
                        value={company}
                        onChange={(event) => setCompany(event.target.value)}
                        required
                    />
                </label>

                <label>
                    Position
                    <input
                        value={position}
                        onChange={(event) => setPosition(event.target.value)}
                        required
                    />
                </label>

                <label>
                    Location
                    <input
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        required
                    />
                </label>

                <label>
                    Work type
                    <select
                        value={workType}
                        onChange={(event) =>
                            setWorkType(event.target.value as JobApplication["workType"])
                        }
                    >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                    </select>
                </label>

                <label>
                    Date applied
                    <input
                        type="date"
                        value={dateApplied}
                        onChange={(event) => setDateApplied(event.target.value)}
                        required
                    />
                </label>

                <label>
                    Follow-up Date (optional)
                    <input
                        type="date"
                        value={followUpDate}
                        min={dateApplied}
                        onChange={(event) => setFollowUpDate(event.target.value)}
                    />
                </label>

                <label>
                    Follow-up Note (optional)
                    <textarea
                        value={followUpNote}
                        onChange={(event) => setFollowUpNote(event.target.value)}
                        placeholder="e.g., Email recruiter to ask about the interview timeline"
                        rows={3}
                    />
                </label>

                <label>
                    Status
                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value as JobStatus)}
                    >
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Offer">Offer</option>
                    </select>
                </label>

                <label>
                    Annual salary (optional)
                    <input
                        type="number"
                        min="0"
                        value={salary}
                        onChange={(event) => setSalary(event.target.value)}
                    />
                </label>

                <label>
                    Job URL (optional)
                    <input
                        type="url"
                        placeholder="https://..."
                        value={jobUrl}
                        onChange={(event) => setJobUrl(event.target.value)}
                    />
                </label>

                <label>
                    Notes (optional)
                    <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                    />
                </label>

                <div className="form-actions">
                    <button type="submit">Save Changes</button>
                    <button type="button" className="cancel-button" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );
}

export default EditApplicationForm;