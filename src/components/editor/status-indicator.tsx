import { useIsMutating } from "@tanstack/react-query";

import { Spinner } from "../ui/spinner";

type SpinnerProps = React.ComponentProps<typeof Spinner>;

export function StatusIndicator(props: SpinnerProps) {
	const isMutating = useIsMutating({ mutationKey: ["notes"] });
	return isMutating ? <Spinner {...props} /> : null;
}
