import type { Editor } from "@tiptap/react";
import { SmileIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmojiDropdownMenuProps {
	editor: Editor | null;
}

const EMOJI_CATEGORIES = {
	Smileys: [
		"😀",
		"😃",
		"😄",
		"😁",
		"😅",
		"😂",
		"🤣",
		"😊",
		"😇",
		"🙂",
		"🙃",
		"😉",
		"😌",
		"😍",
		"🥰",
		"😘",
	],
	Gestures: [
		"👍",
		"👎",
		"👌",
		"✌️",
		"🤞",
		"🤟",
		"🤘",
		"🤙",
		"👈",
		"👉",
		"👆",
		"👇",
		"☝️",
		"✋",
		"🤚",
		"🖐️",
	],
	Hearts: [
		"❤️",
		"🧡",
		"💛",
		"💚",
		"💙",
		"💜",
		"🖤",
		"🤍",
		"🤎",
		"💔",
		"❣️",
		"💕",
		"💞",
		"💓",
		"💗",
		"💖",
	],
	Objects: [
		"⭐",
		"✨",
		"💫",
		"🔥",
		"💯",
		"✅",
		"❌",
		"⚡",
		"💡",
		"🎉",
		"🎊",
		"🎈",
		"🎁",
		"🏆",
		"🥇",
		"🎯",
	],
};

export function EmojiDropdownMenu({ editor }: EmojiDropdownMenuProps) {
	const [open, setOpen] = useState(false);

	const insertEmoji = (emoji: string) => {
		if (!editor) return;

		editor.chain().focus().insertContent(emoji).run();

		setOpen(false);
	};

	if (!editor) {
		return null;
	}

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
					<SmileIcon className="h-4 w-4" />
					<span className="sr-only">Insert emoji</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-72 max-h-96 overflow-y-auto"
			>
				{Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
					<div key={category} className="px-2 py-1.5">
						<div className="text-xs font-semibold text-muted-foreground mb-1.5">
							{category}
						</div>
						<div className="grid grid-cols-8 gap-1">
							{emojis.map((emoji) => (
								<DropdownMenuItem
									key={emoji}
									className="h-8 w-8 p-0 flex items-center justify-center cursor-pointer hover:bg-accent rounded-sm"
									onSelect={() => insertEmoji(emoji)}
								>
									<span className="text-lg">{emoji}</span>
								</DropdownMenuItem>
							))}
						</div>
					</div>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
