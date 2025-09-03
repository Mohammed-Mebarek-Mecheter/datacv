import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { cvs } from "@/db/schema/cvs";
import { protectedProcedure, router } from "@/lib/trpc";
import {
    cvPersonalInfoSchema
} from "./schemas";
import type { DataSpecialization } from "@/lib/data-ai";

export const cvRouter = router({
    // Get all user's CVs
    list: protectedProcedure
        .input(z.object({
            targetInstitutionType: z.enum(["university", "research_institute", "industry_lab", "government", "startup", "non_profit"]).optional(),
        }))
        .query(async ({ctx }) => {
            const userId = ctx.session.user.id;

            return db
                .select({
                    id: cvs.id,
                    title: cvs.title,
                    isDefault: cvs.isDefault,
                    targetPosition: cvs.targetPosition,
                    targetSpecialization: cvs.targetSpecialization,
                    targetInstitutionType: cvs.targetInstitutionType,
                    researchArea: cvs.researchArea,
                    updatedAt: cvs.updatedAt,
                    createdAt: cvs.createdAt,
                })
                .from(cvs)
                .where(eq(cvs.userId, userId))
                .orderBy(cvs.updatedAt);
        }),

    // Get specific CV
    get: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            const cv = await db
                .select()
                .from(cvs)
                .where(and(eq(cvs.id, input.id), eq(cvs.userId, userId)))
                .limit(1);

            if (!cv[0]) {
                throw new Error("CV not found");
            }

            return cv[0];
        }),

    // Create new CV
    create: protectedProcedure
        .input(z.object({
            title: z.string(),
            targetPosition: z.string().optional(),
            targetSpecialization: z.string().optional() as z.ZodOptional<z.ZodType<DataSpecialization>>,
            targetInstitutionType: z.enum(["university", "research_institute", "industry_lab", "government", "startup", "non_profit"]).optional(),
            researchArea: z.string().optional(),
            researchKeywords: z.array(z.string()).default([]),
            templateId: z.string().optional(),
            templateVariantId: z.string().optional(),
            personalInfo: cvPersonalInfoSchema.optional(),
            designConfig: z.object({
                academicStyle: z.boolean().optional(),
                publicationStyle: z.enum(["apa", "mla", "chicago", "ieee", "nature", "custom"]).optional(),
                pageNumbering: z.boolean().optional(),
                sectionNumbering: z.boolean().optional(),
            }).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            const [newCv] = await db
                .insert(cvs)
                .values({
                    userId,
                    title: input.title,
                    targetPosition: input.targetPosition || null,
                    targetSpecialization: input.targetSpecialization || null,
                    targetInstitutionType: input.targetInstitutionType || null,
                    researchArea: input.researchArea || null,
                    researchKeywords: input.researchKeywords,
                    templateId: input.templateId || null,
                    templateVariantId: input.templateVariantId || null,
                    isFromTemplate: !!(input.templateId || input.templateVariantId),
                    personalInfo: input.personalInfo || null,
                    designConfig: input.designConfig || null,
                })
                .returning();

            return newCv;
        }),

    // Enhanced update for academic CVs
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            title: z.string().optional(),
            targetPosition: z.string().optional(),
            targetSpecialization: z.string().optional() as z.ZodOptional<z.ZodType<DataSpecialization>>,
            targetInstitutionType: z.enum(["university", "research_institute", "industry_lab", "government", "startup", "non_profit"]).optional(),
            researchArea: z.string().optional(),
            researchKeywords: z.array(z.string()).optional(),
            personalInfo: cvPersonalInfoSchema.optional(),
            researchStatement: z.string().optional(),
            researchStatementStyle: z.enum(["narrative", "structured", "problem_focused", "methodology_focused"]).optional(),
            teachingPhilosophy: z.string().optional(),
            teachingExperience: z.array(z.object({
                id: z.string(),
                institution: z.string(),
                courseTitle: z.string(),
                courseNumber: z.string().optional(),
                level: z.enum(["undergraduate", "graduate", "professional", "workshop"]),
                role: z.enum(["instructor", "teaching_assistant", "guest_lecturer", "course_designer"]),
                semester: z.string(),
                year: z.string(),
                enrollment: z.number().optional(),
                courseDescription: z.string().optional(),
                syllabusUrl: z.url().optional(),
                evaluationMethods: z.array(z.string()).optional(),
                studentEvaluations: z.object({
                    averageRating: z.number().optional(),
                    totalResponses: z.number().optional(),
                    highlights: z.array(z.string()).optional(),
                }).optional(),
                teachingInnovations: z.array(z.string()).optional(),
                technologyUsed: z.array(z.string()).optional(),
                isVisible: z.boolean(),
                priority: z.number(),
            })).optional(),
            // Add other CV-specific sections as needed
            settings: z.object({
                includePersonalPhoto: z.boolean(),
                includeResearchStatement: z.boolean(),
                includeTeachingPhilosophy: z.boolean(),
                includeDiversityStatement: z.boolean(),
                includeReferences: z.boolean(),
                citationStyle: z.enum(["apa", "mla", "chicago", "ieee", "nature", "custom"]),
                showPageNumbers: z.boolean(),
                showSectionNumbers: z.boolean(),
                useAcademicDateFormat: z.boolean(),
                groupPublicationsByType: z.boolean(),
                sortPublicationsBy: z.enum(["date", "importance", "citations", "alphabetical"]),
                showCitationCounts: z.boolean(),
                showImpactFactors: z.boolean(),
                showHIndex: z.boolean(),
                maxCvLength: z.enum(["no_limit", "5_pages", "10_pages", "15_pages"]),
                detailLevel: z.enum(["concise", "standard", "comprehensive"]),
                includeAbstracts: z.boolean(),
                includeKeywords: z.boolean(),
                emphasizeRecentWork: z.boolean(),
                highlightCollaborations: z.boolean(),
                showFundingAmounts: z.boolean(),
                includePendingSubmissions: z.boolean(),
                showTeachingEvaluations: z.boolean(),
                includeServiceDetails: z.boolean(),
                showMentorshipRecord: z.boolean(),
                preferredFormat: z.enum(["pdf", "docx", "txt", "json"]),
                pageFormat: z.enum(["a4", "us_letter"]),
                orientation: z.enum(["portrait", "landscape"]),
                anonymizeInProgress: z.boolean(),
                showPersonalAddress: z.boolean(),
                includePhoneNumber: z.boolean(),
            }).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;
            const { id, ...updateData } = input;

            await db
                .update(cvs)
                .set({
                    ...updateData,
                    updatedAt: new Date(),
                    version: 1, // TODO: Implement proper version incrementing
                })
                .where(and(eq(cvs.id, id), eq(cvs.userId, userId)));

            return { success: true };
        }),

    // Delete CV
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            const deleted = await db
                .delete(cvs)
                .where(and(eq(cvs.id, input.id), eq(cvs.userId, userId)))
                .returning({ id: cvs.id });

            if (!deleted.length) {
                throw new Error("CV not found or not authorized to delete");
            }

            return { success: true, id: deleted[0].id };
        }),
});
