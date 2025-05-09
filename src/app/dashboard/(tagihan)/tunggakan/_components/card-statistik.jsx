import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const CardStatistik = (
	{ stat, i } // Destructure the props to get stat and i directly
) => {
	return (
		<Card
			key={i}
			className="bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-lg transition-shadow duration-300"
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">
					{stat.title}
				</CardTitle>
				{stat.icon}
			</CardHeader>
			<CardContent>
				<div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
				<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
					{stat.desc}
				</p>
			</CardContent>
		</Card>
	);
};

export default CardStatistik;
