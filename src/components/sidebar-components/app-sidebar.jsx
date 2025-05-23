"use client";

import * as React from "react";
import { TeamSwitcher } from "@/components/sidebar-components/team-switcher";
import { NavMain } from "@/components/sidebar-components/nav-main";
import { NavUser } from "@/components/sidebar-components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { dataNavLink } from "@/constant/navLinkData";
import Cookies from "js-cookie";

export function AppSidebar({ ...props }) {
	// Gunakan state untuk menyimpan role user
	const [userRole, setUserRole] = React.useState(null);

	React.useEffect(() => {
		try {
			const userToken = Cookies.get("token");
			if (userToken) {
				// Decode token dengan error handling
				const payload = userToken.split(".")[1];
				const decoded = JSON.parse(atob(payload));
				setUserRole(decoded?.role || null);
			}
		} catch (error) {
			console.error("Error decoding token:", error);
			setUserRole(null);
		}
	}, []);

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={dataNavLink.teams} />
			</SidebarHeader>
			<SidebarContent>
				{userRole === "admin" ? (
					<NavMain items={dataNavLink.navMain} />
				) : (
					<NavMain items={dataNavLink.navSiswaMain} />
				)}
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
