import { NextResponse } from "next/server";

export function middleware(request) {
	const token = request.cookies.get("token");
	const { pathname } = request.nextUrl;

	if (request.nextUrl.pathname === "/") {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	if (!token && pathname.startsWith("/dashboard")) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	if (!token && pathname.startsWith("/dashboard-siswa")) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/dashboard-siswa/:path*", "/"],
};
