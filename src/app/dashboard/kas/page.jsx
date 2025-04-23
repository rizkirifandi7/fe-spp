"use client";
import React, { useState } from "react";
import CardInfoKas from "./components/card-info-kas";
import TableKas from "./components/table-view-kas";

const PageKas = () => {
	const [refreshKey, setRefreshKey] = useState(0);

	return (
		<div>
			<div className="flex flex-col gap-4 w-full">
				<CardInfoKas refreshKey={refreshKey} />
				<TableKas onDataAdded={() => setRefreshKey((prev) => prev + 1)} />
			</div>
		</div>
	);
};

export default PageKas;
