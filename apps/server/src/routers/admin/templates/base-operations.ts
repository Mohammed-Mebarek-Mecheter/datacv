// src/routers/admin/templates/base-operations.ts
import {
    and,
    asc,
    count,
    desc,
    eq,
    gte,
    isNull,
    like,
    lte,
    or,
    sql,
} from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { documentTemplates } from "@/db/schema/document-templates";
import { userTemplateCustomizations } from "@/db/schema/template-customizations";
import { templateVersions } from "@/db/schema/template-versions";
import { adminProcedure, router } from "@/lib/trpc";
import {
    templateFiltersSchema,
    createTemplateSchema,
    updateTemplateSchema,
} from "./schemas";

export const baseTemplateRouter = router({
    // Get all templates with enhanced filtering
    getTemplates: adminProcedure
        .input(templateFiltersSchema)
        .query(async ({ input }) => {
            const conditions: any[] = [sql`1=1`];

            // Apply filters
            if (input.documentType) {
                conditions.push(
                    eq(documentTemplates.DocumentsType, input.documentType),
                );
            }
            if (input.category) {
                conditions.push(eq(documentTemplates.category, input.category));
            }
            if (input.isActive !== undefined) {
                conditions.push(eq(documentTemplates.isActive, input.isActive));
            }
            if (input.isDraft !== undefined) {
                conditions.push(eq(documentTemplates.isDraft, input.isDraft));
            }
            if (input.reviewStatus) {
                conditions.push(eq(documentTemplates.reviewStatus, input.reviewStatus));
            }
            if (input.hasParent !== undefined) {
                if (input.hasParent) {
                    conditions.push(
                        sql`${documentTemplates.parentTemplateId} IS NOT NULL`,
                    );
                } else {
                    conditions.push(isNull(documentTemplates.parentTemplateId));
                }
            }
            if (input.isBaseTemplate !== undefined) {
                conditions.push(
                    eq(documentTemplates.isBaseTemplate, input.isBaseTemplate),
                );
            }
            if (input.isFeatured !== undefined) {
                conditions.push(eq(documentTemplates.isFeatured, input.isFeatured));
            }
            if (input.qualityScoreMin !== undefined) {
                conditions.push(
                    gte(documentTemplates.qualityScore, input.qualityScoreMin),
                );
            }
            if (input.usageCountMin !== undefined) {
                conditions.push(gte(documentTemplates.usageCount, input.usageCountMin));
            }
            if (input.avgRatingMin !== undefined) {
                conditions.push(
                    sql`${documentTemplates.avgRating} >= ${input.avgRatingMin}`,
                );
            }
            if (input.targetExperienceLevel) {
                conditions.push(
                    sql`${documentTemplates.targetExperienceLevel} = ${input.targetExperienceLevel}::text`,
                );
            }
            if (input.targetIndustries) {
                conditions.push(
                    sql`${documentTemplates.targetIndustries} @> ${JSON.stringify([input.targetIndustries])}`,
                );
            }
            if (input.targetSpecialization) {
                conditions.push(
                    sql`${documentTemplates.targetSpecialization} @> ${JSON.stringify([input.targetSpecialization])}`,
                );
            }
            if (input.search) {
                conditions.push(
                    or(
                        like(documentTemplates.name, `%${input.search}%`),
                        like(documentTemplates.description, `%${input.search}%`),
                        like(documentTemplates.searchKeywords, `%${input.search}%`),
                    ),
                );
            }
            if (input.tags && input.tags.length > 0) {
                conditions.push(sql`${documentTemplates.tags} && ${input.tags}`);
            }
            if (input.createdBy) {
                conditions.push(eq(documentTemplates.createdBy, input.createdBy));
            }
            if (input.dateRange?.from) {
                conditions.push(gte(documentTemplates.createdAt, input.dateRange.from));
            }
            if (input.dateRange?.to) {
                conditions.push(lte(documentTemplates.createdAt, input.dateRange.to));
            }

            // Determine sort order
            let orderBy;
            const direction = input.sortOrder === "asc" ? asc : desc;
            switch (input.sortBy) {
                case "name":
                    orderBy = direction(documentTemplates.name);
                    break;
                case "created":
                    orderBy = direction(documentTemplates.createdAt);
                    break;
                case "usage":
                    orderBy = direction(documentTemplates.usageCount);
                    break;
                case "rating":
                    orderBy = direction(documentTemplates.avgRating);
                    break;
                default:
                    orderBy = direction(documentTemplates.updatedAt);
            }

            const templates = await db
                .select({
                    id: documentTemplates.id,
                    name: documentTemplates.name,
                    description: documentTemplates.description,
                    category: documentTemplates.category,
                    documentType: documentTemplates.DocumentsType,
                    parentTemplateId: documentTemplates.parentTemplateId,
                    isBaseTemplate: documentTemplates.isBaseTemplate,
                    targetSpecialization: documentTemplates.targetSpecialization,
                    targetIndustries: documentTemplates.targetIndustries,
                    targetExperienceLevel: documentTemplates.targetExperienceLevel,
                    previewImageUrl: documentTemplates.previewImageUrl,
                    tags: documentTemplates.tags,
                    isPremium: documentTemplates.isPremium,
                    isActive: documentTemplates.isActive,
                    isDraft: documentTemplates.isDraft,
                    isFeatured: documentTemplates.isFeatured,
                    reviewStatus: documentTemplates.reviewStatus,
                    qualityScore: documentTemplates.qualityScore,
                    usageCount: documentTemplates.usageCount,
                    avgRating: documentTemplates.avgRating,
                    version: documentTemplates.version,
                    createdBy: documentTemplates.createdBy,
                    createdAt: documentTemplates.createdAt,
                    updatedAt: documentTemplates.updatedAt,
                })
                .from(documentTemplates)
                .where(and(...conditions))
                .orderBy(orderBy)
                .limit(input.limit)
                .offset(input.offset);

            // Get total count
            const [{ total }] = await db
                .select({ total: count() })
                .from(documentTemplates)
                .where(and(...conditions));

            return {
                templates,
                totalCount: total,
            };
        }),

    // Get specific template with full details including versions
    getTemplate: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const [template] = await db
                .select()
                .from(documentTemplates)
                .where(eq(documentTemplates.id, input.id))
                .limit(1);

            if (!template) {
                throw new Error("Template not found");
            }

            // Get template versions
            const versions = await db
                .select({
                    id: templateVersions.id,
                    versionNumber: templateVersions.versionNumber,
                    versionType: templateVersions.versionType,
                    changelogNotes: templateVersions.changelogNotes,
                    isBreaking: templateVersions.isBreaking,
                    createdBy: templateVersions.createdBy,
                    createdAt: templateVersions.createdAt,
                })
                .from(templateVersions)
                .where(eq(templateVersions.templateId, input.id))
                .orderBy(desc(templateVersions.createdAt));

            // Get parent template if exists
            let parentTemplate = null;
            if (template.parentTemplateId) {
                [parentTemplate] = await db
                    .select({
                        id: documentTemplates.id,
                        name: documentTemplates.name,
                        version: documentTemplates.version,
                    })
                    .from(documentTemplates)
                    .where(eq(documentTemplates.id, template.parentTemplateId))
                    .limit(1);
            }

            // Get child templates
            const childTemplates = await db
                .select({
                    id: documentTemplates.id,
                    name: documentTemplates.name,
                    version: documentTemplates.version,
                    isActive: documentTemplates.isActive,
                })
                .from(documentTemplates)
                .where(eq(documentTemplates.parentTemplateId, input.id));

            return {
                template,
                versions,
                parentTemplate,
                childTemplates,
            };
        }),

    // Create new template with enhanced validation
    createTemplate: adminProcedure
        .input(createTemplateSchema)
        .mutation(async ({ input, ctx }) => {
            const createdBy = ctx.session.user.id;

            // Validate parent template if specified
            if (input.parentTemplateId) {
                const [parentTemplate] = await db
                    .select({ id: documentTemplates.id })
                    .from(documentTemplates)
                    .where(eq(documentTemplates.id, input.parentTemplateId))
                    .limit(1);

                if (!parentTemplate) {
                    throw new Error("Parent template not found");
                }
            }

            const [newTemplate] = await db
                .insert(documentTemplates)
                .values({
                    name: input.name,
                    description: input.description,
                    category: input.category,
                    DocumentsType: input.documentType,
                    parentTemplateId: input.parentTemplateId,
                    isBaseTemplate: input.isBaseTemplate,
                    targetSpecialization: input.targetSpecialization,
                    targetIndustries: input.targetIndustries,
                    targetExperienceLevel: input.targetExperienceLevel,
                    templateStructure: input.templateStructure as any,
                    designConfig: input.designConfig as any,
                    componentCode: input.componentCode,
                    componentPath: input.componentPath,
                    componentVersion: input.componentVersion,
                    previewImageUrl: input.previewImageUrl,
                    previewImages: input.previewImages as any,
                    previewImageAlt: input.previewImageAlt,
                    seoTitle: input.seoTitle,
                    seoDescription: input.seoDescription,
                    tags: input.tags || [],
                    searchKeywords: input.searchKeywords,
                    isPremium: input.isPremium,
                    isActive: input.isActive,
                    isPublic: input.isPublic,
                    isDraft: input.isDraft,
                    isFeatured: input.isFeatured,
                    featuredOrder: input.featuredOrder,
                    featuredUntil: input.featuredUntil,
                    version: input.version,
                    reviewStatus: input.reviewStatus,
                    reviewNotes: input.reviewNotes,
                    createdBy,
                    updatedBy: createdBy,
                })
                .returning();

            // Create initial version
            await db.insert(templateVersions).values({
                templateId: newTemplate.id,
                versionNumber: input.version,
                versionType: "major",
                snapshot: {
                    name: input.name,
                    description: input.description,
                    templateStructure: input.templateStructure,
                    designConfig: input.designConfig,
                    componentCode: input.componentCode,
                    tags: input.tags || [],
                },
                changelogNotes: "Initial template version",
                createdBy,
            } as typeof templateVersions.$inferInsert);

            return {
                success: true,
                template: newTemplate,
            };
        }),

    // Update existing template with version tracking
    updateTemplate: adminProcedure
        .input(updateTemplateSchema)
        .mutation(async ({ input, ctx }) => {
            const { id, ...updateData } = input;
            const updatedBy = ctx.session.user.id;

            // Get current template for version comparison
            const [currentTemplate] = await db
                .select()
                .from(documentTemplates)
                .where(eq(documentTemplates.id, id))
                .limit(1);

            if (!currentTemplate) {
                throw new Error("Template not found");
            }

            // Prepare update data
            const mappedData: any = {
                updatedBy,
                updatedAt: new Date(),
            };

            // Map all possible update fields
            Object.entries(updateData).forEach(([key, value]) => {
                if (value !== undefined) {
                    switch (key) {
                        case "documentType":
                            mappedData.DocumentsType = value;
                            break;
                        case "targetSpecialization":
                        case "targetIndustries":
                            mappedData[key] = value;
                            break;
                        case "targetExperienceLevel":
                            mappedData[key] = value;
                            break;
                        case "templateStructure":
                        case "designConfig":
                        case "previewImages":
                            mappedData[key] = value as any;
                            break;
                        default:
                            mappedData[key] = value;
                    }
                }
            });

            // Update template
            await db
                .update(documentTemplates)
                .set(mappedData)
                .where(eq(documentTemplates.id, id));

            // Check if this warrants a new version
            const significantChanges = [
                "templateStructure",
                "designConfig",
                "componentCode",
                "version",
            ].some(
                (field) => (updateData as Record<string, unknown>)[field] !== undefined,
            );

            if (
                significantChanges &&
                updateData.version &&
                updateData.version !== currentTemplate.version
            ) {
                // Create new version
                await db.insert(templateVersions).values({
                    templateId: id,
                    versionNumber: updateData.version as string,
                    versionType: "minor", // Could be determined by semver logic
                    snapshot: {
                        name: updateData.name || currentTemplate.name,
                        description: updateData.description || currentTemplate.description,
                        templateStructure:
                            updateData.templateStructure || currentTemplate.templateStructure,
                        designConfig:
                            updateData.designConfig || currentTemplate.designConfig,
                        componentCode:
                            updateData.componentCode || currentTemplate.componentCode,
                        tags: updateData.tags || currentTemplate.tags,
                    },
                    changelogNotes: `Updated to version ${updateData.version}`,
                    createdBy: updatedBy,
                } as typeof templateVersions.$inferInsert);
            }

            return { success: true };
        }),

    // Delete template (enhanced with safety checks)
    deleteTemplate: adminProcedure
        .input(
            z.object({
                id: z.string(),
                hardDelete: z.boolean().default(false),
                transferDependenciesTo: z.string().optional(),
            }),
        )
        .mutation(async ({ input }) => {
            // Check for dependencies
            const [childTemplates] = await db
                .select({ count: count() })
                .from(documentTemplates)
                .where(eq(documentTemplates.parentTemplateId, input.id));

            const [customizations] = await db
                .select({ count: count() })
                .from(userTemplateCustomizations)
                .where(eq(userTemplateCustomizations.templateId, input.id));

            if (childTemplates.count > 0 || customizations.count > 0) {
                if (!input.transferDependenciesTo && input.hardDelete) {
                    throw new Error(
                        `Cannot delete template with dependencies. Found ${childTemplates.count} child templates and ${customizations.count} customizations.`,
                    );
                }

                // Transfer dependencies if specified
                if (input.transferDependenciesTo) {
                    await db
                        .update(documentTemplates)
                        .set({ parentTemplateId: input.transferDependenciesTo })
                        .where(eq(documentTemplates.parentTemplateId, input.id));

                    await db
                        .update(userTemplateCustomizations)
                        .set({ templateId: input.transferDependenciesTo })
                        .where(eq(userTemplateCustomizations.templateId, input.id));
                }
            }

            if (input.hardDelete) {
                // Delete all related data
                await db
                    .delete(templateVersions)
                    .where(eq(templateVersions.templateId, input.id));
                await db
                    .delete(documentTemplates)
                    .where(eq(documentTemplates.id, input.id));
            } else {
                // Soft delete
                await db
                    .update(documentTemplates)
                    .set({
                        isActive: false,
                        updatedAt: new Date(),
                    })
                    .where(eq(documentTemplates.id, input.id));
            }

            return { success: true };
        }),

    // Generate preview images for template
    generatePreviewImages: adminProcedure
        .input(
            z.object({
                templateId: z.string(),
                regenerate: z.boolean().default(false),
            }),
        )
        .mutation(async ({ input }) => {
            // This would integrate with a service like Puppeteer or Playwright
            // to generate actual preview images of the rendered template

            const [template] = await db
                .select()
                .from(documentTemplates)
                .where(eq(documentTemplates.id, input.templateId))
                .limit(1);

            if (!template) {
                throw new Error("Template not found");
            }

            // Generate preview URLs (implementation depends on your image service)
            const previewImages = {
                desktop: `/api/previews/${input.templateId}/desktop.png`,
                mobile: `/api/previews/${input.templateId}/mobile.png`,
                thumbnail: `/api/previews/${input.templateId}/thumb.png`,
            };

            // Update template with generated preview URLs
            await db
                .update(documentTemplates)
                .set({
                    previewImages: previewImages as any,
                    previewImageUrl: previewImages.desktop,
                    updatedAt: new Date(),
                })
                .where(eq(documentTemplates.id, input.templateId));

            return { success: true, previewImages };
        }),
});
