import { Spinner } from "../ui/spinner";

type SpinnerProps = React.ComponentProps<typeof Spinner>;

export function StatusIndicator(props: SpinnerProps) {
	return <Spinner {...props} />;
}
