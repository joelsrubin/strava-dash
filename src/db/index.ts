import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { extractHashtags } from "@/lib/utils";

export interface User {
	id: number;
	strava_id: number;
	name: string;
}

export interface Note {
	id: number;
	user_id: number;
	run_id: number;
	content: string;
	created_at: string;
	updated_at: string;
	hashtags: string;
}

export type ParsedNotes = Omit<Note, "hashtags"> & {
	hashtags: string[];
};

export interface Hashtag {
	tag: string;
}

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
	const { results } = await env.DB.prepare(
		"SELECT * FROM users ORDER BY id DESC",
	).all<User>();
	return { results };
});

export const getUser = createServerFn({ method: "GET" })
	.inputValidator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		const { id } = data;
		const { results } = await env.DB.prepare("SELECT * FROM users WHERE id = ?")
			.bind(id)
			.all<User>();
		return { results };
	});

export const getUserByStravaId = createServerFn({ method: "GET" })
	.inputValidator((input: { strava_id: number }) => input)
	.handler(async ({ data }) => {
		const { strava_id } = data;
		const { results } = await env.DB.prepare(
			"SELECT * FROM users WHERE strava_id = ?",
		)
			.bind(strava_id)
			.all<User>();
		return { results };
	});
export const createUserIfNotExists = createServerFn({ method: "POST" })
	.inputValidator((input: { strava_id: number; name: string }) => input)
	.handler(async ({ data }): Promise<{ user: User }> => {
		const { strava_id, name } = data;
		const user = await env.DB.prepare(
			`INSERT INTO users (strava_id, name) VALUES (?, ?)
   ON CONFLICT (strava_id) DO UPDATE SET strava_id = excluded.strava_id
   RETURNING *`,
		)
			.bind(strava_id, name)
			.first<User>();
		if (!user) {
			throw new Error(`no user found or created with strava id: ${strava_id}`);
		}
		return { user };
	});

export const updateUser = createServerFn({ method: "POST" })
	.inputValidator(
		(input: { id: number; strava_id: number; name: string }) => input,
	)
	.handler(async ({ data }) => {
		const { id, strava_id, name } = data;
		const result = await env.DB.prepare(
			"UPDATE users SET strava_id = ?, name = ? WHERE id = ?",
		)
			.bind(strava_id, name, id)
			.run();
		return { success: result.success };
	});

export const deleteUser = createServerFn({ method: "POST" })
	.inputValidator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		const { id } = data;
		const result = await env.DB.prepare("DELETE FROM users WHERE id = ?")
			.bind(id)
			.run();
		return { success: result.success };
	});

export const getNotes = createServerFn({ method: "GET" })
	.inputValidator((input: { user_id: number }) => input)
	.handler(async ({ data }) => {
		const { user_id } = data;
		const { results } = await env.DB.prepare(
			"SELECT * FROM notes WHERE user_id = ?",
		)
			.bind(user_id)
			.all<Note>();

		const notes = results.map((note) => ({
			...note,
			hashtags: JSON.parse(note.hashtags || "[]"),
		}));

		return { results: notes };
	});

export const getNotesByUserId = createServerFn({ method: "GET" })
	.inputValidator((input: { user_id: number }) => input)
	.handler(async ({ data }) => {
		const { user_id } = data;
		const { results } = await env.DB.prepare(
			"SELECT * FROM notes WHERE user_id = ?",
		)
			.bind(user_id)
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
		(input: { user_id: number; run_id: number; content: string }) => input,
	)
	.handler(async ({ data }) => {
		const { user_id, run_id, content } = data;
		const hashtags = extractHashtags(content);
		if (hashtags.length > 0) {
			const result = await env.DB.prepare(
				"INSERT INTO notes (user_id, run_id, content, hashtags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
			)
				.bind(
					user_id,
					run_id,
					content,
					JSON.stringify(hashtags),
					new Date().toISOString(),
					new Date().toISOString(),
				)
				.run();
			return { success: result.success };
		} else {
			const result = await env.DB.prepare(
				"INSERT INTO notes (user_id, run_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
			)
				.bind(
					user_id,
					run_id,
					content,
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

export const deleteNote = createServerFn({ method: "POST" })
	.inputValidator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		const { id } = data;
		const result = await env.DB.prepare("DELETE FROM notes WHERE id = ?")
			.bind(id)
			.run();
		return { success: result.success };
	});

export const getHashtagsByUser = createServerFn({ method: "GET" })
	.inputValidator((input: { user_id: number }) => input)
	.handler(async ({ data }) => {
		const result = await env.DB.prepare(
			"SELECT DISTINCT j.value as tag FROM notes, json_each(notes.hashtags) j WHERE user_id = ?",
		)
			.bind(data.user_id)
			.all<Hashtag>();
		return { results: result.results };
	});

export const getHashtagsByRunId = createServerFn({ method: "GET" })
	.inputValidator((input: { run_id: number }) => input)
	.handler(async ({ data }) => {
		const results = await env.DB.prepare(
			"SELECT DISTINCT j.value as tag FROM notes, json_each(notes.hashtags) j WHERE run_id = ?",
		)
			.bind(data.run_id)
			.all<Hashtag>();
		return { results: results.results };
	});
