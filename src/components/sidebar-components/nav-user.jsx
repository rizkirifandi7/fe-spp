"use client";

import { useEffect, useState } from "react"; // Impor useEffect dan useState
import {
	BadgeCheck,
	Bell,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
// Hapus import Cookies from "js-cookie"; jika tidak digunakan lagi di file ini

import { logoutAction } from "@/actions/auth";
import { getCookie } from "@/actions/cookies";
import Cookies from "js-cookie"; // Impor Cookies dari js-cookie
import { jwtDecode } from "jwt-decode";

export function NavUser() {
	const { isMobile } = useSidebar();
	const [user, setUser] = useState({
		id: "",
		name: "User",
		role: "user@example.com",
		avatar: "",
	});

	useEffect(() => {
		const loadUserFromToken = () => {
			try {
				const token = Cookies.get("token");
				if (!token) {
					return;
				}

				// Decode token menggunakan jwt-decode
				const decodedPayload = jwtDecode(token);

				setUser({
					id: decodedPayload.id,
					name: decodedPayload.nama,
					role: decodedPayload.role,
				});
			} catch (error) {
				console.error("Error decoding token:", error);
			}
		};

		loadUserFromToken();
	}, []);

	return (
		<div>
			<DropdownMenu>
				<DropdownMenuTrigger className="w-fit" asChild>
					<SidebarMenuButton
						size="lg"
						className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<Avatar className="h-8 w-8 rounded-lg">
							<AvatarImage src={user.avatar} alt={user.name} />
							<AvatarFallback className="rounded-lg">
								{user.name ? user.name.substring(0, 2).toUpperCase() : "US"}
							</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">{user.name}</span>
							<span className="truncate text-xs">{user.role}</span>
						</div>
						<ChevronsUpDown className="ml-auto size-4" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
					side={"bottom"}
					align="end"
					sideOffset={4}
				>
					<DropdownMenuLabel className="p-0 font-normal">
						<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.avatar} alt={user.name} />
								<AvatarFallback className="rounded-lg">
									{user.name ? user.name.substring(0, 2).toUpperCase() : "US"}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
								<span className="truncate text-xs">{user.role}</span>
							</div>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={logoutAction}>
						<LogOut className="mr-2 h-4 w-4" />{" "}
						{/* Tambahkan margin untuk ikon */}
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
