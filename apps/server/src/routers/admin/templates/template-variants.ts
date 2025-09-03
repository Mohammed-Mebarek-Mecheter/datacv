// apps/server/src/routers/admin/templates/template-variants.ts
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { documentTemplates } from "@/db/schema/document-templates";
import { adminProcedure, router } from "@/lib/trpc";
import {createVariantSchema, variantDesignOverrideSchema} from "@/routers/admin/templates/schemas";


const updateVariantSchema = createVariantSchema.extend({
    variantId: z.string(),
}).omit({ templateId: true });

// Utility functions
function deepMergeObjects(target: any, source: any): any {
    if (!source) return target;
    if (!target) return source;

    const result = JSON.parse(JSON.stringify(target));

    function merge(dest: any, src: any) {
        for (const key in src) {
            if (src[key] && typeof src[key] === 'object' && !Array.isArray(src[key])) {
                if (!dest[key]) dest[key] = {};
                merge(dest[key], src[key]);
            } else {
                dest[key] = src[key];
            }
        }
    }

    merge(result, source);
    return result;
}

function generateVariantId(): string {
    return crypto.randomUUID();
}

// Predefined variant generators
function createColorSchemeVariants(): Array<any> {
    return [
        {
            name: "Professional Blue",
            description: "Clean, trustworthy blue theme for corporate environments",
            variantType: "color",
            designOverrides: {
                colors: {
                    primary: "#2563eb",
                    accent: "#1d4ed8",
                    text: "#1f2937",
                    headings: "#2563eb",
                    links: "#1d4ed8",
                },
            },
            sortOrder: 0,
        },
        {
            name: "Modern Green",
            description: "Fresh, growth-oriented green theme for startups and tech",
            variantType: "color",
            designOverrides: {
                colors: {
                    primary: "#059669",
                    accent: "#047857",
                    text: "#1f2937",
                    headings: "#059669",
                    links: "#047857",
                },
            },
            sortOrder: 1,
        },
        {
            name: "Creative Purple",
            description: "Innovative, creative purple theme for design and creative roles",
            variantType: "color",
            designOverrides: {
                colors: {
                    primary: "#7c3aed",
                    accent: "#6d28d9",
                    text: "#1f2937",
                    headings: "#7c3aed",
                    links: "#6d28d9",
                },
            },
            sortOrder: 2,
        },
        {
            name: "Executive Black",
            description: "Sophisticated, authoritative black theme for senior positions",
            variantType: "color",
            designOverrides: {
                colors: {
                    primary: "#1f2937",
                    accent: "#374151",
                    text: "#111827",
                    headings: "#1f2937",
                    links: "#374151",
                },
            },
            sortOrder: 3,
        },
        {
            name: "Tech Orange",
            description: "Bold, energetic orange theme for tech and innovation roles",
            variantType: "color",
            designOverrides: {
                colors: {
                    primary: "#ea580c",
                    accent: "#dc2626",
                    text: "#1f2937",
                    headings: "#ea580c",
                    links: "#dc2626",
                },
            },
            sortOrder: 4,
        },
    ];
}

function createLayoutVariants(): Array<any> {
    return [
        {
            name: "Classic Single Column",
            description: "Traditional single-column layout for maximum readability",
            variantType: "layout",
            designOverrides: {
                layout: {
                    style: "two_column_right",
                    columns: 2,
                    columnWidths: [70, 30],
                    headerStyle: "standard",
                },
            },
            sortOrder: 2,
        },
        {
            name: "Balanced Two-Column",
            description: "Symmetrical two-column layout with equal weight distribution",
            variantType: "layout",
            designOverrides: {
                layout: {
                    style: "two_column_balanced",
                    columns: 2,
                    columnWidths: [50, 50],
                    headerStyle: "split",
                },
            },
            sortOrder: 3,
        },
        {
            name: "Timeline Style",
            description: "Chronological timeline layout ideal for showcasing career progression",
            variantType: "layout",
            designOverrides: {
                layout: {
                    style: "timeline",
                    columns: 1,
                    headerStyle: "minimal",
                },
            },
            sortOrder: 4,
        },
        {
            name: "Modern Card Layout",
            description: "Contemporary modular card design for visual appeal",
            variantType: "layout",
            designOverrides: {
                layout: {
                    style: "modular_cards",
                    columns: 1,
                    headerStyle: "hero",
                },
            },
            sortOrder: 5,
        },
    ];
}

