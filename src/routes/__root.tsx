import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Container } from "@/components/container";

import { getThemeScript } from "@/lib/theme";
import appCss from "../styles.css?url";
import { PendingComponent } from "./_authed/-pending-component";
import { Providers } from "./-providers";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	athlete?: TAthlete;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "not so fast",
			},

			// Open Graph / Facebook
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:url",
				content: "https://notsofast.run",
			},
			{
				property: "og:title",
				content: "not so fast",
			},
			{
				property: "og:description",
				content: "run in public. think in private.",
			},
			{
				property: "og:image",
				content: "/og-image.jpg",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			// Favicon
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},

			// Apple Touch Icons
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
		],
	}),
	pendingComponent: PendingComponent,
	notFoundComponent: () => (
		<Container>
			<div className="flex justify-center items-center flex-col">
				<h1 className="text-6xl">404</h1>
				<span>Page Not Found!</span>
			</div>
		</Container>
	),
	pendingMinMs: 0,
	shellComponent: RootDocument,
});

function RootDocument({
	children,
	athlete,
}: {
	children: React.ReactNode;
	athlete?: TAthlete;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: just going for it */}
				<script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
			</head>
			<body suppressHydrationWarning>
				<Providers stravaId={athlete?.id}>{children}</Providers>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "TanStack Query",
							render: <ReactQueryDevtoolsPanel />,
						},
						{
							name: "TanStack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
