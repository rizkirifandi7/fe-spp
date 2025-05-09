"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { NavUser } from "./nav-user";

const HeaderSidebar = () => {
	const pathname = usePathname();

	// Generate breadcrumbs from pathname
	const generateBreadcrumbs = () => {
		const paths = pathname.split("/").filter((path) => path !== "");

		if (paths.length === 0) return [{ name: "Home", path: "/" }];

		return [
			...paths.map((path, index) => {
				const formattedPath =
					path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
				const url = `/${paths.slice(0, index + 1).join("/")}`;
				return { name: formattedPath, path: url };
			}),
		];
	};

	const breadcrumbs = generateBreadcrumbs();

	return (
		<header className="flex justify-between w-full h-16 border-b shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
			<div className="flex justify-between items-center gap-2 px-4 w-full">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 h-4" />
				<div className="flex justify-between items-center w-full">
					<Breadcrumb>
						<BreadcrumbList>
							{breadcrumbs.map((breadcrumb, index) => (
								<React.Fragment key={breadcrumb.path}>
									{index < breadcrumbs.length - 1 ? (
										<BreadcrumbItem className="hidden md:block">
											<BreadcrumbLink asChild>
												<Link href={"#"}>{breadcrumb.name}</Link>
											</BreadcrumbLink>
										</BreadcrumbItem>
									) : (
										<BreadcrumbItem>
											<BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
										</BreadcrumbItem>
									)}
									{index < breadcrumbs.length - 1 && (
										<BreadcrumbSeparator className="hidden md:block" />
									)}
								</React.Fragment>
							))}
						</BreadcrumbList>
					</Breadcrumb>
					<NavUser />
				</div>
			</div>
		</header>
	);
};

export default HeaderSidebar;
