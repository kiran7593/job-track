type ThemeToggleProps = {
    isDarkMode: boolean;
    onToggle: () => void;
};

function ThemeToggle({
    isDarkMode,
    onToggle,
}: ThemeToggleProps) {
    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={onToggle}
            aria-pressed={isDarkMode}
        >
            {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
    );
}

export default ThemeToggle;