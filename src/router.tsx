import { QueryClient } from "@tanstack/react-query";
import { createRouter, ErrorComponent } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
	const queryClient = new QueryClient();
	const router = createRouter({
		routeTree,
		context: {
			queryClient,
		},
		defaultPreload: "intent",
		scrollRestoration: true,
		defaultStaleTime: Infinity,
		defaultPreloadStaleTime: 5 * 1000,
		defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	return router;
};
