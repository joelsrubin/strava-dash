import { Container } from "@/components/container";
import { SidebarInset } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";

export function PendingComponent() {
	return (
		<SidebarInset className={"flex min-h-0 flex-1 flex-col"}>
			<Container>
				<Spinner />
			</Container>
		</SidebarInset>
	);
}
