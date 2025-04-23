import React from "react";
import BerandaDashboard from "./components/broadcast-form";
import { Card } from "@/components/ui/card";

const MainPage = () => {
	return (
		<div className="">
			<h2 className="text-xl font-semibold">Broadcast</h2>
			<Card className={"mt-4 p-4 bg-white shadow-md rounded-lg"}>
				<BerandaDashboard />
			</Card>
		</div>
	);
};

export default MainPage;
