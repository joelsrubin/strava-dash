import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
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
	onUpdate: (content: string) => void;
}

const Tiptap = ({
	initialContent = "",
	placeholder = "Start writing...",
	onUpdate,
}: TiptapProps) => {
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({
				codeBlock: false, // Disable default code block, we use CodeBlockLowlight instead
			}),
			Emoji.configure({
				emojis: gitHubEmojis,
				enableEmoticons: true,
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
			Typography,
		],

		content: initialContent,
		onUpdate: async ({ editor }) => {
			onUpdate(editor.getHTML());
		},
		onUnmount: async ({ editor }) => {
			onUpdate(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class: "tiptap",
			},
		},
	});

	return (
		<div className="rounded-md border border-border bg-transparent flex flex-col min-h-0 flex-1 overflow-hidden">
			<Toolbar editor={editor} />
			<div className="min-h-0 flex-1 overflow-y-auto">
				<EditorContent editor={editor} />
			</div>
		</div>
	);
};

export default Tiptap;
