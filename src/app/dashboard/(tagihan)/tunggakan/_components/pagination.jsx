// src/components/ui/Pagination.jsx
import { Button } from "@/components/ui/button";

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	if (totalPages <= 1) return null;

	const handlePrev = () => {
		onPageChange(currentPage - 1);
	};

	const handleNext = () => {
		onPageChange(currentPage + 1);
	};

	return (
		<div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
			<Button
				variant="outline"
				size="sm"
				onClick={handlePrev}
				disabled={currentPage === 1}
			>
				Sebelumnya
			</Button>
			<span className="text-sm text-slate-700 dark:text-slate-300">
				Halaman {currentPage} dari {totalPages}
			</span>
			<Button
				variant="outline"
				size="sm"
				onClick={handleNext}
				disabled={currentPage === totalPages}
			>
				Berikutnya
			</Button>
		</div>
	);
};
