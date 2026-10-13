import type { JobApplication } from "../types/JobApplication";

type FollowUpRemindersProps = {
    applications: JobApplication[];
    onComplete: (id: number, completed: boolean) => void;
};

function FollowUpReminders({
    applications,
    onComplete,
}: FollowUpRemindersProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const completedReminders = applications
        .filter(
            (application) =>
                application.followUpDate &&
                application.followUpCompleted === true
        )
        .sort((a, b) =>
            a.followUpDate!.localeCompare(b.followUpDate!)
        );

    const reminders = applications
        .filter(
            (application) =>
                application.followUpDate &&
                application.followUpCompleted !== true &&
                (application.status === "Applied" ||
                    application.status === "Interview")
        )
        .sort((a, b) =>
            a.followUpDate!.localeCompare(b.followUpDate!)
        );

    const overdueReminders = reminders.filter(
        (application) => application.followUpDate! < todayString
    );

    const dueTodayReminders = reminders.filter(
        (application) => application.followUpDate === todayString
    );

    const upcomingReminders = reminders.filter((application) => {
        const followUpDate = new Date(
            `${application.followUpDate}T00:00:00`
        );

        return (
            application.followUpDate! > todayString &&
            followUpDate <= sevenDaysFromNow
        );
    });

    const renderReminder = (
        application: JobApplication,
        completed: boolean
    ) => (
        <li key={application.id}>
            <strong>{application.company}</strong>
            {" — "}
            {application.position}
            {" · "}
            {application.followUpDate}
            {completed && " · Completed"}

            {application.followUpNote && (
                <p className="follow-up-note">
                    {application.followUpNote}
                </p>
            )}

            <button
                type="button"
                onClick={() =>
                    onComplete(application.id, !completed)
                }
            >
                {completed ? "Mark Active" : "Mark Completed"}
            </button>
        </li>
    );

    return (
        <section className="follow-up-reminders">
            <h2>Follow-up Reminders</h2>

            <div className="follow-up-summary">
                <p>
                    Overdue:
                    <strong>{overdueReminders.length}</strong>
                </p>
                <p>
                    Due Today:
                    <strong>{dueTodayReminders.length}</strong>
                </p>
                <p>
                    Upcoming:
                    <strong>{upcomingReminders.length}</strong>
                </p>
                <p>
                    Completed:
                    <strong>{completedReminders.length}</strong>
                </p>
            </div>

            <div>
                <h3>Overdue</h3>
                {overdueReminders.length > 0 ? (
                    <ul>
                        {overdueReminders.map((application) =>
                            renderReminder(application, false)
                        )}
                    </ul>
                ) : (
                    <p>No overdue follow-ups.</p>
                )}
            </div>

            <div>
                <h3>Due Today</h3>
                {dueTodayReminders.length > 0 ? (
                    <ul>
                        {dueTodayReminders.map((application) =>
                            renderReminder(application, false)
                        )}
                    </ul>
                ) : (
                    <p>No follow-ups due today.</p>
                )}
            </div>

            <div>
                <h3>Upcoming</h3>
                {upcomingReminders.length > 0 ? (
                    <ul>
                        {upcomingReminders.map((application) =>
                            renderReminder(application, false)
                        )}
                    </ul>
                ) : (
                    <p>No upcoming follow-ups in the next 7 days.</p>
                )}
            </div>

            <div>
                <h3>Completed Follow-ups</h3>
                {completedReminders.length > 0 ? (
                    <ul>
                        {completedReminders.map((application) =>
                            renderReminder(application, true)
                        )}
                    </ul>
                ) : (
                    <p>No completed follow-ups yet.</p>
                )}
            </div>
        </section>
    );
}

export default FollowUpReminders;