// src/routers/admin/templates/schemas.ts
import { z } from "zod";
import type { DataIndustry, DataSpecialization, DocumentsType } from "@/lib/data-ai";

// Enhanced section validation schema
export const sectionValidationSchema = z.object({
    minItems: z.number().optional(),
    requiredFields: z.array(z.string()).optional(),
    fieldTypes: z.record(z.string(), z.string()).optional(),
});

// Enhanced conditional visibility schema
export const conditionalVisibilitySchema = z.object({
    dependsOn: z.string().optional(),
    condition: z.enum(["exists", "empty", "equals"]).optional(),
    value: z.any().optional(),
});

// Layout properties for sections
export const layoutPropsSchema = z.object({
    columnSpan: z.union([z.literal(1), z.literal(2)]).optional(),
    rowSpan: z.number().optional(),
    flexGrow: z.number().optional(),
    alignment: z.enum(["left", "center", "right"]).optional(),
    sticky: z.boolean().optional(),
});

// Enhanced section schema with layout and visual options
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
        "certifications",
        "publications",
        "achievements",
        "references",
        "custom",
    ]),
    isRequired: z.boolean(),
    order: z.number(),
    description: z.string().optional(),
    maxItems: z.number().optional(),

    // Enhanced layout properties
    layoutProps: layoutPropsSchema.optional(),
    displayStyle: z.enum(["standard", "timeline", "cards", "grid", "compact"]).optional(),
    headerStyle: z.enum(["minimal", "standard", "prominent", "divider", "colored_bar", "icon"]).optional(),
    iconName: z.string().optional(),

    validation: sectionValidationSchema.optional(),
    conditionalVisibility: conditionalVisibilitySchema.optional(),
});

// Enhanced custom field schema
export const customFieldSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["text", "textarea", "date", "url", "list", "rating", "percentage"]),
    section: z.string(),
    order: z.number(),
    validation: z.any().optional(),
});

// Visual style configuration
export const visualStyleSchema = z.object({
    theme: z.enum(["professional", "modern", "creative", "minimal", "bold", "elegant", "technical"]),
    personality: z.enum(["conservative", "balanced", "progressive", "creative"]),
    density: z.enum(["compact", "comfortable", "spacious"]),
    emphasis: z.enum(["content", "design", "balanced"]),
});

// Enhanced layout configuration
export const layoutConfigSchema = z.object({
    style: z.enum([
        "single_column",
        "two_column_left",
        "two_column_right",
        "two_column_balanced",
        "grid_based",
        "hybrid",
        "timeline",
        "modular_cards",
        "infographic",
    ]),
    columns: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    columnWidths: z.array(z.number()).optional(),
    headerStyle: z.enum(["minimal", "standard", "prominent", "hero", "split"]),

    // Paper and margins
    paperFormat: z.enum(["a4_portrait", "a4_landscape", "us_letter_portrait", "us_letter_landscape"]),
    pageMargins: z.object({
        top: z.number(),
        bottom: z.number(),
        left: z.number(),
        right: z.number(),
    }),

    // Spacing and organization
    sectionSpacing: z.number(),
    itemSpacing: z.number().optional(),
    allowReordering: z.boolean().optional(),

    // Advanced layout features
    stickyHeader: z.boolean().optional(),
    pageBreaks: z.enum(["auto", "manual", "avoid_orphans"]).optional(),
    contentFlow: z.enum(["standard", "masonry", "justified"]).optional(),

    // Column configuration for multi-column layouts
    columnConfiguration: z.object({
        leftColumn: z.object({
            width: z.number(),
            sections: z.array(z.string()),
            alignment: z.enum(["left", "center", "right"]).optional(),
            backgroundColor: z.string().optional(),
            padding: z.number().optional(),
        }).optional(),
        rightColumn: z.object({
            width: z.number(),
            sections: z.array(z.string()),
            alignment: z.enum(["left", "center", "right"]).optional(),
            backgroundColor: z.string().optional(),
            padding: z.number().optional(),
        }).optional(),
    }).optional(),

    // Grid configuration
    gridConfiguration: z.object({
        columns: z.number(),
        rows: z.number(),
        areas: z.record(z.string(), z.object({
            row: z.number(),
            column: z.number(),
            rowSpan: z.number().optional(),
            colSpan: z.number().optional(),
        })),
    }).optional(),
});

// Enhanced template structure schema
export const templateStructureSchema = z.object({
    sections: z.array(sectionSchema),
    layout: layoutConfigSchema,
    visualStyle: visualStyleSchema,
    customFields: z.array(customFieldSchema).optional(),
});

