
import type { JobApplication } from "../types/JobApplication";

type KanbanBoardProps = {
    applications: JobApplication[];
    onStatusChange: (
        id: number,
        newStatus: JobApplication["status"]
    ) => void;
};

const statuses: JobApplication["status"][] = [
    "Applied",
    "Interview",
    "Rejected",
    "Offer",
];

function KanbanBoard({
    applications,
    onStatusChange,
}: KanbanBoardProps) {
    return (
        <section className="kanban-board">
            {statuses.map((status) => {
                const statusApplications = applications.filter(
                    (application) => application.status === status
                );

                return (
                    <div className="kanban-column" key={status}>
                        <h3>
                            {status}
                            <span className="kanban-count">
                                {statusApplications.length}
                            </span>
                        </h3>

                        {statusApplications.length === 0 ? (
                            <p className="kanban-empty">
                                No applications
                            </p>
                        ) : (
                            statusApplications.map((application) => (
                                <article
                                    className="kanban-card"
                                    key={application.id}
                                >
                                    <h4>{application.company}</h4>
                                    <p>{application.position}</p>

                                    <small>
                                        Applied: {application.dateApplied}
                                    </small>

                                    <label>
                                        Change status
                                        <select
                                            value={application.status}
                                            onChange={(event) =>
                                                onStatusChange(
                                                    application.id,
                                                    event.target.value as JobApplication["status"]
                                                )
                                            }
                                        >
                                            {statuses.map((option) => (
                                                <option
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </article>
                            ))
                        )}
                    </div>
                );
            })}
        </section>
    );
}

export default KanbanBoard;