"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import Link from "next/link";
import { NumberInputWithFormat } from "./idr-input";
import { DatePicker } from "./date-input";
import { cn } from "@/lib/utils";
import { PhoneInput } from "./phone-input";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const GenericFormDialog = ({
	layoutType = "vertical",
	dialogClassName = "",
	formClassName = "",
	triggerText,
	dialogTitle,
	dialogDescription,
	formSchema,
	defaultValues,
	fields,
	onSubmit,
	onSuccess,
	triggerVariant = "default",
	triggerIcon: TriggerIconProp, // Ubah nama prop agar tidak konflik
	triggerButton,
	triggerButtonProps = {},
	onDataAdded, // Tetap ada jika digunakan
	submitButtonText = "Submit", // Tambahkan prop untuk teks tombol submit
}) => {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false); // State untuk loading submit

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	// Reset form ketika dialog ditutup atau defaultValues berubah
	useEffect(() => {
		if (!open) {
			form.reset(defaultValues);
		}
	}, [open, defaultValues, form]);

	const handleSubmitWrapper = async (values) => {
		setIsSubmitting(true);
		try {
			await onSubmit(values);
			toast.success("Data berhasil disimpan!");
			form.reset();
			setOpen(false);
			if (onSuccess) onSuccess(); // Pastikan onSuccess dipanggil
			if (onDataAdded) onDataAdded();
		} catch (error) {
			console.error("Error submitting form:", error);
			toast.error(error.message || "Gagal menyimpan data. Silakan coba lagi.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderFormControl = (field, renderFieldProps) => {
		const commonInputClass =
			"bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-emerald-500 focus:border-emerald-500 dark:text-slate-100 rounded-lg shadow-sm";
		switch (field.fieldType || "input") {
			case "select":
				return (
					<Select
						onValueChange={renderFieldProps.onChange}
						value={renderFieldProps.value || ""}
						defaultValue={renderFieldProps.value} // Tetap gunakan defaultValue untuk Select dari Shadcn
						disabled={field.disabled}
					>
						<FormControl>
							<SelectTrigger
								className={cn(
									"w-full",
									commonInputClass,
									field.disabled && "opacity-70 cursor-not-allowed"
								)}
							>
								<SelectValue
									placeholder={field.placeholder || "Pilih opsi..."}
								/>
							</SelectTrigger>
						</FormControl>
						<SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
							{field.options?.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value.toString()}
									className="hover:bg-emerald-50 dark:hover:bg-slate-700"
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);
			case "textarea":
				return (
					<Textarea
						placeholder={field.placeholder}
						{...renderFieldProps}
						rows={field.rows || 3}
						className={cn(commonInputClass, "min-h-[80px]")}
					/>
				);
			case "file":
				return (
					<Input
						type="file"
						accept={field.accept || "image/*"} // Default ke image jika tidak dispesifikasi
						multiple={field.multiple}
						onChange={(e) => renderFieldProps.onChange(e.target.files)}
						className={cn(
							commonInputClass,
							"pt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
						)}
					/>
				);
			case "date":
				return (
					<DatePicker // Asumsi DatePicker adalah komponen kustom Anda
						value={renderFieldProps.value}
						onChange={renderFieldProps.onChange}
						placeholder={field.placeholder || "Pilih tanggal"}
						className={commonInputClass} // Berikan kelas jika DatePicker Anda menerimanya
					/>
				);
			case "tel": // Menggunakan tipe "tel" untuk input telepon
				return (
					<PhoneInput // Asumsi PhoneInput adalah komponen kustom Anda
						value={renderFieldProps.value}
						onChange={renderFieldProps.onChange}
						placeholder={field.placeholder || "e.g., +628123456789"}
						className={commonInputClass}
					/>
				);
			// Tambahkan case lain jika ada (checkbox, radio, number, dll.)
			default:
				return (
					<Input
						placeholder={field.placeholder}
						type={field.type || "text"}
						{...renderFieldProps}
						className={commonInputClass}
					/>
				);
		}
	};

	const renderTriggerButton = () => {
		if (triggerButton) return triggerButton;

		let icon = TriggerIconProp;
		let variant = triggerVariant === "default" ? "default" : triggerVariant; // Sesuaikan dengan prop Button Shadcn
		let buttonText = triggerText;
		let buttonClassName = "";
		let buttonSize = "default";
		let tooltipInfo = "";

		switch (triggerVariant) {
			case "add":
				icon = icon || <Plus className="h-4 w-4" />;
				buttonText = buttonText || "Tambah";
				buttonClassName =
					"bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md hover:shadow-lg";
				break;
			case "edit":
				icon = icon || <Pencil className="h-4 w-4" />;
				variant = "outline";
				buttonClassName =
					"dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-slate-700 dark:hover:text-emerald-300";
				buttonSize = triggerText ? "default" : "icon"; // Jadi icon jika tidak ada teks
				tooltipInfo = triggerText ? "" : "Edit";
				break;
			default:
				// Default styling jika diperlukan, atau biarkan Shadcn yang menangani
				break;
		}

		const finalClassName = `${buttonClassName} ${
			triggerButtonProps.className || ""
		}`.trim();

		const ButtonComponent = (
			<Button
				variant={variant}
				{...triggerButtonProps}
				className={finalClassName}
				size={buttonSize}
				onClick={() => setOpen(true)}
			>
				{icon && <span className={buttonText ? "mr-2" : ""}>{icon}</span>}
				{buttonText}
			</Button>
		);

		if (tooltipInfo) {
			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>{ButtonComponent}</TooltipTrigger>
						<TooltipContent>
							<p>{tooltipInfo}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		}
		return ButtonComponent;
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{renderTriggerButton()}</DialogTrigger>
			<DialogContent
				className={cn(
					"bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-2xl rounded-xl p-0 max-h-[95vh] flex flex-col",
					dialogClassName
				)}
			>
				<DialogHeader className="px-6 py-5 border-b dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 rounded-t-xl">
					<DialogTitle className="text-xl font-semibold text-gray-800 dark:text-slate-100">
						{dialogTitle}
					</DialogTitle>
					{dialogDescription && (
						<DialogDescription className="text-sm text-gray-500 dark:text-slate-400 mt-1">
							{dialogDescription}
						</DialogDescription>
					)}
				</DialogHeader>

				<div className="flex-grow overflow-y-auto px-6 py-5">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmitWrapper)}
							className={cn(
								layoutType === "grid" &&
									"grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5", // Default grid, bisa di-override
								layoutType === "vertical" && "flex flex-col space-y-5",
								formClassName
							)}
						>
							{fields.map((field) => {
								if (field.fieldType === "separator") {
									return (
										<div
											key={field.label || Math.random()}
											className={cn("md:col-span-2 pt-3 pb-1", field.className)}
										>
											<h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-500 mb-1">
												{field.label}
											</h3>
											<Separator className="bg-gray-200 dark:bg-slate-700" />
										</div>
									);
								}
								return (
									<FormField
										key={field.name}
										control={form.control}
										name={field.name}
										render={({ field: renderFieldProps }) => (
											<FormItem className={cn(field.className)}>
												{field.fieldType !== "checkbox" && (
													<FormLabel className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center">
														{field.icon && (
															<field.icon className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-500 opacity-80" />
														)}
														{field.label}
														{formSchema.shape[field.name] &&
															!formSchema.shape[field.name].isOptional() && (
																<span className="text-red-500 ml-1">*</span>
															)}
													</FormLabel>
												)}
												<FormControl>
													{renderFormControl(field, renderFieldProps)}
												</FormControl>
												{field.description && (
													<FormDescription className="text-xs text-gray-500 dark:text-slate-400 mt-1">
														{field.description}
														{field.link && (
															<Link
																href={field.link.href}
																className="text-emerald-600 hover:text-emerald-700 underline ml-1"
															>
																{field.link.text}
															</Link>
														)}
													</FormDescription>
												)}
												<FormMessage className="text-xs" />
											</FormItem>
										)}
									/>
								);
							})}
							<DialogFooter className="md:col-span-2 pt-6 sticky bottom-0 bg-white dark:bg-slate-800 pb-6 px-6 -mx-6 border-t dark:border-slate-700 rounded-b-xl">
								<Button
									type="button"
									variant="outline"
									onClick={() => setOpen(false)}
									className="mr-2 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700"
									disabled={isSubmitting}
								>
									Batal
								</Button>
								<Button
									type="submit"
									className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md hover:shadow-lg"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<CheckCircle2 className="mr-2 h-4 w-4" />
									)}
									{isSubmitting ? "Menyimpan..." : submitButtonText}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default GenericFormDialog;
