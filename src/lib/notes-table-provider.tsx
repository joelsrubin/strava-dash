import type { Table } from "@tanstack/react-table";
import { createContext, type ReactNode, useContext, useState } from "react";
import type { ParsedNote } from "@/db";

interface TableProviderContextValue {
	table: Table<ParsedNote>;
}

const TableProviderContext = createContext<
	TableProviderContextValue | undefined
>(undefined);

interface TableProviderProps {
	children: ReactNode;
	table: Table<ParsedNote>;
}

export function TableProvider({
	children,
	table: tableData,
}: TableProviderProps) {
	const [table] = useState(tableData);
	return (
		<TableProviderContext.Provider value={{ table }}>
			{children}
		</TableProviderContext.Provider>
	);
}

export function useNotesTable(): TableProviderContextValue {
	const context = useContext(TableProviderContext);
	if (context === undefined) {
		throw new Error("useNotesTable must be used within a TableProvider");
	}
	return context;
}
