import { useServerFn } from "@tanstack/react-start";
import { Bike } from "lucide-react";
import { navigateToStrava } from "@/api/auth.server";
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

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const navigateToStravaFn = useServerFn(navigateToStrava);
	const handleClick = async () => {
		await navigateToStravaFn();
	};

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
							<Button type="submit" onClick={handleClick}>
								Login with Strava <Bike />
							</Button>
						</Field>
					</FieldGroup>
				</CardContent>
			</Card>
		</div>
	);
}
