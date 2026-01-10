import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import type { Row } from "@tanstack/react-table";
import { Hash, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ParsedNote } from "@/db";
import { updateNote } from "@/db";

interface AddTagsVariables {
	selectedRows: Row<ParsedNote>[];
	tagsToAdd: string[];
}

interface AddTagsResult {
	noteCount: number;
	tagCount: number;
}

function generateHashtagString(tag: string) {
	return `<span data-tag="${tag}" class="hashtag" data-hashtag="" contenteditable="false">#${tag}</span>`;
}

export function Hashtag({ selectedRows }: { selectedRows: Row<ParsedNote>[] }) {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const { queryClient, athlete } = useRouteContext({
		from: "/_authed/dashboard/_charts/notes",
	});

	// Parse comma-separated input into individual tags
	const parseTags = (input: string): string[] => {
		// Only parse completed tags (those followed by commas)
		const completedTags = input
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0);

		// Remove the last tag if it doesn't end with a comma (incomplete)
		if (!input.endsWith(",") && completedTags.length > 0) {
			return completedTags.slice(0, -1);
		}

		return completedTags;
	};

	// Parse all tags including incomplete ones for submission
	const parseAllTags = (input: string): string[] => {
		return input
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0);
	};

	const tagsToAdd = parseTags(inputValue);

	// Create a mutation for adding tags
	const addTagsMutation = useMutation<AddTagsResult, Error, AddTagsVariables>({
		mutationFn: async ({ selectedRows, tagsToAdd }: AddTagsVariables) => {
			// Update each selected note with the new hashtags
			const updatePromises = selectedRows.map(async (row) => {
				const note = row.original;
				const newTags = tagsToAdd.map((tag) => generateHashtagString(tag));

				const updatedContent = note.content.concat(newTags.join(" "));
				await updateNote({
					data: { id: note.id, content: updatedContent },
				});

				return { runId: note.run_id, hashtags: newTags };
			});

			await Promise.all(updatePromises);

			// Invalidate queries to refresh data
			queryClient.invalidateQueries({
				queryKey: ["notes", athlete.id],
			});
			// Remove the specific note queries entirely so the run page fetches fresh data
			for (const runId of selectedRows.map((row) => row.original.run_id)) {
				queryClient.refetchQueries({ queryKey: ["note", runId] });
			}

			return {
				noteCount: selectedRows.length,
				tagCount: tagsToAdd.length,
			};
		},
		onSuccess: (result: AddTagsResult) => {
			const { noteCount, tagCount } = result;
			toast.success(
				`Added ${tagCount} tag${tagCount > 1 ? "s" : ""} to ${noteCount} note${
					noteCount > 1 ? "s" : ""
				}`,
			);
			// Reset and close
			setInputValue("");
			setOpen(false);
		},
		onError: (error: Error) => {
			console.error("Failed to add tags:", error);
			toast.error("Failed to add tags");
		},
	});

	const handleAddTags = async () => {
		const allTags = parseAllTags(inputValue);
		if (allTags.length === 0) return;

		try {
			await addTagsMutation.mutateAsync({
				selectedRows,
				tagsToAdd: allTags,
			});

			// Reset and close
			setInputValue("");
			setOpen(false);
		} catch (error) {
			console.error("Failed to add tags:", error);
			toast.error("Failed to add tags");
		}
	};

	const removeTag = (tagToRemove: string) => {
		const tags = parseTags(inputValue);
		const filteredTags = tags.filter((tag) => tag !== tagToRemove);
		setInputValue(filteredTags.join(", "));
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Hash className="mr-1" />
					Tag
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add Hashtags</DialogTitle>
					<DialogDescription>
						Add hashtags to {selectedRows.length} selected note
						{selectedRows.length > 1 ? "s" : ""}. Enter tags separated by
						commas.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Tag Preview */}
					{tagsToAdd.length > 0 && (
						<div className="space-y-2">
							<p className="text-sm font-medium text-muted-foreground">
								Tags to add:
							</p>
							<div className="flex flex-wrap gap-2">
								{tagsToAdd.map((tag) => (
									<Badge
										key={tag}
										variant="secondary"
										className="flex items-center gap-1"
									>
										#{tag}
										<X
											className="h-3 w-3 cursor-pointer hover:text-destructive"
											onClick={() => removeTag(tag)}
										/>
									</Badge>
								))}
							</div>
						</div>
					)}

					{/* Input */}
					<div className="space-y-2">
						<label htmlFor="tag-input" className="text-sm font-medium">
							Hashtags
						</label>
						<Input
							id="tag-input"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							placeholder="running, workout, morning"
							className="w-full"
						/>
						<p className="text-xs text-muted-foreground">
							Enter hashtags separated by commas
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={addTagsMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleAddTags}
						disabled={
							addTagsMutation.isPending || parseAllTags(inputValue).length === 0
						}
					>
						{addTagsMutation.isPending ? (
							<>Adding...</>
						) : (
							<>
								<Plus className="h-4 w-4 mr-1" />
								Add {parseAllTags(inputValue).length} tag
								{parseAllTags(inputValue).length !== 1 ? "s" : ""}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
