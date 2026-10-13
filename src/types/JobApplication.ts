import type { ActivityEvent } from "./ActivityEvent";

export type JobStatus =
    | "Applied"
    | "Interview"
    | "Rejected"
    | "Offer";

export type JobApplication = {
    id: number;
    company: string;
    position: string;
    location: string;
    workType: "Remote" | "Hybrid" | "On-site";
    dateApplied: string;
    followUpDate?: string;
    followUpCompleted?: boolean;
    followUpNote?: string;
    activityHistory?: ActivityEvent[];
    status: JobStatus;
    salary?: number;
    jobUrl?: string;
    notes?: string;
    updatedAt?: string;
};