import { useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("jobtrack-theme") === "dark";
  });

  function handleThemeToggle() {
    setIsDarkMode((currentMode) => {
      const newMode = !currentMode;
      localStorage.setItem("jobtrack-theme", newMode ? "dark" : "light");
      return newMode;
    });
  }

  return (
    <div
      className={isDarkMode ? "dark-mode app-container" : "light-mode app-container"}
      style={{
        backgroundColor: isDarkMode ? "#111827" : "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <header>
        <h1>JobTrack</h1>
        <p>Track your job applications in one place.</p>
      </header>

      <Dashboard
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />
    </div>
  );
}

export default App;
