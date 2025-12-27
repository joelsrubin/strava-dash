export function Container({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm mx-auto">{children}</div>
		</div>
	);
}
