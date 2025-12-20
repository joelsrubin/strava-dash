import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	plugins: [
		nitro(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		devtools(),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