// Enhanced design configuration schema
export const enhancedDesignConfigSchema = z.object({
    // Color system
    colors: z.object({
        // Primary colors
        primary: z.string(),
        primaryLight: z.string().optional(),
        primaryDark: z.string().optional(),
        secondary: z.string().optional(),
        accent: z.string().optional(),

        // Text colors
        text: z.string(),
        textSecondary: z.string().optional(),
        textMuted: z.string().optional(),
        headings: z.string().optional(),

        // Background colors
        background: z.string(),
        surface: z.string().optional(),
        surfaceSecondary: z.string().optional(),

        // UI colors
        border: z.string().optional(),
        divider: z.string().optional(),
        success: z.string().optional(),
        warning: z.string().optional(),
        error: z.string().optional(),

        // Semantic colors
        links: z.string().optional(),
        dates: z.string().optional(),
        companies: z.string().optional(),
        achievements: z.string().optional(),

        // Color variations
        variations: z.record(z.string(), z.object({
            name: z.string(),
            primary: z.string(),
            secondary: z.string().optional(),
            accent: z.string().optional(),
            description: z.string().optional(),
        })).optional(),
    }),

    // Enhanced typography system
    typography: z.object({
        // Font families
        fontFamily: z.string(),
        headingFontFamily: z.string().optional(),
        brandFontFamily: z.string().optional(),

        // Font sizes
        baseFontSize: z.number(),
        scaleRatio: z.number().optional(),
        fontSizes: z.object({
            xs: z.number(),
            sm: z.number(),
            base: z.number(),
            lg: z.number(),
            xl: z.number(),
            "2xl": z.number(),
            "3xl": z.number(),
            "4xl": z.number(),
        }),

        // Heading hierarchy
        headingSizes: z.object({
            name: z.number(),
            h1: z.number(),
            h2: z.number(),
            h3: z.number(),
        }),

        // Font weights
        fontWeights: z.object({
            light: z.number(),
            normal: z.number(),
            medium: z.number(),
            semibold: z.number(),
            bold: z.number(),
        }),

        // Text properties
        lineHeight: z.number(),
        headingLineHeight: z.number().optional(),
        letterSpacing: z.number().optional(),
        headingLetterSpacing: z.number().optional(),

        // Font pairings
        fontPairings: z.array(z.object({
            name: z.string(),
            heading: z.string(),
            body: z.string(),
            accent: z.string().optional(),
        })).optional(),
    }),

    // Enhanced spacing system
    spacing: z.object({
        baseUnit: z.number(),
        sectionSpacing: z.number(),
        itemSpacing: z.number().optional(),
        paragraphSpacing: z.number().optional(),
        nameSpacing: z.number().optional(),
        contactSpacing: z.number().optional(),
        summarySpacing: z.number().optional(),
        listItemSpacing: z.number().optional(),

        pageMargins: z.object({
            top: z.number(),
            bottom: z.number(),
            left: z.number(),
            right: z.number(),
        }),

        columnGap: z.number().optional(),
        rowGap: z.number().optional(),
    }),

    // Enhanced border system
    borders: z.object({
        sectionDividers: z.boolean(),
        headerUnderline: z.boolean(),
        style: z.enum(["solid", "dotted", "dashed", "double"]),
        width: z.number(),
        radius: z.number().optional(),

        sectionBorders: z.boolean().optional(),
        itemBorders: z.boolean().optional(),
        headerBorders: z.object({
            top: z.boolean().optional(),
            bottom: z.boolean().optional(),
            left: z.boolean().optional(),
            right: z.boolean().optional(),
            style: z.enum(["solid", "dotted", "dashed"]).optional(),
            color: z.string().optional(),
        }).optional(),
    }),

    // Enhanced layout configuration
    layout: z.object({
        maxWidth: z.string().optional(),
        contentAlignment: z.enum(["left", "center", "right", "justified"]).optional(),
        headerAlignment: z.enum(["left", "center", "right"]).optional(),

        columnConfiguration: z.object({
            leftColumn: z.object({
                width: z.number(),
                sections: z.array(z.string()),
                alignment: z.enum(["left", "center", "right"]).optional(),
                backgroundColor: z.string().optional(),
                padding: z.number().optional(),
            }).optional(),
            rightColumn: z.object({
                width: z.number(),
                sections: z.array(z.string()),
                alignment: z.enum(["left", "center", "right"]).optional(),
                backgroundColor: z.string().optional(),
                padding: z.number().optional(),
            }).optional(),
        }).optional(),

        gridConfiguration: z.object({
            columns: z.number(),
            rows: z.number(),
            areas: z.record(z.string(), z.object({
                row: z.number(),
                column: z.number(),
                rowSpan: z.number().optional(),
                colSpan: z.number().optional(),
            })),
        }).optional(),
    }),

    // Enhanced effects
    effects: z.object({
        shadows: z.boolean().optional(),
        animations: z.boolean().optional(),
        gradients: z.boolean().optional(),
        backgroundPattern: z.enum(["none", "dots", "lines", "subtle_texture"]).optional(),
        hoverEffects: z.boolean().optional(),
        smoothTransitions: z.boolean().optional(),
        printOptimization: z.boolean().optional(),
        colorAdjustment: z.enum(["auto", "preserve", "grayscale"]).optional(),
    }),

    // Icon configuration
    icons: z.object({
        sectionIcons: z.boolean().optional(),
        contactIcons: z.boolean().optional(),
        skillIcons: z.boolean().optional(),
        iconStyle: z.enum(["outline", "filled", "minimal"]).optional(),
        iconSize: z.number().optional(),
        customIcons: z.record(z.string(), z.string()).optional(),
    }),

    // Content presentation styles
    contentStyles: z.object({
        bulletStyle: z.enum(["standard", "minimal", "custom", "icons", "colored"]).optional(),
        dateFormat: z.enum(["month_year", "full_date", "year_only", "custom"]).optional(),
        skillPresentation: z.enum(["list", "tags", "bars", "grid", "compact"]).optional(),
        projectPresentation: z.enum(["detailed", "compact", "cards", "timeline"]).optional(),
        achievementFormat: z.enum(["bullets", "numbered", "highlights", "metrics_focused"]).optional(),
    }),
});

