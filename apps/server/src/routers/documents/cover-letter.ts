import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { coverLetters } from "@/db/schema/cover-letters";
import { protectedProcedure, router } from "@/lib/trpc";
import {
    coverLetterPersonalInfoSchema,
    commonTargetingSchema,
} from "./schemas";

export const coverLetterRouter = router({
    // Get all user's cover letters
    list: protectedProcedure
        .input(z.object({
            company: z.string().optional(),
        }))
        .query(async ({ctx }) => {
            const userId = ctx.session.user.id;

            let query = db
                .select({
                    id: coverLetters.id,
                    title: coverLetters.title,
                    targetCompany: coverLetters.targetCompany,
                    targetRole: coverLetters.targetRole,
                    targetJobTitle: coverLetters.targetJobTitle,
                    isPublic: coverLetters.isPublic,
                    linkedResumeId: coverLetters.linkedResumeId,
                    updatedAt: coverLetters.updatedAt,
                    createdAt: coverLetters.createdAt,
                })
                .from(coverLetters)
                .where(eq(coverLetters.userId, userId));

            return query.orderBy(coverLetters.updatedAt);
        }),

    // Get specific cover letter
    get: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            const coverLetter = await db
                .select()
                .from(coverLetters)
                .where(and(eq(coverLetters.id, input.id), eq(coverLetters.userId, userId)))
                .limit(1);

            if (!coverLetter[0]) {
                throw new Error("Cover letter not found");
            }

            return coverLetter[0];
        }),

    // Create new cover letter
    create: protectedProcedure
        .input(z.object({
            title: z.string(),
            targetCompany: z.string(),
            ...commonTargetingSchema.shape,
            targetRole: z.string(),
            templateId: z.string().optional(),
            templateVariantId: z.string().optional(),
            linkedResumeId: z.string().optional(),
            personalInfo: coverLetterPersonalInfoSchema.optional(),
            jobContext: z.object({
                jobDescription: z.string().optional(),
                requiredSkills: z.array(z.string()).default([]),
                preferredSkills: z.array(z.string()).default([]),
                companyValues: z.array(z.string()).default([]),
                companyNews: z.array(z.string()).default([]),
                hiringManagerName: z.string().optional(),
                referralSource: z.string().optional(),
                applicationDeadline: z.string().optional(),
                companyResearch: z.object({
                    recentNews: z.array(z.string()).default([]),
                    values: z.array(z.string()).default([]),
                    culture: z.array(z.string()).default([]),
                    challenges: z.array(z.string()).default([]),
                }).optional(),
            }).optional(),
            designConfig: z.object({
                layoutStyle: z.enum(["traditional", "modern", "split_layout", "header_match", "creative"]).optional(),
                matchResumeHeader: z.boolean().optional(),
                headerStyle: z.enum(["minimal", "standard", "prominent", "branded"]).optional(),
                letterhead: z.object({
                    includeLogo: z.boolean().optional(),
                    includeAddress: z.boolean().optional(),
                    dateFormat: z.enum(["full", "short", "hidden"]).optional(),
                    recipientFormat: z.enum(["formal", "modern"]).optional(),
                }).optional(),
                formalFormatting: z.boolean().optional(),
            }).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            const [newCoverLetter] = await db
                .insert(coverLetters)
                .values({
                    userId,
                    title: input.title,
                    targetCompany: input.targetCompany,
                    targetRole: input.targetRole,
                    targetJobTitle: input.targetJobTitle || null,
                    targetSpecialization: input.targetSpecialization || null,
                    targetIndustry: input.targetIndustry || null,
                    targetCompanyType: input.targetCompanyType || null,
                    templateId: input.templateId || null,
                    templateVariantId: input.templateVariantId || null,
                    isFromTemplate: !!(input.templateId || input.templateVariantId),
                    linkedResumeId: input.linkedResumeId || null,
                    personalInfo: input.personalInfo || null,
                    jobContext: input.jobContext || null,
                    designConfig: input.designConfig || null,
                })
                .returning();

            return newCoverLetter;
        }),

    // Enhanced update with comprehensive cover letter structure
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            title: z.string().optional(),
            targetCompany: z.string().optional(),
            targetRole: z.string().optional(),
            targetJobTitle: z.string().optional(),
            personalInfo: coverLetterPersonalInfoSchema.optional(),
            letterDate: z.string().optional(),
            recipientInfo: z.object({
                hiringManagerName: z.string().optional(),
                hiringManagerTitle: z.string().optional(),
                companyName: z.string(),
                companyAddress: z.object({
                    street: z.string().optional(),
                    city: z.string().optional(),
                    state: z.string().optional(),
                    zipCode: z.string().optional(),
                }).optional(),
                department: z.string().optional(),
            }).optional(),
            salutation: z.string().optional(),
            salutationStyle: z.enum(["formal", "personal", "modern"]).optional(),
            opening: z.object({
                content: z.string(),
                hookType: z.enum([
                    "personal_connection",
                    "company_news",
                    "shared_values",
                    "impressive_metric",
                    "industry_insight",
                    "referral",
                    "passion_driven"
                ]),
                hookContext: z.object({
                    connectionName: z.string().optional(),
                    newsSource: z.string().optional(),
                    metricDetails: z.object({
                        metric: z.string(),
                        value: z.string(),
                        context: z.string(),
                    }).optional(),
                    sharedValueDetails: z.string().optional(),
                }).optional(),
                style: z.enum(["direct", "storytelling", "question", "statement"]).optional(),
                tone: z.enum(["confident", "enthusiastic", "professional", "conversational"]).optional(),
            }).optional(),
            bodyParagraphs: z.array(z.object({
                id: z.string(),
                type: z.enum([
                    "experience",
                    "skills",
                    "achievements",
                    "cultural_fit",
                    "passion",
                    "problem_solving",
                    "innovation",
                    "leadership"
                ]),
                content: z.string(),
                supportingEvidence: z.array(z.object({
                    type: z.enum(["metric", "achievement", "skill", "project", "reference"]),
                    description: z.string(),
                    quantifiableResult: z.string().optional(),
                })).optional(),
                addressesRequirement: z.string().optional(),
                relevanceScore: z.number().min(0).max(100).optional(),
                tone: z.enum(["confident", "humble", "enthusiastic", "analytical"]).optional(),
                focus: z.enum(["technical", "business", "personal", "team"]).optional(),
                includesMetrics: z.boolean().optional(),
                includesTechStack: z.boolean().optional(),
                priority: z.number(),
                isCore: z.boolean().optional(),
            })).optional(),
            closing: z.object({
                content: z.string(),
                callToAction: z.string(),
                availability: z.object({
                    immediateStart: z.boolean().optional(),
                    noticePeriod: z.string().optional(),
                    relocatingWillingness: z.boolean().optional(),
                    travelWillingness: z.boolean().optional(),
                }).optional(),
                nextSteps: z.string().optional(),
                followUpTimeline: z.string().optional(),
                style: z.enum(["formal", "confident", "grateful", "forward_looking"]).optional(),
                urgencyLevel: z.enum(["none", "subtle", "moderate", "high"]).optional(),
                signature: z.object({
                    includeTitle: z.boolean().optional(),
                    includeCompany: z.boolean().optional(),
                    includeLinkedIn: z.boolean().optional(),
                }).optional(),
            }).optional(),
            projectHighlights: z.array(z.object({
                id: z.string(),
                projectName: z.string(),
                description: z.string(),
                relevanceToRole: z.string(),
                technologiesUsed: z.array(z.string()),
                dataVolume: z.string().optional(),
                complexity: z.enum(["low", "medium", "high"]).optional(),
                businessProblem: z.string(),
                solution: z.string(),
                impact: z.string(),
                stakeholders: z.array(z.string()).optional(),
                quantifiableResults: z.array(z.object({
                    metric: z.string(),
                    value: z.string(),
                    timeframe: z.string().optional(),
                })).optional(),
                portfolioUrl: z.url().optional(),
                githubUrl: z.url().optional(),
                demoUrl: z.url().optional(),
                priority: z.number(),
                emphasizeInLetter: z.boolean().optional(),
            })).optional(),
            settings: z.object({
                layoutStyle: z.enum(["traditional", "modern", "split_layout", "branded"]),
                headerStyle: z.enum(["minimal", "standard", "prominent", "match_resume"]),
                includeSalutation: z.boolean(),
                includeDate: z.boolean(),
                includeRecipientAddress: z.boolean(),
                includeSubjectLine: z.boolean(),
                preferredLength: z.enum(["concise", "standard", "detailed"]),
                tonePreference: z.enum(["formal", "professional", "conversational", "enthusiastic"]),
                emphasizeCompliance: z.boolean().optional(),
                includePortfolioLinks: z.boolean().optional(),
                emphasizeRemoteCapability: z.boolean().optional(),
                highlightDiversityCommitment: z.boolean().optional(),
                preferredFormat: z.enum(["pdf", "docx", "txt", "json"]),
                includeCoverPage: z.boolean().optional(),
                watermarkEnabled: z.boolean().optional(),
            }).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;
            const { id, ...updateData } = input;

            await db
                .update(coverLetters)
                .set({
                    ...updateData,
                    updatedAt: new Date(),
                    version: 1, // TODO: Implement proper version incrementing
                })
                .where(and(eq(coverLetters.id, id), eq(coverLetters.userId, userId)));

            return { success: true };
        }),

    // Delete cover letter
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            const deleted = await db
                .delete(coverLetters)
                .where(and(eq(coverLetters.id, input.id), eq(coverLetters.userId, userId)))
                .returning({ id: coverLetters.id });

            if (!deleted.length) {
                throw new Error("Cover letter not found or not authorized to delete");
            }

            return { success: true, id: deleted[0].id };
        }),

    // Duplicate cover letter
    duplicate: protectedProcedure
        .input(z.object({
            id: z.string(),
            title: z.string().optional(),
            targetCompany: z.string().optional(),
            preservePersonalInfo: z.boolean().default(true),
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            const original = await db
                .select()
                .from(coverLetters)
                .where(and(eq(coverLetters.id, input.id), eq(coverLetters.userId, userId)))
                .limit(1);

            if (!original[0]) {
                throw new Error("Cover letter not found");
            }

            const duplicateData = {
                ...original[0],
                id: undefined,
                title: input.title || `${original[0].title} (Copy)`,
                targetCompany: input.targetCompany || original[0].targetCompany,
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

            const [duplicate] = await db
                .insert(coverLetters)
                .values(duplicateData)
                .returning();

            return duplicate;
        }),

    // Update application status with tracking
    updateStatus: protectedProcedure
        .input(z.object({
            id: z.string(),
            status: z.enum([
                "draft", "ready", "sent", "delivered", "viewed",
                "interview_scheduled", "interview_completed",
                "offer_received", "rejected", "withdrawn"
            ]),
            notes: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            const updateData: any = {
                applicationStatus: input.status,
                updatedAt: new Date(),
            };

            // Set submission date if being marked as sent
            if (input.status === "sent") {
                updateData.dateSubmitted = new Date();
            }

            // TODO: Add to application history
            // This would require getting the current record first to append to history

            await db
                .update(coverLetters)
                .set(updateData)
                .where(and(eq(coverLetters.id, input.id), eq(coverLetters.userId, userId)));

            return { success: true };
        }),
});
