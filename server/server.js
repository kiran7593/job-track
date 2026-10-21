const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "JobTrack API is running!",
    });
});

// Get all job applications
app.get("/api/applications", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        id,
        company,
        position,
        location,
        work_type AS "workType",
        TO_CHAR(date_applied, 'YYYY-MM-DD') AS "dateApplied",
        TO_CHAR(follow_up_date, 'YYYY-MM-DD') AS "followUpDate",
        follow_up_completed AS "followUpCompleted",
        follow_up_note AS "followUpNote",
        status,
        salary::FLOAT8 AS salary,
        job_url AS "jobUrl",
        notes,
        updated_at AS "updatedAt",
        activity_history AS "activityHistory"
      FROM applications
      ORDER BY date_applied DESC, id DESC
    `);

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error("Failed to fetch applications:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve job applications.",
        });
    }
});

 // Create a new job application
app.post("/api/applications", async (req, res) => {
  const {
    company,
    position,
    location,
    workType,
    dateApplied,
    followUpDate,
    followUpCompleted,
    followUpNote,
    status,
    salary,
    jobUrl,
    notes,
    updatedAt,
    activityHistory,
  } = req.body;

  if (
    !company?.trim() ||
    !position?.trim() ||
    !location?.trim() ||
    !dateApplied ||
    !["Remote", "Hybrid", "On-site"].includes(workType) ||
    !["Applied", "Interview", "Rejected", "Offer"].includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid application details.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO applications (
        company,
        position,
        location,
        work_type,
        date_applied,
        follow_up_date,
        follow_up_completed,
        follow_up_note,
        status,
        salary,
        job_url,
        notes,
        updated_at,
        activity_history
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14
      )
      RETURNING
        id,
        company,
        position,
        location,
        work_type AS "workType",
        TO_CHAR(date_applied, 'YYYY-MM-DD') AS "dateApplied",
        TO_CHAR(follow_up_date, 'YYYY-MM-DD') AS "followUpDate",
        follow_up_completed AS "followUpCompleted",
        follow_up_note AS "followUpNote",
        status,
        salary::FLOAT8 AS salary,
        job_url AS "jobUrl",
        notes,
        updated_at AS "updatedAt",
        activity_history AS "activityHistory"`,
      [
        company.trim(),
        position.trim(),
        location.trim(),
        workType,
        dateApplied,
        followUpDate || null,
        followUpCompleted ?? false,
        followUpNote || null,
        status,
        salary ?? null,
        jobUrl || null,
        notes || null,
        updatedAt || new Date().toISOString(),
        JSON.stringify(activityHistory ?? []),
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to create application:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save the application.",
    });
  }
});

 // Update an existing job application
app.put("/api/applications/:id", async (req, res) => {
  const { id } = req.params;

  const {
    company,
    position,
    location,
    workType,
    dateApplied,
    followUpDate,
    followUpCompleted,
    followUpNote,
    status,
    salary,
    jobUrl,
    notes,
    updatedAt,
    activityHistory,
  } = req.body;

  if (
    !company?.trim() ||
    !position?.trim() ||
    !location?.trim() ||
    !dateApplied ||
    !["Remote", "Hybrid", "On-site"].includes(workType) ||
    !["Applied", "Interview", "Rejected", "Offer"].includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid application details.",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE applications SET
        company = $1,
        position = $2,
        location = $3,
        work_type = $4,
        date_applied = $5,
        follow_up_date = $6,
        follow_up_completed = $7,
        follow_up_note = $8,
        status = $9,
        salary = $10,
        job_url = $11,
        notes = $12,
        updated_at = $13,
        activity_history = $14
      WHERE id = $15
      RETURNING
        id,
        company,
        position,
        location,
        work_type AS "workType",
        TO_CHAR(date_applied, 'YYYY-MM-DD') AS "dateApplied",
        TO_CHAR(follow_up_date, 'YYYY-MM-DD') AS "followUpDate",
        follow_up_completed AS "followUpCompleted",
        follow_up_note AS "followUpNote",
        status,
        salary::FLOAT8 AS salary,
        job_url AS "jobUrl",
        notes,
        updated_at AS "updatedAt",
        activity_history AS "activityHistory"`,
      [
        company.trim(),
        position.trim(),
        location.trim(),
        workType,
        dateApplied,
        followUpDate || null,
        followUpCompleted ?? false,
        followUpNote || null,
        status,
        salary ?? null,
        jobUrl || null,
        notes || null,
        updatedAt || new Date().toISOString(),
        JSON.stringify(activityHistory ?? []),
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to update application:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update the application.",
    });
  }
});

 // Delete an existing job application
app.delete("/api/applications/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM applications
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.json({
      success: true,
      message: "Application deleted successfully.",
      data: { id: result.rows[0].id },
    });
  } catch (error) {
    console.error("Failed to delete application:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete the application.",
    });
  }
});

// Start server only when this file is run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`JobTrack API running at http://localhost:${PORT}`);
    });
}

// Export the app for automated testing
module.exports = app;