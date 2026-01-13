import { Link } from "@tanstack/react-router";

import { NavUser } from "./nav-user";

export function SiteHeader({ user }: { user: TAthlete }) {
	return (
		<header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
			<div className="flex h-(--header-height) w-full items-center gap-2 px-4">
				<div className="flex items-center gap-2">
					<Link
						to="/dashboard"
						search={(prev) => ({
							tab: prev.tab,
						})}
						className="flex items-center gap-2"
					>
						<span className="w-32">not so fast</span>
					</Link>
				</div>
				<div className="w-full sm:ml-auto sm:w-auto" />
				<div className="ml-2">
					<NavUser user={user} />
				</div>
			</div>
		</header>
	);
}
