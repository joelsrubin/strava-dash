// Generate or derive a key
export async function deriveKey(password: string): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);

	const hash = await crypto.subtle.digest("SHA-256", data);

	return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
		"encrypt",
		"decrypt",
	]);
}

// Encrypt
export async function encryptEntry(
	plaintext: string,
	password: string,
): Promise<string> {
	const key = await deriveKey(password);
	const iv = crypto.getRandomValues(new Uint8Array(12)); // initialization vector

	const encoded = new TextEncoder().encode(plaintext);
	const ciphertext = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		encoded,
	);

	// Combine IV + ciphertext and return as base64
	const combined = new Uint8Array(iv.length + ciphertext.byteLength);
	combined.set(iv);
	combined.set(new Uint8Array(ciphertext), iv.length);

	return btoa(String.fromCharCode(...combined));
}

// Decrypt
export async function decryptEntry(
	encrypted: string,
	password: string,
): Promise<string> {
	const key = await deriveKey(password);
	const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));

	const iv = combined.slice(0, 12);
	const ciphertext = combined.slice(12);

	const plaintext = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		key,
		ciphertext,
	);

	return new TextDecoder().decode(plaintext);
}
