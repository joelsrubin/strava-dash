import type { Row, Table } from "@tanstack/react-table";

import type { ParsedNote } from "@/db";

import { Tools } from "./tools";

export function BulkToolbar({
	table,
	selectedRows,
}: {
	table: Table<ParsedNote>;
	selectedRows: Row<ParsedNote>[];
}) {
	return selectedRows.length ? (
		<div className="flex items-end justify-end pb-2 pr-2">
			<div className="flex gap-2">
				<Tools.Hashtag selectedRows={selectedRows} table={table} />
				<Tools.Delete selectedRows={selectedRows} table={table} />
			</div>
		</div>
	) : null;
}
