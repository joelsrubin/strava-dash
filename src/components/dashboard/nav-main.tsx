"use client";

import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/components/ui/sidebar";

export interface NavItem {
	title: string;
	url: string;
	icon?: LucideIcon;
	isActive?: boolean;
	items?: NavItem[];
}

function NavItemComponent({
	item,
	level = 0,
}: {
	item: NavItem;
	level?: number;
}) {
	const hasChildren = item.items && item.items.length > 0;
	const isTopLevel = level === 0;

	const Wrapper = isTopLevel ? SidebarMenuItem : SidebarMenuSubItem;
	const Button = isTopLevel ? SidebarMenuButton : SidebarMenuSubButton;
	const { setOpenMobile } = useSidebar();
	return (
		<Collapsible key={item.title} asChild defaultOpen={item.isActive}>
			<Wrapper>
				<div className="flex items-center w-full">
					<Button
						asChild
						tooltip={item.title}
						onClick={() => setTimeout(() => setOpenMobile(false), 100)}
					>
						<Link to={item.url} className="flex-1" preload="intent">
							{item.icon && <item.icon />}
							<span>{item.title}</span>
						</Link>
					</Button>
					{hasChildren && (
						<CollapsibleTrigger asChild>
							<SidebarMenuAction className="data-[state=open]:rotate-90">
								<ChevronRight />
								<span className="sr-only">Toggle</span>
							</SidebarMenuAction>
						</CollapsibleTrigger>
					)}
				</div>

				{hasChildren && (
					<CollapsibleContent>
						<SidebarMenuSub>
							{item.items?.map((child) => (
								<NavItemComponent
									key={`${item.title}-${child.title}`}
									item={child}
									level={level + 1}
								/>
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				)}
			</Wrapper>
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
