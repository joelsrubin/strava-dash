import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/theme";

export function Providers({
	children,
}: {
	children: React.ReactNode;
	stravaId?: number;
}) {
	return (
		<ThemeProvider>
			{children}
			<Toaster position="top-center" />
		</ThemeProvider>
	);
}
