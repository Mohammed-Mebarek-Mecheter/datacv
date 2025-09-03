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
    inArray,
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
        .input(templateFiltersSchema.extend({
            // New filter options based on schema updates
            variantType: z.enum(["color", "layout", "typography", "style", "complete"]).optional(),
            isVariant: z.boolean().optional(),
            baseTemplateId: z.string().optional(),
            accessLevel: z.enum(["public", "premium", "enterprise", "beta"]).optional(),
            requiredPlan: z.enum(["free", "pro", "enterprise"]).optional(),
            featuredCategory: z.enum(["trending", "popular", "new", "staff_pick"]).optional(),
            targetJobTitles: z.array(z.string()).optional(),
            targetCompanyTypes: z.array(z.enum(["startup", "enterprise", "consulting", "agency", "non_profit", "government"])).optional(),
            qualityScoreMin: z.number().min(0).max(100).optional(),
            completionRateMin: z.number().min(0).max(1).optional(),
            exportRateMin: z.number().min(0).max(1).optional(),
            layoutEngine: z.enum(["standard", "flexbox", "grid", "absolute", "custom"]).optional(),
            supportedExports: z.array(z.enum(["pdf", "docx", "txt", "json"])).optional(),
            aiOptimized: z.boolean().optional(),
            atsOptimized: z.boolean().optional(),
            includeVariants: z.boolean().default(false),
            includeAnalytics: z.boolean().default(false),
        }))
        .query(async ({ input }) => {
            const conditions: any[] = [sql`1=1`];

            // Existing filters (keeping all the original ones)
            if (input.documentType) {
                conditions.push(eq(documentTemplates.DocumentsType, input.documentType));
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
                    conditions.push(sql`${documentTemplates.parentTemplateId} IS NOT NULL`);
                } else {
                    conditions.push(isNull(documentTemplates.parentTemplateId));
                }
            }
            if (input.isBaseTemplate !== undefined) {
                conditions.push(eq(documentTemplates.isBaseTemplate, input.isBaseTemplate));
            }
            if (input.isFeatured !== undefined) {
                conditions.push(eq(documentTemplates.isFeatured, input.isFeatured));
            }
            if (input.qualityScoreMin !== undefined) {
                conditions.push(gte(documentTemplates.qualityScore, input.qualityScoreMin));
            }
            if (input.usageCountMin !== undefined) {
                conditions.push(gte(documentTemplates.usageCount, input.usageCountMin));
            }
            if (input.avgRatingMin !== undefined) {
                conditions.push(sql`${documentTemplates.avgRating} >= ${input.avgRatingMin}`);
            }

            // NEW FILTERS based on schema enhancements
            if (input.isVariant !== undefined) {
                conditions.push(eq(documentTemplates.isVariant, input.isVariant));
            }
            if (input.variantType) {
                conditions.push(eq(documentTemplates.variantType, input.variantType));
            }
            if (input.baseTemplateId) {
                conditions.push(eq(documentTemplates.baseTemplateId, input.baseTemplateId));
            }
            if (input.accessLevel) {
                conditions.push(eq(documentTemplates.accessLevel, input.accessLevel));
            }
            if (input.requiredPlan) {
                conditions.push(eq(documentTemplates.requiredPlan, input.requiredPlan));
            }
            if (input.featuredCategory) {
                conditions.push(eq(documentTemplates.featuredCategory, input.featuredCategory));
            }
            if (input.targetJobTitles && input.targetJobTitles.length > 0) {
                conditions.push(sql`${documentTemplates.targetJobTitles} && ${JSON.stringify(input.targetJobTitles)}`);
            }
            if (input.targetCompanyTypes && input.targetCompanyTypes.length > 0) {
                conditions.push(sql`${documentTemplates.targetCompanyTypes} && ${JSON.stringify(input.targetCompanyTypes)}`);
            }
            if (input.completionRateMin !== undefined) {
                conditions.push(gte(documentTemplates.completionRate, input.completionRateMin.toString()));
            }
            if (input.exportRateMin !== undefined) {
                conditions.push(gte(documentTemplates.exportRate, input.exportRateMin.toString()));
            }
            if (input.layoutEngine) {
                conditions.push(sql`${documentTemplates.layoutEngine}->>'engine' = ${input.layoutEngine}`);
            }
            if (input.supportedExports && input.supportedExports.length > 0) {
                conditions.push(sql`${documentTemplates.features}->>'supportedExports' @> ${JSON.stringify(input.supportedExports)}`);
            }
            if (input.aiOptimized !== undefined) {
                conditions.push(sql`${documentTemplates.features}->>'aiOptimized' = ${input.aiOptimized.toString()}`);
            }
            if (input.atsOptimized !== undefined) {
                conditions.push(sql`${documentTemplates.features}->>'atsOptimized' = ${input.atsOptimized.toString()}`);
            }

            // Existing search and filters
            if (input.targetExperienceLevel) {
                conditions.push(sql`${documentTemplates.targetExperienceLevel, input.targetExperienceLevel}`);
            }
            if (input.targetIndustries) {
                conditions.push(sql`${documentTemplates.targetIndustries} @> ${JSON.stringify([input.targetIndustries])}`);
            }
            if (input.targetSpecialization) {
                conditions.push(sql`${documentTemplates.targetSpecialization} @> ${JSON.stringify([input.targetSpecialization])}`);
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

            // Enhanced sort options
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
                case "quality":
                    orderBy = direction(documentTemplates.qualityScore);
                    break;
                case "completion_rate":
                    orderBy = direction(documentTemplates.completionRate);
                    break;
                case "export_rate":
                    orderBy = direction(documentTemplates.exportRate);
                    break;
                default:
                    orderBy = direction(documentTemplates.updatedAt);
            }

            // Enhanced select with new fields
            const baseSelect = {
                id: documentTemplates.id,
                name: documentTemplates.name,
                description: documentTemplates.description,
                category: documentTemplates.category,
                documentType: documentTemplates.DocumentsType,
                parentTemplateId: documentTemplates.parentTemplateId,
                baseTemplateId: documentTemplates.baseTemplateId,
                isBaseTemplate: documentTemplates.isBaseTemplate,
                isVariant: documentTemplates.isVariant,
                variantType: documentTemplates.variantType,
                variantName: documentTemplates.variantName,
                targetSpecialization: documentTemplates.targetSpecialization,
                targetIndustries: documentTemplates.targetIndustries,
                targetExperienceLevel: documentTemplates.targetExperienceLevel,
                targetJobTitles: documentTemplates.targetJobTitles,
                targetCompanyTypes: documentTemplates.targetCompanyTypes,
                previewImageUrl: documentTemplates.previewImageUrl,
                previewImages: documentTemplates.previewImages,
                tags: documentTemplates.tags,
                isPremium: documentTemplates.isPremium,
                isActive: documentTemplates.isActive,
                isDraft: documentTemplates.isDraft,
                isFeatured: documentTemplates.isFeatured,
                featuredCategory: documentTemplates.featuredCategory,
                reviewStatus: documentTemplates.reviewStatus,
                qualityScore: documentTemplates.qualityScore,
                usageCount: documentTemplates.usageCount,
                avgRating: documentTemplates.avgRating,
                completionRate: documentTemplates.completionRate,
                exportRate: documentTemplates.exportRate,
                customizationRate: documentTemplates.customizationRate,
                version: documentTemplates.version,
                accessLevel: documentTemplates.accessLevel,
                requiredPlan: documentTemplates.requiredPlan,
                features: documentTemplates.features,
                layoutEngine: documentTemplates.layoutEngine,
                createdBy: documentTemplates.createdBy,
                createdAt: documentTemplates.createdAt,
                updatedAt: documentTemplates.updatedAt,
            };

            const templates = await db
                .select(baseSelect)
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

            // Optionally include variants for base templates
            let templatesWithVariants = templates;
            if (input.includeVariants) {
                const baseTemplateIds = templates
                    .filter(t => t.isBaseTemplate)
                    .map(t => t.id);

                if (baseTemplateIds.length > 0) {
                    const variants = await db
                        .select(baseSelect)
                        .from(documentTemplates)
                        .where(
                            and(
                                inArray(documentTemplates.baseTemplateId, baseTemplateIds),
                                eq(documentTemplates.isVariant, true)
                            )
                        );

                    // Group variants by base template
                    const variantsByBase = variants.reduce((acc, variant) => {
                        if (!variant.baseTemplateId) return acc;
                        if (!acc[variant.baseTemplateId]) acc[variant.baseTemplateId] = [];
                        acc[variant.baseTemplateId].push(variant);
                        return acc;
                    }, {} as Record<string, typeof variants>);

                    templatesWithVariants = templates.map(template => ({
                        ...template,
                        variants: template.isBaseTemplate ? (variantsByBase[template.id] || []) : undefined
                    }));
                }
            }

            return {
                templates: templatesWithVariants,
                totalCount: total,
            };
        }),

    // Enhanced getTemplate with comprehensive details
    getTemplate: adminProcedure
        .input(z.object({
            id: z.string(),
        }))
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

            // Get base template if this is a variant
            let baseTemplate = null;
            if (template.baseTemplateId && template.isVariant) {
                [baseTemplate] = await db
                    .select({
                        id: documentTemplates.id,
                        name: documentTemplates.name,
                        version: documentTemplates.version,
                        category: documentTemplates.category,
                    })
                    .from(documentTemplates)
                    .where(eq(documentTemplates.id, template.baseTemplateId))
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
                baseTemplate,
                parentTemplate,
                childTemplates
            };
        }),

    // Enhanced createTemplate with new fields
    createTemplate: adminProcedure
        .input(createTemplateSchema.extend({
            // New fields from schema
            baseTemplateId: z.string().optional(),
            isVariant: z.boolean().default(false),
            variantType: z.enum(["color", "layout", "typography", "style", "complete"]).optional(),
            variantName: z.string().optional(),
            targetJobTitles: z.array(z.string()).optional(),
            targetCompanyTypes: z.array(z.enum(["startup", "enterprise", "consulting", "agency", "non_profit", "government"])).optional(),
            accessLevel: z.enum(["public", "premium", "enterprise", "beta"]).default("public"),
            requiredPlan: z.enum(["free", "pro", "enterprise"]).optional(),
            featuredCategory: z.enum(["trending", "popular", "new", "staff_pick"]).optional(),
            layoutEngine: z.object({
                engine: z.enum(["standard", "flexbox", "grid", "absolute", "custom"]).default("standard"),
                responsive: z.boolean().optional(),
                breakpoints: z.object({
                    mobile: z.number().optional(),
                    tablet: z.number().optional(),
                    desktop: z.number().optional(),
                }).optional(),
            }).optional(),
            features: z.object({
                supportedExports: z.array(z.enum(["pdf", "docx", "txt", "json"])).default(["pdf"]),
                aiOptimized: z.boolean().default(false),
                aiSuggestions: z.boolean().default(false),
                contentGeneration: z.boolean().default(false),
                colorCustomization: z.boolean().default(true),
                fontCustomization: z.boolean().default(true),
                layoutCustomization: z.boolean().default(false),
                sectionCustomization: z.boolean().default(true),
                multilingual: z.boolean().default(false),
                atsOptimized: z.boolean().default(true),
                printOptimized: z.boolean().default(true),
                mobileOptimized: z.boolean().default(false),
                portfolioSupport: z.boolean().default(false),
                publicationSupport: z.boolean().default(false),
                projectGallery: z.boolean().default(false),
                skillVisualization: z.boolean().default(false),
            }).optional(),
            templateVariants: z.array(z.object({
                id: z.string(),
                name: z.string(),
                description: z.string().optional(),
                variantType: z.enum(["color", "layout", "typography", "style", "complete"]),
                designOverrides: z.any().optional(),
                previewImageUrl: z.string().optional(),
                isDefault: z.boolean().default(false),
                isPremium: z.boolean().default(false),
                sortOrder: z.number().optional(),
            })).default([]),
        }))
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

            // Validate base template if this is a variant
            if (input.isVariant && input.baseTemplateId) {
                const [baseTemplate] = await db
                    .select({
                        id: documentTemplates.id,
                        isBaseTemplate: documentTemplates.isBaseTemplate
                    })
                    .from(documentTemplates)
                    .where(eq(documentTemplates.id, input.baseTemplateId))
                    .limit(1);

                if (!baseTemplate) {
                    throw new Error("Base template not found");
                }

                if (!baseTemplate.isBaseTemplate) {
                    throw new Error("Referenced template is not marked as a base template");
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
                    baseTemplateId: input.baseTemplateId,
                    isBaseTemplate: input.isBaseTemplate,
                    isVariant: input.isVariant,
                    variantType: input.variantType,
                    variantName: input.variantName,
                    targetSpecialization: input.targetSpecialization,
                    targetIndustries: input.targetIndustries,
                    targetExperienceLevel: input.targetExperienceLevel,
                    targetJobTitles: input.targetJobTitles,
                    targetCompanyTypes: input.targetCompanyTypes,
                    templateStructure: input.templateStructure as any,
                    designConfig: input.designConfig as any,
                    templateVariants: input.templateVariants as any,
                    componentCode: input.componentCode,
                    componentPath: input.componentPath,
                    componentVersion: input.componentVersion,
                    layoutEngine: input.layoutEngine as any || { engine: "standard" },
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
                    featuredCategory: input.featuredCategory,
                    version: input.version,
                    reviewStatus: input.reviewStatus,
                    reviewNotes: input.reviewNotes,
                    accessLevel: input.accessLevel,
                    requiredPlan: input.requiredPlan,
                    features: input.features as any,
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

    // Enhanced updateTemplate to handle new fields
    updateTemplate: adminProcedure
        .input(updateTemplateSchema.extend({
            // New fields that can be updated
            baseTemplateId: z.string().optional(),
            isVariant: z.boolean().optional(),
            variantType: z.enum(["color", "layout", "typography", "style", "complete"]).optional(),
            variantName: z.string().optional(),
            targetJobTitles: z.array(z.string()).optional(),
            targetCompanyTypes: z.array(z.enum(["startup", "enterprise", "consulting", "agency", "non_profit", "government"])).optional(),
            accessLevel: z.enum(["public", "premium", "enterprise", "beta"]).optional(),
            requiredPlan: z.enum(["free", "pro", "enterprise"]).optional(),
            featuredCategory: z.enum(["trending", "popular", "new", "staff_pick"]).optional(),
            layoutEngine: z.any().optional(),
            features: z.any().optional(),
            templateVariants: z.any().optional(),
            qualityMetrics: z.any().optional(),
        }))
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

            // Prepare update data with new field mappings
            const mappedData: any = {
                updatedBy,
                updatedAt: new Date(),
            };

            // Map all possible update fields including new ones
            Object.entries(updateData).forEach(([key, value]) => {
                if (value !== undefined) {
                    switch (key) {
                        case "documentType":
                            mappedData.DocumentsType = value;
                            break;
                        case "targetSpecialization":
                        case "targetIndustries":
                        case "targetJobTitles":
                        case "targetCompanyTypes":
                            mappedData[key] = value;
                            break;
                        case "targetExperienceLevel":
                            mappedData[key] = value;
                            break;
                        case "templateStructure":
                        case "designConfig":
                        case "previewImages":
                        case "templateVariants":
                        case "layoutEngine":
                        case "features":
                        case "qualityMetrics":
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
                "templateVariants",
                "layoutEngine",
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

    // Enhanced deleteTemplate with dependency transfer for variants
    deleteTemplate: adminProcedure
        .input(
            z.object({
                id: z.string(),
                hardDelete: z.boolean().default(false),
                transferDependenciesTo: z.string().optional(),
                deleteVariants: z.boolean().default(false), // New option to handle variants
            }),
        )
        .mutation(async ({ input }) => {
            // Check for dependencies including variants
            const [childTemplates] = await db
                .select({ count: count() })
                .from(documentTemplates)
                .where(eq(documentTemplates.parentTemplateId, input.id));

            const [variants] = await db
                .select({ count: count() })
                .from(documentTemplates)
                .where(eq(documentTemplates.baseTemplateId, input.id));

            const [customizations] = await db
                .select({ count: count() })
                .from(userTemplateCustomizations)
                .where(eq(userTemplateCustomizations.templateId, input.id));

            if ((childTemplates.count > 0 || customizations.count > 0 || variants.count > 0) && input.hardDelete) {
                if (!input.transferDependenciesTo && !input.deleteVariants) {
                    throw new Error(
                        `Cannot delete template with dependencies. Found ${childTemplates.count} child templates, ${variants.count} variants, and ${customizations.count} customizations.`,
                    );
                }

                // Handle variants
                if (variants.count > 0) {
                    if (input.deleteVariants) {
                        // Delete all variants
                        await db
                            .delete(documentTemplates)
                            .where(eq(documentTemplates.baseTemplateId, input.id));
                    } else if (input.transferDependenciesTo) {
                        // Transfer variants to new base template
                        await db
                            .update(documentTemplates)
                            .set({ baseTemplateId: input.transferDependenciesTo })
                            .where(eq(documentTemplates.baseTemplateId, input.id));
                    }
                }

                // Transfer other dependencies if specified
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

    // Enhanced generatePreviewImages with variant support
    generatePreviewImages: adminProcedure
        .input(
            z.object({
                templateId: z.string(),
                regenerate: z.boolean().default(false),
                includeVariants: z.boolean().default(false),
                formats: z.array(z.enum(["desktop", "mobile", "thumbnail", "fullPage"])).default(["desktop", "thumbnail"]),
            }),
        )
        .mutation(async ({ input }) => {
            const [template] = await db
                .select()
                .from(documentTemplates)
                .where(eq(documentTemplates.id, input.templateId))
                .limit(1);

            if (!template) {
                throw new Error("Template not found");
            }

            // Generate preview URLs based on requested formats
            const previewImages: Record<string, string> = {};

            input.formats.forEach(format => {
                previewImages[format] = `/api/previews/${input.templateId}/${format}.png`;
            });

            // If template has variants and includeVariants is true, generate for variants too
            let variantPreviews = {};
            if (input.includeVariants && template.templateVariants) {
                const variants = template.templateVariants as any[];
                variantPreviews = variants.reduce((acc, variant) => {
                    acc[variant.id] = input.formats.reduce((formatAcc, format) => {
                        formatAcc[format] = `/api/previews/${input.templateId}/variants/${variant.id}/${format}.png`;
                        return formatAcc;
                    }, {} as Record<string, string>);
                    return acc;
                }, {} as Record<string, Record<string, string>>);
            }

            // Update template with generated preview URLs
            await db
                .update(documentTemplates)
                .set({
                    previewImages: {
                        ...previewImages,
                        variations: variantPreviews,
                    } as any,
                    previewImageUrl: previewImages.desktop || previewImages.thumbnail,
                    updatedAt: new Date(),
                })
                .where(eq(documentTemplates.id, input.templateId));

            return {
                success: true,
                previewImages,
                variantPreviews: Object.keys(variantPreviews).length > 0 ? variantPreviews : undefined
            };
        }),
});
