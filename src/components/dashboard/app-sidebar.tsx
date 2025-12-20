import { Clock, Notebook, SquareTerminal } from "lucide-react";

import { NavMain } from "@/components/dashboard/nav-main";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
} from "@/components/ui/sidebar";

const data = {
	navMain: [
		{
			title: "Profile",
			url: "#",
			icon: SquareTerminal,
			isActive: true,
			items: [
				{
					title: "Activities",
					url: "/dashboard/main",
					icon: Clock,
				},
				{
					title: "Notes",
					url: "/dashboard/notes",
					icon: Notebook,
				},
			],
		},
	],
};

export function AppSidebar({
	user,
	...props
}: React.ComponentProps<typeof Sidebar> & { user: TAthlete }) {
	return (
		<Sidebar
			className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
			{...props}
		>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<div className="flex items-center justify-center">
					<img
						className="w-40 pb-2"
						src="/powered-by-strava.png"
						alt="Powered by Strava"
					/>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
