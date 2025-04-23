"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({ items }) {
	const pathname = usePathname();

	// Helper function to check if an item is active
	const isItemActive = (itemUrl) => {
		return pathname === itemUrl || pathname.startsWith(itemUrl + "/");
	};

	// Helper function to check if any submenu item is active
	const hasActiveSubItem = (subItems) => {
		if (!subItems) return false;
		return subItems.some((subItem) => isItemActive(subItem.url));
	};

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu className={"gap-y-2"}>
				{items.map((item) => {
					// Check if the item has submenu items
					const hasSubItems = item.items && item.items.length > 0;
					// Check if this item or any of its children is active
					const isActive =
						isItemActive(item.url) || hasActiveSubItem(item.items);

					// If no submenu items, render a simple link
					if (!hasSubItems) {
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									asChild
									isActive={isActive}
									tooltip={item.title}
								>
									<a href={item.url}>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					}

					// If has submenu items, render a collapsible
					return (
						<Collapsible
							key={item.title}
							asChild
							defaultOpen={isActive}
							className="group/collapsible"
						>
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton tooltip={item.title} isActive={isActive}>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
										<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{item.items.map((subItem) => (
											<SidebarMenuSubItem key={subItem.title}>
												<SidebarMenuSubButton
													asChild
													isActive={isItemActive(subItem.url)}
												>
													<a href={subItem.url}>
														<span>{subItem.title}</span>
													</a>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										))}
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
