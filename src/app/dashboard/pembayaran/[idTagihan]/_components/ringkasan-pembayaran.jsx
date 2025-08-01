// app/dashboard/pembayaran/[idTagihan]/_components/RingkasanPembayaran.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const SummaryRow = ({ label, value }) => (
	<div className="flex justify-between text-sm">
		<span className="text-slate-600 dark:text-emerald-400">{label}</span>
		<span className="font-medium text-slate-800 dark:text-emerald-100">
			{value}
		</span>
	</div>
);

export const RingkasanPembayaran = ({
	totalUnpaid,
	selectedItemsCount,
	selectedTotal,
	paymentAmount,
}) => {
	const formatIDR = (amount) =>
		new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);

	return (
		<Card className="bg-white dark:bg-slate-800 border dark:border-emerald-700">
			<CardHeader>
				<CardTitle>Ringkasan Pembayaran</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<SummaryRow label="Total Belum Lunas" value={formatIDR(totalUnpaid)} />
				<SummaryRow
					label="Item Terpilih"
					value={`${selectedItemsCount} item`}
				/>
				<SummaryRow label="Total Dipilih" value={formatIDR(selectedTotal)} />
				<Separator className="my-2" />
				<div className="flex justify-between text-lg font-semibold">
					<span>Total Bayar:</span>
					<span className="text-emerald-600 dark:text-emerald-400">
						{formatIDR(paymentAmount || 0)}
					</span>
				</div>
			</CardContent>
		</Card>
	);
};
