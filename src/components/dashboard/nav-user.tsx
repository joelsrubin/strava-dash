import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronsUpDown, LogOut, Mail, Monitor, Moon, Sun } from "lucide-react";
import { clearStravaSession } from "@/api/auth.server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/lib/theme";

export function NavUser({ user }: { user: TAthlete }) {
	const clearStravaSessionFn = useServerFn(clearStravaSession);
	const navigate = useNavigate();
	const { theme, setTheme } = useTheme();
	const handleLogout = async () => {
		await clearStravaSessionFn();
		navigate({ to: "/" });
	};
	const { isMobile } = useIsMobile();
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground z-1000"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.profile_medium} alt={user.firstname} />
								<AvatarFallback className="rounded-lg">
									{user.firstname.charAt(0)}
									{user.lastname.charAt(0)}
								</AvatarFallback>
							</Avatar>
							{!isMobile && (
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{user.firstname} {user.lastname}
									</span>
								</div>
							)}
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side="bottom"
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal"></DropdownMenuLabel>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								{theme === "dark" ? (
									<Moon className="size-4" />
								) : theme === "light" ? (
									<Sun className="size-4" />
								) : (
									<Monitor className="size-4" />
								)}
								Theme
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								<DropdownMenuItem onClick={() => setTheme("light")}>
									<Sun className="size-4" />
									Light
									{theme === "light" && (
										<span className="ml-auto text-xs text-muted-foreground">
											✓
										</span>
									)}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("dark")}>
									<Moon className="size-4" />
									Dark
									{theme === "dark" && (
										<span className="ml-auto text-xs text-muted-foreground">
											✓
										</span>
									)}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("system")}>
									<Monitor className="size-4" />
									System
									{theme === "system" && (
										<span className="ml-auto text-xs text-muted-foreground">
											✓
										</span>
									)}
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuSeparator />
						<a href="mailto:hello@notsofast.run" target="_blank" rel="noopener">
							<DropdownMenuItem>
								<Mail className="mr-2 h-4 w-4" />
								Support
							</DropdownMenuItem>
						</a>
						<DropdownMenuItem onClick={handleLogout}>
							<LogOut className="mr-2 h-4 w-4" />
							<span>Log out</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
