import type { JobApplication } from "../types/JobApplication";

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Retrieve all job applications
export async function getApplications(): Promise<JobApplication[]> {
  const response = await fetch(`${API_BASE_URL}/applications`);

  if (!response.ok) {
    throw new Error("Failed to fetch job applications.");
  }

  const result: ApiResponse<JobApplication[]> = await response.json();

  return result.data ?? [];
}

// Create a job application
export async function createApplication(
  application: Omit<JobApplication, "id">,
): Promise<JobApplication> {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(application),
  });

  const result: ApiResponse<JobApplication> = await response.json();

  if (!response.ok) {
    throw new Error(result.message ?? "Failed to create job application.");
  }

  if (!result.data) {
    throw new Error("The API did not return the created application.");
  }

  return result.data;
}


 // Update an existing job application
export async function updateApplication(
  application: JobApplication,
): Promise<JobApplication> {
  const response = await fetch(
    `${API_BASE_URL}/applications/${application.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(application),
    },
  );

  const result: ApiResponse<JobApplication> = await response.json();

  if (!response.ok) {
    throw new Error(result.message ?? "Failed to update job application.");
  }

  if (!result.data) {
    throw new Error("The API did not return the updated application.");
  }

  return result.data;
}

 // Delete a job application
export async function deleteApplication(
  id: number,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/applications/${id}`,
    {
      method: "DELETE",
    },
  );

  const result: ApiResponse<{ id: number }> = await response.json();

  if (!response.ok) {
    throw new Error(result.message ?? "Failed to delete job application.");
  }
}
