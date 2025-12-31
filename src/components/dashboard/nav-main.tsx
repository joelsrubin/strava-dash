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
} from "@/components/ui/sidebar";
import { Badge } from "../ui/badge";

export interface NavItem {
	title: string;
	url: string;
	icon?: LucideIcon;
	isActive?: boolean;
	items?: NavItem[];
	count?: number;
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

	return (
		<Collapsible key={item.title} asChild defaultOpen={item.isActive}>
			<Wrapper>
				<div className="flex items-center w-full">
					<Button asChild tooltip={item.title}>
						<Link to={item.url} className="flex-1" preload="intent">
							{item.icon && <item.icon />}
							<div className="flex justify-between gap-2 w-full">
								<span className="truncate flex-1">{item.title}</span>
								{item.count !== undefined && (
									<Badge
										variant="secondary"
										className="h-2 w-2 rounded-full p-2 tabular-nums"
									>
										{item.count}
									</Badge>
								)}
							</div>
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
