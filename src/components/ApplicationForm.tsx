import { useState } from "react";
import { createApplication } from "../services/api";
import type { FormEvent } from "react";
import type { JobApplication, JobStatus } from "../types/JobApplication";

type ApplicationFormProps = {
    onAddApplication: (application: JobApplication) => void;
};

function ApplicationForm({ onAddApplication }: ApplicationFormProps) {
    const [company, setCompany] = useState("");
    const [companyError, setCompanyError] = useState("");
    const [position, setPosition] = useState("");
    const [positionError, setPositionError] = useState("");
    const [location, setLocation] = useState("");
    const [workType, setWorkType] = useState<"Remote" | "Hybrid" | "On-site">("Remote");
    const [dateApplied, setDateApplied] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [followUpDate, setFollowUpDate] = useState("");
    const [followUpNote, setFollowUpNote] = useState("");
    const [status, setStatus] = useState<JobStatus>("Applied");
    const [salary, setSalary] = useState("");
    const [salaryError, setSalaryError] = useState("");
    const [notes, setNotes] = useState("");
    const [jobUrl, setJobUrl] = useState("");
    const [jobUrlError, setJobUrlError] = useState("");
    const [submitError, setSubmitError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (company.trim() === "") {
            setCompanyError("Company name is required.");
            return;
        }

        if (position.trim() === "") {
            setPositionError("Position is required.");
            return;
        }

        if (salary.trim() !== "") {
            const salaryAmount = Number(salary);

            if (!Number.isFinite(salaryAmount) || salaryAmount <= 0) {
                setSalaryError("Salary must be a positive number.");
                return;
            }
        }

        if (jobUrl.trim() !== "") {
            try {
                new URL(jobUrl);
            } catch {
                setJobUrlError("Please enter a valid URL.");
                return;
            }
        }

        setJobUrlError("");

        setSalaryError("");

        setPositionError("");

        setCompanyError("");

        const applicationData: Omit<JobApplication, "id"> = {
            company,
            position,
            location,
            workType,
            dateApplied,
            ...(followUpDate.trim() !== "" ? { followUpDate } : {}),
            ...(followUpNote.trim() !== "" ? { followUpNote: followUpNote.trim() } : {}),
            status,
            updatedAt: new Date().toISOString(),
            ...(salary.trim() !== "" ? { salary: Number(salary) } : {}),
            ...(notes.trim() !== "" ? { notes: notes.trim() } : {}),
            ...(jobUrl.trim() !== "" ? { jobUrl: jobUrl.trim() } : {}),
            activityHistory: [
                {
                    id: crypto.randomUUID(),
                    date: new Date().toISOString(),
                    action: "Application created",
                    details: "Application added to JobTrack.",
                },
            ],
        };

        setSubmitError("");

        try {
            const savedApplication = await createApplication(applicationData);
            onAddApplication(savedApplication);
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Failed to save the application. Please try again."
            );
            return;
        }

        setCompany("");
        setPosition("");
        setLocation("");
        setWorkType("Remote");
        setDateApplied(new Date().toISOString().slice(0, 10));
        setStatus("Applied");
        setSalary("");
        setNotes("");
        setJobUrl("");
        setCompanyError("");
        setPositionError("");
        setSalaryError("");
        setJobUrlError("");
        setFollowUpDate("");
        setFollowUpNote("");
    }

    return (
        <section className="form-section">
            <h2>Add an Application</h2>

            <form className="application-form" onSubmit={handleSubmit}>
                <label>
                    Company
                    <input
                        type="text"
                        value={company}
                        onChange={(event) => {
                            setCompany(event.target.value);

                            if (event.target.value.trim() !== "") {
                                setCompanyError("");
                            }
                        }}
                    />

                    {companyError && (
                        <span style={{ color: "#b91c1c", fontSize: "13px" }}>
                            {companyError}
                        </span>
                    )}
                </label>

                <label>
                    Position
                    <input
                        type="text"
                        value={position}
                        onChange={(event) => {
                            setPosition(event.target.value);

                            if (event.target.value.trim() !== "") {
                                setPositionError("");
                            }
                        }}
                    />

                    {positionError && (
                        <span style={{ color: "#b91c1c", fontSize: "13px" }}>
                            {positionError}
                        </span>
                    )}
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
                            setWorkType(event.target.value as "Remote" | "Hybrid" | "On-site")
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
                    Salary
                    <input
                        type="number"
                        min="1"
                        value={salary}
                        onChange={(event) => {
                            setSalary(event.target.value);

                            if (
                                event.target.value.trim() === "" ||
                                (Number.isFinite(Number(event.target.value)) &&
                                    Number(event.target.value) > 0)
                            ) {
                                setSalaryError("");
                            }
                        }}
                    />

                    {salaryError && (
                        <span style={{ color: "#b91c1c", fontSize: "13px" }}>
                            {salaryError}
                        </span>
                    )}
                </label>

                <label>
                    Job URL (optional)
                    <input
                        type="text"
                        value={jobUrl}
                        onChange={(event) => {
                            setJobUrl(event.target.value);

                            if (event.target.value.trim() === "") {
                                setJobUrlError("");
                                return;
                            }

                            try {
                                new URL(event.target.value);
                                setJobUrlError("");
                            } catch {
                                setJobUrlError("Please enter a valid URL.");
                            }
                        }}
                        placeholder="https://example.com/job"
                    />

                    {jobUrlError && (
                        <span style={{ color: "#b91c1c", fontSize: "13px" }}>
                            {jobUrlError}
                        </span>
                    )}
                </label>

                <label>
                    Notes (optional)
                    <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                    />
                </label>

                {submitError && (
                    <p className="error-message" role="alert">
                        {submitError}
                    </p>
                )}

                <button type="submit">Add Application</button>
            </form>
        </section>
    );
}

export default ApplicationForm;