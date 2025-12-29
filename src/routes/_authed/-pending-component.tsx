import { Container } from "@/components/container";
import { SidebarInset } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";

export function PendingComponent() {
	return (
		<SidebarInset className={"flex min-h-0 flex-1 flex-col"}>
			<Container>
				<div className="flex items-center justify-center h-full">
					<Spinner className="h-12 w-12 text-primary" />
				</div>
			</Container>
		</SidebarInset>
	);
}
