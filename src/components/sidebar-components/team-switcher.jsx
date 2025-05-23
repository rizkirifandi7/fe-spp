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
	// useSidebar, // Not used in the provided snippet, can be removed if not needed elsewhere
} from "@/components/ui/sidebar";

export function TeamSwitcher() {
	// const { isMobile } = useSidebar(); // Removed as it's not used in this specific logic
	const [allTeams, setAllTeams] = React.useState([]);
	const [activeTeam, setActiveTeam] = React.useState(null);
	const [isLoading, setIsLoading] = React.useState(true); // Added loading state

	React.useEffect(() => {
		const fetchTeams = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/sekolah`
				); // Use environment variable for API URL
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const result = await response.json();
				if (result.data && Array.isArray(result.data)) {
					const transformedTeams = result.data.map((school) => ({
						id: school.id,
						name: school.nama_sekolah,
						logoUrl: school.gambar, // Store the image URL
					}));
					setAllTeams(transformedTeams);
					if (transformedTeams.length > 0) {
						setActiveTeam(transformedTeams[0]);
					} else {
						setActiveTeam(null); // No teams found
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
			} finally {
				setIsLoading(false);
			}
		};

		fetchTeams();
	}, []);

	if (isLoading) {
		// Optional: Render a placeholder or skeleton loader
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						size="lg"
						className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground animate-pulse"
					>
						<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-300"></div>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold h-4 bg-gray-300 rounded w-3/4"></span>
							<span className="truncate text-xs h-3 bg-gray-300 rounded w-1/2 mt-1"></span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	if (!activeTeam) {
		// Handle case where no active team is set (e.g., no data fetched)
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						size="lg"
						className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
							<Building className="size-4" />
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">No School Data</span>
							<span className="truncate text-xs">Unavailable</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

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
								{activeTeam.logoUrl ? (
									<img
										src={activeTeam.logoUrl}
										alt={`${activeTeam.name} logo`}
										className="size-full object-cover"
									/>
								) : (
									<Building className="size-4" />
								)}
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{activeTeam.name}
								</span>
								<span className="truncate text-xs">Dashboard</span>
							</div>
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					{/* You can add DropdownMenuContent here if needed */}
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
