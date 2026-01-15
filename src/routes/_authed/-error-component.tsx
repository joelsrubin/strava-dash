import { type ErrorComponentProps, Link } from "@tanstack/react-router";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function RootErrorComponent({ error, reset }: ErrorComponentProps) {
	const isDevelopment = import.meta.env.DEV;

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="max-w-2xl w-full">
				<CardHeader>
					<div className="flex items-center gap-2">
						<AlertCircle className="h-6 w-6 text-destructive" />
						<CardTitle>Something went wrong</CardTitle>
					</div>
					<CardDescription>
						An unexpected error occurred. Please try again or return to the home
						page.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{isDevelopment && error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Error Details (Development Only)</AlertTitle>
							<AlertDescription className="mt-2 font-mono text-sm">
								<div className="space-y-2">
									<div>
										<strong>Message:</strong> {error.message}
									</div>
									{error.stack && (
										<details className="mt-2">
											<summary className="cursor-pointer hover:underline">
												View Stack Trace
											</summary>
											<pre className="mt-2 whitespace-pre-wrap text-xs overflow-auto max-h-60 p-2 bg-muted rounded">
												{error.stack}
											</pre>
										</details>
									)}
								</div>
							</AlertDescription>
						</Alert>
					)}
				</CardContent>

				<CardFooter className="flex gap-2">
					<Button onClick={reset} variant="default" className="flex-1">
						<RefreshCcw className="mr-2 h-4 w-4" />
						Try Again
					</Button>
					<Button asChild variant="outline" className="flex-1 bg-transparent">
						<Link to="/">
							<Home className="mr-2 h-4 w-4" />
							Go Home
						</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
