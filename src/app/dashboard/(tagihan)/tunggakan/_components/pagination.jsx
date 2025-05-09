import { Button } from "@/components/ui/button";

export const Pagination = ({ currentPage, totalPages, onPrev, onNext }) => (
	<div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-green-900/50">
		<Button
			variant="outline"
			size="sm"
			onClick={onPrev}
			disabled={currentPage === 1}
			className="text-slate-800 dark:text-green-400 border-slate-200 dark:border-green-800 hover:bg-white dark:hover:bg-green-900/30"
		>
			Sebelumnya
		</Button>
		<span className="text-sm text-slate-700 dark:text-slate-300">
			Halaman {currentPage} dari {totalPages}
		</span>
		<Button
			variant="outline"
			size="sm"
			onClick={onNext}
			disabled={currentPage === totalPages}
			className="text-slate-800 dark:text-green-400 border-slate-200 dark:border-green-800 hover:bg-white dark:hover:bg-green-900/30"
		>
			Berikutnya
		</Button>
	</div>
);
