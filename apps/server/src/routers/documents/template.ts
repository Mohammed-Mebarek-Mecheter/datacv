// apps/server/src/routers/document/template.ts
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { documentTemplates } from "@/db/schema/document-templates";
import type {
    DataIndustry,
    DataSpecialization,
    DocumentsType
} from "@/lib/data-ai";
import { protectedProcedure, router } from "@/lib/trpc";

export const templateRouter = router({
    // Get available templates
    getTemplates: protectedProcedure
        .input(
            z.object({
                DocumentsType: z.string() as z.ZodType<DocumentsType>,
                specialization: z.string().optional() as z.ZodOptional<
                    z.ZodType<DataSpecialization>
                >,
                industry: z.string().optional() as z.ZodOptional<
                    z.ZodType<DataIndustry>
                >,
            }),
        )
        .query(async ({ input }) => {
            // Add filters based on input
            return db
                .select({
                    id: documentTemplates.id,
                    name: documentTemplates.name,
                    description: documentTemplates.description,
                    category: documentTemplates.category,
                    templateStructure: documentTemplates.templateStructure,
                    designConfig: documentTemplates.designConfig,
                    isPremium: documentTemplates.isPremium,
                    usageCount: documentTemplates.usageCount,
                    avgRating: documentTemplates.avgRating,
                })
                .from(documentTemplates)
                .where(eq(documentTemplates.DocumentsType, input.DocumentsType));
        }),

    // Get template by ID
    getTemplate: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const template = await db
                .select()
                .from(documentTemplates)
                .where(eq(documentTemplates.id, input.id))
                .limit(1);

            if (!template[0]) {
                throw new Error("Template not found");
            }

            return template[0];
        }),
});
