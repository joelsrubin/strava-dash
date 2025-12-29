import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useSession } from "@tanstack/react-start/server";
import { fetchAthleteQueryOptions } from "@/api/queries/strava";
import { useStravaSession } from "@/api/session";
import { Toaster } from "@/components/ui/sonner";
import { getThemeScript, ThemeProvider } from "@/lib/theme";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	athlete: TAthlete;
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
				title: "Dash",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	// beforeLoad: async ({context: {queryClient}}) => {
	// 	const session = await useStravaSession()
	// 	const athlete = await 	queryClient.ensureQueryData(fetchAthleteQueryOptions()),
	// }
	notFoundComponent: () => <div>Not Found</div>,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
				<link rel="icon" href="/favicon.svg" />
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: just going for it */}
				<script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
			</head>
			<body suppressHydrationWarning>
				<ThemeProvider>
					{children}
					<Toaster position="top-center" />
				</ThemeProvider>
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
