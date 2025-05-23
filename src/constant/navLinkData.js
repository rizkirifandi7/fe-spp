import {
	AudioWaveform,
	Database,
	Users,
	Command,
	House,
	GalleryVerticalEnd,
	Settings2,
	Wallet,
	Mail,
	Dot,
	HandCoins,
	Book,
	BellDot,
	Banknote,
	FileCog,
} from "lucide-react";

export const dataNavLink = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Acme Inc",
			logo: GalleryVerticalEnd,
			plan: "Enterprise",
		},
		{
			name: "Acme Corp.",
			logo: AudioWaveform,
			plan: "Startup",
		},
		{
			name: "Evil Corp.",
			logo: Command,
			plan: "Free",
		},
	],
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard/home",
			icon: House,
		},
		{
			title: "PPDB",
			url: "#",
			icon: Users,
			items: [
				{
					title: "Daftar Siswa",
					url: "/dashboard/daftar-ppdb",
					icon: Dot,
				},
				{
					title: "Setting PPDB",
					url: "/dashboard/setting-ppdb",
					icon: Dot,
				},
			],
		},
		{
			title: "Broadcast",
			url: "/dashboard/broadcast",
			icon: Mail,
		},
		{
			title: "Kas",
			url: "/dashboard/kas",
			icon: Wallet,
		},
		{
			title: "Pembayaran",
			url: "/dashboard/pembayaran",
			icon: HandCoins,
		},
		// {
		// 	title: "Laporan",
		// 	url: "/dashboard/laporan",
		// 	icon: Book,
		// },
		{
			title: "Tagihan",
			url: "#",
			icon: Banknote,
			items: [
				{
					title: "Tunggakan",
					url: "/dashboard/tunggakan",
				},
				{
					title: "Buat Tagihan",
					url: "/dashboard/buat-tagihan",
				},
			],
		},
		{
			title: "Master Data",
			url: "#",
			icon: Database,
			items: [
				{
					title: "Admin",
					url: "/dashboard/admin",
				},
				{
					title: "Siswa",
					url: "/dashboard/siswa",
				},
				{
					title: "Kelas",
					url: "/dashboard/kelas",
				},
				{
					title: "Unit",
					url: "/dashboard/unit",
				},
				{
					title: "Jurusan",
					url: "/dashboard/jurusan",
				},
			],
		},

		{
			title: "Settings",
			url: "#",
			icon: Settings2,
			items: [
				{
					title: "Aplikasi",
					url: "/dashboard/aplikasi",
				},
			],
		},
	],
	navSiswaMain: [
		{
			title: "Dashboard",
			url: "/dashboard-siswa/home",
			icon: House,
		},
		{
			title: "Tagihan",
			url: "/dashboard-siswa/tagihan",
			icon: HandCoins,
		},
		{
			title: "Profil",
			url: "/dashboard-siswa/profil",
			icon: Users,
		},
	],
};
