// app/dashboard/.../_components/CardStatistik.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const CardStatistik = ({ stat }) => {
  return (
    <Card className="bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {stat.title}
        </CardTitle>
        {stat.icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stat.value}</div>
      </CardContent>
    </Card>
  );
};

export default CardStatistik;