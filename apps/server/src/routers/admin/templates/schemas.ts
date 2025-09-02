// src/routers/admin/templates/schemas.ts
import { z } from "zod";
import type { DataIndustry, DataSpecialization, DocumentsType } from "@/lib/data-ai";

// Section validation schema
export const sectionValidationSchema = z.object({
    minItems: z.number().optional(),
    requiredFields: z.array(z.string()).optional(),
    fieldTypes: z.record(z.string(), z.string()).optional(),
});

// Conditional visibility schema
export const conditionalVisibilitySchema = z.object({
    dependsOn: z.string().optional(),
    condition: z.enum(["exists", "empty", "equals"]).optional(),
    value: z.any().optional(),
});

// Section schema
export const sectionSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum([
        "personal_info",
        "summary",
        "experience",
        "education",
        "skills",
        "projects",
        "custom",
    ]),
    isRequired: z.boolean(),
    order: z.number(),
    description: z.string().optional(),
    maxItems: z.number().optional(),
    validation: sectionValidationSchema.optional(),
    conditionalVisibility: conditionalVisibilitySchema.optional(),
});

// Custom field schema
export const customFieldSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["text", "textarea", "date", "url", "list"]),
    section: z.string(),
    order: z.number(),
    validation: z.any().optional(),
});

// Template structure schema
export const templateStructureSchema = z.object({
    sections: z.array(sectionSchema),
    layout: z.object({
        columns: z.union([z.literal(1), z.literal(2)]),
        headerStyle: z.enum(["minimal", "standard", "prominent"]),
        pageMargins: z
            .object({
                top: z.number(),
                bottom: z.number(),
                left: z.number(),
                right: z.number(),
            })
            .optional(),
        sectionSpacing: z.number().optional(),
        allowReordering: z.boolean().optional(),
    }),
    customFields: z.array(customFieldSchema).optional(),
});

// Enhanced design config schema
export const enhancedDesignConfigSchema = z.object({
    colors: z.object({
        primary: z.string(),
        secondary: z.string().optional(),
        accent: z.string().optional(),
        text: z.string(),
        textSecondary: z.string().optional(),
        background: z.string(),
        border: z.string().optional(),
        variations: z
            .record(
                z.string(),
                z.object({
                    primary: z.string(),
                    secondary: z.string().optional(),
                    accent: z.string().optional(),
                }),
            )
            .optional(),
    }),
    typography: z.object({
        fontFamily: z.string(),
        fontSize: z.number(),
        lineHeight: z.number().optional(),
        headingFontFamily: z.string().optional(),
        headingSizes: z
            .object({
                h1: z.number(),
                h2: z.number(),
                h3: z.number(),
            })
            .optional(),
        fontWeights: z
            .object({
                normal: z.number(),
                bold: z.number(),
                heading: z.number(),
            })
            .optional(),
        letterSpacing: z.number().optional(),
    }),
    spacing: z.object({
        sectionSpacing: z.number(),
        itemSpacing: z.number().optional(),
        paragraphSpacing: z.number().optional(),
        marginTop: z.number().optional(),
        marginBottom: z.number().optional(),
    }),
    borders: z
        .object({
            sectionDividers: z.boolean(),
            headerUnderline: z.boolean(),
            style: z.enum(["solid", "dotted", "dashed"]),
            width: z.number(),
            radius: z.number().optional(),
        })
        .optional(),
    layout: z
        .object({
            maxWidth: z.string().optional(),
            columnGap: z.number().optional(),
            rowGap: z.number().optional(),
            alignment: z.enum(["left", "center", "right"]).optional(),
        })
        .optional(),
    effects: z
        .object({
            shadows: z.boolean().optional(),
            animations: z.boolean().optional(),
            gradients: z.boolean().optional(),
        })
        .optional(),
});

// Create template schema
export const createTemplateSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    description: z.string().optional(),
    category: z.enum(["professional", "modern", "creative", "academic"]),
    documentType: z.enum([
        "resume",
        "cv",
        "cover_letter",
    ]) as z.ZodType<DocumentsType>,

    // Template inheritance
    parentTemplateId: z.string().optional(),
    isBaseTemplate: z.boolean().default(false),

    // Target audience
    targetSpecialization: z.array(z.string()).optional() as z.ZodOptional<
        z.ZodType<DataSpecialization[]>
    >,
    targetIndustries: z.array(z.string()).optional() as z.ZodOptional<
        z.ZodType<DataIndustry[]>
    >,
    targetExperienceLevel: z
        .enum([
            "entry",
            "junior",
            "mid",
            "senior",
            "lead",
            "principal",
            "executive",
        ])
        .optional(),

    // Template structure
    templateStructure: templateStructureSchema,
    designConfig: enhancedDesignConfigSchema,

    // Component management
    componentCode: z.string().optional(),
    componentPath: z.string().optional(),
    componentVersion: z.string().default("1.0.0"),

    // Preview and SEO
    previewImageUrl: z.string().optional(),
    previewImages: z
        .object({
            desktop: z.string().optional(),
            mobile: z.string().optional(),
            thumbnail: z.string().optional(),
            variations: z.record(z.string(), z.string()).optional(),
        })
        .optional(),
    previewImageAlt: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),

    // Tags and keywords
    tags: z.array(z.string()).optional(),
    searchKeywords: z.string().optional(),

    // Settings
    isPremium: z.boolean().default(false),
    isActive: z.boolean().default(true),
    isPublic: z.boolean().default(true),
    isDraft: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    featuredOrder: z.number().optional(),
    featuredUntil: z.date().optional(),
    version: z.string().default("1.0.0"),

    // Quality assurance
    reviewStatus: z.enum(["pending", "approved", "rejected"]).default("pending"),
    reviewNotes: z.string().optional(),
});

