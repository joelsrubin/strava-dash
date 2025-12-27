// hooks/useAutosave.ts

import { useMutation } from "@tanstack/react-query";

import { useCallback, useEffect, useRef } from "react";
import { useDebouncedCallback } from "./use-debounce";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutosaveOptions {
	onSave: (content: string) => Promise<void>;
	debounceMs?: number;
	maxWaitMs?: number;
}

export function useAutosave({
	onSave,
	debounceMs = 5000,
	maxWaitMs = 30000,
}: UseAutosaveOptions) {
	const lastSavedContent = useRef<string | null>(null);

	const mutation = useMutation({
		mutationFn: onSave,
		onSuccess: (_, content) => {
			lastSavedContent.current = content;
		},
	});

	const save = useCallback(
		(content: string) => {
			const contentStr = content;

			// Skip if content hasn't changed
			if (contentStr === lastSavedContent.current) return;

			mutation.mutate(content);
		},
		[mutation],
	);

	const debouncedSave = useDebouncedCallback(save, debounceMs, {
		maxWait: maxWaitMs,
	});

	// Flush on unmount
	useEffect(() => {
		return () => {
			debouncedSave.flush();
		};
	}, [debouncedSave]);

	// Reset when activityId changes
	useEffect(() => {
		lastSavedContent.current = null;
	}, []);

	const status: SaveStatus = mutation.isPending
		? "saving"
		: mutation.isError
			? "error"
			: mutation.isSuccess
				? "saved"
				: "idle";

	return {
		triggerSave: debouncedSave,
		flushSave: debouncedSave.flush,
		status,
		error: mutation.error,
	};
}
