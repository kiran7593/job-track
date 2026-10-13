import { useState } from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

type AnalyticsProps = {
    applications: {
        status: "Applied" | "Interview" | "Rejected" | "Offer";
        dateApplied: string;
    }[];
};

function Analytics({ applications }: AnalyticsProps) {
    const [dateRange, setDateRange] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const daysToInclude =
        dateRange === "7" ? 7 :
            dateRange === "30" ? 30 :
                dateRange === "90" ? 90 :
                    null;

    const filteredApplications = applications.filter((application) => {
        const appliedDate = new Date(
            `${application.dateApplied}T00:00:00`
        );

        if (dateRange === "custom") {
            if (!startDate || !endDate || startDate > endDate) {
                return false;
            }

            return (
                application.dateApplied >= startDate &&
                application.dateApplied <= endDate
            );
        }

        if (daysToInclude === null) {
            return true;
        }

        const rangeStart = new Date(today);
        rangeStart.setHours(0, 0, 0, 0);
        rangeStart.setDate(rangeStart.getDate() - (daysToInclude - 1));

        return appliedDate >= rangeStart && appliedDate <= today;
    });
    
    const interviewRate =
        filteredApplications.length === 0
            ? 0
            : Math.round(
                (filteredApplications.filter(
                    (application) => application.status === "Interview"
                ).length /
                    filteredApplications.length) *
                100
            );

    const offerRate =
        applications.length === 0
            ? 0
            : Math.round(
                (applications.filter(
                    (application) => application.status === "Offer"
                ).length /
                    applications.length) *
                100
            );

    const statusData = [
        {
            status: "Applied",
            count: filteredApplications.filter(
                (application) => application.status === "Applied"
            ).length,
        },
        {
            status: "Interview",
            count: filteredApplications.filter(
                (application) => application.status === "Interview"
            ).length,
        },
        {
            status: "Rejected",
            count: filteredApplications.filter(
                (application) => application.status === "Rejected"
            ).length,
        },
        {
            status: "Offer",
            count: filteredApplications.filter(
                (application) => application.status === "Offer"
            ).length,
        },
    ];

    const applicationsOverTime = filteredApplications.reduce<Record<string, number>>(
        (counts, application) => {
            counts[application.dateApplied] =
                (counts[application.dateApplied] ?? 0) + 1;

            return counts;
        },
        {}
    );

    const timelineData = Object.entries(applicationsOverTime)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, count]) => ({
            date,
            count,
        }));

    return (
        <section className="analytics-section">
            <h2>Application Analytics</h2>

            <label className="analytics-filter">
                Date range:
                <select
                    value={dateRange}
                    onChange={(event) => setDateRange(event.target.value)}
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="custom">Custom Range</option>
                    <option value="all">All Time</option>
                </select>
            </label>

            {dateRange === "custom" && (
                <div className="custom-date-range">
                    <label>
                        Start date:
                        <input
                            type="date"
                            value={startDate}
                            onChange={(event) => setStartDate(event.target.value)}
                        />
                    </label>

                    <label>
                        End date:
                        <input
                            type="date"
                            value={endDate}
                            onChange={(event) => setEndDate(event.target.value)}
                        />
                    </label>
                </div>
            )}

            <p className="analytics-metric">
                Interview Rate: {interviewRate}%
            </p>

            <p className="analytics-metric">
                Offer Rate: {offerRate}%
            </p>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />

                        <Bar dataKey="count">
                            {statusData.map((entry) => (
                                <Cell
                                    key={entry.status}
                                    fill={
                                        {
                                            Applied: "#1d4ed8",
                                            Interview: "#6d28d9",
                                            Rejected: "#b91c1c",
                                            Offer: "#15803d",
                                        }[entry.status]
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <h3>Applications Over Time</h3>

            <p className="analytics-metric">
                Total Applications: {filteredApplications.length}
            </p>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="date"
                            tickFormatter={(date) =>
                                new Date(
                                    `${date}T00:00:00`
                                ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }
                        />

                        <YAxis allowDecimals={false} />
                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}

export default Analytics;