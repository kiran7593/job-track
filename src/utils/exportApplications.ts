import type { JobApplication } from "../types/JobApplication";

export function exportApplicationsToCSV(
    applications: JobApplication[]
) {
    const headers = [
        "Company",
        "Position",
        "Location",
        "Work Type",
        "Date Applied",
        "Status",
        "Salary",
        "Job URL",
        "Notes",
        "Follow-up Date",
        "Follow-up Note",
    ];

    const escapeCSV = (value: string | number | undefined) => {
        const text = String(value ?? "");
        return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = applications.map((application) => [
        application.company,
        application.position,
        application.location ?? "",
        application.workType,
        application.dateApplied,
        application.status,
        application.salary ?? "",
        application.jobUrl ?? "",
        application.notes ?? "",
        application.followUpDate ?? "",
        application.followUpNote ?? "",
    ]);

    const csvContent = [
        headers.map(escapeCSV).join(","),
        ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "jobtrack-applications.csv";
    link.click();

    URL.revokeObjectURL(url);
}