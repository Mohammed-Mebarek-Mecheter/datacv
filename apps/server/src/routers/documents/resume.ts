import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { resumes } from "@/db/schema/resumes";
import { protectedProcedure, router } from "@/lib/trpc";
import {
    resumePersonalInfoSchema,
    skillSchema,
    projectSchema,
    workExperienceSchema,
    educationSchema,
    certificationSchema,
    achievementSchema,
    publicationSchema,
    commonTargetingSchema,
    designConfigSchema,
} from "./schemas";

export const resumeRouter = router({
    // Get all user's resumes with enhanced filtering
    list: protectedProcedure
        .input(z.object({
            includeArchived: z.boolean().default(false),
            targetRole: z.string().optional(),
            targetIndustry: z.string().optional(),
        }))
        .query(async ({ctx }) => {
            const userId = ctx.session.user.id;

            return db
                .select({
                    id: resumes.id,
                    title: resumes.title,
                    isDefault: resumes.isDefault,
                    targetRole: resumes.targetRole,
                    targetJobTitle: resumes.targetJobTitle,
                    targetSpecialization: resumes.targetSpecialization,
                    targetIndustry: resumes.targetIndustry,
                    experienceLevel: resumes.experienceLevel,
                    isPublic: resumes.isPublic,
                    version: resumes.version,
                    lastExportedAt: resumes.lastExportedAt,
                    exportCount: resumes.exportCount,
                    updatedAt: resumes.updatedAt,
                    createdAt: resumes.createdAt,
                })
                .from(resumes)
                .where(eq(resumes.userId, userId))
                .orderBy(resumes.updatedAt);
        }),

    // Get specific resume with full details
    get: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            const resume = await db
                .select()
                .from(resumes)
                .where(and(eq(resumes.id, input.id), eq(resumes.userId, userId)))
                .limit(1);

            if (!resume[0]) {
                throw new Error("Resume not found");
            }

            return resume[0];
        }),

    // Create new resume with enhanced options
    create: protectedProcedure
        .input(z.object({
            title: z.string(),
            ...commonTargetingSchema.shape,
            templateId: z.string().optional(),
            templateVariantId: z.string().optional(),
            personalInfo: resumePersonalInfoSchema.optional(),
            designConfig: designConfigSchema.optional(),
            linkedResumeId: z.string().optional(), // For creating variations
            settings: z.object({
                includePortfolio: z.boolean().default(true),
                emphasizeQuantitativeResults: z.boolean().default(true),
                showTechnicalSkills: z.boolean().default(true),
                showSoftSkills: z.boolean().default(true),
                includeSideProjects: z.boolean().default(true),
                colorScheme: z.string().default("professional"),
                fontFamily: z.string().default("Inter"),
                layoutStyle: z.string().default("single_column"),
                headerStyle: z.string().default("standard"),
                preferredFormat: z.enum(["pdf", "docx", "txt", "json"]).default("pdf"),
                pageFormat: z.enum(["a4", "us_letter"]).default("a4"),
                orientation: z.enum(["portrait", "landscape"]).default("portrait"),
                showPersonalPhoto: z.boolean().default(false),
                showFullAddress: z.boolean().default(false),
                anonymizeCompanyNames: z.boolean().default(false),
            }).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            const [newResume] = await db
                .insert(resumes)
                .values({
                    userId,
                    title: input.title,
                    targetRole: input.targetRole || null,
                    targetJobTitle: input.targetJobTitle || null,
                    targetSpecialization: input.targetSpecialization || null,
                    targetIndustry: input.targetIndustry || null,
                    targetCompanyType: input.targetCompanyType || null,
                    experienceLevel: input.experienceLevel || null,
                    templateId: input.templateId || null,
                    templateVariantId: input.templateVariantId || null,
                    isFromTemplate: !!(input.templateId || input.templateVariantId),
                    personalInfo: input.personalInfo || null,
                    designConfig: input.designConfig || null,
                    settings: input.settings || null,
                })
                .returning();

            return newResume;
        }),

    // Enhanced update with comprehensive field support
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            title: z.string().optional(),
            ...commonTargetingSchema.shape,
            personalInfo: resumePersonalInfoSchema.optional(),
            professionalSummary: z.string().optional(),
            summaryStyle: z.enum(["paragraph", "bullet_points", "hybrid", "metrics_focused"]).optional(),
            workExperience: z.array(workExperienceSchema).optional(),
            education: z.array(educationSchema).optional(),
            skills: z.array(skillSchema).optional(),
            projects: z.array(projectSchema).optional(),
            certifications: z.array(certificationSchema).optional(),
            achievements: z.array(achievementSchema).optional(),
            publications: z.array(publicationSchema).optional(),
            designConfig: designConfigSchema.optional(),
            settings: z.object({
                includePortfolio: z.boolean(),
                emphasizeQuantitativeResults: z.boolean(),
                showTechnicalSkills: z.boolean(),
                showSoftSkills: z.boolean(),
                includeSideProjects: z.boolean(),
                colorScheme: z.string(),
                fontFamily: z.string(),
                layoutStyle: z.string(),
                headerStyle: z.string(),
                preferredFormat: z.enum(["pdf", "docx", "txt", "json"]),
                pageFormat: z.enum(["a4", "us_letter"]),
                orientation: z.enum(["portrait", "landscape"]),
                showPersonalPhoto: z.boolean(),
                showFullAddress: z.boolean(),
                anonymizeCompanyNames: z.boolean(),
                emphasizeCompliance: z.boolean().optional(),
                showPublications: z.boolean().optional(),
                includePortfolioGallery: z.boolean().optional(),
            }).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;
            const { id, ...updateData } = input;

            await db
                .update(resumes)
                .set({
                    ...updateData,
                    updatedAt: new Date(),
                    version: 1, // TODO: Implement proper version incrementing
                })
                .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));

            return { success: true };
        }),

    // Duplicate resume with enhanced options
    duplicate: protectedProcedure
        .input(z.object({
            id: z.string(),
            title: z.string().optional(),
            targetRole: z.string().optional(),
            preservePersonalInfo: z.boolean().default(true),
            preserveDesignConfig: z.boolean().default(true),
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            const original = await db
                .select()
                .from(resumes)
                .where(and(eq(resumes.id, input.id), eq(resumes.userId, userId)))
                .limit(1);

            if (!original[0]) {
                throw new Error("Resume not found");
            }

            const duplicateData = {
                ...original[0],
                id: undefined,
                title: input.title || `${original[0].title} (Copy)`,
                targetRole: input.targetRole || original[0].targetRole,
                isDefault: false,
                isPublic: false,
                shareToken: null,
                version: 1,
                exportCount: 0,
                lastExportedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            if (!input.preservePersonalInfo) {
                duplicateData.personalInfo = null;
            }

            if (!input.preserveDesignConfig) {
                duplicateData.designConfig = null;
                duplicateData.templateId = null;
                duplicateData.templateVariantId = null;
            }

            const [duplicate] = await db
                .insert(resumes)
                .values(duplicateData)
                .returning();

            return duplicate;
        }),

    // Delete resume
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            const deleted = await db
                .delete(resumes)
                .where(and(eq(resumes.id, input.id), eq(resumes.userId, userId)))
                .returning({ id: resumes.id });

            if (!deleted.length) {
                throw new Error("Resume not found or not authorized to delete");
            }

            return { success: true, id: deleted[0].id };
        }),

    // Set default resume
    setDefault: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            // Remove default from all user's resumes
            await db
                .update(resumes)
                .set({ isDefault: false, updatedAt: new Date() })
                .where(eq(resumes.userId, userId));

            // Set new default
            const updated = await db
                .update(resumes)
                .set({ isDefault: true, updatedAt: new Date() })
                .where(and(eq(resumes.id, input.id), eq(resumes.userId, userId)))
                .returning({ id: resumes.id });

            if (!updated.length) {
                throw new Error("Resume not found or not authorized to modify");
            }

            return { success: true };
        }),
});
