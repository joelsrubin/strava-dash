import type { Row } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import type { ParsedNote } from "@/db";
import { Button } from "../ui/button";

export function BulkToolbar({
	isDeleting,
	selectedCount,
	selectedRows,
	onDelete,
}: {
	isDeleting: boolean;
	selectedCount: number;
	selectedRows: Row<ParsedNote>[];
	onDelete: (data: { runIds: number[] }) => void;
}) {
	return (
		<div className="flex items-end justify-end pb-2 pr-2">
			<div className="flex gap-2">
				<Button
					disabled={isDeleting}
					size="sm"
					onClick={() =>
						onDelete({
							runIds: selectedRows.map((row) => row.original.run_id),
						})
					}
				>
					<Trash2 className="h-4 w-4 mr-1" />
					Delete <span className="ml-1 tabular-nums">{selectedCount}</span>
				</Button>
			</div>
		</div>
	);
}
