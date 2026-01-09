import { Notebook, Send, SquareTerminal } from "lucide-react";
import { useEffect, useState } from "react";

import { NavMain } from "@/components/dashboard/nav-main";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
} from "@/components/ui/sidebar";

import { useTheme } from "@/lib/theme";
import { NavSecondary } from "./nav-secondary";

// array of all hte months

export function AppSidebar({
	user,

	...props
}: React.ComponentProps<typeof Sidebar> & { user: TAthlete }) {
	const { theme } = useTheme();

	const [imgUrl, setImgUrl] = useState("/powered-by-strava-light.png");
	useEffect(() => {
		setImgUrl(
			theme === "light"
				? "/powered-by-strava-light.png"
				: "/powered-by-strava.png",
		);
	}, [theme]);

	const items = [
		{
			title: "Activities",
			url: "/dashboard",
			icon: SquareTerminal,
		},
		{
			title: "Notes",
			url: "/dashboard/notes",
			icon: Notebook,
		},
	];

	return (
		<Sidebar
			className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
			{...props}
		>
			<SidebarContent>
				<NavMain items={items} />
				<NavSecondary
					className="mt-auto"
					items={[
						{
							title: "Feedback",
							url: "mailto:hello@notsofast.run",
							icon: Send,
						},
					]}
				/>
			</SidebarContent>
			<SidebarFooter>
				<div className="flex items-center justify-center">
					<img className="w-40 pb-2" src={imgUrl} alt="Powered by Strava" />
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
