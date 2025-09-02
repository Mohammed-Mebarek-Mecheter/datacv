// apps/server/src/routers/user.ts

import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { coverLetters } from "@/db/schema/cover-letters";
import { cvs } from "@/db/schema/cvs";
import { resumes } from "@/db/schema/resumes";
import { userOnboarding, userPreferences } from "@/db/schema/user";
import type {
	DataIndustry,
	DataSpecialization,
	DocumentsType,
	ExperienceLevel,
} from "@/lib/data-ai";
import { protectedProcedure, router } from "@/lib/trpc";

// 🔹 Reusable helper for document counts
async function getDocumentCounts(userId: string) {
	const [resumeCount] = await db
		.select({ count: count() })
		.from(resumes)
		.where(eq(resumes.userId, userId));

	const [cvCount] = await db
		.select({ count: count() })
		.from(cvs)
		.where(eq(cvs.userId, userId));

	const [coverLetterCount] = await db
		.select({ count: count() })
		.from(coverLetters)
		.where(eq(coverLetters.userId, userId));

	return {
		resumes: resumeCount.count,
		cvs: cvCount.count,
		coverLetters: coverLetterCount.count,
		total: resumeCount.count + cvCount.count + coverLetterCount.count,
	};
}

export const userRouter = router({
	// Get current user profile and stats
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// Onboarding
		const onboardingData = await db
			.select()
			.from(userOnboarding)
			.where(eq(userOnboarding.userId, userId))
			.limit(1);

		// Preferences
		const preferencesData = await db
			.select()
			.from(userPreferences)
			.where(eq(userPreferences.userId, userId))
			.limit(1);

		// 🔹 Reuse helper
		const documentCounts = await getDocumentCounts(userId);

		return {
			user: ctx.session.user,
			onboarding: onboardingData[0] || null,
			preferences: preferencesData[0] || null,
			stats: documentCounts,
		};
	}),

	// Update onboarding progress
	updateOnboarding: protectedProcedure
		.input(
			z.object({
				currentStep: z.string(),
				collectedInfo: z
					.object({
						firstName: z.string().optional(),
						lastName: z.string().optional(),
						email: z.string().optional(),
						dataSpecialization: z.string().optional() as z.ZodOptional<
							z.ZodType<DataSpecialization>
						>,
						experienceLevel: z.string().optional() as z.ZodOptional<
							z.ZodType<ExperienceLevel>
						>,
						targetIndustries: z.array(z.string()).optional() as z.ZodOptional<
							z.ZodArray<z.ZodType<DataIndustry>>
						>,
						yearsOfExperience: z.number().optional(),
					})
					.optional(),
				initialDocumentChoice: z.string().optional() as z.ZodOptional<
					z.ZodType<DocumentsType>
				>,
				firstDocumentCreated: z.boolean().optional(),
				isCompleted: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			const existing = await db
				.select()
				.from(userOnboarding)
				.where(eq(userOnboarding.userId, userId))
				.limit(1);

			const updateData = {
				currentStep: input.currentStep,
				...(input.collectedInfo && { collectedInfo: input.collectedInfo }),
				...(input.initialDocumentChoice && {
					initialDocumentChoice: input.initialDocumentChoice,
				}),
				...(input.firstDocumentCreated !== undefined && {
					firstDocumentCreated: input.firstDocumentCreated,
				}),
				...(input.isCompleted !== undefined && {
					isCompleted: input.isCompleted,
					...(input.isCompleted && { completedAt: new Date() }),
				}),
				updatedAt: new Date(),
			};

			if (existing.length > 0) {
				await db
					.update(userOnboarding)
					.set(updateData)
					.where(eq(userOnboarding.userId, userId));
			} else {
				await db.insert(userOnboarding).values({
					userId,
					...updateData,
				});
			}

			return { success: true };
		}),

	// Update user preferences
	updatePreferences: protectedProcedure
		.input(
			z.object({
				dataSpecialization: z.string().optional() as z.ZodOptional<
					z.ZodType<DataSpecialization>
				>,
				experienceLevel: z.string().optional() as z.ZodOptional<
					z.ZodType<ExperienceLevel>
				>,
				primaryIndustry: z.string().optional() as z.ZodOptional<
					z.ZodType<DataIndustry>
				>,
				yearsOfExperience: z.number().optional(),
				targetRoles: z.array(z.string()).optional(),
				aiWritingStyle: z
					.enum(["professional", "technical", "creative", "academic"])
					.optional(),
				defaultDocumentsType: z.string().optional() as z.ZodOptional<
					z.ZodType<DocumentsType>
				>,
				defaultTemplate: z.string().optional(),
				includePortfolio: z.boolean().optional(),
				emphasizeQuantitativeResults: z.boolean().optional(),
				subscriptionPlan: z.enum(["free", "monthly", "lifetime"]).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			const existing = await db
				.select()
				.from(userPreferences)
				.where(eq(userPreferences.userId, userId))
				.limit(1);

			const updateData = {
				...input,
				updatedAt: new Date(),
			};

			if (existing.length > 0) {
				await db
					.update(userPreferences)
					.set(updateData)
					.where(eq(userPreferences.userId, userId));
			} else {
				await db.insert(userPreferences).values({
					userId,
					...updateData,
				});
			}

			return { success: true };
		}),

	// Get dashboard statistics
	getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// 🔹 Reuse helper for counts
		const documentCounts = await getDocumentCounts(userId);

		// Recent documents
		const recentResumes = (
			await db
				.select({
					id: resumes.id,
					title: resumes.title,
					updatedAt: resumes.updatedAt,
				})
				.from(resumes)
				.where(eq(resumes.userId, userId))
				.orderBy(desc(resumes.updatedAt))
				.limit(3)
		).map((r) => ({
			...r,
			type: "resume" as const,
		}));

		const recentCvs = (
			await db
				.select({
					id: cvs.id,
					title: cvs.title,
					updatedAt: cvs.updatedAt,
				})
				.from(cvs)
				.where(eq(cvs.userId, userId))
				.orderBy(desc(cvs.updatedAt))
				.limit(3)
		).map((c) => ({
			...c,
			type: "cv" as const,
		}));

		const recentCoverLetters = (
			await db
				.select({
					id: coverLetters.id,
					title: coverLetters.title,
					updatedAt: coverLetters.updatedAt,
				})
				.from(coverLetters)
				.where(eq(coverLetters.userId, userId))
				.orderBy(desc(coverLetters.updatedAt))
				.limit(3)
		).map((cl) => ({
			...cl,
			type: "cover_letter" as const,
		}));

		const allRecent = [...recentResumes, ...recentCvs, ...recentCoverLetters]
			.sort(
				(a, b) =>
					new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
			)
			.slice(0, 5);

		return {
			documentCounts,
			recentDocuments: allRecent,
		};
	}),
});
