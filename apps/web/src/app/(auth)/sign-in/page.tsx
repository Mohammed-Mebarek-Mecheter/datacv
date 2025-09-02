// src/app/(auth)/sign-in/page.tsx
"use client";
import { Eye, EyeOff, Mail } from "lucide-react";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const result = await authClient.signIn.email({
				email: formData.email,
				password: formData.password,
			});

			if (result.error) {
				setError(result.error.message || "An error occurred during sign in");
				return;
			}

			router.push("/admin/templates");
		} catch (error) {
			if (error instanceof Error) {
				setError(
					error.message || "An unexpected error occurred. Please try again.",
				);
			} else {
				setError("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuthLogin = async (
		provider: "google" | "facebook" | "linkedin",
	) => {
		try {
			setIsLoading(true);
			setError("");
			await authClient.signIn.social({
				provider,
				callbackURL: `${window.location.origin}/dashboard`,
			});
		} catch (error) {
			if (error instanceof Error) {
				setError(`Failed to sign in with ${provider}: ${error.message}`);
			} else {
				setError(`Failed to sign in with ${provider}`);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h1 className="font-bold text-2xl text-gray-900 dark:text-white">
					Welcome back
				</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-300">
					Sign in to your DataCV account to continue building your data career
				</p>
			</div>

			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-center">Sign in to your account</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Social Login Buttons */}
					<div className="grid grid-cols-3 gap-3">
						<Button
							variant="outline"
							onClick={() => handleOAuthLogin("google")}
							disabled={isLoading}
						>
							<Mail className="mr-2 h-4 w-4" />
							Google
						</Button>
						<Button
							variant="outline"
							onClick={() => handleOAuthLogin("facebook")}
							disabled={isLoading}
						>
							<FaFacebook className="mr-2 h-4 w-4" />
							Facebook
						</Button>
						<Button
							variant="outline"
							onClick={() => handleOAuthLogin("linkedin")}
							disabled={isLoading}
						>
							<FaLinkedin className="mr-2 h-4 w-4" />
							LinkedIn
						</Button>
					</div>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<Separator />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-white px-2 text-gray-500 dark:bg-gray-900">
								Or continue with
							</span>
						</div>
					</div>

					{/* Email/Password Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, email: e.target.value }))
								}
								placeholder="john.doe@example.com"
								required
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Password</Label>
								<Link
									href="/forgot-password"
									className="font-medium text-blue-600 text-sm hover:text-blue-500"
								>
									Forgot password?
								</Link>
							</div>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									value={formData.password}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											password: e.target.value,
										}))
									}
									placeholder="Enter your password"
									required
									disabled={isLoading}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="-translate-y-1/2 absolute top-1/2 right-3 transform text-gray-400 hover:text-gray-600"
									disabled={isLoading}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Signing in..." : "Sign In"}
						</Button>
					</form>

					<div className="text-center text-sm">
						<span className="text-gray-600 dark:text-gray-300">
							Don't have an account?{" "}
						</span>
						<Link
							href="/sign-up"
							className="font-medium text-blue-600 hover:text-blue-500"
						>
							Sign up
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
