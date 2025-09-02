// apps/web/src/app/(auth)/verify-otp/page.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { LogoIcon } from "@/components/logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

// ✅ Child component so we can use useSearchParams safely
function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const type = searchParams.get("type") || "forget-password";

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!email) {
            router.push("/forgot-password");
        }
    }, [email, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        try {
            const result = await authClient.emailOtp.resetPassword({
                email: email!,
                otp,
                password: newPassword,
            });

            if (result.error) {
                setError(
                    result.error.message || "Failed to reset password. Please try again.",
                );
                return;
            }

            setSuccess("Password reset successfully. Redirecting to login...");
            setTimeout(() => {
                router.push("/sign-in");
            }, 2000);
        } catch (err: any) {
            console.error("Failed to reset password:", err);
            setError(err.message || "Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            await authClient.forgetPassword.emailOtp({
                email: email!,
            });
        } catch (err) {
            console.error("Failed to resend OTP:", err);
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
                        <h1 className="mt-4 mb-1 font-semibold text-xl">Verify OTP</h1>
                        <p className="text-sm">
                            Enter the OTP sent to {email} and your new password
                        </p>
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
                            <Label htmlFor="otp" className="block text-sm">
                                OTP Code
                            </Label>
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={setOtp}
                                disabled={isLoading}
                            >
                                <InputOTPGroup>
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <InputOTPSlot key={index} index={index} />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="block text-sm">
                                New Password
                            </Label>
                            <Input
                                type="password"
                                required
                                name="password"
                                id="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="block text-sm">
                                Confirm Password
                            </Label>
                            <Input
                                type="password"
                                required
                                name="confirmPassword"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                disabled={isLoading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || otp.length !== 6}
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground text-sm">
                            Didn't receive the OTP?
                            <Button
                                type="button"
                                variant="link"
                                className="px-2"
                                onClick={handleResendOTP}
                            >
                                Resend OTP
                            </Button>
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

// ✅ Wrap with Suspense at the page level
export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
            <VerifyOtpContent />
        </Suspense>
    );
}
