import { useNotesTable } from "@/lib/notes-table-provider";
import { Tools } from "./tools";

export function BulkToolbar() {
	const { table } = useNotesTable();
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	return selectedRows.length ? (
		<div className="flex items-end justify-end p-2">
			<div className="flex gap-2">
				<Tools.Hashtag />
				<Tools.Delete />
			</div>
		</div>
	) : null;
}
