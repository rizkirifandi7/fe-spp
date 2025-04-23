"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
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
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const DeleteDialog = ({
	id,
	entityName,
	onSuccess,
	deleteFn,
	triggerVariant = "icon",
	triggerText = "Hapus",
	triggerClassName = "",
	description = `Apakah Anda yakin ingin menghapus ${entityName} ini? Tindakan ini tidak dapat dibatalkan.`,
	cancelText = "Batal",
	confirmText = "Hapus",
	onDataAdded,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteFn(id);
			toast.success(`${entityName} berhasil dihapus`);
			onSuccess();
			if (onDataAdded) {
				onDataAdded();
			}
			setIsOpen(false);
		} catch (error) {
			console.error(`Error deleting ${entityName}:`, error);
			toast.error(
				error.response?.data?.message || `Gagal menghapus ${entityName}`
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const renderTrigger = () => {
		switch (triggerVariant) {
			case "icon":
				return (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className={` border-red-500 shadow-none hover:text-destructive cursor-pointer ${triggerClassName}`}
									onClick={() => setIsOpen(true)} // Manually control dialog opening
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Hapus</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				);
			case "text":
				return (
					<Button variant="destructive" className={triggerClassName}>
						{triggerText}
					</Button>
				);
			case "both":
				return (
					<Button variant="destructive" className={`gap-2 ${triggerClassName}`}>
						<Trash2 className="h-4 w-4" />
						{triggerText}
					</Button>
				);
			default:
				return null;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			{renderTrigger()}
			<DialogContent className="max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Hapus {entityName}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2">
					<Button
						variant="outline"
						onClick={() => setIsOpen(false)}
						disabled={isDeleting}
					>
						{cancelText}
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting ? "Menghapus..." : confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteDialog;