function createTypographyVariants(): Array<any> {
    return [
        {
            name: "Classic Serif",
            description: "Traditional serif typography for formal, academic contexts",
            variantType: "typography",
            designOverrides: {
                typography: {
                    fontFamily: "Times New Roman",
                    headingFontFamily: "Times New Roman",
                    fontWeights: {
                        normal: 400,
                        medium: 500,
                        semibold: 600,
                        bold: 700,
                    },
                },
            },
            sortOrder: 0,
        },
        {
            name: "Modern Sans-Serif",
            description: "Clean, contemporary sans-serif for modern professions",
            variantType: "typography",
            designOverrides: {
                typography: {
                    fontFamily: "Inter",
                    headingFontFamily: "Inter",
                    fontWeights: {
                        normal: 400,
                        medium: 500,
                        semibold: 600,
                        bold: 700,
                    },
                },
            },
            sortOrder: 1,
        },
        {
            name: "Professional Mix",
            description: "Sophisticated heading and body font combination",
            variantType: "typography",
            designOverrides: {
                typography: {
                    fontFamily: "Source Sans Pro",
                    headingFontFamily: "Playfair Display",
                    fontWeights: {
                        normal: 400,
                        medium: 500,
                        semibold: 600,
                        bold: 700,
                    },
                },
            },
            sortOrder: 2,
        },
        {
            name: "Technical Mono",
            description: "Monospace-influenced design for technical roles",
            variantType: "typography",
            designOverrides: {
                typography: {
                    fontFamily: "Roboto",
                    headingFontFamily: "JetBrains Mono",
                    fontWeights: {
                        normal: 400,
                        medium: 500,
                        semibold: 600,
                        bold: 700,
                    },
                },
            },
            sortOrder: 3,
        },
        {
            name: "Creative Display",
            description: "Expressive typography for creative and design roles",
            variantType: "typography",
            designOverrides: {
                typography: {
                    fontFamily: "Open Sans",
                    headingFontFamily: "Montserrat",
                    fontWeights: {
                        normal: 400,
                        medium: 500,
                        semibold: 600,
                        bold: 700,
                    },
                },
            },
            sortOrder: 4,
        },
    ];
}

function createIndustryThemeVariants(): Array<any> {
    return [
        {
            name: "Tech Startup",
            description: "Dynamic, innovative styling for tech startup environments",
            variantType: "style",
            designOverrides: {
                colors: {
                    primary: "#6366f1",
                    accent: "#8b5cf6",
                    headings: "#6366f1",
                },
                effects: {
                    shadows: true,
                    gradients: true,
                },
                contentStyles: {
                    bulletStyle: "custom",
                    achievementFormat: "metrics_focused",
                },
            },
            sortOrder: 0,
        },
        {
            name: "Financial Services",
            description: "Conservative, trustworthy styling for financial sector",
            variantType: "style",
            designOverrides: {
                colors: {
                    primary: "#1e40af",
                    accent: "#1e3a8a",
                    headings: "#1e40af",
                },
                effects: {
                    shadows: false,
                    gradients: false,
                },
                contentStyles: {
                    bulletStyle: "standard",
                    achievementFormat: "bullets",
                },
            },
            sortOrder: 1,
        },
        {
            name: "Healthcare & Life Sciences",
            description: "Clean, caring aesthetic for healthcare professionals",
            variantType: "style",
            designOverrides: {
                colors: {
                    primary: "#059669",
                    accent: "#047857",
                    headings: "#059669",
                },
                effects: {
                    shadows: false,
                    gradients: false,
                },
                contentStyles: {
                    bulletStyle: "standard",
                    achievementFormat: "bullets",
                },
            },
            sortOrder: 2,
        },
        {
            name: "Management Consulting",
            description: "Professional, authoritative styling for consulting roles",
            variantType: "style",
            designOverrides: {
                colors: {
                    primary: "#374151",
                    accent: "#1f2937",
                    headings: "#374151",
                },
                effects: {
                    shadows: false,
                    gradients: false,
                },
                contentStyles: {
                    bulletStyle: "standard",
                    achievementFormat: "metrics_focused",
                },
            },
            sortOrder: 3,
        },
        {
            name: "Creative & Design",
            description: "Bold, expressive styling for creative professionals",
            variantType: "style",
            designOverrides: {
                colors: {
                    primary: "#ec4899",
                    accent: "#be185d",
                    headings: "#ec4899",
                },
                effects: {
                    shadows: true,
                    gradients: true,
                },
                contentStyles: {
                    bulletStyle: "custom",
                    achievementFormat: "highlights",
                },
            },
            sortOrder: 4,
        },
    ];
}

