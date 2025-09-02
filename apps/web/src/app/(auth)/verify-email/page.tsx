"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
    Suspense,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { LogoIcon } from "@/components/logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

/**
 * Wrapper so Next.js can prerender safely.
 */
function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);

    // Prevent duplicate initial OTP sends
    const hasSentInitialOTP = useRef(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (!email) {
            router.push("/sign-up");
            return;
        }

        // Only send initial OTP once, and only on the first mount
        if (isInitialMount.current && !hasSentInitialOTP.current) {
            hasSentInitialOTP.current = true;
            handleResendOTP();
        }

        isInitialMount.current = false;
    }, [email, router]);

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown((c) => c - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResendOTP = useCallback(async () => {
        if (!email || resendCooldown > 0 || isResending) return;

        setError("");
        setIsResending(true);

        try {
            const result = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: "email-verification",
            });

            if (result.error) {
                setError(
                    result.error.message ||
                    "Failed to send verification code. Please try again.",
                );
                return;
            }

            setSuccess("Verification code sent to your email!");
            setResendCooldown(60); // 60 second cooldown
        } catch (err: any) {
            console.error("Failed to send OTP:", err);
            setError("Failed to send verification code. Please try again.");
        } finally {
            setIsResending(false);
        }
    }, [email, resendCooldown, isResending]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }

        setIsLoading(true);

        try {
            const result = await authClient.emailOtp.verifyEmail({
                email: email!,
                otp,
            });

            if (result.error) {
                setError(
                    result.error.message ||
                    "Invalid verification code. Please try again.",
                );
                return;
            }

            setSuccess("Email verified successfully! Redirecting...");
            setTimeout(() => {
                router.push("/admin/templates");
            }, 2000);
        } catch (err: any) {
            console.error("Failed to verify email:", err);
            setError("Failed to verify email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualResend = () => {
        if (resendCooldown === 0) {
            handleResendOTP();
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
                            Verify Your Email
                        </h1>
                        <p className="text-sm">
                            Enter the verification code sent to {email}
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
                                Verification Code
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

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || otp.length !== 6}
                        >
                            {isLoading ? "Verifying..." : "Verify Email"}
                        </Button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="mb-3 text-muted-foreground text-sm">
                            Didn't receive the code?
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleManualResend}
                            disabled={isResending || resendCooldown > 0}
                        >
                            {isResending
                                ? "Sending..."
                                : resendCooldown > 0
                                    ? `Resend in ${resendCooldown}s`
                                    : "Resend Code"}
                        </Button>
                    </div>
                </div>

                <div className="p-3">
                    <p className="text-center text-accent-foreground text-sm">
                        Already verified?
                        <Button asChild variant="link" className="px-2">
                            <Link href="/sign-in">Sign In</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    );
}

/**
 * Default export wrapped in Suspense
 */
export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
