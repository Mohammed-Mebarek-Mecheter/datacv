// apps/server/src/routers/documents/template-documents.ts
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { documentTemplates } from "@/db/schema/document-templates";
import { protectedProcedure, router } from "@/lib/trpc";
import type { DocumentsType, DataSpecialization, DataIndustry } from "@/lib/data-ai";

export const templateRouter = router({
    // Get available templates with enhanced filtering
    list: protectedProcedure
        .input(z.object({
            documentType: z.string() as z.ZodType<DocumentsType>,
            specialization: z.string().optional() as z.ZodOptional<z.ZodType<DataSpecialization>>,
            industry: z.string().optional() as z.ZodOptional<z.ZodType<DataIndustry>>,
            category: z.string().optional(),
            isPremium: z.boolean().optional(),
            minRating: z.number().min(0).max(5).optional(),
        }))
        .query(async ({ input }) => {
            let query = db
                .select({
                    id: documentTemplates.id,
                    name: documentTemplates.name,
                    description: documentTemplates.description,
                    category: documentTemplates.category,
                    DocumentsType: documentTemplates.DocumentsType,
                    targetSpecialization: documentTemplates.targetSpecialization,
                    targetIndustry: documentTemplates.targetIndustries,
                    templateStructure: documentTemplates.templateStructure,
                    designConfig: documentTemplates.designConfig,
                    isPremium: documentTemplates.isPremium,
                    usageCount: documentTemplates.usageCount,
                    avgRating: documentTemplates.avgRating,
                    previewImages: documentTemplates.previewImages,
                    createdAt: documentTemplates.createdAt,
                    updatedAt: documentTemplates.updatedAt,
                })
                .from(documentTemplates)
                .where(eq(documentTemplates.DocumentsType, input.documentType));

            return query;
        }),

    // Get specific template with variants
    get: protectedProcedure
        .input(z.object({
            id: z.string(),
            includeVariants: z.boolean().default(true),
        }))
        .query(async ({ input }) => {
            const template = await db
                .select()
                .from(documentTemplates)
                .where(eq(documentTemplates.id, input.id))
                .limit(1);

            if (!template[0]) {
                throw new Error("Template not found");
            }

            // TODO: If includeVariants is true, fetch template variants
            // This would require a separate table for template variants

            return template[0];
        }),
});
