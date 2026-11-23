
import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

// Create Theme Context
const ThemeContext = createContext(null);

// Theme Provider
export const ThemeProvider = ({ children }) => {

    // Get previously selected theme
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("workhub-theme") || "light";
    });

    // Update theme throughout the application
    useEffect(() => {

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        localStorage.setItem(
            "workhub-theme",
            theme
        );

    }, [theme]);

    // Switch between Light and Dark
    const toggleTheme = () => {
        setTheme((currentTheme) =>
            currentTheme === "light" ? "dark" : "light"
        );
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                toggleTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

// Custom Hook
export const useTheme = () => {

    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }

    return context;
};
