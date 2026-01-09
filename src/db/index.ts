import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { extractHashtags } from "@/lib/utils";

export interface Note {
	id: number;
	strava_id: number;
	run_id: number;
	content: string;
	created_at: string;
	activity_date: string;
	updated_at: string;
	hashtags: string;
}

export type ParsedNote = Omit<Note, "hashtags"> & {
	hashtags: string[];
};

export interface Hashtag {
	tag: string;
}

export interface UserPreferences {
	unitOfMeasurement: "miles" | "kilometers";
}

export interface ThemePreferences {
	theme: "light" | "dark" | "system";
}

export interface UserPreferenceRecord {
	id: number;
	strava_id: number;
	preferences: string; // JSON string
	created_at: string;
	updated_at: string;
}

export const getNotesByUserId = createServerFn({ method: "GET" })
	.inputValidator((input: { strava_id: number }) => input)
	.handler(async ({ data }) => {
		const { strava_id } = data;
		const { results } = await env.DB.prepare(
			"SELECT * FROM notes WHERE strava_id = ?",
		)
			.bind(strava_id)
			.all<Note>();
		const notes = results.map((note) => ({
			...note,
			hashtags: JSON.parse(note.hashtags || "[]"),
		}));

		return { results: notes };
	});

export const getNoteByRun = createServerFn({ method: "GET" })
	.inputValidator((input: { run_id: number }) => input)
	.handler(async ({ data }) => {
		const { run_id } = data;
		const { results } = await env.DB.prepare(
			"SELECT * FROM notes WHERE run_id = ?",
		)
			.bind(run_id)
			.all<Note>();
		return { results };
	});

export const createNote = createServerFn({ method: "POST" })
	.inputValidator(
		(input: {
			strava_id: number;
			run_id: number;
			content: string;
			activity_date: string;
		}) => input,
	)
	.handler(async ({ data }) => {
		const { strava_id, run_id, content, activity_date } = data;

		const hashtags = extractHashtags(content);
		if (hashtags.length > 0) {
			const result = await env.DB.prepare(
				"INSERT INTO notes (strava_id, run_id, content, hashtags, activity_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
				.bind(
					strava_id,
					run_id,
					content,
					JSON.stringify(hashtags),
					activity_date,
					new Date().toISOString(),
					new Date().toISOString(),
				)
				.run();
			return { success: result.success };
		} else {
			const result = await env.DB.prepare(
				"INSERT INTO notes (strava_id, run_id, content, activity_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
			)
				.bind(
					strava_id,
					run_id,
					content,
					activity_date,
					new Date().toISOString(),
					new Date().toISOString(),
				)
				.run();
			return { success: result.success };
		}
	});

export const updateNote = createServerFn({ method: "POST" })
	.inputValidator((input: { id: number; content: string }) => input)
	.handler(async ({ data }) => {
		const { id, content } = data;
		const hashtags = extractHashtags(content);

		if (hashtags.length > 0) {
			const result = await env.DB.prepare(
				"UPDATE notes SET content = ?, hashtags = ?, updated_at = ? WHERE id = ?",
			)
				.bind(content, JSON.stringify(hashtags), new Date().toISOString(), id)
				.run();
			return { success: result.success };
		} else {
			const result = await env.DB.prepare(
				"UPDATE notes SET content = ?, updated_at = ? WHERE id = ?",
			)
				.bind(content, new Date().toISOString(), id)
				.run();
			return { success: result.success };
		}
	});

export const deleteNotes = createServerFn({ method: "POST" })
	.inputValidator((input: { runIds: number[] }) => input)
	.handler(async ({ data }) => {
		const { runIds } = data;

		if (runIds.length === 0) {
			return { success: true, deleted: 0 };
		}

		const placeholders = runIds.map(() => "?").join(", ");
		const result = await env.DB.prepare(
			`DELETE FROM notes WHERE run_id IN (${placeholders})`,
		)
			.bind(...runIds)
			.run();

		return { success: result.success, deleted: result.meta.changes };
	});

// User Preferences API endpoints
export const getUserPreferences = createServerFn({ method: "GET" })
	.inputValidator((input: { strava_id: number }) => input)
	.handler(async ({ data }) => {
		const { strava_id } = data;

		const { results } = await env.DB.prepare(
			"SELECT * FROM user_preferences WHERE strava_id = ?",
		)
			.bind(strava_id)
			.all<UserPreferenceRecord>();

		if (results.length === 0) {
			// Return default preferences if none exist
			const defaultPreferences: UserPreferences = {
				unitOfMeasurement: "miles",
			};
			return { preferences: defaultPreferences };
		}

		const record = results[0];
		const preferences = JSON.parse(record.preferences) as UserPreferences;

		return { preferences };
	});

export const updateUserPreferences = createServerFn({ method: "POST" })
	.inputValidator(
		(input: { strava_id: number; preferences: UserPreferences }) => input,
	)
	.handler(async ({ data }) => {
		const { strava_id, preferences } = data;

		const preferencesJson = JSON.stringify(preferences);

		// Try to update existing record first
		const updateResult = await env.DB.prepare(
			"UPDATE user_preferences SET preferences = ?, updated_at = ? WHERE strava_id = ?",
		)
			.bind(preferencesJson, new Date().toISOString(), strava_id)
			.run();

		// If no record was updated, insert a new one
		if (updateResult.meta.changes === 0) {
			const insertResult = await env.DB.prepare(
				"INSERT INTO user_preferences (strava_id, preferences, created_at, updated_at) VALUES (?, ?, ?, ?)",
			)
				.bind(
					strava_id,
					preferencesJson,
					new Date().toISOString(),
					new Date().toISOString(),
				)
				.run();

			return { success: insertResult.success };
		}

		return { success: updateResult.success };
	});
