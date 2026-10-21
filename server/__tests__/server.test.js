jest.mock("../db", () => ({
    query: jest.fn(),
}));

const request = require("supertest");
const pool = require("../db");
const app = require("../server");
beforeEach(() => {
    pool.query.mockReset();
});

describe("GET /api/health", () => {
    it("returns a successful health check", async () => {
        const response = await request(app).get("/api/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "JobTrack API is running!",
        });
    });
});

describe("POST /api/applications", () => {
    it("rejects an application with missing required fields", async () => {
        const response = await request(app)
            .post("/api/applications")
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "Please provide valid application details.",
        });
    });

    it("rejects an invalid work type", async () => {
        const response = await request(app)
            .post("/api/applications")
            .send({
                company: "Example Company",
                position: "Junior Developer",
                location: "New York",
                dateApplied: "2026-10-20",
                workType: "Spaceship",
                status: "Applied",
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Please provide valid application details."
        );
    });

    it("rejects an invalid application status", async () => {
        const response = await request(app)
            .post("/api/applications")
            .send({
                company: "Example Company",
                position: "Junior Developer",
                location: "New York",
                dateApplied: "2026-10-20",
                workType: "Remote",
                status: "In Progress",
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Please provide valid application details."
        );
    });

    it("creates an application with valid details", async () => {
        const createdApplication = {
            id: 1,
            company: "Example Company",
            position: "Junior Developer",
            location: "New York",
            workType: "Remote",
            dateApplied: "2026-10-20",
            status: "Applied",
        };

        pool.query.mockResolvedValueOnce({
            rows: [createdApplication],
        });

        const response = await request(app)
            .post("/api/applications")
            .send({
                company: " Example Company ",
                position: "Junior Developer",
                location: "New York",
                dateApplied: "2026-10-20",
                workType: "Remote",
                status: "Applied",
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(createdApplication);
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it("rejects a company name containing only spaces", async () => {
        const response = await request(app)
            .post("/api/applications")
            .send({
                company: "   ",
                position: "Junior Developer",
                location: "New York",
                dateApplied: "2026-10-20",
                workType: "Remote",
                status: "Applied",
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Please provide valid application details."
        );
        expect(pool.query).not.toHaveBeenCalled();
    });

    it("returns 500 when creating an application fails", async () => {
        pool.query.mockRejectedValueOnce(
            new Error("Database connection failed")
        );

        const response = await request(app)
            .post("/api/applications")
            .send({
                company: "Example Company",
                position: "Junior Developer",
                location: "New York",
                dateApplied: "2026-10-20",
                workType: "Remote",
                status: "Applied",
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Failed to save the application.",
        });
    });
});

describe("GET /api/applications", () => {
    it("returns all job applications", async () => {
        const applications = [
            {
                id: 1,
                company: "Example Company",
                position: "Junior Developer",
                status: "Applied",
            },
        ];

        pool.query.mockResolvedValueOnce({
            rows: applications,
        });

        const response = await request(app).get("/api/applications");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(applications);
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it("returns 500 when retrieving applications fails", async () => {
        pool.query.mockRejectedValueOnce(
            new Error("Database connection failed")
        );

        const response = await request(app).get("/api/applications");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Failed to retrieve job applications.",
        });
    });
});

describe("PUT /api/applications/:id", () => {
    it("updates an existing job application", async () => {
        const updatedApplication = {
            id: 1,
            company: "Updated Company",
            position: "Frontend Developer",
            location: "New York",
            workType: "Remote",
            dateApplied: "2026-10-20",
            status: "Interview",
        };

        pool.query.mockResolvedValueOnce({
            rows: [updatedApplication],
            rowCount: 1,
        });

        const response = await request(app)
            .put("/api/applications/1")
            .send({
                company: "Updated Company",
                position: "Frontend Developer",
                location: "New York",
                workType: "Remote",
                dateApplied: "2026-10-20",
                status: "Interview",
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(updatedApplication);
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it("returns 404 when the application does not exist", async () => {
        pool.query.mockResolvedValueOnce({
            rows: [],
            rowCount: 0,
        });

        const response = await request(app)
            .put("/api/applications/999")
            .send({
                company: "Example Company",
                position: "Junior Developer",
                location: "New York",
                workType: "Remote",
                dateApplied: "2026-10-20",
                status: "Applied",
            });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            success: false,
            message: "Application not found.",
        });
    });

    it("returns 500 when updating an application fails", async () => {
        pool.query.mockRejectedValueOnce(
            new Error("Database connection failed")
        );

        const response = await request(app)
            .put("/api/applications/1")
            .send({
                company: "Example Company",
                position: "Junior Developer",
                location: "New York",
                dateApplied: "2026-10-20",
                workType: "Remote",
                status: "Applied",
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Failed to update the application.",
        });
    });
});

describe("DELETE /api/applications/:id", () => {
    it("deletes an existing job application", async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1 }],
            rowCount: 1,
        });

        const response = await request(app)
            .delete("/api/applications/1");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "Application deleted successfully.",
            data: { id: 1 },
        });
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it("returns 404 when the application does not exist", async () => {
        pool.query.mockResolvedValueOnce({
            rows: [],
            rowCount: 0,
        });

        const response = await request(app)
            .delete("/api/applications/999");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            success: false,
            message: "Application not found.",
        });
    });

    it("returns 500 when deleting an application fails", async () => {
        pool.query.mockRejectedValueOnce(
            new Error("Database connection failed")
        );

        const response = await request(app)
            .delete("/api/applications/1");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Failed to delete the application.",
        });
    });
});
