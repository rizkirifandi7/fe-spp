"use client";

import { LoginForm } from "@/components/login-form/login-form";

const PageLogin = () => {
	return (
		<div className="min-h-svh flex items-center justify-center">
			<div className="flex flex-1 items-center justify-center">
				<LoginForm />
			</div>
		</div>
	);
};

export default PageLogin;
