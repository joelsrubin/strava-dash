import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MONTHS } from "@/constants/months";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatTime(seconds: number) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return `${hours ? `${hours}h ` : ""}${minutes ? `${minutes} min ` : ""}`;
}

export function formatDistance(distance: number) {
	return `${(distance * 0.00062137).toFixed(2)} mi`;
}

export function formatElevation(elevation: number) {
	return `${elevation.toFixed(0)} ft`;
}

export function formatDate(date: string) {
	return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
		new Date(date),
	);
}

export function formatPace(metersPerSecond: number) {
	if (!metersPerSecond || metersPerSecond <= 0) return "--:--";

	const metersPerMile = 1609.34;
	const minutesPerMile = metersPerMile / (metersPerSecond * 60);

	const minutes = Math.floor(minutesPerMile);
	const seconds = Math.round((minutesPerMile - minutes) * 60);

	if (seconds === 60) {
		return `${minutes + 1}:00`;
	}

	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function getActivityYear(date: string) {
	return new Date(date).getFullYear();
}

export function getActivityMonth(date: string) {
	const monthNumber = new Date(date).getMonth();
	const monthName = MONTHS[monthNumber];
	return monthName;
}

export const extractHashtags = (content: string): string[] => {
	const matches = content.match(/#(\w+)/g) || [];
	return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
};

export function parseNoteContent(html: string) {
	const tagMatches = html.matchAll(/data-tag="([^"]+)"/g);
	const hashtags = [...tagMatches].map((match) => match[1]);

	const linkMatches = html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g);
	const links = [...linkMatches].map((match) => ({
		url: match[1],
		text: match[2],
	}));

	const text = html
		.replace(/<span[^>]*class="hashtag"[^>]*>[^<]*<\/span>/g, "") // remove hashtag spans
		.replace(/<a[^>]*>[^<]*<\/a>/g, "") // remove links
		.replace(/\s+/g, " ")
		.trim();

	return { text, hashtags, links };
}
