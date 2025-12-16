import { redirect, useNavigate } from "@tanstack/react-router";
import { Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";

async function handleLogin(onSuccess: () => void) {
	const response = await fetch("https://www.strava.com/oauth/token", {
		method: "POST",
		body: new URLSearchParams({
			client_id: import.meta.env.VITE_STRAVA_CLIENT_ID,
			client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: import.meta.env.VITE_STRAVA_REFRESH_TOKEN,
		}),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to login with Strava");
	}

	const data = await response.json();
	console.log(data);
	onSuccess();
	return data;
}

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const navigate = useNavigate();
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>
						Click the button below to login with Strava
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<Field>
							<Button
								type="submit"
								onClick={() =>
									handleLogin(() => navigate({ to: "/dashboard" }))
								}
							>
								Login with Strava <Bike />
							</Button>
						</Field>
					</FieldGroup>
				</CardContent>
			</Card>
		</div>
	);
}