export const templateVariantsRouter = router({
    // Create a new variant for a template
    createVariant: adminProcedure
        .input(createVariantSchema)
        .mutation(async ({ input, ctx }) => {
            const { templateId, ...variantData } = input;
            const updatedBy = ctx.session.user.id;

            // Fetch current template
            const [template] = await db
                .select({
                    id: documentTemplates.id,
                    templateVariants: documentTemplates.templateVariants,
                })
                .from(documentTemplates)
                .where(eq(documentTemplates.id, templateId));

            if (!template) {
                throw new Error("Template not found");
            }

            // Create new variant
            const variantId = generateVariantId();
            const newVariant = {
                id: variantId,
                ...variantData,
            };

            // Manage existing variants
            const currentVariants = (template.templateVariants as any[]) || [];

            // If this variant is set as default, remove default from others
            if (newVariant.isDefault) {
                currentVariants.forEach(variant => {
                    variant.isDefault = false;
                });
            }

            // Add new variant to the list
            const updatedVariants = [...currentVariants, newVariant];

            // Update template in database
            await db
                .update(documentTemplates)
                .set({
                    templateVariants: updatedVariants as any,
                    updatedBy,
                    updatedAt: new Date(),
                })
                .where(eq(documentTemplates.id, templateId));

            return {
                success: true,
                variantId,
                variant: newVariant,
            };
        }),

    // Update an existing variant
    updateVariant: adminProcedure
        .input(updateVariantSchema)
        .mutation(async ({ input, ctx }) => {
            const { variantId, ...updateData } = input;
            const updatedBy = ctx.session.user.id;

            // Find template containing this variant
            const [template] = await db
                .select({
                    id: documentTemplates.id,
                    templateVariants: documentTemplates.templateVariants,
                })
                .from(documentTemplates)
                .where(
                    sql`${documentTemplates.templateVariants}::jsonb @> ${JSON.stringify([{ id: variantId }])}::jsonb`
                );

            if (!template) {
                throw new Error("Template or variant not found");
            }

            // Update the specific variant
            const currentVariants = (template.templateVariants as any[]) || [];
            let updated = false;

            const updatedVariants = currentVariants.map(variant => {
                if (variant.id === variantId) {
                    updated = true;
                    const updatedVariant = { ...variant, ...updateData };

                    // Handle default variant logic
                    if (updatedVariant.isDefault) {
                        currentVariants.forEach(v => {
                            if (v.id !== variantId) v.isDefault = false;
                        });
                    }

                    return updatedVariant;
                }
                return variant;
            });

            if (!updated) {
                throw new Error("Variant not found in template");
            }

            // Update template in database
            await db
                .update(documentTemplates)
                .set({
                    templateVariants: updatedVariants as any,
                    updatedBy,
                    updatedAt: new Date(),
                })
                .where(eq(documentTemplates.id, template.id));

            return { success: true };
        }),

    // Delete a variant
    deleteVariant: adminProcedure
        .input(z.object({
            templateId: z.string(),
            variantId: z.string()
        }))
        .mutation(async ({ input, ctx }) => {
            const { templateId, variantId } = input;
            const updatedBy = ctx.session.user.id;

            // Fetch current template
            const [template] = await db
                .select({
                    id: documentTemplates.id,
                    templateVariants: documentTemplates.templateVariants,
                })
                .from(documentTemplates)
                .where(eq(documentTemplates.id, templateId));

            if (!template) {
                throw new Error("Template not found");
            }

            // Remove the variant
            const currentVariants = (template.templateVariants as any[]) || [];
            const variantToDelete = currentVariants.find(v => v.id === variantId);

            if (!variantToDelete) {
                throw new Error("Variant not found");
            }

            const updatedVariants = currentVariants.filter(variant => variant.id !== variantId);

            // If we removed the default variant, make the first remaining variant default
            if (variantToDelete.isDefault && updatedVariants.length > 0) {
                updatedVariants[0].isDefault = true;
            }

            // Update template in database
            await db
                .update(documentTemplates)
                .set({
                    templateVariants: updatedVariants as any,
                    updatedBy,
                    updatedAt: new Date(),
                })
                .where(eq(documentTemplates.id, templateId));

            return { success: true };
        }),

    // Reorder variants
    reorderVariants: adminProcedure
        .input(z.object({
            templateId: z.string(),
            variantOrders: z.array(z.object({
                variantId: z.string(),
                order: z.number(),
            })),
        }))
        .mutation(async ({ input, ctx }) => {
            const { templateId, variantOrders } = input;
            const updatedBy = ctx.session.user.id;

            // Fetch current template
            const [template] = await db
                .select({
                    id: documentTemplates.id,
                    templateVariants: documentTemplates.templateVariants,
                })
                .from(documentTemplates)
                .where(eq(documentTemplates.id, templateId));

            if (!template) {
                throw new Error("Template not found");
            }

            // Create order mapping
            const orderMap = variantOrders.reduce((map, item) => {
                map[item.variantId] = item.order;
                return map;
            }, {} as Record<string, number>);

            // Apply new ordering
            const currentVariants = (template.templateVariants as any[]) || [];
            const updatedVariants = currentVariants.map(variant => ({
                ...variant,
                sortOrder: orderMap[variant.id] ?? variant.sortOrder ?? 0,
            }));

            // Update template in database
            await db
                .update(documentTemplates)
                .set({
                    templateVariants: updatedVariants as any,
                    updatedBy,
                    updatedAt: new Date(),
                })
                .where(eq(documentTemplates.id, templateId));

            return { success: true };
        }),

    // Generate preview for a specific variant
    generateVariantPreview: adminProcedure
        .input(z.object({
            templateId: z.string(),
            variantId: z.string(),
            regenerate: z.boolean().default(false),
        }))
        .mutation(async ({ input }) => {
            const { templateId, variantId } = input;

            // In a real implementation, this would integrate with your preview generation service
            // (Puppeteer, Playwright, or similar) to create actual preview images
            const previewUrl = `/api/previews/templates/${templateId}/variants/${variantId}/preview.png`;

            // Update the variant with the new preview URL
            const [template] = await db
                .select({
                    id: documentTemplates.id,
                    templateVariants: documentTemplates.templateVariants,
                })
                .from(documentTemplates)
                .where(eq(documentTemplates.id, templateId));

            if (template) {
                const currentVariants = (template.templateVariants as any[]) || [];
                const updatedVariants = currentVariants.map(variant => {
                    if (variant.id === variantId) {
                        return { ...variant, previewImageUrl: previewUrl };
                    }
                    return variant;
                });

                await db
                    .update(documentTemplates)
                    .set({
                        templateVariants: updatedVariants as any,
                        updatedAt: new Date(),
                    })
                    .where(eq(documentTemplates.id, templateId));
            }

            return {
                success: true,
                previewUrl,
                message: "Variant preview generated successfully"
            };
        }),

    // Duplicate an existing variant
    duplicateVariant: adminProcedure
        .input(z.object({
            templateId: z.string(),
            sourceVariantId: z.string(),
            newName: z.string(),
            modifications: variantDesignOverrideSchema.optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { templateId, sourceVariantId, newName, modifications } = input;
            const updatedBy = ctx.session.user.id;

            // Fetch template and source variant
            const [template] = await db
                .select({
                    id: documentTemplates.id,
                    templateVariants: documentTemplates.templateVariants,
                })
                .from(documentTemplates)
                .where(eq(documentTemplates.id, templateId));

            if (!template) {
                throw new Error("Template not found");
            }

            const currentVariants = (template.templateVariants as any[]) || [];
            const sourceVariant = currentVariants.find(v => v.id === sourceVariantId);

            if (!sourceVariant) {
                throw new Error("Source variant not found");
            }

            // Create new variant based on source
            const newVariantId = generateVariantId();
            const newVariant = {
                ...sourceVariant,
                id: newVariantId,
                name: newName,
                isDefault: false,
                sortOrder: Math.max(...currentVariants.map(v => v.sortOrder || 0), 0) + 1,
                designOverrides: modifications ?
                    deepMergeObjects(sourceVariant.designOverrides || {}, modifications) :
                    sourceVariant.designOverrides,
            };

            const updatedVariants = [...currentVariants, newVariant];

            // Update template in database
            await db
                .update(documentTemplates)
                .set({
                    templateVariants: updatedVariants as any,
                    updatedBy,
                    updatedAt: new Date(),
                })
                .where(eq(documentTemplates.id, templateId));

            return {
                success: true,
                variantId: newVariantId,
                variant: newVariant,
            };
        }),

    // Get all variants for a template
    getTemplateVariants: adminProcedure
        .input(z.object({ templateId: z.string() }))
        .query(async ({ input }) => {
            const [template] = await db
                .select({
                    id: documentTemplates.id,
                    name: documentTemplates.name,
                    templateVariants: documentTemplates.templateVariants,
                    designConfig: documentTemplates.designConfig,
                })
                .from(documentTemplates)
                .where(eq(documentTemplates.id, input.templateId));

            if (!template) {
                throw new Error("Template not found");
            }

            const variants = (template.templateVariants as any[]) || [];

            // Enhance variants with computed design configurations
            const enrichedVariants = variants.map(variant => ({
                ...variant,
                computedDesignConfig: variant.designOverrides ?
                    deepMergeObjects(template.designConfig, variant.designOverrides) :
                    template.designConfig,
            }));

            // Sort by sortOrder
            const sortedVariants = enrichedVariants.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

            return {
                templateId: template.id,
                templateName: template.name,
                baseDesignConfig: template.designConfig,
                variants: sortedVariants,
                totalVariants: sortedVariants.length,
                defaultVariant: sortedVariants.find(v => v.isDefault) || sortedVariants[0],
            };
        }),

    // Create predefined variant sets
    createVariantSet: adminProcedure
        .input(z.object({
            templateId: z.string(),
            setType: z.enum(["color_schemes", "layout_styles", "typography_sets", "industry_themes"]),
            replaceExisting: z.boolean().default(false),
        }))
        .mutation(async ({ input, ctx }) => {
            const { templateId, setType, replaceExisting } = input;
            const updatedBy = ctx.session.user.id;

            // Fetch current template
            const [template] = await db
                .select({
                    id: documentTemplates.id,
                    templateVariants: documentTemplates.templateVariants,
                })
                .from(documentTemplates)
                .where(eq(documentTemplates.id, templateId));

            if (!template) {
                throw new Error("Template not found");
            }

            // Generate predefined variants based on set type
            let newVariants: any[] = [];
            const currentVariants = replaceExisting ? [] : (template.templateVariants as any[]) || [];

            switch (setType) {
                case "color_schemes":
                    newVariants = createColorSchemeVariants();
                    break;
                case "layout_styles":
                    newVariants = createLayoutVariants();
                    break;
                case "typography_sets":
                    newVariants = createTypographyVariants();
                    break;
                case "industry_themes":
                    newVariants = createIndustryThemeVariants();
                    break;
            }

            // Add unique IDs and proper ordering
            const startingOrder = currentVariants.length > 0 ?
                Math.max(...currentVariants.map(v => v.sortOrder || 0)) + 1 : 0;

            newVariants.forEach((variant, index) => {
                variant.id = generateVariantId();
                variant.sortOrder = startingOrder + index;
                if (index === 0 && currentVariants.length === 0) {
                    variant.isDefault = true;
                }
            });

            const finalVariants = [...currentVariants, ...newVariants];

            // Update template in database
            await db
                .update(documentTemplates)
                .set({
                    templateVariants: finalVariants as any,
                    updatedBy,
                    updatedAt: new Date(),
                })
                .where(eq(documentTemplates.id, templateId));

            return {
                success: true,
                variantsCreated: newVariants.length,
                totalVariants: finalVariants.length,
                setType,
            };
        }),

    // Bulk operations for variants
    bulkUpdateVariants: adminProcedure
        .input(z.object({
            templateId: z.string(),
            variantIds: z.array(z.string()),
            updates: z.object({
                isPremium: z.boolean().optional(),
                isDefault: z.boolean().optional(),
            }),
        }))
        .mutation(async ({ input, ctx }) => {
            const { templateId, variantIds, updates } = input;
            const updatedBy = ctx.session.user.id;

            // Fetch current template
            const [template] = await db
                .select({
                    id: documentTemplates.id,
                    templateVariants: documentTemplates.templateVariants,
                })
                .from(documentTemplates)
                .where(eq(documentTemplates.id, templateId));

            if (!template) {
                throw new Error("Template not found");
            }

            const currentVariants = (template.templateVariants as any[]) || [];
            let updatedCount = 0;

            const updatedVariants = currentVariants.map(variant => {
                if (variantIds.includes(variant.id)) {
                    updatedCount++;
                    return { ...variant, ...updates };
                }
                return variant;
            });

            // Handle default variant logic
            if (updates.isDefault === true) {
                updatedVariants.forEach(variant => {
                    if (!variantIds.includes(variant.id)) {
                        variant.isDefault = false;
                    }
                });
            }

            // Update template in database
            await db
                .update(documentTemplates)
                .set({
                    templateVariants: updatedVariants as any,
                    updatedBy,
                    updatedAt: new Date(),
                })
                .where(eq(documentTemplates.id, templateId));

            return {
                success: true,
                updatedCount,
            };
        }),
});
