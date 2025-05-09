"use client";

import * as React from "react";
import { Building } from "lucide-react"; // Added Building icon

import {
	DropdownMenu,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

export function TeamSwitcher() {
	// Removed teams prop
	const { isMobile } = useSidebar();
	const [allTeams, setAllTeams] = React.useState([]);
	const [activeTeam, setActiveTeam] = React.useState(null); // Initialize as null

	React.useEffect(() => {
		const fetchTeams = async () => {
			try {
				const response = await fetch("http://localhost:8010/sekolah");
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const result = await response.json();
				if (result.data && Array.isArray(result.data)) {
					const transformedTeams = result.data.map((school) => ({
						id: school.id,
						name: school.nama_sekolah,
						logo: Building,
					}));
					setAllTeams(transformedTeams);
					if (transformedTeams.length > 0) {
						setActiveTeam(transformedTeams[0]);
					} else {
						setActiveTeam(null);
					}
				} else {
					console.warn(
						"No team data found or data is not an array:",
						result.message
					);
					setAllTeams([]);
					setActiveTeam(null);
				}
			} catch (error) {
				console.error("Failed to fetch teams:", error);
				setAllTeams([]);
				setActiveTeam(null);
			}
		};

		fetchTeams();
	}, []); // Empty dependency array to run once on mount

	if (!activeTeam) {
		// Optionally, return a loading indicator or null
		return null;
		// return <p>Loading teams...</p>;
	}

	const ActiveTeamLogo = activeTeam.logo; // Get the logo component

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<ActiveTeamLogo className="size-4" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{activeTeam.name}
								</span>
								<span className="truncate text-xs">Dashboard</span>
							</div>
						</SidebarMenuButton>
					</DropdownMenuTrigger>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
