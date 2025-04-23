"use client";

import * as React from "react";

import { TeamSwitcher } from "@/components/sidebar-components/team-switcher";
import { NavMain } from "@/components/sidebar-components/nav-main";
import { NavUser } from "@/components/sidebar-components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { dataNavLink } from "@/constant/navLinkData";

export function AppSidebar({ ...props }) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={dataNavLink.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={dataNavLink.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={dataNavLink.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
