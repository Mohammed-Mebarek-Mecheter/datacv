// apps/server/src/routers/email-otp.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth } from "../lib/auth";
import { publicProcedure, router } from "@/lib/trpc";

export const emailOtpRouter = router({
	// Send verification OTP
	sendVerificationOtp: publicProcedure
		.input(
			z.object({
				email: z.email({ message: "Invalid email address" }),
				type: z.enum(["sign-in", "email-verification", "forget-password"]),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				// Use the correct method from better-auth
				const result = await (auth.api as any).sendVerificationOTP({
					body: {
						email: input.email,
						type: input.type,
					},
				});

				if (result.error) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: result.error.message || "Failed to send OTP",
					});
				}

				return {
					success: true,
					message: "OTP sent successfully",
				};
			} catch (error) {
				console.error("Failed to send OTP:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to send OTP. Please try again.",
				});
			}
		}),

	// Verify OTP (optional check without signing in)
	checkVerificationOtp: publicProcedure
		.input(
			z.object({
				email: z.email({ message: "Invalid email address" }),
				otp: z.string().min(6, "OTP must be at least 6 characters"),
				type: z.enum(["sign-in", "email-verification", "forget-password"]),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				// Use the correct method from better-auth
				const result = await (auth.api as any).checkVerificationOTP({
					body: {
						email: input.email,
						otp: input.otp,
						type: input.type,
					},
				});

				if (result.error) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: result.error.message || "Invalid OTP",
					});
				}

				return {
					success: true,
					valid: result.data?.valid || false,
				};
			} catch (error) {
				console.error("Failed to verify OTP:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to verify OTP. Please try again.",
				});
			}
		}),

	// Sign in with OTP
	signInWithOtp: publicProcedure
		.input(
			z.object({
				email: z.email({ message: "Invalid email address" }),
				otp: z.string().min(6, "OTP must be at least 6 characters"),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				// Use the correct method from better-auth
				const result = await (auth.api as any).signInEmailOTP({
					body: {
						email: input.email,
						otp: input.otp,
					},
				});

				if (result.error) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: result.error.message || "Invalid OTP or sign-in failed",
					});
				}

				return {
					success: true,
					user: result.data?.user,
					session: result.data?.session,
				};
			} catch (error) {
				console.error("Failed to sign in with OTP:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Sign-in failed. Please try again.",
				});
			}
		}),

	// Verify email with OTP
	verifyEmailWithOtp: publicProcedure
		.input(
			z.object({
				email: z.email({ message: "Invalid email address" }),
				otp: z.string().min(6, "OTP must be at least 6 characters"),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				// Use the correct method from better-auth
				const result = await (auth.api as any).verifyEmailOTP({
					body: {
						email: input.email,
						otp: input.otp,
					},
				});

				if (result.error) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: result.error.message || "Email verification failed",
					});
				}

				return {
					success: true,
					message: "Email verified successfully",
				};
			} catch (error) {
				console.error("Failed to verify email:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Email verification failed. Please try again.",
				});
			}
		}),

	// Send password reset OTP
	sendPasswordResetOtp: publicProcedure
		.input(
			z.object({
				email: z.email({ message: "Invalid email address" }),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				// Use the correct method from better-auth
				const result = await (auth.api as any).forgetPasswordEmailOTP({
					body: {
						email: input.email,
					},
				});

				if (result.error) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message:
							result.error.message || "Failed to send password reset OTP",
					});
				}

				return {
					success: true,
					message: "Password reset OTP sent successfully",
				};
			} catch (error) {
				console.error("Failed to send password reset OTP:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to send password reset OTP. Please try again.",
				});
			}
		}),

	// Reset password with OTP
	resetPasswordWithOtp: publicProcedure
		.input(
			z.object({
				email: z.email({ message: "Invalid email address" }),
				otp: z.string().min(6, "OTP must be at least 6 characters"),
				newPassword: z
					.string()
					.min(8, "Password must be at least 8 characters"),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				// Use the correct method from better-auth
				const result = await (auth.api as any).resetPasswordEmailOTP({
					body: {
						email: input.email,
						otp: input.otp,
						password: input.newPassword,
					},
				});

				if (result.error) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: result.error.message || "Password reset failed",
					});
				}

				return {
					success: true,
					message: "Password reset successfully",
				};
			} catch (error) {
				console.error("Failed to reset password:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Password reset failed. Please try again.",
				});
			}
		}),
});
