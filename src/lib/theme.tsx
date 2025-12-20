import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_COOKIE_NAME = "theme";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getSystemTheme(): ResolvedTheme {
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
	if (theme === "system") {
		return getSystemTheme();
	}
	return theme;
}

function setCookie(name: string, value: string, maxAge: number) {
	document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getCookie(name: string): string | undefined {
	if (typeof document === "undefined") return undefined;
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop()?.split(";").shift();
	return undefined;
}

interface ThemeProviderProps {
	children: ReactNode;
	/** Initial theme from server (parsed from cookie) */
	initialTheme?: Theme;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(() => {
		// On client, try to get from cookie first, then use initialTheme
		if (typeof window !== "undefined") {
			const cookieTheme = getCookie(THEME_COOKIE_NAME) as Theme | undefined;
			if (cookieTheme && ["light", "dark", "system"].includes(cookieTheme)) {
				return cookieTheme;
			}
		}
		return initialTheme ?? "system";
	});

	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
		resolveTheme(theme),
	);

	// Apply theme class to document
	const applyTheme = useCallback((resolved: ResolvedTheme) => {
		const root = document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(resolved);
		// Also set on body for the leaflet filter styles
		document.body.classList.remove("light", "dark");
		document.body.classList.add(resolved);
	}, []);

	// Handle theme changes
	const setTheme = useCallback(
		(newTheme: Theme) => {
			setThemeState(newTheme);
			setCookie(THEME_COOKIE_NAME, newTheme, THEME_COOKIE_MAX_AGE);

			const resolved = resolveTheme(newTheme);
			setResolvedTheme(resolved);
			applyTheme(resolved);
		},
		[applyTheme],
	);

	// Apply initial theme on mount
	useEffect(() => {
		const resolved = resolveTheme(theme);
		setResolvedTheme(resolved);
		applyTheme(resolved);
	}, [theme, applyTheme]);

	// Listen for system theme changes
	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = () => {
			const resolved = getSystemTheme();
			setResolvedTheme(resolved);
			applyTheme(resolved);
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme, applyTheme]);

	return (
		<ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}

/**
 * Isomorphic function to get the initial theme from cookies.
 * Works on both server and client.
 */
export function getInitialTheme(cookieHeader?: string): Theme {
	if (typeof document !== "undefined") {
		// Client-side: read from document.cookie
		const cookieTheme = getCookie(THEME_COOKIE_NAME) as Theme | undefined;
		if (cookieTheme && ["light", "dark", "system"].includes(cookieTheme)) {
			return cookieTheme;
		}
	} else if (cookieHeader) {
		// Server-side: parse from cookie header
		const cookies = cookieHeader.split(";").reduce(
			(acc, cookie) => {
				const [key, value] = cookie.trim().split("=");
				if (key && value) acc[key] = value;
				return acc;
			},
			{} as Record<string, string>,
		);

		const theme = cookies[THEME_COOKIE_NAME] as Theme | undefined;
		if (theme && ["light", "dark", "system"].includes(theme)) {
			return theme;
		}
	}

	return "system";
}

/**
 * Inline script to prevent FOUC (Flash of Unstyled Content).
 * This script runs before React hydrates to set the correct theme class.
 */
export function getThemeScript() {
	return `
(function() {
  function getTheme() {
    var theme = document.cookie.match(/(?:^|; )theme=([^;]*)/)?.[1];
    if (theme === 'light' || theme === 'dark') return theme;
    if (theme === 'system' || !theme) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }
  var theme = getTheme();
  document.documentElement.classList.add(theme);
  document.body && document.body.classList.add(theme);
})();
`;
}
