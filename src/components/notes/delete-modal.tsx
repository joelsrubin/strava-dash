import { AlertCircle } from "lucide-react";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteConfirmationModalProps {
	onConfirm: () => void;
	title?: string;
	description?: string;
	itemName?: string;
	children: ReactElement;
	isLoading?: boolean;
}

export function DeleteConfirmationModal({
	onConfirm,
	title = "Are you sure?",
	description = "This action cannot be undone. This will permanently delete the item.",
	itemName,
	isLoading = false,
	children,
}: DeleteConfirmationModalProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
							<AlertCircle className="size-5 text-destructive" />
						</div>
						<DialogTitle className="text-balance">{title}</DialogTitle>
					</div>
					<DialogDescription className="text-balance pt-2">
						{itemName ? (
							<>
								{description}{" "}
								<strong className="text-foreground">{itemName}</strong> will be
								permanently removed.
							</>
						) : (
							description
						)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2">
					<DialogClose asChild>
						<Button type="button" variant="outline" disabled={isLoading}>
							Cancel
						</Button>
					</DialogClose>
					<Button
						type="button"
						variant="destructive"
						onClick={onConfirm}
						disabled={isLoading}
					>
						{isLoading ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
