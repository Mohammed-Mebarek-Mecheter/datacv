// src/routers/admin/templates/duplication.ts
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documentTemplates } from "@/db/schema/document-templates";
import { adminProcedure, router } from "@/lib/trpc";
import {
    duplicateTemplateSchema,
    createFromBaseSchema,
} from "./schemas";

export const duplicationRouter = router({
    // Enhanced template duplication with customization
    duplicateTemplate: adminProcedure
        .input(duplicateTemplateSchema)
        .mutation(async ({ input, ctx }) => {
            const createdBy = ctx.session.user.id;

            // Get original template
            const [originalTemplate] = await db
                .select()
                .from(documentTemplates)
                .where(eq(documentTemplates.id, input.templateId))
                .limit(1);

            if (!originalTemplate) {
                throw new Error("Template not found");
            }

            // Merge overrides
            const designConfig = input.designConfigOverrides
                ? { ...originalTemplate.designConfig, ...input.designConfigOverrides }
                : originalTemplate.designConfig;

            const templateStructure = input.templateStructureOverrides
                ? {
                    ...originalTemplate.templateStructure,
                    ...input.templateStructureOverrides,
                }
                : originalTemplate.templateStructure;

            // Create new template
            const [newTemplate] = await db
                .insert(documentTemplates)
                .values({
                    ...originalTemplate,
                    id: undefined, // Remove ID to create new template
                    name: input.name,
                    description: input.description || originalTemplate.description,
                    category: input.category || originalTemplate.category,
                    parentTemplateId: input.setAsChildTemplate ? input.templateId : null,
                    designConfig: designConfig as any,
                    templateStructure: templateStructure as any,
                    tags: input.tags || originalTemplate.tags,
                    targetSpecialization:
                        (input.targetSpecialization as any) ||
                        originalTemplate.targetSpecialization,
                    targetIndustries:
                        (input.targetIndustries as any) ||
                        originalTemplate.targetIndustries,
                    targetExperienceLevel:
                        (input.targetExperienceLevel as any) ||
                        originalTemplate.targetExperienceLevel,
                    version: "1.0.0",
                    isDraft: true, // Start as draft
                    reviewStatus: "pending",
                    createdBy,
                    updatedBy: createdBy,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();

            return {
                success: true,
                template: newTemplate,
            };
        }),

    // Create template from base template
    createTemplateFromBase: adminProcedure
        .input(createFromBaseSchema)
        .mutation(async ({ input, ctx }) => {
            const createdBy = ctx.session.user.id;

            // Get base template
            const [baseTemplate] = await db
                .select()
                .from(documentTemplates)
                .where(eq(documentTemplates.id, input.baseTemplateId))
                .limit(1);

            if (!baseTemplate) {
                throw new Error("Base template not found");
            }

            // Merge overrides with base template
            const newTemplateData = {
                ...baseTemplate,
                id: undefined, // Remove ID to create new template
                name: input.name,
                description: input.description || baseTemplate.description,
                parentTemplateId: input.baseTemplateId,
                category: input.overrides?.category || baseTemplate.category,
                designConfig: input.overrides?.designConfig
                    ? { ...baseTemplate.designConfig, ...input.overrides.designConfig }
                    : baseTemplate.designConfig,
                templateStructure: input.overrides?.templateStructure
                    ? {
                        ...baseTemplate.templateStructure,
                        ...input.overrides.templateStructure,
                    }
                    : baseTemplate.templateStructure,
                targetSpecialization:
                    input.overrides?.targetSpecialization ||
                    baseTemplate.targetSpecialization,
                targetIndustries:
                    input.overrides?.targetIndustries || baseTemplate.targetIndustries,
                targetExperienceLevel:
                    input.overrides?.targetExperienceLevel ||
                    baseTemplate.targetExperienceLevel,
                tags: input.overrides?.tags || baseTemplate.tags,
                version: "1.0.0", // Reset version for new template
                createdBy,
                updatedBy: createdBy,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const [newTemplate] = await db
                .insert(documentTemplates)
                .values(newTemplateData as any)
                .returning();

            return {
                success: true,
                template: newTemplate,
            };
        }),
});
