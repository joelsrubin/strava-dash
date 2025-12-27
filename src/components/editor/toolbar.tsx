import type { Editor } from "@tiptap/react";
import {
	Bold,
	Code,
	CodeSquare,
	Heading1,
	Heading2,
	Heading3,
	Italic,
	Link,
	List,
	ListOrdered,
	Minus,
	Pilcrow,
	Quote,
	Redo,
	Strikethrough,
	Undo,
	Unlink,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmojiDropdownMenu } from "./emoji-toolbar-button";
import { StatusIndicator } from "./status-indicator";

interface ToolbarProps {
	editor: Editor | null;
}

function ToolbarButton({
	onClick,
	isActive = false,
	disabled = false,
	children,
	title,
}: {
	onClick: () => void;
	isActive?: boolean;
	disabled?: boolean;
	children: React.ReactNode;
	title: string;
}) {
	return (
		<Button
			type="button"
			variant={isActive ? "secondary" : "ghost"}
			size="icon-sm"
			onClick={onClick}
			disabled={disabled}
			title={title}
			className={isActive ? "bg-muted" : ""}
		>
			{children}
		</Button>
	);
}

function ToolbarDivider() {
	return <Separator orientation="vertical" className="mx-1 h-6" />;
}

export function Toolbar({ editor }: ToolbarProps) {
	const [linkUrl, setLinkUrl] = useState("");
	const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
	const { isMobile } = useIsMobile();
	const setLink = useCallback(() => {
		if (!editor) return;

		if (linkUrl === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
		} else {
			const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
			editor
				.chain()
				.focus()
				.extendMarkRange("link")
				.setLink({ href: url })
				.run();
		}
		setLinkUrl("");
		setLinkPopoverOpen(false);
	}, [editor, linkUrl]);

	const openLinkPopover = useCallback(() => {
		if (!editor) return;
		const previousUrl = editor.getAttributes("link").href || "";
		setLinkUrl(previousUrl);
		setLinkPopoverOpen(true);
	}, [editor]);

	if (!editor) {
		return null;
	}

	return (
		<div className="flex sticky top-0 z-10 flex-wrap items-center gap-0.5 border-b border-border bg-muted/50 backdrop-blur-3xl p-1.5">
			{/* Text formatting */}
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleBold().run()}
				isActive={editor.isActive("bold")}
				title="Bold (⌘B)"
			>
				<Bold className="size-4" />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleItalic().run()}
				isActive={editor.isActive("italic")}
				title="Italic (⌘I)"
			>
				<Italic className="size-4" />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleStrike().run()}
				isActive={editor.isActive("strike")}
				title="Strikethrough"
			>
				<Strikethrough className="size-4" />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleCode().run()}
				isActive={editor.isActive("code")}
				title="Inline code"
			>
				<Code className="size-4" />
			</ToolbarButton>

			<ToolbarDivider />

			{/* Headings */}
			<ToolbarButton
				onClick={() => editor.chain().focus().setParagraph().run()}
				isActive={editor.isActive("paragraph")}
				title="Paragraph"
			>
				<Pilcrow className="size-4" />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				isActive={editor.isActive("heading", { level: 1 })}
				title="Heading 1"
			>
				<Heading1 className="size-4" />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				isActive={editor.isActive("heading", { level: 2 })}
				title="Heading 2"
			>
				<Heading2 className="size-4" />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				isActive={editor.isActive("heading", { level: 3 })}
				title="Heading 3"
			>
				<Heading3 className="size-4" />
			</ToolbarButton>

			<ToolbarDivider />

			{/* Lists */}
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				isActive={editor.isActive("bulletList")}
				title="Bullet list"
			>
				<List className="size-4" />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				isActive={editor.isActive("orderedList")}
				title="Numbered list"
			>
				<ListOrdered className="size-4" />
			</ToolbarButton>

			<ToolbarDivider />

			{/* Blocks */}
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				isActive={editor.isActive("blockquote")}
				title="Blockquote"
			>
				<Quote className="size-4" />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
				isActive={editor.isActive("codeBlock")}
				title="Code block"
			>
				<CodeSquare className="size-4" />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
				title="Horizontal rule"
			>
				<Minus className="size-4" />
			</ToolbarButton>

			<ToolbarDivider />

			{/* Link */}
			<Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant={editor.isActive("link") ? "secondary" : "ghost"}
						size="icon-sm"
						onClick={openLinkPopover}
						title="Add link"
						className={editor.isActive("link") ? "bg-muted" : ""}
					>
						<Link className="size-4" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							setLink();
						}}
						className="flex gap-2"
					>
						<Input
							placeholder="Enter URL..."
							value={linkUrl}
							onChange={(e) => setLinkUrl(e.target.value)}
							className="flex-1"
						/>
						<Button type="submit" size="sm">
							Set
						</Button>
					</form>
				</PopoverContent>
			</Popover>
			{editor.isActive("link") && (
				<ToolbarButton
					onClick={() => editor.chain().focus().unsetLink().run()}
					title="Remove link"
				>
					<Unlink className="size-4" />
				</ToolbarButton>
			)}

			<ToolbarDivider />

			{/* Undo/Redo */}
			<ToolbarButton
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().undo()}
				title="Undo (⌘Z)"
			>
				<Undo className="size-4" />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editor.can().redo()}
				title="Redo (⌘⇧Z)"
			>
				<Redo className="size-4" />
			</ToolbarButton>
			{!isMobile ? (
				<>
					<ToolbarDivider />
					<EmojiDropdownMenu editor={editor} />
				</>
			) : null}

			<StatusIndicator className="ml-auto" />
		</div>
	);
}
