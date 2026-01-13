import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
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
	};
});
