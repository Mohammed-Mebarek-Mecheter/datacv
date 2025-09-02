// apps/server/src/lib/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});

// Data Professional specific procedure - requires completed onboarding
export const dataProfessionalProcedure = protectedProcedure.use(
	({ ctx, next }) => {
		if (!ctx.userContext?.onboardingStatus?.isCompleted) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Data professional profile required",
				cause: "Incomplete onboarding or missing preferences",
			});
		}

		return next({
			ctx: {
				...ctx,
				userContext: ctx.userContext,
			},
		});
	},
);

// New: Pro procedure - requires active Pro subscription (monthly or lifetime)
export const proProcedure = dataProfessionalProcedure.use(({ ctx, next }) => {
	const plan = ctx.userContext?.preferences?.subscriptionPlan;
	if (plan !== "monthly" && plan !== "lifetime") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Pro subscription required",
			cause: "User on free plan",
		});
	}

	return next({
		ctx: {
			...ctx,
			userContext: ctx.userContext,
		},
	});
});

// New: Admin procedure - requires admin privileges
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (!ctx.isAdmin) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin privileges required",
			cause: "User is not an admin",
		});
	}

	return next({
		ctx: {
			...ctx,
			isAdmin: ctx.isAdmin,
		},
	});
});

// Helper to extract data professional context from user data
export const extractDataProfessionalContext = (userContext: any) => {
	// This would extract the necessary context from user preferences and profile
	// for the AI services
	return {
		targetSpecialization: userContext?.preferences?.dataSpecialization,
		experienceLevel: userContext?.preferences?.experienceLevel,
		targetIndustry: userContext?.preferences?.primaryIndustry,
		yearsOfExperience: userContext?.preferences?.yearsOfExperience,
		primaryTechnologies: userContext?.preferences?.primaryProgrammingLanguages,
		region: userContext?.preferences?.preferredRegion || "north_america",
		// Add more context extraction as needed
	};
};
