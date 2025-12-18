import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { Hashtag } from "./extensions/hashtag";
import { Toolbar } from "./toolbar";

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

interface TiptapProps {
	initialContent?: string;
	placeholder?: string;
	onChange?: (content: string) => void;
}

const Tiptap = ({
	initialContent = "",
	placeholder = "Start writing...",
	onChange,
}: TiptapProps) => {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				codeBlock: false, // Disable default code block, we use CodeBlockLowlight instead
			}),
			Link.configure({
				openOnClick: false, // Don't open links on click in editor
				HTMLAttributes: {
					rel: "noopener noreferrer",
					target: "_blank",
				},
			}),
			Placeholder.configure({
				placeholder,
			}),
			CodeBlockLowlight.configure({
				lowlight,
			}),
			Hashtag,
		],
		content: initialContent,
		onUpdate: ({ editor }) => {
			onChange?.(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class: "tiptap",
			},
		},
	});

	return (
		<div className="overflow-scroll rounded-md border border-border bg-transparent focus-within:ring-1 focus-within:ring-ring h-full">
			<Toolbar editor={editor} />
			<EditorContent editor={editor} />
		</div>
	);
};

export default Tiptap;
