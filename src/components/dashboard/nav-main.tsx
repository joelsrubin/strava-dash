import { useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Collapsible } from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

export interface NavItem {
	title: string;
	url: string;
	icon?: LucideIcon;
	isActive?: boolean;
	items?: NavItem[];
}

function NavItemComponent({ item }: { item: NavItem }) {
	const navigate = useNavigate();
	const { setOpenMobile } = useSidebar();

	const handleClick = async () => {
		await navigate({ to: item.url });
		setOpenMobile(false);
	};
	return (
		<Collapsible key={item.title} asChild defaultOpen={item.isActive}>
			<SidebarMenuItem>
				<div className="flex items-center w-full">
					<SidebarMenuButton asChild tooltip={item.title}>
						<SidebarMenuButton className="flex-1" onClick={handleClick}>
							{item.icon && <item.icon />}
							<div className="flex justify-between gap-2 w-full">
								<span className="truncate flex-1">{item.title}</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuButton>
				</div>
			</SidebarMenuItem>
		</Collapsible>
	);
}

export function NavMain({ items }: { items: NavItem[] }) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<NavItemComponent key={item.title} item={item} />
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
