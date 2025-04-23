"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export const NumberInputWithFormat = ({
	value,
	onChange,
	placeholder,
	...props
}) => {
	const [displayValue, setDisplayValue] = useState("");

	// Format ke IDR saat menampilkan
	const formatToIDR = (num) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(num || 0);
	};

	// Parse dari format IDR ke number
	const parseFromIDR = (str) => {
		const num = parseInt(str.replace(/\D/g, "")) || 0;
		return num;
	};

	useEffect(() => {
		// Set initial display value
		setDisplayValue(formatToIDR(value));
	}, [value]);

	const handleChange = (e) => {
		const rawValue = e.target.value;
		const num = parseFromIDR(rawValue);

		// Update display value (formatted)
		setDisplayValue(formatToIDR(num));

		// Pass raw number to form
		onChange(num);
	};

	const handleBlur = () => {
		if (!displayValue) {
			setDisplayValue(formatToIDR(0));
			onChange(0);
		}
	};

	return (
		<Input
			{...props}
			value={displayValue}
			onChange={handleChange}
			onBlur={handleBlur}
			placeholder={placeholder || "Rp0"}
		/>
	);
};