// Layout engine configuration schema
export const layoutEngineSchema = z.object({
    engine: z.enum(["standard", "flexbox", "grid", "absolute", "custom"]),
    responsive: z.boolean().optional(),
    breakpoints: z.object({
        mobile: z.number().optional(),
        tablet: z.number().optional(),
        desktop: z.number().optional(),
    }).optional(),
    layoutRules: z.array(z.object({
        condition: z.string(),
        overrides: z.any(),
    })).optional(),
});

// Template features schema
export const templateFeaturesSchema = z.object({
    supportedExports: z.array(z.enum(["pdf", "docx", "txt", "json"])),
    aiOptimized: z.boolean().optional(),
    aiSuggestions: z.boolean().optional(),
    contentGeneration: z.boolean().optional(),
    colorCustomization: z.boolean().optional(),
    fontCustomization: z.boolean().optional(),
    layoutCustomization: z.boolean().optional(),
    sectionCustomization: z.boolean().optional(),
    multilingual: z.boolean().optional(),
    atsOptimized: z.boolean().optional(),
    printOptimized: z.boolean().optional(),
    mobileOptimized: z.boolean().optional(),
    portfolioSupport: z.boolean().optional(),
    publicationSupport: z.boolean().optional(),
    projectGallery: z.boolean().optional(),
    skillVisualization: z.boolean().optional(),
});

// Enhanced sample content mapping schema
export const sampleContentMapSchema = z.record(
    z.string(),
    z.union([
        z.string(), // Simple string ID for backward compatibility
        z.object({
            default: z.string(),
            byJobTitle: z.record(z.string(), z.string()).optional(),
            bySpecialization: z.record(z.string(), z.string()).optional(),
            byIndustry: z.record(z.string(), z.string()).optional(),
            byExperienceLevel: z.record(z.string(), z.string()).optional(),
        })
    ])
);

// Enhanced create template schema
export const createTemplateSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    description: z.string().optional(),
    category: z.enum(["professional", "modern", "creative", "academic", "minimalist", "executive", "technical", "infographic"]),
    documentType: z.enum(["resume", "cv", "cover_letter"]) as z.ZodType<DocumentsType>,

    // Template inheritance and variants
    parentTemplateId: z.string().optional(),
    baseTemplateId: z.string().optional(),
    isBaseTemplate: z.boolean().default(false),
    isVariant: z.boolean().default(false),
    variantType: z.string().optional(),
    variantName: z.string().optional(),

    // Enhanced target audience
    targetSpecialization: z.array(z.string()).optional() as z.ZodOptional<z.ZodType<DataSpecialization[]>>,
    targetIndustries: z.array(z.string()).optional() as z.ZodOptional<z.ZodType<DataIndustry[]>>,
    targetJobTitles: z.array(z.string()).optional(),
    targetCompanyTypes: z.array(z.enum(["startup", "enterprise", "consulting", "agency", "non_profit", "government"])).optional(),
    targetExperienceLevel: z.enum(["entry", "junior", "mid", "senior", "lead", "principal", "executive"]).optional(),

    // Enhanced template structure and design
    templateStructure: templateStructureSchema,
    designConfig: enhancedDesignConfigSchema,
    layoutEngine: layoutEngineSchema.optional(),

    // Enhanced sample content mapping
    specificSampleContentMap: sampleContentMapSchema.optional(),

    // Component management
    componentCode: z.string().optional(),
    componentPath: z.string().optional(),
    componentVersion: z.string().default("1.0.0"),

    // Enhanced preview system
    previewImageUrl: z.string().optional(),
    previewImages: z.object({
        desktop: z.string().optional(),
        mobile: z.string().optional(),
        thumbnail: z.string().optional(),
        fullPage: z.string().optional(),
        section_previews: z.record(z.string(), z.string()).optional(),
        variations: z.record(z.string(), z.string()).optional(),
        export_formats: z.object({
            pdf: z.string().optional(),
            docx: z.string().optional(),
        }).optional(),
    }).optional(),
    previewImageAlt: z.string().optional(),

    // SEO and discoverability
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    tags: z.array(z.string()).optional(),
    searchKeywords: z.string().optional(),

    // Enhanced template features
    features: templateFeaturesSchema.optional(),

    // Status and access control
    isPremium: z.boolean().default(false),
    isActive: z.boolean().default(true),
    isPublic: z.boolean().default(true),
    isDraft: z.boolean().default(false),
    accessLevel: z.enum(["public", "premium", "enterprise", "beta"]).default("public"),
    requiredPlan: z.enum(["free", "pro", "enterprise"]).optional(),

    // Featured status
    isFeatured: z.boolean().default(false),
    featuredOrder: z.number().optional(),
    featuredUntil: z.date().optional(),
    featuredCategory: z.enum(["trending", "popular", "new", "staff_pick"]).optional(),

    // Version control
    version: z.string().default("1.0.0"),
    changelog: z.array(z.object({
        version: z.string(),
        date: z.string(),
        changes: z.array(z.string()),
        author: z.string(),
        breaking: z.boolean().optional(),
        migrationGuide: z.string().optional(),
    })).optional(),

    // Quality assurance
    qualityScore: z.number().optional(),
    qualityMetrics: z.object({
        designConsistency: z.number().optional(),
        contentRelevance: z.number().optional(),
        userSatisfaction: z.number().optional(),
        technicalQuality: z.number().optional(),
        accessibility: z.number().optional(),
    }).optional(),
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

