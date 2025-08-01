// app/dashboard/pembayaran/[idTagihan]/_components/ItemTagihanTable.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export const ItemTagihanTable = ({
	items,
	selectedItems,
	unpaidItemsCount,
	onItemSelect,
	onSelectAll,
}) => {
	return (
		<Card className="bg-white dark:bg-slate-800 border dark:border-emerald-700">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Item Tagihan</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={onSelectAll}
						disabled={unpaidItemsCount === 0}
					>
						{selectedItems.length === unpaidItemsCount && unpaidItemsCount > 0
							? "Batal Pilih"
							: "Pilih Semua"}
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[60px] text-center"></TableHead>
							<TableHead>Deskripsi</TableHead>
							<TableHead className="text-right">Jumlah</TableHead>
							<TableHead className="text-center">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((item) => (
							<TableRow
								key={item.id}
								onClick={() =>
									item.status === "unpaid" && onItemSelect(item.id)
								}
								className={
									item.status === "unpaid"
										? "cursor-pointer hover:bg-slate-50"
										: "opacity-60 cursor-not-allowed"
								}
							>
								<TableCell className="text-center">
									{item.status === "unpaid" ? (
										<div
											className={`mx-auto h-5 w-5 rounded border flex items-center justify-center ${
												selectedItems.includes(item.id)
													? "bg-emerald-500 border-emerald-600"
													: "border-slate-300"
											}`}
										>
											{selectedItems.includes(item.id) && (
												<CheckCircle2 className="h-4 w-4 text-white" />
											)}
										</div>
									) : (
										<div className="mx-auto h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
											<CheckCircle2 className="h-4 w-4 text-emerald-500" />
										</div>
									)}
								</TableCell>
								<TableCell className="font-medium">{item.deskripsi}</TableCell>
								<TableCell className="text-right font-medium">
									{new Intl.NumberFormat("id-ID", {
										style: "currency",
										currency: "IDR",
										minimumFractionDigits: 0,
									}).format(item.jumlah)}
								</TableCell>
								<TableCell className="text-center">
									<Badge
										variant={item.status === "paid" ? "success" : "destructive"}
									>
										{item.status === "paid" ? "Lunas" : "Belum Lunas"}
									</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
};
