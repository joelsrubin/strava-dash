import { useIsMutating } from "@tanstack/react-query";

import { Spinner } from "../ui/spinner";

type SpinnerProps = React.ComponentProps<typeof Spinner>;

export function StatusIndicator(props: SpinnerProps) {
	const isUpdating = useIsMutating({ mutationKey: ["notes-update"] });
	const isCreating = useIsMutating({ mutationKey: ["notes-create"] });
	const isMutating = isUpdating || isCreating;
	return isMutating ? <Spinner {...props} /> : null;
}