// Enhanced template filters with new fields
export const templateFiltersSchema = z.object({
    documentType: z.enum(["resume", "cv", "cover_letter"]).optional(),
    category: z.enum(["professional", "modern", "creative", "academic", "minimalist", "executive", "technical", "infographic"]).optional(),
    layoutStyle: z.enum([
        "single_column", "two_column_left", "two_column_right", "two_column_balanced",
        "grid_based", "hybrid", "timeline", "modular_cards", "infographic"
    ]).optional(),
    paperFormat: z.enum(["a4_portrait", "a4_landscape", "us_letter_portrait", "us_letter_landscape"]).optional(),

    // Enhanced filtering options
    isActive: z.boolean().optional(),
    isDraft: z.boolean().optional(),
    isVariant: z.boolean().optional(),
    hasVariants: z.boolean().optional(),
    reviewStatus: z.enum(["pending", "approved", "rejected"]).optional(),
    hasParent: z.boolean().optional(),
    isBaseTemplate: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    featuredCategory: z.enum(["trending", "popular", "new", "staff_pick"]).optional(),
    accessLevel: z.enum(["public", "premium", "enterprise", "beta"]).optional(),

    // Target audience filters
    targetExperienceLevel: z.string().optional(),
    targetIndustries: z.string().optional(),
    targetSpecialization: z.string().optional(),
    targetJobTitles: z.array(z.string()).optional(),
    targetCompanyTypes: z.array(z.string()).optional(),

    // Quality and performance filters
    qualityScoreMin: z.number().optional(),
    usageCountMin: z.number().optional(),
    avgRatingMin: z.number().optional(),
    completionRateMin: z.number().optional(),

    // Search and discovery
    search: z.string().optional(),
    tags: z.array(z.string()).optional(),

    // Creator and date filters
    createdBy: z.string().optional(),
    dateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
    }).optional(),

    // Sorting and pagination
    sortBy: z.enum([
        "name", "created", "updated", "usage", "rating", "quality",
        "completion_rate", "export_rate", "effectiveness"
    ]).default("updated"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    includeVariants: z.boolean().default(true),
    limit: z.number().default(50),
    offset: z.number().default(0),
});

// Template duplication schemas
export const duplicateTemplateSchema = z.object({
    templateId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    category: z.enum(["professional", "modern", "creative", "academic", "minimalist", "executive", "technical", "infographic"]).optional(),
    setAsChildTemplate: z.boolean().default(false),
    setAsVariant: z.boolean().default(false),
    variantType: z.enum(["color", "layout", "typography", "style", "complete"]).optional(),

    // Override configurations
    designConfigOverrides: enhancedDesignConfigSchema.partial().optional(),
    templateStructureOverrides: templateStructureSchema.partial().optional(),
    sampleContentOverrides: sampleContentMapSchema.optional(),

    // Target audience modifications
    targetSpecialization: z.array(z.string()).optional(),
    targetIndustries: z.array(z.string()).optional(),
    targetJobTitles: z.array(z.string()).optional(),
    targetExperienceLevel: z.string().optional(),

    // Metadata
    tags: z.array(z.string()).optional(),
    version: z.string().optional(),
});

