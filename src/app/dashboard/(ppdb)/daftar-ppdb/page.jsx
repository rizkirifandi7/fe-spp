"use client";

import { useState } from "react";
import CardInfoPPDB from "./components/card-info-ppdb";
import TableDaftarPPDB from "./components/table-ppdb";

const PageDaftarPPDB = () => {
	const [refreshKey, setRefreshKey] = useState(0);

	return (
		<div className="flex flex-col gap-4">
			<CardInfoPPDB refreshKey={refreshKey} />
			<TableDaftarPPDB onDataAdded={() => setRefreshKey((prev) => prev + 1)} />
		</div>
	);
};

export default PageDaftarPPDB;
