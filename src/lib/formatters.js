// src/lib/formatters.js

export const formatToIDRLocal = (numberString) => {
	const number = parseFloat(numberString);
	if (isNaN(number)) return "Rp 0";
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(number);
};

export const formatDateLocal = (dateString, includeTime = false) => {
	if (!dateString) return "-";
	const date = new Date(dateString);
	const options = { day: "2-digit", month: "long", year: "numeric" };
	if (includeTime) {
		options.hour = "2-digit";
		options.minute = "2-digit";
		options.hour12 = false;
	}
	return new Intl.DateTimeFormat("id-ID", options).format(date);
};

export const monthNames = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"Mei",
	"Jun",
	"Jul",
	"Agu",
	"Sep",
	"Okt",
	"Nov",
	"Des",
];
