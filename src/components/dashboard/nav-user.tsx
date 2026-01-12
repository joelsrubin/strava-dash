import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronsUpDown, LogOut, Monitor, Moon, Send, Sun } from "lucide-react";
import { clearStravaSession } from "@/api/auth.server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useTheme } from "@/lib/theme";
import { useUnitOfMeasurement } from "@/lib/user-preferences";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export function NavUser({ user }: { user: TAthlete }) {
	const clearStravaSessionFn = useServerFn(clearStravaSession);
	const navigate = useNavigate();
	const { theme, setTheme } = useTheme();
	const { unitOfMeasurement, setUnitOfMeasurement } = useUnitOfMeasurement();
	const handleLogout = async () => {
		await clearStravaSessionFn();
		navigate({ to: "/" });
	};

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
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

					<div className="hidden sm:grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-medium">
							{user.firstname} {user.lastname}
						</span>
					</div>

					<ChevronsUpDown className="ml-auto size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
				side="bottom"
				align="end"
				sideOffset={4}
			>
				<DropdownMenuLabel className="p-0 font-normal"></DropdownMenuLabel>
				<DropdownMenuSeparator />

				<DropdownMenuLabel>Preferences</DropdownMenuLabel>
				<div className="flex flex-col gap-3 p-2">
					<div className="flex flex-row justify-between items-center">
						<span className="text-xs text-accent-foreground">Theme</span>
						<Tabs
							defaultValue={theme}
							onValueChange={(value) =>
								setTheme(value as "light" | "dark" | "system")
							}
						>
							<TabsList className="rounded-xl transition-all duration-200 ease-in-out">
								<TabsTrigger
									className="rounded-full transition-all duration-200 ease-in-out data-[state=active]:scale-105 data-[state=active]:shadow-sm"
									value="light"
								>
									<Sun className="h-3 w-3" />
								</TabsTrigger>
								<TabsTrigger
									className="rounded-full transition-all duration-200 ease-in-out data-[state=active]:scale-105 data-[state=active]:shadow-sm"
									value="dark"
								>
									<Moon className="h-3 w-3" />
								</TabsTrigger>
								<TabsTrigger
									className="rounded-full transition-all duration-200 ease-in-out data-[state=active]:scale-105 data-[state=active]:shadow-sm"
									value="system"
								>
									<Monitor className="h-3 w-3" />
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
					<div className="flex flex-row justify-between items-center">
						<span className="text-xs text-accent-foreground">
							Unit of measurement
						</span>
						<Tabs
							value={unitOfMeasurement}
							onValueChange={(value) =>
								setUnitOfMeasurement(value as "miles" | "kilometers")
							}
						>
							<TabsList className="rounded-xl transition-all duration-200 ease-in-out">
								<TabsTrigger
									className="rounded-full transition-all duration-200 ease-in-out data-[state=active]:scale-105 data-[state=active]:shadow-sm"
									value="miles"
								>
									mi
								</TabsTrigger>
								<TabsTrigger
									className="rounded-full transition-all duration-200 ease-in-out data-[state=active]:scale-105 data-[state=active]:shadow-sm"
									value="kilometers"
								>
									km
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<a
						className="flex items-center gap-2"
						href="mailto:hello@notsofast.run"
					>
						<Send className="mr-2 h-4 w-4" />
						<span>Feedback</span>
					</a>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleLogout}>
					<LogOut className="mr-2 h-4 w-4" />
					<span>Log out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
