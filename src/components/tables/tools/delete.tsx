import { useRouteContext } from "@tanstack/react-router";
import type { Row, Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteNoteMutation } from "@/api/mutations/notes";
import { Button } from "@/components/ui/button";
import type { ParsedNote } from "@/db";

export function Delete({
	selectedRows,
	table,
}: {
	selectedRows: Row<ParsedNote>[];
	table: Table<ParsedNote>;
}) {
	const { queryClient, athlete } = useRouteContext({
		from: "/_authed/dashboard/_charts/notes",
	});
	const { mutate: deleteNotes, isPending: isDeleting } = useDeleteNoteMutation({
		onSuccess: (_data, variables) => {
			const deletedCount = variables.runIds.length;
			const didDeleteMultipleNotes = deletedCount > 1;
			queryClient.invalidateQueries({
				queryKey: ["notes", athlete.id],
			});
			// Remove the specific note queries entirely so the run page fetches fresh data
			for (const runId of variables.runIds) {
				queryClient.removeQueries({ queryKey: ["note", runId] });
			}

			toast.success(
				`${deletedCount} ${didDeleteMultipleNotes ? "notes" : "note"} deleted successfully`,
			);
		},
		onError: (error) => {
			console.error("Failed to delete note:", error);
			toast.error("Failed to delete note");
		},
	});
	return (
		<Button
			disabled={isDeleting}
			size="sm"
			onClick={() => {
				table.toggleAllPageRowsSelected(false);
				deleteNotes({
					runIds: selectedRows.map((row) => row.original.run_id),
				});
			}}
		>
			<Trash2 className="h-4 w-4 mr-1" />
			Delete <span className="ml-1 tabular-nums">{selectedRows.length}</span>
		</Button>
	);
}
