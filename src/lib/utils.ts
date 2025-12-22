import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatTime(seconds: number) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return `${hours ? `${hours}h ` : ""}${minutes ? `${minutes}m ` : ""}`;
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

export const extractHashtags = (content: string): string[] => {
	const matches = content.match(/#(\w+)/g) || [];
	return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
};
