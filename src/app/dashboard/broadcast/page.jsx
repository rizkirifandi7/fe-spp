import React from "react";
import BerandaDashboard from "./_components/broadcast-form";
import { Card } from "@/components/ui/card";

const MainPage = () => {
	return (
		<div className="p-6 md:p-8">
			<Card className={"mt-4 p-4 bg-white shadow-md rounded-lg"}>
				<BerandaDashboard />
			</Card>
		</div>
	);
};

export default MainPage;