export const createFromBaseSchema = z.object({
    baseTemplateId: z.string(),
    name: z.string(),
    description: z.string().optional(),

    overrides: z.object({
        category: z.enum(["professional", "modern", "creative", "academic", "minimalist", "executive", "technical", "infographic"]).optional(),
        designConfig: enhancedDesignConfigSchema.partial().optional(),
        templateStructure: templateStructureSchema.partial().optional(),
        layoutEngine: layoutEngineSchema.partial().optional(),

        targetSpecialization: z.array(z.string()).optional(),
        targetIndustries: z.array(z.string()).optional(),
        targetJobTitles: z.array(z.string()).optional(),
        targetCompanyTypes: z.array(z.string()).optional(),
        targetExperienceLevel: z.enum(["entry", "junior", "mid", "senior", "lead", "principal", "executive"]).optional(),

        tags: z.array(z.string()).optional(),
        features: templateFeaturesSchema.partial().optional(),
    }).optional(),
});

// Enhanced bulk operation schemas
export const bulkUpdateSchema = z.object({
    templateIds: z.array(z.string()),
    updates: z.object({
        isActive: z.boolean().optional(),
        isPremium: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        reviewStatus: z.enum(["pending", "approved", "rejected"]).optional(),
        category: z.enum(["professional", "modern", "creative", "academic", "minimalist", "executive", "technical", "infographic"]).optional(),
        accessLevel: z.enum(["public", "premium", "enterprise", "beta"]).optional(),

        // Target audience updates
        targetSpecialization: z.array(z.string()).optional() as z.ZodOptional<z.ZodType<DataSpecialization[]>>,
        targetIndustries: z.array(z.string()).optional() as z.ZodOptional<z.ZodType<DataIndustry[]>>,
        targetJobTitles: z.array(z.string()).optional(),
        targetExperienceLevel: z.enum(["entry", "junior", "mid", "senior", "lead", "principal", "executive"]).optional(),

        // Metadata updates
        tags: z.array(z.string()).optional(),
        version: z.string().optional(),
        qualityScore: z.number().optional(),
    }),
    createVersions: z.boolean().default(false),
});

export const bulkDeleteSchema = z.object({
    templateIds: z.array(z.string()),
    hardDelete: z.boolean().default(false),
    transferDependenciesTo: z.string().optional(),
    preserveVariants: z.boolean().default(false), // Whether to preserve variants when deleting base template
});

// Template validation schemas
export const validateStructureSchema = z.object({
    templateStructure: templateStructureSchema,
    designConfig: enhancedDesignConfigSchema,
    sampleContent: z.any().optional(),
    checkConsistency: z.boolean().default(true),
    validateSampleMapping: z.boolean().default(true),
});

// Version management schemas
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

export const versionListSchema = z.object({
    templateId: z.string(),
    includeUnpublished: z.boolean().default(false),
    limit: z.number().default(20),
    offset: z.number().default(0),
});

export const publishVersionSchema = z.object({
    versionId: z.string(),
    unpublishOthers: z.boolean().default(true),
    notifyUsers: z.boolean().default(false),
});

export const revertVersionSchema = z.object({
    templateId: z.string(),
    versionId: z.string(),
    createBackup: z.boolean().default(true),
    preserveVariants: z.boolean().default(true),
});

// Template analytics and insights schemas
export const templateAnalyticsSchema = z.object({
    templateIds: z.array(z.string()).optional(),
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }).optional(),
    metrics: z.array(z.enum([
        "usage", "conversion", "completion", "export", "rating",
        "customization", "effectiveness", "user_satisfaction"
    ])).optional(),
    groupBy: z.enum(["template", "category", "industry", "experience_level", "date"]).optional(),
});

// Template testing and optimization schemas
export const abTestSchema = z.object({
    templateId: z.string(),
    testName: z.string(),
    variants: z.array(z.object({
        variantId: z.string(),
        trafficPercentage: z.number().min(0).max(100),
    })),
    metrics: z.array(z.string()),
    duration: z.number(), // Days
    targetAudience: z.object({
        industries: z.array(z.string()).optional(),
        experienceLevels: z.array(z.string()).optional(),
        specializations: z.array(z.string()).optional(),
    }).optional(),
});

// Import/export schemas for template migration
export const exportTemplatesSchema = z.object({
    templateIds: z.array(z.string()),
    includeVariants: z.boolean().default(true),
    includeSampleContent: z.boolean().default(false),
    includeAnalytics: z.boolean().default(false),
    format: z.enum(["json", "yaml"]).default("json"),
});

export const importTemplatesSchema = z.object({
    templates: z.any(), // Will be validated against createTemplateSchema
    overwriteExisting: z.boolean().default(false),
    preserveIds: z.boolean().default(false),
    updateReferences: z.boolean().default(true),
});

