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
import { useState } from "react";
import Link from "next/link";
import { NumberInputWithFormat } from "./idr-input";
import { DatePicker } from "./date-input";
import { cn } from "@/lib/utils";
import { PhoneInput } from "./phone-input";

const GenericFormDialog = ({
	layoutType = "vertical", // 'vertical' | 'grid' | 'custom'
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
	triggerIcon,
	triggerButton,
	triggerButtonProps = {},
	onDataAdded,
}) => {
	const [open, setOpen] = useState(false);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const handleSubmit = async (values) => {
		try {
			await onSubmit(values);
			toast.success("Data berhasil disimpan");
			form.reset();
			setOpen(false);
			onSuccess();
			if (onDataAdded) onDataAdded();
		} catch (error) {
			console.error("Error submitting form:", error);
			toast.error(error.message || "Gagal menyimpan data");
		}
	};

	const renderFormControl = (field, renderField) => {
		switch (field.fieldType || "input") {
			case "select":
				return (
					<Select
						onValueChange={renderField.onChange}
						value={renderField.value || ""} // Use value instead of defaultValue to make it controlled
						defaultValue={renderField.value}
						className="w-full"
					>
						<FormControl className="w-full">
							<SelectTrigger>
								<SelectValue placeholder={field.placeholder} />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{field.options?.map((option) => (
								<SelectItem key={option.value} value={option.value.toString()}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);
			case "checkbox":
				return (
					<div className="flex items-center space-x-2">
						<Checkbox
							id={field.name}
							checked={renderField.value}
							onCheckedChange={renderField.onChange}
						/>
						<label
							htmlFor={field.name}
							className="text-sm font-medium leading-none"
						>
							{field.label}
						</label>
					</div>
				);
			case "radio":
				return (
					<RadioGroup
						onValueChange={renderField.onChange}
						defaultValue={renderField.value}
						className="flex flex-col space-y-1"
					>
						{field.options?.map((option) => (
							<FormItem
								key={option.value}
								className="flex items-center space-x-3 space-y-0"
							>
								<FormControl>
									<RadioGroupItem value={option.value} />
								</FormControl>
								<FormLabel className="font-normal">{option.label}</FormLabel>
							</FormItem>
						))}
					</RadioGroup>
				);
			case "textarea":
				return <Textarea placeholder={field.placeholder} {...renderField} />;
			case "file":
				return (
					<Input
						type="file"
						accept={field.accept}
						multiple={field.multiple}
						onChange={(e) => renderField.onChange(e.target.files)}
					/>
				);
			case "number":
				if (field.currencyFormat === "IDR") {
					return (
						<NumberInputWithFormat
							placeholder={field.placeholder}
							value={renderField.value}
							onChange={renderField.onChange}
						/>
					);
				}
				return (
					<Input
						type="number"
						placeholder={field.placeholder}
						{...renderField}
						onChange={(e) => renderField.onChange(e.target.valueAsNumber || 0)}
					/>
				);
			case "phone":
				return (
					<PhoneInput
						value={renderField.value}
						onChange={renderField.onChange}
						placeholder={field.placeholder}
					/>
				);
			case "date":
				return (
					<DatePicker
						value={renderField.value}
						onChange={renderField.onChange}
						placeholder={field.placeholder}
					/>
				);
			default:
				return (
					<Input
						placeholder={field.placeholder}
						type={field.type || "text"}
						{...renderField}
					/>
				);
		}
	};

	const renderTriggerButton = () => {
		if (triggerButton) return triggerButton;

		let icon = triggerIcon;
		let variant = "default";
		let buttonText = triggerText;
		let buttonClassName = ""; // Initialize className variable
		let buttonSize = "default"; // Initialize size variable
		let tooltipInfo = ""; // Default tooltip info

		switch (triggerVariant) {
			case "add":
				icon = <Plus className="h-4 w-4" />;
				buttonText = buttonText || "Tambah";
				buttonClassName = "bg-emerald-600 text-white cursor-pointer";
				break;
			case "edit":
				icon = <Pencil className="h-4 w-4" />;
				variant = "outline";
				buttonClassName = "cursor-pointer";
				buttonSize = "icon";
				tooltipInfo = "Edit";
				break;
			default:
				buttonClassName = "bg-blue-600 hover:bg-blue-700 text-white";
				break;
		}

		// Merge with any className from triggerButtonProps
		const finalClassName = `${buttonClassName} ${
			triggerButtonProps.className || ""
		}`.trim();

		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant={variant}
							{...triggerButtonProps}
							className={finalClassName}
							size={buttonSize}
							onClick={() => setOpen(true)}
						>
							{icon}
							{buttonText}
						</Button>
					</TooltipTrigger>
					<TooltipContent className={tooltipInfo ? "" : "hidden"}>
						<p>{tooltipInfo}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{renderTriggerButton()}
			<DialogContent className={cn("sm:max-w-[600px]", dialogClassName)}>
				<DialogHeader>
					<DialogTitle>{dialogTitle}</DialogTitle>
					<DialogDescription>{dialogDescription}</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className={cn(
							"space-y-1.5",
							layoutType === "grid" && "grid grid-cols-2 gap-x-4",
							layoutType === "vertical" && "flex flex-col gap-4",
							formClassName
						)}
					>
						{fields.map((field) => (
							<FormField
								key={field.name}
								control={form.control}
								name={field.name}
								render={({ field: renderField }) => (
									<FormItem>
										{field.fieldType !== "checkbox" && (
											<FormLabel>{field.label}</FormLabel>
										)}
										{renderFormControl(field, renderField)}
										{field.description && (
											<FormDescription>
												{field.description}
												{field.link && (
													<Link
														href={field.link.href}
														className="text-primary underline"
													>
														{field.link.text}
													</Link>
												)}
											</FormDescription>
										)}
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
						<DialogFooter className="mt-4 col-span-2">
							<Button type="submit" className="w-full bg-emerald-600">
								Submit
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default GenericFormDialog;
