# JobTrack — Job Application Tracker

A full-stack web application for organizing job applications, tracking application progress, managing follow-ups, and monitoring your job search in one place.

## Features

- **Application Management** — Add, view, edit, and delete job applications.
- **Application Status Tracking** — Track progress through stages such as Applied, Interview, Offer, and Rejected.
- **Analytics Dashboard** — Review job search activity and application statistics.
- **Kanban Board** — Visualize applications by status.
- **Follow-Up Reminders** — Keep track of follow-up dates and outstanding tasks.
- **Calendar View** — Review important dates and scheduled follow-ups.
- **Activity History** — Track application-related activity.
- **CSV Import and Export** — Import application data and export records for backup or analysis.
- **Dark Mode** — Switch between light and dark themes.
- **PostgreSQL Integration** — Persist application data through a backend API.

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite
- HTML
- CSS

**Backend**
- Node.js
- Express
- REST API

**Database**
- PostgreSQL

**Tools**
- Git
- GitHub
- npm

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/kiran7593/job-track.git
cd job-track
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` directory and add your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/jobtrack
```

Replace `USERNAME` and `PASSWORD` with your local PostgreSQL credentials. Never commit your `.env` file or publish database credentials.

### 5. Start the backend

From the `server` directory, run:

```bash
npm start
```

The API runs at `http://localhost:5000` when using the default configuration.

### 6. Start the frontend

Open a second terminal in the project root and run:

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

## Project Structure

```text
job-track/
├── server/              # Express API and database connection
├── public/              # Public assets
├── src/
│   ├── components/      # Dashboard and UI components
│   ├── data/             # Sample application data
│   ├── services/         # API integration
│   ├── types/            # TypeScript types
│   └── utils/            # CSV import/export utilities
├── index.html
├── package.json
└── README.md
```

## Future Improvements

- Deploy the frontend, backend, and database to production hosting.
- Add user authentication and individual accounts.
- Improve automated testing and error handling.

## Author

**Kiran Persaud**

- GitHub: [kiran7593](https://github.com/kiran7593)
- LinkedIn: [Kiran Persaud](https://www.linkedin.com/in/kiran-p-896a59219/)

---

Built as a full-stack web development portfolio project.