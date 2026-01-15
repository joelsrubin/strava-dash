import { cn } from "@/lib/utils";

export function Container({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex h-full w-full items-center justify-center p-6 md:p-10",
				className,
			)}
		>
			<div className="w-full max-w-sm mx-auto">{children}</div>
		</div>
	);
}
