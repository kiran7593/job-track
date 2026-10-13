import type { JobApplication } from "../types/JobApplication";

export function importApplicationsFromCSV(
    file: File
): Promise<JobApplication[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const text = String(reader.result ?? "");
                const lines = text
                    .replace(/^\uFEFF/, "")
                    .split(/\r?\n/)
                    .filter((line) => line.trim() !== "");

                if (lines.length < 2) {
                    throw new Error("The CSV file has no application records.");
                }

                const parseRow = (line: string): string[] => {
                    const values: string[] = [];
                    let value = "";
                    let insideQuotes = false;

                    for (let i = 0; i < line.length; i++) {
                        const character = line[i];

                        if (character === '"') {
                            if (insideQuotes && line[i + 1] === '"') {
                                value += '"';
                                i++;
                            } else {
                                insideQuotes = !insideQuotes;
                            }
                        } else if (character === "," && !insideQuotes) {
                            values.push(value);
                            value = "";
                        } else {
                            value += character;
                        }
                    }

                    if (insideQuotes) {
                        throw new Error("The CSV contains an unclosed quotation mark.");
                    }

                    values.push(value);
                    return values;
                };

                const headers = parseRow(lines[0]).map((header) =>
                    header.trim().toLowerCase()
                );

                const requiredHeaders = [
                    "company",
                    "position",
                    "date applied",
                    "status",
                ];

                for (const header of requiredHeaders) {
                    if (!headers.includes(header)) {
                        throw new Error(
                            `The CSV is missing the required "${header}" column.`
                        );
                    }
                }

                const getValue = (
                    row: string[],
                    header: string
                ): string => {
                    const index = headers.indexOf(header);
                    return index === -1 ? "" : (row[index] ?? "").trim();
                };

                const applications = lines.slice(1).map((line, index) => {
                    const row = parseRow(line);

                    const company = getValue(row, "company");
                    const position = getValue(row, "position");
                    const dateApplied = getValue(row, "date applied");
                    const status = getValue(row, "status");

                    if (!company || !position || !dateApplied) {
                        throw new Error(
                            `Row ${index + 2} is missing a company, position, or application date.`
                        );
                    }

                    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateApplied) ||
                        Number.isNaN(Date.parse(`${dateApplied}T00:00:00`))) {
                        throw new Error(
                            `Row ${index + 2} has an invalid application date.`
                        );
                    }

                    if (
                        !["Applied", "Interview", "Rejected", "Offer"].includes(status)
                    ) {
                        throw new Error(
                            `Row ${index + 2} has an invalid status.`
                        );
                    }

                    const salaryText = getValue(row, "salary");
                    const salary = salaryText ? Number(salaryText) : undefined;

                    if (
                        salary !== undefined &&
                        (!Number.isFinite(salary) || salary < 0)
                    ) {
                        throw new Error(`Row ${index + 2} has an invalid salary.`);
                    }

                    return {
                        id: Date.now() + index,
                        company,
                        position,
                        location: getValue(row, "location"),
                        workType: getValue(row, "work type") as
                            | "Remote"
                            | "Hybrid"
                            | "On-site",
                        dateApplied,
                        status: status as
                            | "Applied"
                            | "Interview"
                            | "Rejected"
                            | "Offer",
                        salary,
                        jobUrl: getValue(row, "job url"),
                        notes: getValue(row, "notes"),
                        followUpDate: getValue(row, "follow-up date"),
                        followUpNote: getValue(row, "follow-up note"),
                        followUpCompleted: false,
                        updatedAt: new Date().toISOString(),
                        activityHistory: [
                            {
                                id: crypto.randomUUID(),
                                date: new Date().toISOString(),
                                action: "Application imported",
                                details: "Application imported from a CSV file.",
                            },
                        ],
                    } satisfies JobApplication;
                });

                resolve(applications);
            } catch (error) {
                reject(
                    error instanceof Error
                        ? error
                        : new Error("Unable to import the CSV file.")
                );
            }
        };

        reader.onerror = () => {
            reject(new Error("Unable to read the selected file."));
        };

        reader.readAsText(file);
    });
}