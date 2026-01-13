import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { configDefaults } from "vitest/config";

export default defineConfig(({ mode }) => {
	// Optional: Use loadEnv for environment-specific configs if needed
	const plugins = [
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		devtools(),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	];

	// Only add Cloudflare plugin if not in test mode
	if (mode !== "test") {
		plugins.push(cloudflare({ viteEnvironment: { name: "ssr" } }));
	}

	return {
		plugins,
		test: {
			globals: true,
			environment: "jsdom",
			setupFiles: ["./src/test/setup.ts"],
			coverage: {
				provider: "v8",
				reporter: ["text", "json", "html"],
			},
			exclude: [...configDefaults.exclude, "**/e2e/**", "**/playwright/**"],
		},
	};
});
