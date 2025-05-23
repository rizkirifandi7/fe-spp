"use client";
import React, { useState } from "react";
import CardInfoKas from "./_components/card-info-kas";
import TableKas from "./_components/table-view-kas";

const PageKas = () => {
	const [refreshKey, setRefreshKey] = useState(0);

	const handleDataChange = () => {
		setRefreshKey((prev) => prev + 1);
	};

	return (
		<div className="space-y-6">
			<CardInfoKas refreshKey={refreshKey} />
			<TableKas onDataChanged={handleDataChange} />
		</div>
	);
};

export default PageKas;
