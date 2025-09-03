// apps/server/src/routers/documents/shared-router.ts
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { resumes } from "@/db/schema/resumes";
import { cvs } from "@/db/schema/cvs";
import { coverLetters } from "@/db/schema/cover-letters";
import { protectedProcedure, router } from "@/lib/trpc";
import type { DocumentsType } from "@/lib/data-ai";

export const sharedRouter = router({
    // Get document analytics across all types
    getAnalytics: protectedProcedure
        .input(z.object({
            period: z.enum(["week", "month", "quarter", "year"]).default("month"),
        }))
        .query(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            // This would be a complex query joining multiple document types
            // For now, return basic counts
            const resumeCount = await db
                .select({ count: resumes.id })
                .from(resumes)
                .where(eq(resumes.userId, userId));

            const cvCount = await db
                .select({ count: cvs.id })
                .from(cvs)
                .where(eq(cvs.userId, userId));

            const coverLetterCount = await db
                .select({ count: coverLetters.id })
                .from(coverLetters)
                .where(eq(coverLetters.userId, userId));

            return {
                totalDocuments: resumeCount.length + cvCount.length + coverLetterCount.length,
                resumes: resumeCount.length,
                cvs: cvCount.length,
                coverLetters: coverLetterCount.length,
                // Add more analytics as needed
            };
        }),

    // Export document to various formats
    /*export: protectedProcedure
    // {this functionality will be implemented in a separate service}
        }),*/

    // Bulk operations
    bulkDelete: protectedProcedure
        .input(z.object({
            documentType: z.string() as z.ZodType<DocumentsType>,
            documentIds: z.array(z.string()),
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            let deletedCount = 0;
            switch (input.documentType) {
                case "resume":
                    const deletedResumes = await db
                        .delete(resumes)
                        .where(and(
                            inArray(resumes.id, input.documentIds),
                            eq(resumes.userId, userId)
                        ))
                        .returning({ id: resumes.id });
                    deletedCount = deletedResumes.length;
                    break;
                case "cv":
                    const deletedCvs = await db
                        .delete(cvs)
                        .where(and(
                            inArray(cvs.id, input.documentIds),
                            eq(cvs.userId, userId)
                        ))
                        .returning({ id: cvs.id });
                    deletedCount = deletedCvs.length;
                    break;
                case "cover_letter":
                    const deletedCoverLetters = await db
                        .delete(coverLetters)
                        .where(and(
                            inArray(coverLetters.id, input.documentIds),
                            eq(coverLetters.userId, userId)
                        ))
                        .returning({ id: coverLetters.id });
                    deletedCount = deletedCoverLetters.length;
                    break;
            }

            return { success: true, deletedCount };
        }),
});
