// apps/server/src/lib/auth.ts
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { emailOTP } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { Polar } from "@polar-sh/sdk";
import * as schema from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { userPreferences } from "@/db/schema/user";
import { sendOTPEmail } from "../lib/email";
import { db } from "@/db";
import { env } from "cloudflare:workers";

// Initialize Polar SDK client
const polarClient = new Polar({
	accessToken: env.POLAR_ACCESS_TOKEN!,
	server: env.SERVER_ENVIRONMENT === "production" ? "production" : "sandbox",
});

// Define the configuration object with the explicit type
const authConfig: BetterAuthOptions = {
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
	},
	socialProviders: {
		facebook: {
			clientId: env.FACEBOOK_CLIENT_ID as string,
			clientSecret: env.FACEBOOK_CLIENT_SECRET as string,
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID as string,
			clientSecret: env.GOOGLE_CLIENT_SECRET as string,
		},
		linkedin: {
			clientId: env.LINKEDIN_CLIENT_ID as string,
			clientSecret: env.LINKEDIN_CLIENT_SECRET as string,
		},
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				console.log(`Sending OTP ${otp} to ${email} for ${type}`);

				// Send OTP email based on type
				await sendOTPEmail({
					to: email,
					otp,
					type,
				});
			},
			// OTP configuration
			otpLength: 6,
			expiresIn: 300, // 5 minutes
			allowedAttempts: 3,
			sendVerificationOnSignUp: false,
			disableSignUp: false,
			// Override default email verification to use OTP
			overrideDefaultEmailVerification: true,
			// Store OTP as hashed for security
			storeOTP: "hashed",
		}),
		admin({
			// Default role for new users
			defaultRole: "user",

			// Roles considered as admin
			adminRoles: ["admin", "superadmin"],

			// Specific user IDs that should have admin access
			adminUserIds: ["1VbLMALfW3JB5fykQeEy6hwhkch3ztAp"],

			// Impersonation session duration (1 hour by default)
			impersonationSessionDuration: 60 * 60, // 1 hour

			// Default ban settings
			defaultBanReason: "Terms of service violation",
			defaultBanExpiresIn: 60 * 60 * 24 * 7, // 1 week

			// Custom message for banned users
			bannedUserMessage:
				"Your account has been temporarily suspended. Please contact support if you believe this is an error.",
		}),
		polar({
			client: polarClient,
			createCustomerOnSignUp: true,
			// Add custom customer creation handler
			hooks: {
				onCustomerCreationFailed: async (error: any, user: any) => {
					console.warn(
						`Failed to create Polar customer for user ${user.id} (${user.email}):`,
						error,
					);

					// Check if it's an external_id conflict error
					if (
						error.message?.includes("Customer external ID cannot be updated")
					) {
						console.log(
							`Polar customer already exists for email ${user.email}, continuing with user creation`,
						);
						// Don't throw error, allow user creation to continue
						return;
					}

					// For other errors, you might want to handle them differently
					// For now, we'll log and continue
					console.error("Polar customer creation error:", error);
					return; // Don't block user creation
				},
			},
			use: [
				checkout({
					products: [
						{
							productId: process.env.POLAR_MONTHLY_PRODUCT_ID!,
							slug: "monthly-pro", // For Monthly Pro ($19/month)
						},
						{
							productId: process.env.POLAR_LIFETIME_PRODUCT_ID!,
							slug: "lifetime-pro", // For Lifetime Pro ($199 one-time)
						},
					],
					successUrl: `${process.env.BETTER_AUTH_URL}/success?checkout_id={CHECKOUT_ID}`,
					authenticatedUsersOnly: true,
				}),
				portal(),
				webhooks({
					secret: process.env.POLAR_WEBHOOK_SECRET!,
					onOrderPaid: async (payload) => {
						console.log("Order paid:", payload);
						const order = payload.data;
						const userId = order.customer?.externalId;
						if (!userId) {
							console.warn("No user ID found in order payload");
							return;
						}

						// Check if this is a lifetime (one-time) product
						if (
							!order.product.isRecurring &&
							order.product.id === process.env.POLAR_LIFETIME_PRODUCT_ID
						) {
							try {
								await db
									.update(userPreferences)
									.set({ subscriptionPlan: "lifetime" })
									.where(eq(userPreferences.userId, userId));
								console.log(`Updated user ${userId} to lifetime plan`);
							} catch (error) {
								console.error(`Failed to update user ${userId} plan:`, error);
							}
						}
					},
					onSubscriptionActive: async (payload) => {
						console.log("Subscription active:", payload);
						const subscription = payload.data;
						const userId = subscription.customer?.externalId;
						if (!userId) {
							console.warn("No user ID found in subscription payload");
							return;
						}

						// Check if this is the monthly product
						if (
							subscription.product.id === process.env.POLAR_MONTHLY_PRODUCT_ID
						) {
							try {
								await db
									.update(userPreferences)
									.set({ subscriptionPlan: "monthly" })
									.where(eq(userPreferences.userId, userId));
								console.log(`Updated user ${userId} to monthly plan`);
							} catch (error) {
								console.error(`Failed to update user ${userId} plan:`, error);
							}
						}
					},
					onSubscriptionCanceled: async (payload) => {
						console.log("Subscription canceled:", payload);
						const subscription = payload.data;
						const userId = subscription.customer?.externalId;
						if (!userId) {
							console.warn("No user ID found in subscription payload");
							return;
						}

						// Revert to free plan on cancellation (only for monthly)
						if (
							subscription.product.id === process.env.POLAR_MONTHLY_PRODUCT_ID
						) {
							try {
								await db
									.update(userPreferences)
									.set({ subscriptionPlan: "free" })
									.where(eq(userPreferences.userId, userId));
								console.log(`Reverted user ${userId} to free plan`);
							} catch (error) {
								console.error(`Failed to revert user ${userId} plan:`, error);
							}
						}
					},
					onSubscriptionRevoked: async (payload) => {
						console.log("Subscription revoked:", payload);
						const subscription = payload.data;
						const userId = subscription.customer?.externalId;
						if (!userId) {
							console.warn("No user ID found in subscription payload");
							return;
						}

						// Revert to free plan on revocation (only for monthly)
						if (
							subscription.product.id === process.env.POLAR_MONTHLY_PRODUCT_ID
						) {
							try {
								await db
									.update(userPreferences)
									.set({ subscriptionPlan: "free" })
									.where(eq(userPreferences.userId, userId));
								console.log(
									`Reverted user ${userId} to free plan on revocation`,
								);
							} catch (error) {
								console.error(`Failed to revert user ${userId} plan:`, error);
							}
						}
					},
				}),
			],
		}),
	],
};

// Create the auth instance with the explicit type annotation
export const auth = betterAuth(authConfig) as unknown as ReturnType<
	typeof betterAuth
>;
