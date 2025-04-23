"use client";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Import locale Indonesia
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const DatePicker = ({ value, onChange, placeholder }) => {
	// Format tanggal dalam bahasa Indonesia
	const formatIndonesianDate = (date) => {
		return format(date, "dd MMMM yyyy", { locale: id });
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-full justify-start text-left font-normal",
						!value && "text-muted-foreground"
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{value ? (
						formatIndonesianDate(value)
					) : (
						<span>{placeholder || "Pilih Tanggal"}</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="single"
					selected={value}
					onSelect={onChange}
					initialFocus
					locale={id} // Set locale kalender ke Indonesia
					modifiersClassNames={{
						selected: "bg-primary text-primary-foreground hover:bg-primary",
						today: "font-bold",
					}}
					formatters={{
						formatDay: (date) => format(date, "d", { locale: id }),
						formatWeekdayName: (date) => format(date, "EEEEEE", { locale: id }),
						formatMonthCaption: (date) =>
							format(date, "MMMM yyyy", { locale: id }),
					}}
				/>
			</PopoverContent>
		</Popover>
	);
};