// Enhanced Design System Schema
export const designSystemSchema = z.object({
    colors: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
        text: z.string(),
        textSecondary: z.string(),
        background: z.string(),
        border: z.string(),
        headings: z.string(),
        links: z.string(),
    }),
    typography: z.object({
        fontFamily: z.string(),
        headingFontFamily: z.string(),
        baseFontSize: z.number(),
        fontWeights: z.object({
            light: z.number(),
            normal: z.number(),
            medium: z.number(),
            semibold: z.number(),
            bold: z.number(),
        }),
        lineHeight: z.object({
            body: z.number(),
            heading: z.number(),
        }),
    }),
    layout: z.object({
        style: z.enum([
            "single_column", "two_column_left", "two_column_right",
            "two_column_balanced", "grid_based", "hybrid", "timeline",
            "modular_cards", "infographic"
        ]),
        columns: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        columnWidths: z.array(z.number()),
        headerStyle: z.enum(["minimal", "standard", "prominent", "hero", "split"]),
        paperFormat: z.enum([
            "a4_portrait", "a4_landscape", "us_letter_portrait", "us_letter_landscape"
        ]),
        spacing: z.object({
            section: z.number(),
            item: z.number(),
            paragraph: z.number(),
            pageMargins: z.object({
                top: z.number(),
                bottom: z.number(),
                left: z.number(),
                right: z.number(),
            }),
        }),
    }),
    components: z.object({
        sectionHeading: z.object({
            alignment: z.enum(["left", "center", "right"]),
            underline: z.boolean(),
            divider: z.enum(["none", "solid", "dashed", "dotted"]),
            style: z.enum(["bar", "icon", "plain"]),
        }),
        borders: z.object({
            style: z.enum(["solid", "dotted", "dashed", "double"]),
            width: z.number(),
        }),
        effects: z.object({
            shadows: z.boolean(),
            animations: z.boolean(),
            gradients: z.boolean(),
            backgroundPattern: z.enum(["none", "dots", "lines", "subtle_texture"]),
        }),
        icons: z.object({
            sectionIcons: z.boolean(),
            contactIcons: z.boolean(),
            skillIcons: z.boolean(),
            style: z.enum(["outline", "filled", "minimal"]),
            size: z.number(),
        }),
        content: z.object({
            bulletStyle: z.enum(["standard", "minimal", "custom", "icons", "colored"]),
            dateFormat: z.enum(["month_year", "full_date", "year_only", "custom"]),
            skillPresentation: z.enum(["list", "tags", "bars", "grid", "compact"]),
            projectPresentation: z.enum(["detailed", "compact", "cards", "timeline"]),
            achievementFormat: z.enum(["bullets", "numbered", "highlights", "metrics_focused"]),
        }),
    }),
});

// Template Variant Schema
export const templateVariantSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    variantType: z.enum(["color", "layout", "typography", "style", "complete"]),
    designOverrides: designSystemSchema.partial().optional(),
    previewImageUrl: z.string().optional(),
    isDefault: z.boolean().default(false),
    isPremium: z.boolean().default(false),
    sortOrder: z.number().default(0),
    targetIndustry: z.string().optional(),
    targetRole: z.string().optional(),
    personalityTags: z.array(z.string()).optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

// Data Professional Content Schema
export const dataProfessionalContentSchema = z.object({
    jobTitle: z.string(),
    industry: z.string().optional(),
    experienceLevel: z.enum(["entry", "mid", "senior", "executive"]),
    personalInfo: z.object({
        name: z.string(),
        title: z.string(),
        email: z.string(),
        phone: z.string(),
        location: z.string(),
        linkedin: z.string(),
        github: z.string().optional(),
        portfolio: z.string().optional(),
    }),
    professionalSummary: z.array(z.string()),
    skills: z.object({
        technical: z.array(z.object({
            category: z.string(),
            skills: z.array(z.string()),
        })),
        tools: z.array(z.object({
            category: z.string(),
            tools: z.array(z.string()),
        })),
        soft: z.array(z.string()),
    }),
    experience: z.array(z.object({
        title: z.string(),
        company: z.string(),
        location: z.string(),
        duration: z.string(),
        description: z.string(),
        achievements: z.array(z.string()),
        technologies: z.array(z.string()),
        metrics: z.array(z.string()),
    })),
    projects: z.array(z.object({
        name: z.string(),
        description: z.string(),
        technologies: z.array(z.string()),
        achievements: z.array(z.string()),
        metrics: z.array(z.string()),
        link: z.string().optional(),
    })),
    education: z.array(z.object({
        degree: z.string(),
        institution: z.string(),
        location: z.string(),
        duration: z.string(),
        gpa: z.string().optional(),
        relevantCoursework: z.array(z.string()).optional(),
    })),
    certifications: z.array(z.object({
        name: z.string(),
        issuer: z.string(),
        date: z.string(),
        credentialId: z.string().optional(),
    })),
    achievements: z.array(z.string()),
    keywords: z.array(z.string()),
});

