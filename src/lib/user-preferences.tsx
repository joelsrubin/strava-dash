import { useDebouncedCallback } from "@tanstack/react-pacer";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import { updateUserPreferences } from "@/db";

interface UserPreferences {
	unitOfMeasurement: "miles" | "kilometers";
}

interface UserPreferencesContextValue {
	preferences: UserPreferences;
	setPreferences: (preferences: Partial<UserPreferences>) => void;
}

const UserPreferencesContext = createContext<
	UserPreferencesContextValue | undefined
>(undefined);

interface UserPreferencesProviderProps {
	children: ReactNode;
	defaultPreferences?: UserPreferences;
	stravaId?: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
	unitOfMeasurement: "miles",
};

export function UserPreferencesProvider({
	children,
	stravaId,
	defaultPreferences,
}: UserPreferencesProviderProps) {
	const [preferences, setPreferencesState] = useState<UserPreferences>(
		defaultPreferences || DEFAULT_PREFERENCES,
	);

	// Save preferences to database
	const savePreferences = useCallback(
		async (newPreferences: UserPreferences) => {
			if (!stravaId) return;

			try {
				await updateUserPreferences({
					data: { strava_id: stravaId, preferences: newPreferences },
				});
			} catch (error) {
				console.error("Failed to save user preferences:", error);
			}
		},
		[stravaId],
	);

	const debouncedSavePreferences = useDebouncedCallback(savePreferences, {
		wait: 500,
	});
	// Update preferences locally and in database
	const setPreferences = useCallback(
		(updates: Partial<UserPreferences>) => {
			const newPreferences = { ...preferences, ...updates };
			setPreferencesState(newPreferences);

			// Save to database asynchronously
			debouncedSavePreferences(newPreferences);
		},
		[preferences, debouncedSavePreferences],
	);

	return (
		<UserPreferencesContext.Provider value={{ preferences, setPreferences }}>
			{children}
		</UserPreferencesContext.Provider>
	);
}

export function useUserPreferences() {
	const context = useContext(UserPreferencesContext);
	if (context === undefined) {
		throw new Error(
			"useUserPreferences must be used within a UserPreferencesProvider",
		);
	}
	return context;
}

// Convenience hook for unit of measurement
export function useUnitOfMeasurement() {
	const { preferences, setPreferences } = useUserPreferences();

	const setUnitOfMeasurement = useCallback(
		(unitOfMeasurement: UserPreferences["unitOfMeasurement"]) => {
			setPreferences({ unitOfMeasurement });
		},
		[setPreferences],
	);

	return {
		unitOfMeasurement: preferences.unitOfMeasurement,
		setUnitOfMeasurement,
	};
}