// Update template schema
export const updateTemplateSchema = createTemplateSchema
    .extend({
        id: z.string(),
    })
    .partial()
    .required({ id: true });

// Template version schema
export const templateVersionSchema = z.object({
    templateId: z.string(),
    versionNumber: z.string(),
    versionType: z.enum(["major", "minor", "patch"]).default("minor"),
    changelogNotes: z.string().optional(),
    isBreaking: z.boolean().default(false),
    deprecatedFeatures: z.array(z.string()).optional(),
    migrationNotes: z.string().optional(),
    backwardCompatible: z.boolean().default(true),
    isPublished: z.boolean().default(false),
    publishedAt: z.date().optional(),
});

// Template listing filters schema
export const templateFiltersSchema = z.object({
    documentType: z.enum(["resume", "cv", "cover_letter"]).optional(),
    category: z
        .enum(["professional", "modern", "creative", "academic"])
        .optional(),
    isActive: z.boolean().optional(),
    isDraft: z.boolean().optional(),
    reviewStatus: z.enum(["pending", "approved", "rejected"]).optional(),
    hasParent: z.boolean().optional(),
    isBaseTemplate: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    search: z.string().optional(),
    tags: z.array(z.string()).optional(),
    createdBy: z.string().optional(),
    dateRange: z
        .object({
            from: z.date().optional(),
            to: z.date().optional(),
        })
        .optional(),
    qualityScoreMin: z.number().optional(),
    usageCountMin: z.number().optional(),
    avgRatingMin: z.number().optional(),
    targetExperienceLevel: z.string().optional(),
    targetIndustries: z.string().optional(),
    targetSpecialization: z.string().optional(),
    sortBy: z
        .enum(["name", "created", "updated", "usage", "rating", "quality"])
        .default("updated"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    limit: z.number().default(50),
    offset: z.number().default(0),
});

// Duplication schemas
export const duplicateTemplateSchema = z.object({
    templateId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    category: z
        .enum(["professional", "modern", "creative", "academic"])
        .optional(),
    setAsChildTemplate: z.boolean().default(false),
    designConfigOverrides: enhancedDesignConfigSchema.partial().optional(),
    templateStructureOverrides: templateStructureSchema.partial().optional(),
    tags: z.array(z.string()).optional(),
    targetSpecialization: z.string().optional(),
    targetIndustries: z.string().optional(),
    targetExperienceLevel: z.string().optional(),
});

export const createFromBaseSchema = z.object({
    baseTemplateId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    overrides: z
        .object({
            category: z
                .enum(["professional", "modern", "creative", "academic"])
                .optional(),
            designConfig: enhancedDesignConfigSchema.partial().optional(),
            templateStructure: templateStructureSchema.partial().optional(),
            targetSpecialization: z.array(z.string()).optional(),
            targetIndustries: z.array(z.string()).optional(),
            targetExperienceLevel: z
                .enum([
                    "entry",
                    "junior",
                    "mid",
                    "senior",
                    "lead",
                    "principal",
                    "executive",
                ])
                .optional(),
            tags: z.array(z.string()).optional(),
        })
        .optional(),
});

// Bulk operation schemas
export const bulkUpdateSchema = z.object({
    templateIds: z.array(z.string()),
    updates: z.object({
        isActive: z.boolean().optional(),
        isPremium: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        reviewStatus: z.enum(["pending", "approved", "rejected"]).optional(),
        category: z
            .enum(["professional", "modern", "creative", "academic"])
            .optional(),
        tags: z.array(z.string()).optional(),
        targetSpecialization: z.array(z.string()).optional() as z.ZodOptional<
            z.ZodType<DataSpecialization[]>
        >,
        targetIndustries: z.array(z.string()).optional() as z.ZodOptional<
            z.ZodType<DataIndustry[]>
        >,
        targetExperienceLevel: z
            .enum([
                "entry",
                "junior",
                "mid",
                "senior",
                "lead",
                "principal",
                "executive",
            ])
            .optional(),
        version: z.string().optional(),
    }),
    createVersions: z.boolean().default(false),
});

export const bulkDeleteSchema = z.object({
    templateIds: z.array(z.string()),
    hardDelete: z.boolean().default(false),
    transferDependenciesTo: z.string().optional(),
});

// Validation schemas
export const validateStructureSchema = z.object({
    templateStructure: templateStructureSchema,
    sampleContent: z.any().optional(),
});

// Version management schemas
export const versionListSchema = z.object({
    templateId: z.string(),
    limit: z.number().default(20),
    offset: z.number().default(0),
});

export const publishVersionSchema = z.object({
    versionId: z.string(),
    unpublishOthers: z.boolean().default(true),
});

export const revertVersionSchema = z.object({
    templateId: z.string(),
    versionId: z.string(),
    createBackup: z.boolean().default(true),
});
