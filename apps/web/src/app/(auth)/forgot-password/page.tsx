// apps/web/src/app/(auth)/forgot-password/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { LogoIcon } from "@/components/logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setIsLoading(true);

		try {
			// Use the correct method name based on Better Auth documentation
			const result = await authClient.forgetPassword.emailOtp({
				email,
			});

			if (result.error) {
				setError(
					result.error.message || "Failed to send reset OTP. Please try again.",
				);
				return;
			}

			setSuccess("Password reset OTP sent successfully. Check your email.");
			// Redirect to OTP verification page after a short delay
			setTimeout(() => {
				router.push(
					`/verify-otp?email=${encodeURIComponent(email)}&type=forget-password`,
				);
			}, 2000);
		} catch (err: any) {
			console.error("Failed to send reset OTP:", err);
			setError(err.message || "Failed to send reset link. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
			<form
				onSubmit={handleSubmit}
				className="m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border bg-muted shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
			>
				<div className="-m-px rounded-[calc(var(--radius)+.125rem)] border bg-card p-8 pb-6">
					<div>
						<Link href="/" aria-label="go home">
							<LogoIcon />
						</Link>
						<h1 className="mt-4 mb-1 font-semibold text-xl">
							Recover Password
						</h1>
						<p className="text-sm">Enter your email to receive a reset OTP</p>
					</div>

					<div className="mt-6 space-y-6">
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{success && (
							<Alert
								variant="default"
								className="border-green-200 bg-green-50 text-green-800"
							>
								<AlertDescription>{success}</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label htmlFor="email" className="block text-sm">
								Email
							</Label>
							<Input
								type="email"
								required
								name="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="name@example.com"
								disabled={isLoading}
							/>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Sending..." : "Send Reset OTP"}
						</Button>
					</div>

					<div className="mt-6 text-center">
						<p className="text-muted-foreground text-sm">
							We'll send you an OTP to reset your password.
						</p>
					</div>
				</div>

				<div className="p-3">
					<p className="text-center text-accent-foreground text-sm">
						Remembered your password?
						<Button asChild variant="link" className="px-2">
							<Link href="/sign-in">Log in</Link>
						</Button>
					</p>
				</div>
			</form>
		</section>
	);
}
