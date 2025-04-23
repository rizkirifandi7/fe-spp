// components/ui/phone-input.jsx
"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export const PhoneInput = ({ value, onChange, placeholder, ...props }) => {
	const [displayValue, setDisplayValue] = useState("");

	// Format nomor telepon
	const formatPhoneNumber = (phone) => {
		if (!phone) return "";

		// Hanya ambil angka
		const cleaned = phone.replace(/\D/g, "");

		// Format: +62 xxx xxxx xxxx
		const match = cleaned.match(/^(\d{0,3})(\d{0,4})(\d{0,4})$/);

		if (match) {
			let formatted = "";
			if (match[1]) formatted += `${match[1]}`;
			if (match[2]) formatted += ` ${match[2]}`;
			if (match[3]) formatted += ` ${match[3]}`;
			return formatted.trim();
		}

		return phone;
	};

	useEffect(() => {
		setDisplayValue(formatPhoneNumber(value));
	}, [value]);

	const handleChange = (e) => {
		const input = e.target.value;
		// Hapus semua non-digit kecuali tanda +
		const cleaned = input.replace(/[^\d+]/g, "");
		onChange(cleaned);
		setDisplayValue(formatPhoneNumber(cleaned));
	};

	return (
		<Input
			{...props}
			type="tel"
			value={displayValue}
			onChange={handleChange}
			placeholder={placeholder || "+62 ..."}
		/>
	);
};
