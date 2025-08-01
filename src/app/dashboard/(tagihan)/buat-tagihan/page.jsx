// app/dashboard/buat-tagihan/page.jsx

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import BuatTagihanClient from "./_components/buat-tagihan";

// Buat skeleton di sini sebagai fallback
function PageSkeleton() {
	return (
		<div className="container mx-auto py-12 px-4 md:px-6 space-y-6">
			<Skeleton className="h-10 w-3/4 md:w-1/2" />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<Skeleton className="h-12 w-full rounded-lg" />
				<Skeleton className="h-12 w-full rounded-lg" />
			</div>
			<Skeleton className="h-12 w-1/3 md:w-1/4 rounded-lg" />
			<Skeleton className="h-72 w-full rounded-xl" />
		</div>
	);
}

export default function CreateTagihanPage() {
	return (
		<Suspense fallback={<PageSkeleton />}>
			<BuatTagihanClient />
		</Suspense>
	);
}
