import { mergeAttributes, Node } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const Hashtag = Node.create({
	name: "hashtag",
	group: "inline",
	inline: true,
	atom: true, // makes it a single unit, can't place cursor inside

	addAttributes() {
		return {
			tag: {
				default: null,
				parseHTML: (el) => el.getAttribute("data-tag"),
				renderHTML: (attrs) => ({ "data-tag": attrs.tag }),
			},
		};
	},

	parseHTML() {
		return [{ tag: "span[data-hashtag]" }];
	},

	renderHTML({ node, HTMLAttributes }) {
		return [
			"span",
			mergeAttributes(HTMLAttributes, {
				class: "hashtag",
				"data-hashtag": "",
			}),
			`#${node.attrs.tag}`,
		];
	},

	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey("hashtag-input"),
				props: {
					handleTextInput: (view, from, _to, text) => {
						// Only trigger on space after potential hashtag
						if (text !== " ") return false;

						const { state } = view;
						const $from = state.doc.resolve(from);
						const textBefore = $from.parent.textBetween(
							Math.max(0, $from.parentOffset - 50),
							$from.parentOffset,
							null,
							"\ufffc",
						);

						const match = textBefore.match(/#([\w]+)$/);
						if (!match) return false;

						const tag = match[1];
						const start = from - match[0].length;

						const tr = state.tr
							.delete(start, from)
							.insert(start, this.type.create({ tag }))
							.insertText(" ");

						view.dispatch(tr);
						return true;
					},
				},
			}),
		];
	},
});
