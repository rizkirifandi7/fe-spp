"use server";

import { cookies } from "next/headers";

const setCookie = async (name, value) => {
	(await cookies()).set(name, value, { secure: true });
};

const getCookie = async (name) => {
	return (await cookies()).get(name);
};

const removeCookie = async (name) => {
	(await cookies()).delete(name);
};

export { setCookie, removeCookie, getCookie };
