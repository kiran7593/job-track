import type { ActivityEvent } from "../types/ActivityEvent";

type ActivityHistoryProps = {
    events: ActivityEvent[];
};

function ActivityHistory({ events }: ActivityHistoryProps) {
    const sortedEvents = [...events].sort(
        (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
    );

    return (
        <section className="activity-history">
            <h3>Activity History</h3>

            {sortedEvents.length > 0 ? (
                <ul>
                    {sortedEvents.map((event) => (
                        <li key={event.id}>
                            <strong>{event.action}</strong>
                            <p>{event.details}</p>
                            <small>
                                {new Date(event.date).toLocaleString()}
                            </small>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No activity recorded yet.</p>
            )}
        </section>
    );
}

export default ActivityHistory;