// Enhanced Template Schema
export const enhancedTemplateSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    category: z.string(),
    subcategory: z.string().optional(),

    // Base design system
    designConfig: designSystemSchema,

    // Template variants
    templateVariants: z.array(templateVariantSchema).optional(),

    // Content templates for data professionals
    contentTemplates: z.record(
        z.enum(["data_scientist", "data_analyst", "ml_engineer", "data_engineer", "bi_developer"]),
        z.record(
            z.enum(["entry", "mid", "senior", "executive"]),
            dataProfessionalContentSchema
        )
    ).optional(),

    // Industry-specific customizations
    industryCustomizations: z.record(
        z.string(), // industry key
        z.object({
            keywords: z.array(z.string()),
            projects: z.array(z.string()),
            achievements: z.array(z.string()),
            designOverrides: designSystemSchema.partial().optional(),
        })
    ).optional(),

    // Template metadata
    isActive: z.boolean().default(true),
    isPremium: z.boolean().default(false),
    sortOrder: z.number().default(0),
    tags: z.array(z.string()).optional(),

    // Timestamps
    createdAt: z.date(),
    updatedAt: z.date(),
    createdBy: z.string(),
    updatedBy: z.string().optional(),
});

// API Request/Response Schemas
export const createVariantRequestSchema = z.object({
    templateId: z.string(),
    name: z.string().min(1, "Variant name is required"),
    description: z.string().optional(),
    variantType: z.enum(["color", "layout", "typography", "style", "complete"]),
    designOverrides: designSystemSchema.partial().optional(),
    targetIndustry: z.string().optional(),
    targetRole: z.string().optional(),
    personalityTags: z.array(z.string()).optional(),
    isPremium: z.boolean().default(false),
});

export const updateVariantRequestSchema = createVariantRequestSchema.extend({
    variantId: z.string(),
}).omit({ templateId: true });

export const createVariantSetRequestSchema = z.object({
    templateId: z.string(),
    setType: z.enum(["color_schemes", "layout_styles", "typography_sets", "industry_themes", "complete_variations"]),
    includeColorSchemes: z.boolean().default(true),
    includeLayouts: z.boolean().default(true),
    includeTypography: z.boolean().default(true),
    includeIndustryThemes: z.boolean().default(true),
    replaceExisting: z.boolean().default(false),
    targetRoles: z.array(z.string()).optional(),
    targetIndustries: z.array(z.string()).optional(),
});

export const getVariantsRequestSchema = z.object({
    templateId: z.string(),
    includePreviewData: z.boolean().default(false),
    filterByRole: z.string().optional(),
    filterByIndustry: z.string().optional(),
    filterByType: z.enum(["color", "layout", "typography", "style", "complete"]).optional(),
    includeInactive: z.boolean().default(false),
});

export const reorderVariantsRequestSchema = z.object({
    templateId: z.string(),
    variantOrders: z.array(z.object({
        variantId: z.string(),
        order: z.number(),
    })),
});

// Response Schemas
export const variantResponseSchema = z.object({
    success: z.boolean(),
    variantId: z.string().optional(),
    variant: templateVariantSchema.optional(),
    message: z.string().optional(),
});

export const variantSetResponseSchema = z.object({
    success: z.boolean(),
    variantsCreated: z.number(),
    totalVariants: z.number(),
    variants: z.array(templateVariantSchema),
    message: z.string().optional(),
});

export const templateVariantsResponseSchema = z.object({
    templateId: z.string(),
    templateName: z.string(),
    baseDesignSystem: designSystemSchema,
    variants: z.array(templateVariantSchema.extend({
        computedDesignSystem: designSystemSchema.optional(),
        previewData: z.object({
            colorPreview: z.object({
                primary: z.string(),
                accent: z.string(),
                text: z.string(),
            }),
            typographyPreview: z.object({
                headingFont: z.string(),
                bodyFont: z.string(),
                fontSize: z.number(),
            }),
            layoutPreview: z.object({
                style: z.string(),
                columns: z.number(),
                headerStyle: z.string(),
            }),
            personalityTags: z.array(z.string()),
            targetRole: z.string().optional(),
            targetIndustry: z.string().optional(),
        }).optional(),
    })),
});

// Content Generation Schemas
export const generateContentRequestSchema = z.object({
    role: z.enum(["data_scientist", "data_analyst", "ml_engineer", "data_engineer", "bi_developer"]),
    experienceLevel: z.enum(["entry", "mid", "senior", "executive"]),
    industry: z.string().optional(),
    specialization: z.string().optional(),
    includeVariations: z.boolean().default(false),
    customization: z.object({
        emphasizeMetrics: z.boolean().default(false),
        emphasizeSkills: z.boolean().default(false),
        emphasizeLeadership: z.boolean().default(false),
        includePublications: z.boolean().default(false),
        includePatents: z.boolean().default(false),
    }).optional(),
});

export const contentVariationResponseSchema = z.object({
    baseContent: dataProfessionalContentSchema,
    variations: z.array(dataProfessionalContentSchema).optional(),
    industryCustomizations: z.object({
        keywords: z.array(z.string()),
        projects: z.array(z.string()),
        achievements: z.array(z.string()),
    }).optional(),
});

