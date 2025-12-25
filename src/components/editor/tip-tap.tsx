import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Hashtag } from "./extensions/hashtag";
import { Toolbar } from "./toolbar";

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

interface TiptapProps {
	initialContent?: string;
	placeholder?: string;
	onChange?: (content: string) => void;
	onSave?: (content: string) => void;
	isPending?: boolean;
	isMobile?: boolean;
}

const Tiptap = ({
	initialContent = "",
	placeholder = "Start writing...",
	onChange,
	onSave,
	isPending,
	isMobile,
}: TiptapProps) => {
	const editor = useEditor({
		immediatelyRender: false,
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
		<>
			<div
				className={`rounded-md border border-border bg-transparent flex flex-col ${isMobile ? "min-h-0 flex-1 overflow-hidden" : "h-full overflow-scroll"}`}
			>
				<Toolbar editor={editor} />
				<div className={isMobile ? "min-h-0 flex-1 overflow-y-auto" : ""}>
					<EditorContent editor={editor} />
				</div>
			</div>
			<Button
				className="w-[80%] self-center my-2"
				onClick={() => onSave?.(editor?.getHTML() || "")}
			>
				{isPending ? <Spinner /> : null}
				Save
			</Button>
		</>
	);
};

export default Tiptap;
