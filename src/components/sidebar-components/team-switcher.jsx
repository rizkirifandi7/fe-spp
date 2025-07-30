"use client";

import * as React from "react";
import { Building } from "lucide-react"; // Keep Building icon as a fallback

import {
	DropdownMenu,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar, // Not used in the provided snippet, can be removed if not needed elsewhere
} from "@/components/ui/sidebar";

export function TeamSwitcher() {
	const { isMobile } = useSidebar(); // Removed as it's not used in this specific logic

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
								<Building className="size-4" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">YPIM Daarul Ulum</span>
								<span className="truncate text-xs">Dashboard</span>
							</div>
						</SidebarMenuButton>
					</DropdownMenuTrigger>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
