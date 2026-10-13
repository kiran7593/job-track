import { useState } from "react";
import type { JobApplication } from "../types/JobApplication";

type CalendarViewProps = {
    applications: JobApplication[];
};

function CalendarView({ applications }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = Array.from(
        { length: firstDayOfMonth + daysInMonth },
        (_, index) => {
            const dayNumber = index - firstDayOfMonth + 1;
            return dayNumber > 0 ? dayNumber : null;
        }
    );

    function changeMonth(amount: number) {
        setCurrentMonth(new Date(year, month + amount, 1));
    }

    function formatDate(day: number) {
        const monthString = String(month + 1).padStart(2, "0");
        const dayString = String(day).padStart(2, "0");

        return `${year}-${monthString}-${dayString}`;
    }

    const monthApplications = applications.filter(
        (application) =>
            application.dateApplied.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)
    );

    const monthFollowUps = applications.filter(
        (application) =>
            application.followUpDate?.startsWith(
                `${year}-${String(month + 1).padStart(2, "0")}`
            )
    );

    return (
        <section className="calendar-view">
            <div className="calendar-header">
                <button type="button" onClick={() => changeMonth(-1)}>
                    Previous
                </button>

                <h2>
                    {currentMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                    })}
                </h2>

                <button type="button" onClick={() => changeMonth(1)}>
                    Next
                </button>
            </div>

            <div className="calendar-grid">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                        <div className="calendar-weekday" key={day}>
                            {day}
                        </div>
                    )
                )}

                {calendarDays.map((day, index) => {
                    if (day === null) {
                        return (
                            <div
                                className="calendar-day calendar-empty"
                                key={`empty-${index}`}
                            />
                        );
                    }

                    const date = formatDate(day);

                    const dayApplications = monthApplications.filter(
                        (application) => application.dateApplied === date
                    );

                    const dayFollowUps = monthFollowUps.filter(
                        (application) => application.followUpDate === date
                    );

                    return (
                        <div className="calendar-day" key={date}>
                            <strong>{day}</strong>

                            {dayApplications.map((application) => (
                                <div
                                    className="calendar-event application-event"
                                    key={`app-${application.id}`}
                                    title={`${application.company}: ${application.position}`}
                                >
                                    Applied: {application.company}
                                </div>
                            ))}

                            {dayFollowUps.map((application) => (
                                <div
                                    className="calendar-event follow-up-event"
                                    key={`followup-${application.id}`}
                                    title={`${application.company}: ${application.position}`}
                                >
                                    Follow-up: {application.company}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default CalendarView;