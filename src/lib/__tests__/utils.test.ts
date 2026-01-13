import { describe, expect, it } from "vitest";
import {
	cn,
	extractHashtags,
	formatDate,
	formatDistance,
	formatElevation,
	formatPace,
	formatTime,
	getActivityMonth,
	getActivityYear,
	parseNoteContent,
} from "../utils";

describe("Utils", () => {
	describe("cn (className merge)", () => {
		it("should merge class names", () => {
			expect(cn("test", "test2")).toBe("test test2");
			expect(cn("test", { test2: true })).toBe("test test2");
			expect(cn("test", { test2: false })).toBe("test");
		});
	});

	describe("formatTime", () => {
		it("should format time correctly", () => {
			expect(formatTime(3600)).toBe("1h ");
			expect(formatTime(60)).toBe("1 min ");
			expect(formatTime(3661)).toBe("1h 1 min ");
			expect(formatTime(0)).toBe("");
		});
	});

	describe("formatDistance", () => {
		it("should convert kilometers to miles", () => {
			expect(formatDistance(1000, "miles")).toBe("0.62 mi");
			expect(formatDistance(5000, "miles")).toBe("3.11 mi");
		});

		it("should convert kilometers", () => {
			expect(formatDistance(1000, "kilometers")).toBe("1.00 km");
			expect(formatDistance(5000, "kilometers")).toBe("5.00 km");
		});
	});

	describe("formatElevation", () => {
		it("should format elevation in feet", () => {
			expect(formatElevation(100.5)).toBe("101 ft");
			expect(formatElevation(1234.6)).toBe("1235 ft");
		});
	});

	describe("formatDate", () => {
		it("should format dates correctly", () => {
			const date = formatDate("2023-01-15");
			expect(date).toMatch(/January \d+, 2023/);
		});
	});

	describe("formatPace", () => {
		it('should return "--:--" for zero or negative speed', () => {
			expect(formatPace(0, "miles")).toBe("--:--");
			expect(formatPace(-5, "kilometers")).toBe("--:--");
		});

		it("should format pace for miles", () => {
			// Pace depends on actual implementation
			expect(formatPace(4.47, "miles")).toBe("6:00");
		});

		it("should format pace for kilometers", () => {
			// Roughly 5 min/km pace
			expect(formatPace(3.33, "kilometers")).toBe("5:00");
		});
	});

	describe("getActivityYear", () => {
		it("should extract year from date", () => {
			expect(getActivityYear("2023-01-15")).toBe(2023);
			expect(getActivityYear("2022-12-31")).toBe(2022);
		});
	});

	describe("getActivityMonth", () => {
		it("should return correct month name", () => {
			expect(getActivityMonth("2023-01-15")).toBe("January");
			expect(getActivityMonth("2023-12-31")).toBe("December");
		});
	});

	describe("extractHashtags", () => {
		it("should extract unique lowercase hashtags", () => {
			expect(extractHashtags("Hello #Running #Running #fitness")).toEqual([
				"running",
				"fitness",
			]);
			expect(extractHashtags("No hashtags here")).toEqual([]);
		});
	});

	describe("parseNoteContent", () => {
		it("should extract hashtags and links from HTML", () => {
			const html = `
                Some text with a <a href="https://example.com">link</a> 
                and a #hashtag and another <a href="https://test.com">link2</a>
            `;
			const result = parseNoteContent(html);

			expect(result.hashtags).toEqual([]);
			expect(result.links).toEqual([
				{ url: "https://example.com", text: "link" },
				{ url: "https://test.com", text: "link2" },
			]);
		});
	});
});
