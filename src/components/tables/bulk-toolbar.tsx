import type { Row } from "@tanstack/react-table";

import type { ParsedNote } from "@/db";

import { Tools } from "./tools";

export function BulkToolbar({
	selectedRows,
}: {
	selectedRows: Row<ParsedNote>[];
}) {
	return selectedRows.length ? (
		<div className="flex items-end justify-end pb-2 pr-2">
			<div className="flex gap-2">
				<Tools.Hashtag selectedRows={selectedRows} />
				<Tools.Delete selectedRows={selectedRows} />
			</div>
		</div>
	) : null;
}
