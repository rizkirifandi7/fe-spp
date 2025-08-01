// app/dashboard/pembayaran/[idTagihan]/_components/FormPembayaran.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CreditCard, Banknote, Wallet } from "lucide-react";

const paymentMethods = [
	{ value: "tunai", label: "Tunai", icon: <Banknote className="h-5 w-5" /> },
	{
		value: "transfer",
		label: "Transfer Bank",
		icon: <Banknote className="h-5 w-5" />,
	},
	{
		value: "e-wallet",
		label: "E-Wallet",
		icon: <Wallet className="h-5 w-5" />,
	},
];

export const FormPembayaran = ({
	formData,
	onInputChange,
	onSubmit,
	isSubmitting,
	selectedItemsCount,
	selectedTotal,
}) => {
	const isFormDisabled = selectedItemsCount === 0;
	const isAmountInvalid = parseFloat(formData.jumlah) <= 0;

	return (
		<Card className="bg-white dark:bg-slate-800 border dark:border-emerald-700">
			<CardHeader>
				<CardTitle>Metode Pembayaran</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">
							Jumlah Pembayaran
						</label>
						<Input
							type="number"
							name="jumlah"
							value={formData.jumlah}
							onChange={onInputChange}
							required
							disabled={isFormDisabled}
						/>
						<p className="text-xs text-emerald-500 mt-1">
							{isFormDisabled
								? "Pilih item tagihan terlebih dahulu"
								: `Anda bisa membayar sebagian (Total terpilih: ${new Intl.NumberFormat(
										"id-ID",
										{
											style: "currency",
											currency: "IDR",
											minimumFractionDigits: 0,
										}
								  ).format(selectedTotal)})`}
						</p>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Metode Pembayaran
						</label>
						<Select
							name="metode_pembayaran"
							value={formData.metode_pembayaran}
							onValueChange={(value) =>
								onInputChange({ target: { name: "metode_pembayaran", value } })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{paymentMethods.map((m) => (
									<SelectItem key={m.value} value={m.value}>
										<div className="flex items-center gap-2">
											{m.icon}
											{m.label}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Catatan (Opsional)
						</label>
						<Textarea
							name="catatan"
							value={formData.catatan}
							onChange={onInputChange}
						/>
					</div>
					<Button
						type="submit"
						disabled={isSubmitting || isFormDisabled || isAmountInvalid}
						className="w-full bg-emerald-600 hover:bg-emerald-700"
					>
						{isSubmitting ? (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						) : (
							<CreditCard className="h-4 w-4 mr-2" />
						)}
						{isSubmitting ? "Memproses..." : "Konfirmasi Pembayaran"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};
