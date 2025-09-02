// src/app/(auth)/sign-up/page.tsx
"use client";

import {CheckCircle, Eye, EyeOff, Mail,} from "lucide-react";
import {FaFacebook, FaLinkedin} from "react-icons/fa";
import Link from "next/link";
import {useRouter} from "next/navigation";
import React, {useState} from "react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";
import {authClient} from "@/lib/auth-client";

export default function SignUpPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [agreedToTerms, setAgreedToTerms] = useState(false);

	const validatePassword = (password: string) => {
        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
        };
	};

	const passwordRequirements = validatePassword(formData.password);
	const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
	const passwordsMatch = formData.password === formData.confirmPassword;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!agreedToTerms) {
			setError("Please agree to the Terms of Service and Privacy Policy");
			return;
		}

		if (!isPasswordValid) {
			setError("Please ensure your password meets all requirements");
			return;
		}

		if (!passwordsMatch) {
			setError("Passwords do not match");
			return;
		}

		setIsLoading(true);

		try {
			const result = await authClient.signUp.email({
				email: formData.email,
				password: formData.password,
				name: `${formData.firstName} ${formData.lastName}`,
			});

			if (result.error) {
				setError(result.error.message || "An error occurred during sign up");
				return;
			}

			// Redirect to email verification
			router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
		} catch (err) {
			setError("Failed to create account. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuthSignUp = async (
		provider: "google" | "facebook" | "linkedin",
	) => {
		try {
			setIsLoading(true);
			setError("");

			await authClient.signIn.social({
				provider,
				callbackURL: `${window.location.origin}/onboarding`,
			});
		} catch (err) {
			setError(`Failed to sign up with ${provider}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h1 className="font-bold text-2xl text-gray-900 dark:text-white">
					Create your account
				</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-300">
					Start building AI-powered resumes tailored for data professionals
				</p>
			</div>

			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-center">Get started for free</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Social Sign Up Buttons */}
					<div className="grid grid-cols-3 gap-3">
						<Button
							variant="outline"
							onClick={() => handleOAuthSignUp("google")}
							disabled={isLoading}
						>
							<Mail className="mr-2 h-4 w-4" />
							Google
						</Button>
						<Button
							variant="outline"
							onClick={() => handleOAuthSignUp("facebook")}
							disabled={isLoading}
						>
							<FaFacebook className="mr-2 h-4 w-4" />
							Facebook
						</Button>
						<Button
							variant="outline"
							onClick={() => handleOAuthSignUp("linkedin")}
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

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											firstName: e.target.value,
										}))
									}
									placeholder="John"
									required
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									value={formData.lastName}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											lastName: e.target.value,
										}))
									}
									placeholder="Doe"
									required
									disabled={isLoading}
								/>
							</div>
						</div>

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
							<Label htmlFor="password">Password</Label>
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
									placeholder="Create a strong password"
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

							{/* Password Requirements */}
							{formData.password && (
								<div className="mt-2 space-y-1 text-xs">
									<div
										className={`flex items-center gap-2 ${passwordRequirements.length ? "text-green-600" : "text-gray-400"}`}
									>
										<CheckCircle className="h-3 w-3" />
										At least 8 characters
									</div>
									<div
										className={`flex items-center gap-2 ${passwordRequirements.uppercase ? "text-green-600" : "text-gray-400"}`}
									>
										<CheckCircle className="h-3 w-3" />
										One uppercase letter
									</div>
									<div
										className={`flex items-center gap-2 ${passwordRequirements.lowercase ? "text-green-600" : "text-gray-400"}`}
									>
										<CheckCircle className="h-3 w-3" />
										One lowercase letter
									</div>
									<div
										className={`flex items-center gap-2 ${passwordRequirements.number ? "text-green-600" : "text-gray-400"}`}
									>
										<CheckCircle className="h-3 w-3" />
										One number
									</div>
								</div>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<div className="relative">
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									value={formData.confirmPassword}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											confirmPassword: e.target.value,
										}))
									}
									placeholder="Confirm your password"
									required
									disabled={isLoading}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="-translate-y-1/2 absolute top-1/2 right-3 transform text-gray-400 hover:text-gray-600"
									disabled={isLoading}
								>
									{showConfirmPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>

							{formData.confirmPassword && !passwordsMatch && (
								<p className="text-red-600 text-xs">Passwords do not match</p>
							)}
						</div>

						<div className="flex items-start space-x-2">
							<Checkbox
								id="terms"
								checked={agreedToTerms}
								onCheckedChange={(checked) =>
									setAgreedToTerms(checked as boolean)
								}
								disabled={isLoading}
							/>
							<div className="grid gap-1.5 leading-none">
								<label
									htmlFor="terms"
									className="cursor-pointer font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									I agree to the{" "}
									<Link
										href="/#"
										className="text-blue-600 underline hover:text-blue-500"
									>
										Terms of Service
									</Link>{" "}
									and{" "}
									<Link
										href="/#"
										className="text-blue-600 underline hover:text-blue-500"
									>
										Privacy Policy
									</Link>
								</label>
							</div>
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={
								isLoading ||
								!agreedToTerms ||
								!isPasswordValid ||
								!passwordsMatch
							}
						>
							{isLoading ? "Creating account..." : "Create Account"}
						</Button>
					</form>

					<div className="text-center text-sm">
						<span className="text-gray-600 dark:text-gray-300">
							Already have an account?{" "}
						</span>
						<Link
							href="/sign-in"
							className="font-medium text-blue-600 hover:text-blue-500"
						>
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>

			{/* Free Tier Benefits */}
			<div className="space-y-1 text-center text-gray-600 text-sm dark:text-gray-300">
				<p className="font-medium">What's included in your free account:</p>
				<div className="flex items-center justify-center gap-6 text-xs">
					<span>✓ 2 Documents</span>
					<span>✓ 10 AI Generations</span>
					<span>✓ Basic Templates</span>
					<span>✓ PDF Export</span>
				</div>
			</div>
		</div>
	);
}

