export const formatToIDR = (num) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(num || 0);
};

export const formatRupiah = (numberString, isMetricCard = false) => {
	const number = parseFloat(numberString);
	if (isNaN(number)) {
		return isMetricCard ? "0" : "Rp 0";
	}
	if (isMetricCard) {
		return new Intl.NumberFormat("id-ID", {
			style: "decimal",
			minimumFractionDigits: 0,
		}).format(number);
	}
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(number);
};

export const formatDate = (dateString, includeTime = false) => {
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
