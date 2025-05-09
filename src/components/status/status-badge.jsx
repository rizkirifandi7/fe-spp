import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

export const StatusBadge = ({ status }) => {
	switch (status) {
		case "paid":
			return (
				<Badge className="bg-green-100 text-slate-800 dark:bg-green-700 dark:text-green-50">
					<CheckCircle2 className="h-4 w-4 mr-1" />
					Lunas
				</Badge>
			);
		case "pending" || status === "partial":
			return (
				<Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-50">
					<Clock className="h-4 w-4 mr-1" />
					Menunggu
				</Badge>
			);
		default:
			return (
				<Badge className="bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-50">
					<AlertCircle className="h-4 w-4 mr-1" />
					Belum Lunas
				</Badge>
			);
	}
};
