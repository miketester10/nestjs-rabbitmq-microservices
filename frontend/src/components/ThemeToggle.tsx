import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

/**
 * Componente per il toggle della dark mode usando next-themes
 * Gestisce automaticamente lo stato del tema e la persistenza
 * Toggle circolare con ombreggiatura, sempre visibile sopra tutto
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:scale-105"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
    </button>
  );
}
