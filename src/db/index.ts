import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";

interface User {
	id: number;
	strava_id: number;
	name: string;
}

interface Note {
	id: number;
	user_id: number;
	run_id: number;
	title: string;
	content: string;
	created_at: string;
	updated_at: string;
}

interface Hashtag {
	id: number;
	name: string;
}

interface NoteHashtag {
	id: number;
	note_id: number;
	hashtag_id: number;
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
export const createUser = createServerFn({ method: "POST" })
	.inputValidator((input: { strava_id: number; name: string }) => input)
	.handler(async ({ data }) => {
		const { strava_id, name } = data;
		const result = await env.DB.prepare(
			"INSERT INTO users (strava_id, name) VALUES (?, ?)",
		)
			.bind(strava_id, name)
			.run();
		return { success: result.success };
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
		return { results };
	});

export const createNote = createServerFn({ method: "POST" })
	.inputValidator(
		(input: {
			user_id: number;
			run_id: number;
			title: string;
			content: string;
			created_at: string;
			updated_at: string;
		}) => input,
	)
	.handler(async ({ data }) => {
		const { user_id, run_id, title, content, created_at, updated_at } = data;
		const result = await env.DB.prepare(
			"INSERT INTO notes (user_id, run_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
		)
			.bind(user_id, run_id, title, content, created_at, updated_at)
			.run();
		return { success: result.success };
	});

export const updateNote = createServerFn({ method: "POST" })
	.inputValidator(
		(input: {
			id: number;
			user_id: number;
			run_id: number;
			title: string;
			content: string;
			created_at: string;
			updated_at: string;
		}) => input,
	)
	.handler(async ({ data }) => {
		const { id, user_id, run_id, title, content, created_at, updated_at } =
			data;
		const result = await env.DB.prepare(
			"UPDATE notes SET user_id = ?, run_id = ?, title = ?, content = ?, created_at = ?, updated_at = ? WHERE id = ?",
		)
			.bind(user_id, run_id, title, content, created_at, updated_at, id)
			.run();
		return { success: result.success };
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

export const getHashtags = createServerFn({ method: "GET" }).handler(
	async () => {
		const { results } = await env.DB.prepare(
			"SELECT * FROM hashtags",
		).all<Hashtag>();
		return { results };
	},
);

export const createHashtag = createServerFn({ method: "POST" })
	.inputValidator((input: { name: string }) => input)
	.handler(async ({ data }) => {
		const { name } = data;
		const result = await env.DB.prepare(
			"INSERT INTO hashtags (name) VALUES (?)",
		)
			.bind(name)
			.run();
		return { success: result.success };
	});

export const updateHashtag = createServerFn({ method: "POST" })
	.inputValidator((input: { id: number; name: string }) => input)
	.handler(async ({ data }) => {
		const { id, name } = data;
		const result = await env.DB.prepare(
			"UPDATE hashtags SET name = ? WHERE id = ?",
		)
			.bind(name, id)
			.run();
		return { success: result.success };
	});

export const deleteHashtag = createServerFn({ method: "POST" })
	.inputValidator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		const { id } = data;
		const result = await env.DB.prepare("DELETE FROM hashtags WHERE id = ?")
			.bind(id)
			.run();
		return { success: result.success };
	});

export const getNoteHashtags = createServerFn({ method: "GET" })
	.inputValidator((input: { note_id: number }) => input)
	.handler(async ({ data }) => {
		const { note_id } = data;
		const { results } = await env.DB.prepare(
			"SELECT * FROM note_hashtags WHERE note_id = ?",
		)
			.bind(note_id)
			.all<NoteHashtag>();
		return { results };
	});
