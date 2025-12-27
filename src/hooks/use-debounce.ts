// hooks/useDebouncedCallback.ts
import { useCallback, useEffect, useRef } from "react";

interface DebouncedFunction<T extends (...args: any[]) => any> {
	(...args: Parameters<T>): void;
	flush: () => void;
	cancel: () => void;
}

interface DebounceOptions {
	maxWait?: number;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
	callback: T,
	delay: number,
	options: DebounceOptions = {},
): DebouncedFunction<T> {
	const { maxWait } = options;

	const callbackRef = useRef(callback);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const maxWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastArgsRef = useRef<Parameters<T> | null>(null);

	// Keep callback ref fresh
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	const flush = useCallback(() => {
		if (lastArgsRef.current) {
			callbackRef.current(...lastArgsRef.current);
			lastArgsRef.current = null;
		}
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		if (maxWaitTimeoutRef.current) clearTimeout(maxWaitTimeoutRef.current);
		timeoutRef.current = null;
		maxWaitTimeoutRef.current = null;
	}, []);

	const cancel = useCallback(() => {
		lastArgsRef.current = null;
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		if (maxWaitTimeoutRef.current) clearTimeout(maxWaitTimeoutRef.current);
		timeoutRef.current = null;
		maxWaitTimeoutRef.current = null;
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			if (maxWaitTimeoutRef.current) clearTimeout(maxWaitTimeoutRef.current);
		};
	}, []);

	const debouncedCallback = useCallback(
		(...args: Parameters<T>) => {
			lastArgsRef.current = args;

			// Clear existing debounce timeout
			if (timeoutRef.current) clearTimeout(timeoutRef.current);

			// Set up debounce timeout
			timeoutRef.current = setTimeout(() => {
				flush();
			}, delay);

			// Set up maxWait timeout if specified and not already running
			if (maxWait && !maxWaitTimeoutRef.current) {
				maxWaitTimeoutRef.current = setTimeout(() => {
					flush();
				}, maxWait);
			}
		},
		[delay, maxWait, flush],
	);

	const result = debouncedCallback as DebouncedFunction<T>;
	result.flush = flush;
	result.cancel = cancel;

	return result;
}