// Core variant schemas
export const variantDesignOverrideSchema = z.object({
    colors: z.object({
        primary: z.string().optional(),
        secondary: z.string().optional(),
        accent: z.string().optional(),
        text: z.string().optional(),
        textSecondary: z.string().optional(),
        background: z.string().optional(),
        border: z.string().optional(),
        headings: z.string().optional(),
        links: z.string().optional(),
    }).optional(),

    typography: z.object({
        fontFamily: z.string().optional(),
        headingFontFamily: z.string().optional(),
        baseFontSize: z.number().optional(),
        fontWeights: z.object({
            light: z.number().optional(),
            normal: z.number().optional(),
            medium: z.number().optional(),
            semibold: z.number().optional(),
            bold: z.number().optional(),
        }).optional(),
    }).optional(),

    layout: z.object({
        style: z.enum([
            "single_column", "two_column_left", "two_column_right",
            "two_column_balanced", "grid_based", "hybrid", "timeline",
            "modular_cards", "infographic"
        ]).optional(),
        columns: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
        columnWidths: z.array(z.number()).optional(),
        headerStyle: z.enum(["minimal", "standard", "prominent", "hero", "split"]).optional(),
        paperFormat: z.enum([
            "a4_portrait", "a4_landscape", "us_letter_portrait", "us_letter_landscape"
        ]).optional(),
    }).optional(),

    spacing: z.object({
        sectionSpacing: z.number().optional(),
        itemSpacing: z.number().optional(),
        paragraphSpacing: z.number().optional(),
        pageMargins: z.object({
            top: z.number().optional(),
            bottom: z.number().optional(),
            left: z.number().optional(),
            right: z.number().optional(),
        }).optional(),
    }).optional(),

    borders: z.object({
        sectionDividers: z.boolean().optional(),
        headerUnderline: z.boolean().optional(),
        style: z.enum(["solid", "dotted", "dashed", "double"]).optional(),
        width: z.number().optional(),
    }).optional(),

    effects: z.object({
        shadows: z.boolean().optional(),
        animations: z.boolean().optional(),
        gradients: z.boolean().optional(),
        backgroundPattern: z.enum(["none", "dots", "lines", "subtle_texture"]).optional(),
    }).optional(),

    icons: z.object({
        sectionIcons: z.boolean().optional(),
        contactIcons: z.boolean().optional(),
        skillIcons: z.boolean().optional(),
        iconStyle: z.enum(["outline", "filled", "minimal"]).optional(),
        iconSize: z.number().optional(),
    }).optional(),

    contentStyles: z.object({
        bulletStyle: z.enum(["standard", "minimal", "custom", "icons", "colored"]).optional(),
        dateFormat: z.enum(["month_year", "full_date", "year_only", "custom"]).optional(),
        skillPresentation: z.enum(["list", "tags", "bars", "grid", "compact"]).optional(),
        projectPresentation: z.enum(["detailed", "compact", "cards", "timeline"]).optional(),
        achievementFormat: z.enum(["bullets", "numbered", "highlights", "metrics_focused"]).optional(),
    }).optional(),
});

export const createVariantSchema = z.object({
    templateId: z.string(),
    name: z.string().min(1, "Variant name is required"),
    description: z.string().optional(),
    variantType: z.enum(["color", "layout", "typography", "style", "complete"]),
    designOverrides: variantDesignOverrideSchema.optional(),
    previewImageUrl: z.string().optional(),
    isDefault: z.boolean().default(false),
    isPremium: z.boolean().default(false),
    sortOrder: z.number().default(0),
});

// Validation helper functions
export function validateDesignOverrides(overrides: any): boolean {
    try {
        designSystemSchema.partial().parse(overrides);
        return true;
    } catch {
        return false;
    }
}

export function validateTemplateVariant(variant: any): boolean {
    try {
        templateVariantSchema.parse(variant);
        return true;
    } catch {
        return false;
    }
}

export function validateDataProfessionalContent(content: any): boolean {
    try {
        dataProfessionalContentSchema.parse(content);
        return true;
    } catch {
        return false;
    }
}

// Type exports for TypeScript
export type DesignSystem = z.infer<typeof designSystemSchema>;
export type TemplateVariant = z.infer<typeof templateVariantSchema>;
export type DataProfessionalContent = z.infer<typeof dataProfessionalContentSchema>;
export type EnhancedTemplate = z.infer<typeof enhancedTemplateSchema>;
export type CreateVariantRequest = z.infer<typeof createVariantRequestSchema>;
export type UpdateVariantRequest = z.infer<typeof updateVariantRequestSchema>;
export type CreateVariantSetRequest = z.infer<typeof createVariantSetRequestSchema>;
export type GetVariantsRequest = z.infer<typeof getVariantsRequestSchema>;
export type TemplateVariantsResponse = z.infer<typeof templateVariantsResponseSchema>;
export type GenerateContentRequest = z.infer<typeof generateContentRequestSchema>;
export type ContentVariationResponse = z.infer<typeof contentVariationResponseSchema>;
export type VariantDesignOverride = z.infer<typeof variantDesignOverrideSchema>;
export type CreateVariant = z.infer<typeof createVariantSchema>;
