import { AppSidebar } from "@/components/sidebar-components/app-sidebar";
import HeaderSidebar from "@/components/sidebar-components/header-sidebar";

import { Toaster } from "sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import React from "react";

const DashboardLayout = ({ children }) => {
	return (
		<SidebarProvider>
			<Toaster />
			<AppSidebar />
			<SidebarInset>
				<HeaderSidebar />
				<div className="p-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default DashboardLayout;
