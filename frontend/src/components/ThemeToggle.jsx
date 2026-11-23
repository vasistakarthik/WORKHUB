
import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {

    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
                theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
            }
            title={
                theme === "light"
                    ? "Switch to Dark Mode"
                    : "Switch to Light Mode"
            }
        >
            {theme === "light" ? (
                <>
                    <Moon size={20} />
                    <span>Dark Mode</span>
                </>
            ) : (
                <>
                    <Sun size={20} />
                    <span>Light Mode</span>
                </>
            )}
        </button>
    );
}

export default ThemeToggle;
