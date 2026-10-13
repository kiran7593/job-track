
import ApplicationDetails from "./ApplicationDetails";
import Analytics from "./Analytics";
import EditApplicationForm from "./EditApplicationForm";
import ApplicationForm from "./ApplicationForm";
import type { JobApplication } from "../types/JobApplication";
import { useEffect, useState } from "react";
import { sampleApplications } from "../data/sampleApplications";
import FollowUpReminders from "./FollowUpReminders";
import { exportApplicationsToCSV } from "../utils/exportApplications";
import { importApplicationsFromCSV } from "../utils/importApplications";
import KanbanBoard from "./KanbanBoard";
import CalendarView from "./CalendarView";
import ThemeToggle from "./ThemeToggle";
import {
    createApplication,
    deleteApplication,
    getApplications,
    updateApplication,
} from "../services/api";

type DashboardProps = {
    isDarkMode: boolean;
    onThemeToggle: () => void;
};

function getApplicationKey(
    application: Pick<JobApplication, "company" | "position" | "dateApplied">
) {
    return [
        application.company.trim().toLowerCase(),
        application.position.trim().toLowerCase(),
        application.dateApplied,
    ].join("|");
}

function Dashboard({ isDarkMode, onThemeToggle }: DashboardProps) {
    const [applications, setApplications] = useState<JobApplication[]>(() => {
        const savedApplications = localStorage.getItem("jobtrack-applications");

        if (savedApplications) {
            try {
                return JSON.parse(savedApplications) as JobApplication[];
            } catch {
                return sampleApplications;
            }
        }

        return sampleApplications;
    });

    const [isLoadingApplications, setIsLoadingApplications] = useState(true);
    const [isReadyToPersist, setIsReadyToPersist] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [workTypeFilter, setWorkTypeFilter] = useState("All");
    const [sortOrder, setSortOrder] = useState("newest");

    const [editingApplication, setEditingApplication] =
        useState<JobApplication | null>(null);
    const [selectedApplication, setSelectedApplication] =
        useState<JobApplication | null>(null);

    // Load database records and safely recover applications from localStorage.
    useEffect(() => {
        let isActive = true;

        async function loadApplications() {
            try {
                const apiApplications = await getApplications();

                const savedData = localStorage.getItem("jobtrack-applications");
                let savedApplications: JobApplication[] = [];

                if (savedData) {
                    try {
                        const parsed: unknown = JSON.parse(savedData);

                        if (Array.isArray(parsed)) {
                            savedApplications = parsed as JobApplication[];
                        }
                    } catch {
                        console.warn(
                            "Could not read saved local applications."
                        );
                    }
                }

                // Preserve local applications that haven't been saved to the
                // database yet. The database remains authoritative for records
                // that already exist there.
                const existingKeys = new Set(
                    apiApplications.map(getApplicationKey)
                );

                const applicationsToMigrate: JobApplication[] = [];

                for (const application of savedApplications) {
                    const key = getApplicationKey(application);

                    if (!existingKeys.has(key)) {
                        existingKeys.add(key);
                        applicationsToMigrate.push(application);
                    }
                }

                const migratedApplications: JobApplication[] = [];

                for (const application of applicationsToMigrate) {
                    const { id: _oldId, ...applicationData } = application;
                    const savedApplication =
                        await createApplication(applicationData);

                    migratedApplications.push(savedApplication);
                }

                if (isActive) {
                    setApplications([
                        ...apiApplications,
                        ...migratedApplications,
                    ]);
                    setIsReadyToPersist(true);
                }
            } catch (error) {
                console.error(
                    "Could not load or migrate applications:",
                    error
                );
                // Keep the existing local state if the API or migration fails.
                // Do not overwrite the local backup in that situation.
            } finally {
                if (isActive) {
                    setIsLoadingApplications(false);
                }
            }
        }

        void loadApplications();

        return () => {
            isActive = false;
        };
    }, []);

    // Mirror application state to localStorage after the initial API load.
    useEffect(() => {
        if (!isReadyToPersist) {
            return;
        }

        localStorage.setItem(
            "jobtrack-applications",
            JSON.stringify(applications)
        );
    }, [applications, isReadyToPersist]);

    // Save follow-up completion and activity history to PostgreSQL.
    async function handleCompleteFollowUp(
        id: number,
        completed: boolean
    ) {
        const application = applications.find((item) => item.id === id);

        if (!application || application.followUpCompleted === completed) {
            return;
        }

        const timestamp = new Date().toISOString();

        const updatedApplication: JobApplication = {
            ...application,
            followUpCompleted: completed,
            updatedAt: timestamp,
            activityHistory: [
                ...(application.activityHistory ?? []),
                {
                    id: crypto.randomUUID(),
                    date: timestamp,
                    action: completed
                        ? "Follow-up completed"
                        : "Follow-up reactivated",
                    details: completed
                        ? "The follow-up reminder was marked as completed."
                        : "The follow-up reminder was marked as active again.",
                },
            ],
        };

        try {
            const savedApplication =
                await updateApplication(updatedApplication);

            setApplications((currentApplications) =>
                currentApplications.map((item) =>
                    item.id === savedApplication.id
                        ? savedApplication
                        : item
                )
            );
        } catch (error) {
            console.error("Failed to save follow-up change:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to save the follow-up change."
            );
        }
    }

    // Save Kanban status changes and their activity history.
    async function handleKanbanStatusChange(
        id: number,
        newStatus: JobApplication["status"]
    ) {
        const application = applications.find((item) => item.id === id);

        if (!application || application.status === newStatus) {
            return;
        }

        const timestamp = new Date().toISOString();

        const updatedApplication: JobApplication = {
            ...application,
            status: newStatus,
            updatedAt: timestamp,
            activityHistory: [
                ...(application.activityHistory ?? []),
                {
                    id: crypto.randomUUID(),
                    date: timestamp,
                    action: "Status changed",
                    details: `Status changed from ${application.status} to ${newStatus}.`,
                },
            ],
        };

        try {
            const savedApplication =
                await updateApplication(updatedApplication);

            setApplications((currentApplications) =>
                currentApplications.map((item) =>
                    item.id === savedApplication.id
                        ? savedApplication
                        : item
                )
            );
        } catch (error) {
            console.error("Failed to save status change:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to save the status change."
            );
        }
    }

    // Import CSV records and save new records to PostgreSQL.
    async function handleImportCSV(file: File) {
        const savedApplications: JobApplication[] = [];

        try {
            const importedApplications =
                await importApplicationsFromCSV(file);

            const existingKeys = new Set(
                applications.map(getApplicationKey)
            );

            const newApplications: JobApplication[] = [];

            for (const application of importedApplications) {
                const key = getApplicationKey(application);

                if (!existingKeys.has(key)) {
                    existingKeys.add(key);
                    newApplications.push(application);
                }
            }

            for (const application of newApplications) {
                const { id: _oldId, ...applicationData } = application;

                const savedApplication =
                    await createApplication(applicationData);

                savedApplications.push(savedApplication);
            }

            setApplications((currentApplications) => [
                ...savedApplications,
                ...currentApplications,
            ]);

            alert(
                `Import complete! ${savedApplications.length} new applications saved.`
            );
        } catch (error) {
            // If an import partially succeeds, still show the records that
            // PostgreSQL confirmed were saved.
            if (savedApplications.length > 0) {
                setApplications((currentApplications) => [
                    ...savedApplications,
                    ...currentApplications,
                ]);
            }

            console.error("CSV import failed:", error);

            alert(
                error instanceof Error
                    ? `${error.message} ${savedApplications.length} applications were saved before the error.`
                    : "Unable to complete the CSV import."
            );
        }
    }

    // Delete from PostgreSQL before removing an application from the UI.
    async function handleDeleteApplication(id: number) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this application?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteApplication(id);

            setApplications((currentApplications) =>
                currentApplications.filter(
                    (application) => application.id !== id
                )
            );

            setEditingApplication((current) =>
                current?.id === id ? null : current
            );

            setSelectedApplication((current) =>
                current?.id === id ? null : current
            );
        } catch (error) {
            console.error("Failed to delete application:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to delete application."
            );
        }
    }

    // Save edits to PostgreSQL before updating the displayed record.
    async function handleSaveApplication(
        updatedApplication: JobApplication
    ) {
        try {
            const savedApplication =
                await updateApplication(updatedApplication);

            setApplications((currentApplications) =>
                currentApplications.map((application) =>
                    application.id === savedApplication.id
                        ? savedApplication
                        : application
                )
            );

            setEditingApplication(null);
        } catch (error) {
            console.error("Failed to save application:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to save application changes."
            );
        }
    }

    const totalApplications = applications.length;

    const appliedCount = applications.filter(
        (application) => application.status === "Applied"
    ).length;

    const interviewCount = applications.filter(
        (application) => application.status === "Interview"
    ).length;

    const offerCount = applications.filter(
        (application) => application.status === "Offer"
    ).length;

    const summaryCards = [
        { title: "Total Applications", count: totalApplications },
        { title: "Applied", count: appliedCount },
        { title: "Interviews", count: interviewCount },
        { title: "Offers", count: offerCount },
    ];

    const filteredApplications = applications.filter((application) => {
        const matchesSearch =
            application.company
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            application.position
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "All" ||
            application.status === statusFilter;

        const matchesWorkType =
            workTypeFilter === "All" ||
            application.workType === workTypeFilter;

        return matchesSearch && matchesStatus && matchesWorkType;
    });

    const sortedApplications = [...filteredApplications].sort((a, b) => {
        const dateA = new Date(a.dateApplied).getTime();
        const dateB = new Date(b.dateApplied).getTime();

        return sortOrder === "newest"
            ? dateB - dateA
            : dateA - dateB;
    });

    return (
        <main>
            <ThemeToggle
                isDarkMode={isDarkMode}
                onToggle={onThemeToggle}
            />

            <h2>Dashboard</h2>

            {isLoadingApplications && (
                <p role="status">Loading applications...</p>
            )}

            {selectedApplication && (
                <ApplicationDetails
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                />
            )}

            {editingApplication && (
                <EditApplicationForm
                    key={editingApplication.id}
                    application={editingApplication}
                    onSave={handleSaveApplication}
                    onCancel={() => setEditingApplication(null)}
                />
            )}

            <ApplicationForm
                onAddApplication={(newApplication) => {
                    setApplications((currentApplications) => [
                        newApplication,
                        ...currentApplications,
                    ]);
                }}
            />

            <Analytics applications={applications} />

            <FollowUpReminders
                applications={applications}
                onComplete={handleCompleteFollowUp}
            />

            <section className="summary-grid">
                {summaryCards.map((card) => (
                    <article className="summary-card" key={card.title}>
                        <h3>{card.title}</h3>
                        <p className="summary-count">{card.count}</p>
                    </article>
                ))}
            </section>

            <section className="filter-controls">
                <input
                    type="text"
                    placeholder="Search company or position..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                >
                    <option value="All">All statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Offer">Offer</option>
                </select>

                <select
                    value={workTypeFilter}
                    onChange={(event) => setWorkTypeFilter(event.target.value)}
                >
                    <option value="All">All work types</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                </select>

                <button
                    type="button"
                    className="clear-filters-button"
                    onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("All");
                        setWorkTypeFilter("All");
                        setSortOrder("newest");
                    }}
                >
                    Clear Filters
                </button>

                <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                </select>
            </section>

            <h2>Applications ({sortedApplications.length})</h2>

            <label className="edit-button">
                Import CSV
                <input
                    type="file"
                    accept=".csv,text/csv"
                    style={{ display: "none" }}
                    onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                            void handleImportCSV(file);
                        }

                        event.target.value = "";
                    }}
                />
            </label>

            <button
                type="button"
                className="edit-button"
                onClick={() =>
                    exportApplicationsToCSV(sortedApplications)
                }
            >
                Export CSV
            </button>

            <h2>Kanban Board</h2>

            <KanbanBoard
                applications={sortedApplications}
                onStatusChange={handleKanbanStatusChange}
            />

            <h2>Application Calendar</h2>

            <CalendarView applications={sortedApplications} />

            <section className="application-list">
                {sortedApplications.length === 0 ? (
                    <p>No applications match your search or filters.</p>
                ) : (
                    sortedApplications.map((application) => (
                        <article
                            className="application-card"
                            key={application.id}
                        >
                            <h3>{application.position}</h3>
                            <p>{application.company}</p>

                            <p>
                                {application.location} · {application.workType}
                            </p>

                            <p>
                                Status:{" "}
                                <span
                                    className={`status-badge status-${application.status.toLowerCase()}`}
                                >
                                    {application.status}
                                </span>
                            </p>

                            <p>Applied: {application.dateApplied}</p>

                            {application.salary != null && (
                                <p>
                                    Salary: $
                                    {application.salary.toLocaleString()}
                                </p>
                            )}

                            {application.notes && (
                                <p>
                                    <strong>Notes:</strong>{" "}
                                    {application.notes}
                                </p>
                            )}

                            {application.jobUrl && (
                                <p>
                                    <a
                                        href={application.jobUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Job Posting
                                    </a>
                                </p>
                            )}

                            <button
                                type="button"
                                className="edit-button"
                                onClick={() =>
                                    setSelectedApplication(application)
                                }
                            >
                                View Details
                            </button>

                            <button
                                type="button"
                                className="edit-button"
                                onClick={() =>
                                    setEditingApplication(application)
                                }
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                className="delete-button"
                                onClick={() =>
                                    void handleDeleteApplication(application.id)
                                }
                            >
                                Delete
                            </button>
                        </article>
                    ))
                )}
            </section>
        </main>
    );
}

export default Dashboard;
