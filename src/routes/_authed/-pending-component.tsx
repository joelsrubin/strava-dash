import { Container } from "@/components/container";

import { Spinner } from "@/components/ui/spinner";

export function PendingComponent() {
	return (
		<div className={"flex min-h-0 flex-1 flex-col bg-muted/50"}>
			<Container>
				<div className="flex items-center justify-center">
					<Spinner className="h-12 w-12 text-primary" />
				</div>
			</Container>
		</div>
	);
}
