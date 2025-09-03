// apps/server/src/db/schema/document-templates.ts

import { relations } from "drizzle-orm";
import {
    boolean,
    decimal,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";
import { templateVersions } from "@/db/schema/template-versions";
import { templateTagRelations, templateTags } from "@/db/schema/template-tags";
import {
    templateCollectionItems,
    templateCollections,
} from "@/db/schema/template-collections";
import { userTemplateCustomizations } from "@/db/schema/template-customizations";
import { templateUsage } from "@/db/schema/template-usage";
import type {
    DataIndustry,
    DataSpecialization,
    DocumentsType,
} from "@/lib/data-ai";

// Enhanced enums for better type safety
export const templateCategoryEnum = pgEnum("template_category", [
    "professional",
    "modern",
    "creative",
    "academic",
    "minimalist",
    "executive",
    "technical",
    "infographic",
]);

export const experienceLevelEnum = pgEnum("experience_level", [
    "entry",
    "junior",
    "mid",
    "senior",
    "lead",
    "principal",
    "executive",
]);

export const layoutStyleEnum = pgEnum("layout_style", [
    "single_column",
    "two_column_left",
    "two_column_right",
    "two_column_balanced",
    "grid_based",
    "hybrid",
    "timeline",
    "modular_cards",
    "infographic",
]);

export const paperFormatEnum = pgEnum("paper_format", [
    "a4_portrait",
    "a4_landscape",
    "us_letter_portrait",
    "us_letter_landscape",
]);

// Enhanced template system with design variations support
export const documentTemplates = pgTable("document_templates", {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),

        // Basic metadata
        name: text("name").notNull(),
        description: text("description"),
        category: templateCategoryEnum("category").notNull(),
        DocumentsType: text("document_type").$type<DocumentsType>().notNull(),

        // Template inheritance and variants
        parentTemplateId: text("parent_template_id").references(
            (): any => documentTemplates.id,
        ),
        baseTemplateId: text("base_template_id").references(
            (): any => documentTemplates.id,
        ), // Links to the base design
        isBaseTemplate: boolean("is_base_template").default(false),
        isVariant: boolean("is_variant").default(false), // True for design variations
        variantType: text("variant_type"), // "layout", "color", "typography", "style"
        variantName: text("variant_name"), // "Two Column", "Blue Accent", "Sans Serif", etc.

        // Preview system with multiple views
        previewImageUrl: text("preview_image_url"), // Primary preview
        previewImages: jsonb("preview_images").$type<{
            desktop?: string;
            mobile?: string;
            thumbnail?: string;
            fullPage?: string;
            section_previews?: Record<string, string>; // Preview individual sections
            variations?: Record<string, string>; // Different color/style variations
            export_formats?: {
                pdf?: string;
                docx?: string;
            };
        }>(),
        previewImageAlt: text("preview_image_alt"),

        // Target audience with enhanced granularity
        targetSpecialization: jsonb("target_specialization").$type<
            DataSpecialization[]
        >(),
        targetIndustries: jsonb("target_industries").$type<DataIndustry[]>(),
        targetExperienceLevel: experienceLevelEnum("target_experience_level"),
        targetJobTitles: jsonb("target_job_titles").$type<string[]>(), // Specific job titles this template suits
        targetCompanyTypes: jsonb("target_company_types").$type<
            ("startup" | "enterprise" | "consulting" | "agency" | "non_profit" | "government")[]
        >(),

        // Enhanced template structure with layout support
        templateStructure: jsonb("template_structure")
            .$type<{
                sections: Array<{
                    id: string;
                    name: string;
                    type:
                        | "personal_info"
                        | "summary"
                        | "experience"
                        | "education"
                        | "skills"
                        | "projects"
                        | "certifications"
                        | "publications"
                        | "achievements"
                        | "references"
                        | "custom";
                    isRequired: boolean;
                    order: number;
                    description?: string;
                    maxItems?: number;

                    // Layout-specific properties
                    layoutProps?: {
                        columnSpan?: 1 | 2; // For multi-column layouts
                        rowSpan?: number;
                        flexGrow?: number;
                        alignment?: "left" | "center" | "right";
                        sticky?: boolean; // For headers that stick to page breaks
                    };

                    // Visual presentation
                    displayStyle?: "standard" | "timeline" | "cards" | "grid" | "compact";
                    headerStyle?: "minimal" | "standard" | "prominent" | "divider" | "colored_bar" | "icon";
                    iconName?: string; // Lucide icon name for section headers

                    validation?: {
                        minItems?: number;
                        requiredFields?: string[];
                        fieldTypes?: Record<string, string>;
                    };
                    conditionalVisibility?: {
                        dependsOn?: string;
                        condition?: "exists" | "empty" | "equals";
                        value?: string | number | boolean;
                    };
                }>;

                layout: {
                    style: "single_column" | "two_column_left" | "two_column_right" | "two_column_balanced" | "grid_based" | "hybrid" | "timeline" | "modular_cards" | "infographic";
                    columns: 1 | 2 | 3;
                    columnWidths?: number[]; // Relative widths for columns (e.g., [70, 30])
                    headerStyle: "minimal" | "standard" | "prominent" | "hero" | "split";

                    // Paper and margins
                    paperFormat: "a4_portrait" | "a4_landscape" | "us_letter_portrait" | "us_letter_landscape";
                    pageMargins: {
                        top: number;
                        bottom: number;
                        left: number;
                        right: number;
                    };

                    // Spacing and organization
                    sectionSpacing: number;
                    itemSpacing?: number;
                    allowReordering?: boolean;

                    // Advanced layout features
                    stickyHeader?: boolean;
                    pageBreaks?: "auto" | "manual" | "avoid_orphans";
                    contentFlow?: "standard" | "masonry" | "justified";
                };

                // Visual style system
                visualStyle: {
                    theme: "professional" | "modern" | "creative" | "minimal" | "bold" | "elegant" | "technical";
                    personality: "conservative" | "balanced" | "progressive" | "creative";
                    density: "compact" | "comfortable" | "spacious";
                    emphasis: "content" | "design" | "balanced";
                };

                customFields?: Array<{
                    id: string;
                    name: string;
                    type: "text" | "textarea" | "date" | "url" | "list" | "rating" | "percentage";
                    section: string;
                    order: number;
                    validation?: any;
                }>;
            }>()
            .notNull(),

        // Enhanced design configuration with comprehensive styling
        designConfig: jsonb("design_config")
            .$type<{
                // Color system with semantic naming
                colors: {
                    // Primary brand colors
                    primary: string;
                    primaryLight?: string;
                    primaryDark?: string;
                    secondary?: string;
                    accent?: string;

                    // Text colors
                    text: string;
                    textSecondary?: string;
                    textMuted?: string;
                    headings?: string;

                    // Background and surface colors
                    background: string;
                    surface?: string;
                    surfaceSecondary?: string;

                    // UI colors
                    border?: string;
                    divider?: string;
                    success?: string;
                    warning?: string;
                    error?: string;

                    // Semantic colors for different content types
                    links?: string;
                    dates?: string;
                    companies?: string;
                    achievements?: string;

                    // Color variations/themes
                    variations?: Record<
                        string,
                        {
                            name: string;
                            primary: string;
                            secondary?: string;
                            accent?: string;
                            description?: string;
                        }
                    >;
                };

                // Typography system
                typography: {
                    // Font families
                    fontFamily: string;
                    headingFontFamily?: string;
                    brandFontFamily?: string; // For name/header

                    // Font sizes (in points for print)
                    baseFontSize: number;
                    scaleRatio?: number; // For modular scale
                    fontSizes: {
                        xs: number;
                        sm: number;
                        base: number;
                        lg: number;
                        xl: number;
                        "2xl": number;
                        "3xl": number;
                        "4xl": number;
                    };

                    // Heading hierarchy
                    headingSizes: {
                        name: number; // User's name
                        h1: number;   // Section headers
                        h2: number;   // Subsection headers
                        h3: number;   // Sub-subsection headers
                    };

                    // Font weights
                    fontWeights: {
                        light: number;
                        normal: number;
                        medium: number;
                        semibold: number;
                        bold: number;
                    };

                    // Text properties
                    lineHeight: number;
                    headingLineHeight?: number;
                    letterSpacing?: number;
                    headingLetterSpacing?: number;

                    // Font pairing presets
                    fontPairings?: Array<{
                        name: string;
                        heading: string;
                        body: string;
                        accent?: string;
                    }>;
                };

                // Spacing system
                spacing: {
                    // Global spacing
                    baseUnit: number; // Base spacing unit (e.g., 4pt)
                    sectionSpacing: number;
                    itemSpacing: number;
                    paragraphSpacing: number;

                    // Specific spacing controls
                    nameSpacing?: number; // Space around name/header
                    contactSpacing?: number;
                    summarySpacing?: number;
                    listItemSpacing?: number;

                    // Page margins
                    pageMargins: {
                        top: number;
                        bottom: number;
                        left: number;
                        right: number;
                    };

                    // Column spacing for multi-column layouts
                    columnGap?: number;
                    rowGap?: number;
                };

                // Border and divider system
                borders: {
                    sectionDividers: boolean;
                    headerUnderline: boolean;
                    style: "solid" | "dotted" | "dashed" | "double";
                    width: number;
                    radius?: number;

                    // Advanced border options
                    sectionBorders?: boolean;
                    itemBorders?: boolean;
                    headerBorders?: {
                        top?: boolean;
                        bottom?: boolean;
                        left?: boolean;
                        right?: boolean;
                        style?: "solid" | "dotted" | "dashed";
                        color?: string;
                    };
                };

                // Layout configuration
                layout: {
                    maxWidth?: string;
                    contentAlignment?: "left" | "center" | "right" | "justified";
                    headerAlignment?: "left" | "center" | "right";

                    // Column configuration for multi-column layouts
                    columnConfiguration?: {
                        leftColumn?: {
                            width: number; // Percentage
                            sections: string[]; // Section types that go in left column
                            alignment?: "left" | "center" | "right";
                            backgroundColor?: string;
                            padding?: number;
                        };
                        rightColumn?: {
                            width: number;
                            sections: string[];
                            alignment?: "left" | "center" | "right";
                            backgroundColor?: string;
                            padding?: number;
                        };
                    };

                    // Grid configuration for grid-based layouts
                    gridConfiguration?: {
                        columns: number;
                        rows: number;
                        areas: Record<string, { row: number; column: number; rowSpan?: number; colSpan?: number; }>;
                    };
                };

                // Visual effects and enhancements
                effects: {
                    shadows?: boolean;
                    animations?: boolean;
                    gradients?: boolean;

                    // Advanced effects
                    backgroundPattern?: "none" | "dots" | "lines" | "subtle_texture";
                    hoverEffects?: boolean;
                    smoothTransitions?: boolean;

                    // Print-specific effects
                    printOptimization?: boolean;
                    colorAdjustment?: "auto" | "preserve" | "grayscale";
                };

                // Icon and visual elements
                icons: {
                    sectionIcons?: boolean;
                    contactIcons?: boolean;
                    skillIcons?: boolean;
                    iconStyle?: "outline" | "filled" | "minimal";
                    iconSize?: number;
                    customIcons?: Record<string, string>; // Custom icon mappings
                };

                // Content presentation styles
                contentStyles: {
                    bulletStyle?: "standard" | "minimal" | "custom" | "icons" | "colored";
                    dateFormat?: "month_year" | "full_date" | "year_only" | "custom";
                    skillPresentation?: "list" | "tags" | "bars" | "grid" | "compact";
                    projectPresentation?: "detailed" | "compact" | "cards" | "timeline";
                    achievementFormat?: "bullets" | "numbered" | "highlights" | "metrics_focused";
                };
            }>()
            .notNull(),

        // Enhanced sample content mapping with job-specific targeting
        specificSampleContentMap: jsonb("specific_sample_content_map")
            .$type<Record<string, string | {
                default: string; // Default sample content ID
                byJobTitle?: Record<string, string>; // Job-specific overrides
                bySpecialization?: Record<DataSpecialization, string>;
                byIndustry?: Record<DataIndustry, string>;
                byExperienceLevel?: Record<string, string>;
            }>>()
            .default({}),

        // Template variants for design variations
        templateVariants: jsonb("template_variants")
            .$type<Array<{
                id: string;
                name: string; // "Professional Blue", "Modern Green", "Creative Purple"
                description?: string;
                variantType: "color" | "layout" | "typography" | "style" | "complete";

                // Override configurations for this variant
                designOverrides?: {
                    colors?: Partial<any>; // Partial color scheme
                    typography?: Partial<any>; // Font changes
                    layout?: Partial<any>; // Layout modifications
                    effects?: Partial<any>; // Visual effect changes
                };

                // Preview for this specific variant
                previewImageUrl?: string;
                isDefault?: boolean; // Whether this is the default variant shown
                isPremium?: boolean;
                sortOrder?: number;
            }>>()
            .default([]),

        // Enhanced component management
        componentCode: text("component_code"), // React component code
        componentPath: text("component_path"), // Path to component file
        componentVersion: text("component_version").default("1.0.0"),

        // Layout engine configuration
        layoutEngine: jsonb("layout_engine").$type<{
            engine: "standard" | "flexbox" | "grid" | "absolute" | "custom";
            responsive?: boolean;
            breakpoints?: {
                mobile?: number;
                tablet?: number;
                desktop?: number;
            };
            layoutRules?: Array<{
                condition: string; // CSS media query or condition
                overrides: any; // Layout/design overrides for this condition
            }>;
        }>().default({ engine: "standard" }),

        // SEO and discoverability
        tags: jsonb("tags").$type<string[]>().default([]),
        searchKeywords: text("search_keywords"),
        seoTitle: text("seo_title"),
        seoDescription: text("seo_description"),

        // Usage statistics and quality metrics
        usageCount: integer("usage_count").default(0),
        avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0"),
        totalRatings: integer("total_ratings").default(0),
        conversionRate: decimal("conversion_rate", {
            precision: 5,
            scale: 4,
        }).default("0"),

        // Template effectiveness metrics
        completionRate: decimal("completion_rate", { precision: 5, scale: 4 }).default("0"), // How often users finish documents with this template
        exportRate: decimal("export_rate", { precision: 5, scale: 4 }).default("0"), // How often users export/download
        customizationRate: decimal("customization_rate", { precision: 5, scale: 4 }).default("0"), // How often users customize

        // Featured status and curation
        isFeatured: boolean("is_featured").default(false),
        featuredOrder: integer("featured_order"),
        featuredUntil: timestamp("featured_until"),
        featuredCategory: text("featured_category"), // "trending", "popular", "new", "staff_pick"

        // Access control and status
        isActive: boolean("is_active").default(true),
        isPremium: boolean("is_premium").default(false),
        isPublic: boolean("is_public").default(true),
        isDraft: boolean("is_draft").default(false),

        // Advanced access control
        accessLevel: text("access_level").default("public"), // "public", "premium", "enterprise", "beta"
        requiredPlan: text("required_plan"), // "free", "pro", "enterprise"

        // Versioning and changelog
        version: text("version").default("1.0.0"),
        changelog: jsonb("changelog")
            .$type<
                Array<{
                    version: string;
                    date: string;
                    changes: string[];
                    author: string;
                    breaking?: boolean;
                    migrationGuide?: string;
                }>
            >()
            .default([]),

        // Quality assurance and review
        qualityScore: integer("quality_score"), // 0-100
        qualityMetrics: jsonb("quality_metrics").$type<{
            designConsistency?: number; // 0-100
            contentRelevance?: number; // 0-100
            userSatisfaction?: number; // 0-100
            technicalQuality?: number; // 0-100
            accessibility?: number; // 0-100
        }>(),
        reviewStatus: text("review_status").default("pending"),
        reviewNotes: text("review_notes"),
        reviewedBy: text("reviewed_by").references(() => user.id),
        reviewedAt: timestamp("reviewed_at"),

        // Analytics and insights
        analyticsData: jsonb("analytics_data").$type<{
            // Performance metrics
            avgLoadTime?: number;
            renderTime?: number;

            // Usage patterns
            popularSections?: Array<{ section: string; usage: number; }>;
            commonCustomizations?: Record<string, number>;
            exportFormats?: Record<string, number>; // PDF vs DOCX usage

            // User feedback and behavior
            userFeedbackSummary?: {
                positive: string[];
                negative: string[];
                suggestions: string[];
                ratings: Record<string, number>; // Feature ratings
            };

            // Industry-specific metrics
            industryPerformance?: Record<DataIndustry, {
                usage: number;
                satisfaction: number;
                completionRate: number;
            }>;

            // A/B testing results
            abTestResults?: Array<{
                testName: string;
                variant: string;
                metric: string;
                value: number;
                confidence: number;
            }>;
        }>(),

        // Template capabilities and features
        features: jsonb("features").$type<{
            // Export capabilities
            supportedExports: ("pdf" | "docx" | "txt" | "json")[];

            // AI integration features
            aiOptimized?: boolean;
            aiSuggestions?: boolean;
            contentGeneration?: boolean;

            // Customization features
            colorCustomization?: boolean;
            fontCustomization?: boolean;
            layoutCustomization?: boolean;
            sectionCustomization?: boolean;

            // Advanced features
            multilingual?: boolean;
            atsOptimized?: boolean; // Applicant Tracking System optimized
            printOptimized?: boolean;
            mobileOptimized?: boolean;

            // Industry-specific features
            portfolioSupport?: boolean;
            publicationSupport?: boolean;
            projectGallery?: boolean;
            skillVisualization?: boolean;
        }>(),

        // Metadata
        createdBy: text("created_by").references(() => user.id),
        updatedBy: text("updated_by").references(() => user.id),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => ({
        // Enhanced indexes for performance
        categoryIdx: index("templates_category_idx").on(table.category),
        documentTypeIdx: index("templates_document_type_idx").on(table.DocumentsType),
        activeIdx: index("templates_active_idx").on(table.isActive),
        premiumIdx: index("templates_premium_idx").on(table.isPremium),
        featuredIdx: index("templates_featured_idx").on(table.isFeatured, table.featuredOrder),
        variantIdx: index("templates_variant_idx").on(table.isVariant, table.baseTemplateId),
        usageIdx: index("templates_usage_idx").on(table.usageCount),
        ratingIdx: index("templates_rating_idx").on(table.avgRating),
        qualityIdx: index("templates_quality_idx").on(table.qualityScore),
        parentTemplateIdx: index("templates_parent_idx").on(table.parentTemplateId),
        baseTemplateIdx: index("templates_base_idx").on(table.baseTemplateId),
        reviewStatusIdx: index("templates_review_status_idx").on(table.reviewStatus),
        createdByIdx: index("templates_created_by_idx").on(table.createdBy),
        tagsIdx: index("templates_tags_gin_idx").using("gin", table.tags),
        targetSpecializationIdx: index("templates_specialization_gin_idx").using("gin", table.targetSpecialization),
        targetIndustriesIdx: index("templates_industries_gin_idx").using("gin", table.targetIndustries),
        targetJobTitlesIdx: index("templates_job_titles_gin_idx").using("gin", table.targetJobTitles),
    }),
);

// Relations remain the same with enhanced types
export const documentTemplatesRelations = relations(
    documentTemplates,
    ({ one, many }) => ({
        creator: one(user, {
            fields: [documentTemplates.createdBy],
            references: [user.id],
            relationName: "template_creator",
        }),
        updater: one(user, {
            fields: [documentTemplates.updatedBy],
            references: [user.id],
            relationName: "template_updater",
        }),
        reviewer: one(user, {
            fields: [documentTemplates.reviewedBy],
            references: [user.id],
            relationName: "template_reviewer",
        }),
        parentTemplate: one(documentTemplates, {
            fields: [documentTemplates.parentTemplateId],
            references: [documentTemplates.id],
            relationName: "template_inheritance",
        }),
        baseTemplate: one(documentTemplates, {
            fields: [documentTemplates.baseTemplateId],
            references: [documentTemplates.id],
            relationName: "template_base",
        }),
        childTemplates: many(documentTemplates, {
            relationName: "template_inheritance",
        }),
        variants: many(documentTemplates, {
            relationName: "template_base",
        }),
        versions: many(templateVersions),
        customizations: many(userTemplateCustomizations),
        usage: many(templateUsage),
        tagRelations: many(templateTagRelations),
        collectionItems: many(templateCollectionItems),
    }),
);

// Enhanced helper types
export type TemplateWithDetails = typeof documentTemplates.$inferSelect & {
    creator?: typeof user.$inferSelect;
    parentTemplate?: typeof documentTemplates.$inferSelect;
    baseTemplate?: typeof documentTemplates.$inferSelect;
    variants?: (typeof documentTemplates.$inferSelect)[];
    versions?: (typeof templateVersions.$inferSelect)[];
    tags?: (typeof templateTags.$inferSelect)[];
    collections?: (typeof templateCollections.$inferSelect)[];
    customizations?: (typeof userTemplateCustomizations.$inferSelect)[];
    usageStats?: {
        totalUsage: number;
        avgRating: string;
        recentUsage: number;
        conversionRate: string;
        completionRate: string;
        topCountries: string[];
        industryBreakdown: Record<DataIndustry, number>;
        specializationBreakdown: Record<DataSpecialization, number>;
    };
};

export type TemplateVariant = {
    id: string;
    name: string;
    description?: string;
    variantType: "color" | "layout" | "typography" | "style" | "complete";
    designOverrides?: any;
    previewImageUrl?: string;
    isDefault?: boolean;
    isPremium?: boolean;
    sortOrder?: number;
};

export type DesignConfig = typeof documentTemplates.$inferSelect['designConfig'];
export type TemplateStructure = typeof documentTemplates.$inferSelect['templateStructure'];
export type LayoutEngine = typeof documentTemplates.$inferSelect['layoutEngine'];
