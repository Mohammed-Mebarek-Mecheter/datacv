// src/routers/admin/templates/bulk-operations.ts
import { count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { documentTemplates } from "@/db/schema/document-templates";
import { userTemplateCustomizations } from "@/db/schema/template-customizations";
import { templateVersions } from "@/db/schema/template-versions";
import { adminProcedure, router } from "@/lib/trpc";
import {
    bulkUpdateSchema,
    bulkDeleteSchema,
} from "./schemas";
import {z} from "zod";

export const bulkOperationsRouter = router({
    // Bulk update templates (non-analytics)
    bulkUpdateTemplates: adminProcedure
        .input(bulkUpdateSchema)
        .mutation(async ({ input, ctx }) => {
            const updatedBy = ctx.session.user.id;

            // If creating versions for significant changes
            if (
                input.createVersions &&
                (input.updates.version || input.updates.category)
            ) {
                for (const templateId of input.templateIds) {
                    const [currentTemplate] = await db
                        .select()
                        .from(documentTemplates)
                        .where(eq(documentTemplates.id, templateId))
                        .limit(1);

                    if (currentTemplate) {
                        await db.insert(templateVersions).values({
                            templateId,
                            versionNumber:
                                input.updates.version ||
                                `${currentTemplate.version}-bulk-update`,
                            versionType: "minor",
                            snapshot: {
                                name: currentTemplate.name,
                                description: currentTemplate.description,
                                templateStructure: currentTemplate.templateStructure,
                                designConfig: currentTemplate.designConfig,
                                componentCode: currentTemplate.componentCode,
                                tags: currentTemplate.tags,
                            },
                            changelogNotes: "Bulk update applied",
                            createdBy: updatedBy,
                        } as typeof templateVersions.$inferInsert);
                    }
                }
            }

            // Apply bulk updates
            const updatesToApply = {
                ...input.updates,
                updatedBy,
                updatedAt: new Date(),
            };

            // Convert single values to arrays for targetSpecialization and targetIndustries
            if (
                updatesToApply.targetSpecialization &&
                !Array.isArray(updatesToApply.targetSpecialization)
            ) {
                updatesToApply.targetSpecialization = [
                    updatesToApply.targetSpecialization,
                ];
            }
            if (
                updatesToApply.targetIndustries &&
                !Array.isArray(updatesToApply.targetIndustries)
            ) {
                updatesToApply.targetIndustries = [updatesToApply.targetIndustries];
            }

            await db
                .update(documentTemplates)
                .set(updatesToApply)
                .where(inArray(documentTemplates.id, input.templateIds));

            return { success: true, updated: input.templateIds.length };
        }),

    // Bulk delete with dependency handling
    bulkDeleteTemplates: adminProcedure
        .input(bulkDeleteSchema)
        .mutation(async ({ input }) => {
            let successCount = 0;
            const errors: string[] = [];

            for (const templateId of input.templateIds) {
                try {
                    // Check for dependencies
                    const [childTemplates] = await db
                        .select({ count: count() })
                        .from(documentTemplates)
                        .where(eq(documentTemplates.parentTemplateId, templateId));

                    const [customizations] = await db
                        .select({ count: count() })
                        .from(userTemplateCustomizations)
                        .where(eq(userTemplateCustomizations.templateId, templateId));

                    if (
                        (childTemplates.count > 0 || customizations.count > 0) &&
                        !input.transferDependenciesTo &&
                        input.hardDelete
                    ) {
                        errors.push(
                            `Template ${templateId}: Cannot delete with dependencies (${childTemplates.count} children, ${customizations.count} customizations)`,
                        );
                        continue;
                    }

                    // Transfer dependencies if specified
                    if (input.transferDependenciesTo) {
                        await db
                            .update(documentTemplates)
                            .set({ parentTemplateId: input.transferDependenciesTo })
                            .where(eq(documentTemplates.parentTemplateId, templateId));

                        await db
                            .update(userTemplateCustomizations)
                            .set({ templateId: input.transferDependenciesTo })
                            .where(eq(userTemplateCustomizations.templateId, templateId));
                    }

                    if (input.hardDelete) {
                        // Delete all related data
                        await db
                            .delete(templateVersions)
                            .where(eq(templateVersions.templateId, templateId));
                        await db
                            .delete(documentTemplates)
                            .where(eq(documentTemplates.id, templateId));
                    } else {
                        // Soft delete
                        await db
                            .update(documentTemplates)
                            .set({
                                isActive: false,
                                updatedAt: new Date(),
                            })
                            .where(eq(documentTemplates.id, templateId));
                    }

                    successCount++;
                } catch (error) {
                    errors.push(
                        `Template ${templateId}: ${error instanceof Error ? error.message : "Unknown error"}`,
                    );
                }
            }

            return {
                success: successCount > 0,
                successCount,
                errors,
            };
        }),

    // Additional bulk operations can be added here
    bulkChangeStatus: adminProcedure
        .input(
            z.object({
                templateIds: z.array(z.string()),
                status: z.enum(["pending", "approved", "rejected"]),
                reviewNotes: z.string().optional(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const updatedBy = ctx.session.user.id;

            await db
                .update(documentTemplates)
                .set({
                    reviewStatus: input.status,
                    reviewNotes: input.reviewNotes,
                    updatedBy,
                    updatedAt: new Date(),
                })
                .where(inArray(documentTemplates.id, input.templateIds));

            return { success: true, updated: input.templateIds.length };
        }),

    bulkToggleFeature: adminProcedure
        .input(
            z.object({
                templateIds: z.array(z.string()),
                featured: z.boolean(),
                featuredOrder: z.number().optional(),
                featuredUntil: z.date().optional(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const updatedBy = ctx.session.user.id;

            await db
                .update(documentTemplates)
                .set({
                    isFeatured: input.featured,
                    featuredOrder: input.featuredOrder,
                    featuredUntil: input.featuredUntil,
                    updatedBy,
                    updatedAt: new Date(),
                })
                .where(inArray(documentTemplates.id, input.templateIds));

            return { success: true, updated: input.templateIds.length };
        }),
});
