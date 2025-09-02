// apps/server/src/lib/context.ts
import type { Context as HonoContext } from "hono";
import { auth } from "./auth";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { userOnboarding, userPreferences } from "../db/schema/user";
import { user } from "../db/schema/auth";
import { env } from "cloudflare:workers";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});

	let preferences = null;
	let onboardingStatus = null;
	let isAdmin = false;
	let userProfile = null;

	if (session?.user) {
		try {
			// Get user profile with preferences and onboarding status
			const [userResult] = await db
				.select({
					// User basic info
					id: user.id,
					name: user.name,
					email: user.email,
					emailVerified: user.emailVerified,
					image: user.image,
					createdAt: user.createdAt,
					role: user.role,
					banned: user.banned,
					banReason: user.banReason,
					banExpires: user.banExpires,
					// Preferences
					preferencesId: userPreferences.id,
					dataSpecialization: userPreferences.dataSpecialization,
					experienceLevel: userPreferences.experienceLevel,
					primaryIndustry: userPreferences.primaryIndustry,
					yearsOfExperience: userPreferences.yearsOfExperience,
					targetRoles: userPreferences.targetRoles,
					aiWritingStyle: userPreferences.aiWritingStyle,
					defaultDocumentType: userPreferences.defaultDocumentsType,
					defaultTemplate: userPreferences.defaultTemplate,
					includePortfolio: userPreferences.includePortfolio,
					emphasizeQuantitativeResults:
						userPreferences.emphasizeQuantitativeResults,
					subscriptionPlan: userPreferences.subscriptionPlan,
					preferencesIsAdmin: userPreferences.isAdmin,
					preferencesCreatedAt: userPreferences.createdAt,
					preferencesUpdatedAt: userPreferences.updatedAt,
					// Onboarding
					onboardingId: userOnboarding.id,
					currentStep: userOnboarding.currentStep,
					isCompleted: userOnboarding.isCompleted,
					collectedInfo: userOnboarding.collectedInfo,
					initialDocumentChoice: userOnboarding.initialDocumentChoice,
					firstDocumentCreated: userOnboarding.firstDocumentCreated,
					completedAt: userOnboarding.completedAt,
					onboardingCreatedAt: userOnboarding.createdAt,
					onboardingUpdatedAt: userOnboarding.updatedAt,
				})
				.from(user)
				.leftJoin(userPreferences, eq(user.id, userPreferences.userId))
				.leftJoin(userOnboarding, eq(user.id, userOnboarding.userId))
				.where(eq(user.id, session.user.id))
				.limit(1);

			if (userResult) {
				// Structure user profile
				userProfile = {
					id: userResult.id,
					name: userResult.name,
					email: userResult.email,
					emailVerified: userResult.emailVerified,
					image: userResult.image,
					createdAt: userResult.createdAt,
					role: userResult.role,
					banned: userResult.banned,
					banReason: userResult.banReason,
					banExpires: userResult.banExpires,
				};

				// Structure preferences
				if (userResult.preferencesId) {
					preferences = {
						id: userResult.preferencesId,
						userId: userResult.id,
						dataSpecialization: userResult.dataSpecialization,
						experienceLevel: userResult.experienceLevel,
						primaryIndustry: userResult.primaryIndustry,
						yearsOfExperience: userResult.yearsOfExperience,
						targetRoles: userResult.targetRoles,
						aiWritingStyle: userResult.aiWritingStyle,
						defaultDocumentType: userResult.defaultDocumentType,
						defaultTemplate: userResult.defaultTemplate,
						includePortfolio: userResult.includePortfolio,
						emphasizeQuantitativeResults:
							userResult.emphasizeQuantitativeResults,
						subscriptionPlan: userResult.subscriptionPlan,
						isAdmin: userResult.preferencesIsAdmin,
						createdAt: userResult.preferencesCreatedAt,
						updatedAt: userResult.preferencesUpdatedAt,
					};
				}

				// Structure onboarding status
				if (userResult.onboardingId) {
					onboardingStatus = {
						id: userResult.onboardingId,
						userId: userResult.id,
						currentStep: userResult.currentStep,
						isCompleted: userResult.isCompleted,
						collectedInfo: userResult.collectedInfo,
						initialDocumentChoice: userResult.initialDocumentChoice,
						firstDocumentCreated: userResult.firstDocumentCreated,
						completedAt: userResult.completedAt,
						createdAt: userResult.onboardingCreatedAt,
						updatedAt: userResult.onboardingUpdatedAt,
					};
				}

				// Determine admin status
				isAdmin =
					userResult.role === "admin" ||
					userResult.role === "superadmin" ||
					userResult.preferencesIsAdmin === true;
			}
		} catch (error) {
			console.error("Error fetching user context:", error);
			// Continue with basic session info if detailed fetch fails
		}
	}

	// Enhanced user context
	const userContext = session?.user
		? {
				userId: session.user.id,
				profile: userProfile,
				preferences,
				onboardingStatus,
				isAdmin,

				// Computed properties for convenience
				hasCompletedOnboarding: onboardingStatus?.isCompleted || false,
				subscriptionTier: preferences?.subscriptionPlan || "free",
				hasProAccess:
					preferences?.subscriptionPlan === "monthly" ||
					preferences?.subscriptionPlan === "lifetime",

				// User capabilities based on subscription and status
				capabilities: {
					canAccessPremiumTemplates:
						preferences?.subscriptionPlan === "monthly" ||
						preferences?.subscriptionPlan === "lifetime",
					canCreateUnlimitedDocuments:
						preferences?.subscriptionPlan === "monthly" ||
						preferences?.subscriptionPlan === "lifetime",
					canUseAdvancedAI:
						preferences?.subscriptionPlan === "monthly" ||
						preferences?.subscriptionPlan === "lifetime",
					canExportToPDF: true, // Available to all users
					canExportToDocx:
						preferences?.subscriptionPlan === "monthly" ||
						preferences?.subscriptionPlan === "lifetime",
					canShareDocuments: true, // Available to all users
					canCreateCustomTemplates:
						preferences?.subscriptionPlan === "monthly" ||
						preferences?.subscriptionPlan === "lifetime",
					maxDocuments: preferences?.subscriptionPlan === "free" ? 3 : -1, // -1 means unlimited
					maxAIInteractionsPerMonth:
						preferences?.subscriptionPlan === "free" ? 10 : -1,
				},

				// User preferences for AI and document generation
				aiPreferences: preferences
					? {
							writingStyle: preferences.aiWritingStyle,
							defaultDocumentType: preferences.defaultDocumentType,
							emphasizeQuantitativeResults:
								preferences.emphasizeQuantitativeResults,
							includePortfolio: preferences.includePortfolio,
						}
					: null,

				// Professional context for targeted content
				professionalContext: preferences
					? {
							specialization: preferences.dataSpecialization,
							experienceLevel: preferences.experienceLevel,
							primaryIndustry: preferences.primaryIndustry,
							yearsOfExperience: preferences.yearsOfExperience,
							targetRoles: preferences.targetRoles || [],
						}
					: null,

				// Account status
				accountStatus: {
					isBanned: userProfile?.banned || false,
					banReason: userProfile?.banReason,
					banExpires: userProfile?.banExpires,
					emailVerified: userProfile?.emailVerified || false,
					accountAge: userProfile?.createdAt
						? Math.floor(
								(Date.now() - new Date(userProfile?.createdAt).getTime()) /
									(1000 * 60 * 60 * 24),
							)
						: 0,
				},
			}
		: null;

	return {
		session,
		isAdmin,
		userContext,

		// Request metadata
		requestInfo: {
			userAgent: context.req.header("user-agent"),
			ip:
				context.req.header("x-forwarded-for") ||
				context.req.header("x-real-ip") ||
				context.env?.CF_CONNECTING_IP ||
				"unknown",
			country: context.env?.CF_IPCOUNTRY || "unknown",
			timestamp: new Date(),
		},

		// Feature flags and configuration
		features: {
			enableAdvancedAnalytics:
				isAdmin || preferences?.subscriptionPlan !== "free",
			enableBetaFeatures: isAdmin,
			enableDebugMode: isAdmin && env.NODE_ENV === "development",
			maxUploadSize:
				preferences?.subscriptionPlan === "free"
					? 5 * 1024 * 1024
					: 50 * 1024 * 1024, // 5MB vs 50MB
		},
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// Helper function to check if user can perform an action
export function canUserPerformAction(
	context: Context,
	action:
		| "create_document"
		| "use_premium_template"
		| "export_docx"
		| "use_ai"
		| "admin_access",
	resourceCount?: number,
): { allowed: boolean; reason?: string } {
	if (!context.userContext) {
		return { allowed: false, reason: "Authentication required" };
	}

	const { userContext } = context;

	// Check account status first
	if (userContext.accountStatus.isBanned) {
		return { allowed: false, reason: "Account is banned" };
	}

	if (!userContext.accountStatus.emailVerified && action !== "admin_access") {
		return { allowed: false, reason: "Email verification required" };
	}

	// Check specific actions
	switch (action) {
		case "create_document":
			if (
				userContext.capabilities.maxDocuments !== -1 &&
				resourceCount !== undefined &&
				resourceCount >= userContext.capabilities.maxDocuments
			) {
				return {
					allowed: false,
					reason:
						"Document limit reached. Upgrade to Pro for unlimited documents.",
				};
			}
			return { allowed: true };

		case "use_premium_template":
			if (!userContext.capabilities.canAccessPremiumTemplates) {
				return {
					allowed: false,
					reason: "Pro subscription required for premium templates",
				};
			}
			return { allowed: true };

		case "export_docx":
			if (!userContext.capabilities.canExportToDocx) {
				return {
					allowed: false,
					reason: "Pro subscription required for DOCX export",
				};
			}
			return { allowed: true };

		case "use_ai":
			if (
				userContext.capabilities.maxAIInteractionsPerMonth !== -1 &&
				resourceCount !== undefined &&
				resourceCount >= userContext.capabilities.maxAIInteractionsPerMonth
			) {
				return {
					allowed: false,
					reason:
						"AI interaction limit reached. Upgrade to Pro for unlimited AI assistance.",
				};
			}
			return { allowed: true };

		case "admin_access":
			if (!context.isAdmin) {
				return { allowed: false, reason: "Admin privileges required" };
			}
			return { allowed: true };

		default:
			return { allowed: false, reason: "Unknown action" };
	}
}

// Helper function to get user's template preferences
export function getUserTemplatePreferences(context: Context) {
	if (!context.userContext?.professionalContext) {
		return {};
	}

	const { professionalContext } = context.userContext;

	return {
		targetSpecialization: professionalContext.specialization,
		targetIndustry: professionalContext.primaryIndustry,
		targetExperienceLevel: professionalContext.experienceLevel,
		suggestedTags: [
			professionalContext.specialization,
			professionalContext.primaryIndustry,
			professionalContext.experienceLevel,
			...professionalContext.targetRoles,
		].filter(Boolean),
	};
}

// Helper function for data professional context extraction
export const extractDataProfessionalContext = (userContext: any) => {
	if (!userContext?.professionalContext) {
		return {
			targetSpecialization: undefined,
			experienceLevel: undefined,
			targetIndustry: undefined,
			yearsOfExperience: undefined,
			primaryTechnologies: [],
			region: "north_america",
		};
	}

	const { professionalContext, preferences } = userContext;

	return {
		targetSpecialization: professionalContext.specialization,
		experienceLevel: professionalContext.experienceLevel,
		targetIndustry: professionalContext.primaryIndustry,
		yearsOfExperience: professionalContext.yearsOfExperience,
		targetRoles: professionalContext.targetRoles || [],
		writingStyle: preferences?.aiWritingStyle || "professional",
		emphasizeQuantitativeResults:
			preferences?.emphasizeQuantitativeResults ?? true,
		includePortfolio: preferences?.includePortfolio ?? true,
		region: "north_america", // Could be expanded to detect from IP/settings
	};
};
