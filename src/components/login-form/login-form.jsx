import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { loginAction } from "@/actions/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card } from "../ui/card";

export function LoginForm({ className, ...props }) {
	const router = useRouter();
	const [state, formAction, isPending] = useActionState(loginAction, {
		success: false,
		error: null,
		role: null,
	});

	useEffect(() => {
		if (state?.success) {
			toast.success("Login successful!");
			if (state.role === "admin") {
				router.push("/dashboard/home");
			} else if (state.role === "siswa") {
				router.push("/dashboard-siswa/home");
			} else {
				toast.error("Role tidak dikenali");
			}
		} else if (state?.error) {
			toast.error(state.error);
		}
	}, [state, router]);

	return (
		<div className="flex w-full min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
			<Card className="w-full max-w-md overflow-hidden rounded-2xl shadow-lg">
				<div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-center text-white">
					<h1 className="text-3xl font-bold">Selamat Datang</h1>
					<p className="mt-2 opacity-90">
						Masukkan email dan password untuk login.
					</p>
				</div>

				<div className="p-8">
					<form
						action={formAction}
						className={cn("space-y-6", className)}
						{...props}
					>
						{state?.error && (
							<div className="rounded-lg bg-red-100 p-4 text-sm text-red-700">
								{state.error}
							</div>
						)}

						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm font-medium">
									Email
								</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="your@email.com"
									className="h-11 rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
									aria-invalid={!!state?.fieldErrors?.email}
									disabled={isPending}
								/>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="password" className="text-sm font-medium">
										Password
									</Label>
								</div>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="••••••••"
									className="h-11 rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
									aria-invalid={!!state?.fieldErrors?.password}
									disabled={isPending}
								/>
							</div>
						</div>

						<Button
							type="submit"
							className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
							size="lg"
							disabled={isPending}
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								"Sign In"
							)}
						</Button>
					</form>
				</div>
			</Card>
		</div>
	);
}
