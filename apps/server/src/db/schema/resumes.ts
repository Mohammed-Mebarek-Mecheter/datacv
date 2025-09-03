// apps/server/src/db/schema/resumes.ts

import { relations } from "drizzle-orm";
import {
    boolean,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";
import { documentTemplates } from "@/db/schema/document-templates";
import { aiInteractions } from "@/db/schema/ai-interactions";
import type {
    DataIndustry,
    DataProjectType,
    DataSkillCategory,
    DataSpecialization,
    ExperienceLevel,
} from "@/lib/data-ai";

// Enhanced Resume schema with design and variant support
export const resumes = pgTable("resumes", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),

    // Basic metadata
    title: text("title").notNull(),
    isDefault: boolean("is_default").default(false),

    // Enhanced template connection with variant support
    templateId: text("template_id").references(() => documentTemplates.id),
    templateVariantId: text("template_variant_id"), // Selected template variant
    isFromTemplate: boolean("is_from_template").default(false),

    // Design configuration (can override template defaults)
    designConfig: jsonb("design_config").$type<{
        colors?: any;
        typography?: any;
        layout?: any;
        spacing?: any;
        borders?: any;
        effects?: any;
        icons?: any;
        contentStyles?: any;
    }>(),

    // Target context for AI and content selection
    targetRole: text("target_role"),
    targetJobTitle: text("target_job_title"), // More specific than targetRole
    targetSpecialization: text("target_specialization").$type<DataSpecialization>(),
    targetIndustry: text("target_industry").$type<DataIndustry>(),
    targetCompanyType: text("target_company_type").$type<
        "startup" | "enterprise" | "consulting" | "agency" | "non_profit" | "government"
    >(),
    experienceLevel: text("experience_level").$type<ExperienceLevel>(),

    // Content source tracking for analytics
    contentSources: jsonb("content_sources").$type<Record<string, "specific" | "generic" | "default" | "user_created">>(),

    // Personal information with enhanced fields
    personalInfo: jsonb("personal_info").$type<{
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        location?: string;
        linkedIn?: string;
        github?: string;
        portfolio?: string;
        website?: string;

        // Enhanced contact options
        twitter?: string;
        stackoverflow?: string;
        medium?: string;
        kaggle?: string;

        // Professional branding
        tagline?: string; // Professional tagline/subtitle
        professionalPhoto?: string; // URL to professional headshot
    }>(),

    // Professional summary with enhanced formatting
    professionalSummary: text("professional_summary"),
    summaryStyle: text("summary_style").$type<"paragraph" | "bullet_points" | "hybrid" | "metrics_focused">().default("paragraph"),

    // Enhanced work experience
    workExperience: jsonb("work_experience")
        .$type<
            Array<{
                id: string;
                company: string;
                position: string;
                location?: string;
                startDate: string;
                endDate?: string;
                isCurrentRole: boolean;

                // Enhanced achievement tracking
                achievements: Array<{
                    id: string;
                    description: string;
                    impact?: string;
                    metrics?: string[];
                    technologiesUsed?: string[];
                    businessValue?: string;
                    quantifiableResults?: {
                        metric: string;
                        value: string;
                        timeframe?: string;
                    }[];
                }>;

                // Technical and project context
                primaryTechnologies: string[];
                projectTypes?: DataProjectType[];
                teamSize?: string;
                budgetManaged?: string;
                dataVolume?: string;

                // Industry-specific fields
                clientTypes?: string[]; // For consulting roles
                regulatoryContext?: string[]; // For compliance-heavy industries

                // Display preferences
                emphasizeMetrics?: boolean;
                showTechnologies?: boolean;
                isVisible: boolean;
                priority: number;
            }>
        >()
        .default([]),

    // Enhanced education with research and project details
    education: jsonb("education")
        .$type<
            Array<{
                id: string;
                institution: string;
                degree: string;
                fieldOfStudy?: string;
                startDate?: string;
                endDate?: string;
                gpa?: string;

                // Enhanced academic details
                honors?: string[];
                relevantCoursework?: string[];
                thesis?: {
                    title: string;
                    advisor?: string;
                    abstract?: string;
                    keywords?: string[];
                };
                academicProjects?: Array<{
                    name: string;
                    description: string;
                    technologies?: string[];
                }>;

                isVisible: boolean;
                priority: number;
            }>
        >()
        .default([]),

    // Enhanced skills with proficiency tracking and categories
    skills: jsonb("skills")
        .$type<
            Array<{
                id: string;
                name: string;
                category: DataSkillCategory;
                proficiency: "beginner" | "intermediate" | "advanced" | "expert";
                yearsOfExperience?: number;
                lastUsed?: string;

                // Enhanced skill metadata
                certifications?: string[]; // Related certifications
                projects?: string[]; // Projects where this skill was used
                endorsements?: number; // LinkedIn-style endorsements

                // Context and validation
                learnedAt?: string; // Where/how the skill was acquired
                appliedIn?: string[]; // Contexts where skill was applied

                // Display preferences
                showProficiency?: boolean;
                showYearsExperience?: boolean;
                isVisible: boolean;
                priority: number;
            }>
        >()
        .default([]),

    // Enhanced projects with comprehensive metadata
    projects: jsonb("projects")
        .$type<
            Array<{
                id: string;
                name: string;
                description: string;
                type: DataProjectType;

                // Technical details
                technologiesUsed: string[];
                architectureUsed?: string; // "microservices", "monolithic", "serverless"
                dataSize?: string; // "10GB", "1TB", "streaming"

                // Business context
                businessProblem: string;
                solution: string;
                stakeholders?: string[];
                duration?: string;
                teamSize?: number;

                // Results and impact
                outcomes?: Array<{
                    metric: string;
                    value: string;
                    description?: string;
                }>;
                businessImpact?: string;
                lessonsLearned?: string[];

                // Links and documentation
                githubUrl?: string;
                liveUrl?: string;
                documentationUrl?: string;
                presentationUrl?: string;

                // Academic context (for research projects)
                publications?: Array<{
                    title: string;
                    venue: string;
                    year: string;
                }>;

                // Display preferences
                emphasizeBusinessImpact?: boolean;
                showTechnicalDetails?: boolean;
                isVisible: boolean;
                priority: number;
            }>
        >()
        .default([]),

    // Enhanced certifications with validation and skills mapping
    certifications: jsonb("certifications")
        .$type<
            Array<{
                id: string;
                name: string;
                issuer: string;
                issueDate?: string;
                expiryDate?: string;
                credentialId?: string;
                credentialUrl?: string;

                // Enhanced certification details
                skillsValidated?: string[];
                level?: "associate" | "professional" | "expert" | "master";
                prerequisites?: string[];
                continuingEducation?: boolean;

                // Verification and credibility
                isVerified?: boolean;
                verificationMethod?: string;
                industryRecognition?: "high" | "medium" | "low";

                isVisible: boolean;
                priority: number;
            }>
        >()
        .default([]),

    // New: Achievements section for highlighting key accomplishments
    achievements: jsonb("achievements")
        .$type<
            Array<{
                id: string;
                title: string;
                description: string;
                category: "award" | "recognition" | "milestone" | "innovation" | "leadership" | "impact";

                // Context
                organization?: string;
                date?: string;
                scope?: "individual" | "team" | "department" | "company" | "industry";

                // Quantifiable details
                metrics?: Array<{
                    metric: string;
                    value: string;
                    context?: string;
                }>;

                // Supporting evidence
                evidenceUrl?: string;
                mediaUrl?: string;

                isVisible: boolean;
                priority: number;
            }>
        >()
        .default([]),

    // New: Publications section for research-oriented roles
    publications: jsonb("publications")
        .$type<
            Array<{
                id: string;
                title: string;
                authors: string[];
                venue: string;
                year: string;
                type: "journal" | "conference" | "preprint" | "blog" | "book" | "other";

                // Academic metadata
                citations?: number;
                hIndex?: number;
                doi?: string;
                url?: string;
                abstract?: string;
                keywords?: string[];

                // Industry relevance
                industryRelevance?: string;
                businessApplications?: string[];

                isVisible: boolean;
                priority: number;
            }>
        >()
        .default([]),

    // Enhanced AI insights with detailed feedback
    aiInsights: jsonb("ai_insights").$type<{
        completenessScore?: number; // 0-100
        strengthAreas?: string[];
        improvementSuggestions?: Array<{
            section: string;
            suggestion: string;
            priority: "high" | "medium" | "low";
            estimatedImpact: string;
        }>;
        lastAnalyzed?: string;

        // Advanced insights
        industryAlignment?: number; // 0-100
        roleAlignment?: number; // 0-100
        atsOptimization?: number; // 0-100
        keywordDensity?: Record<string, number>;
        technicalDepthScore?: number; // 0-100
        businessImpactScore?: number; // 0-100
        quantificationScore?: number; // 0-100

        // Competitive analysis
        marketPosition?: "below_average" | "average" | "above_average" | "exceptional";
        benchmarkComparison?: {
            industry: string;
            role: string;
            percentile: number;
        };
    }>(),

    // Enhanced settings with layout and export preferences
    settings: jsonb("settings")
        .$type<{
            // Content preferences
            includePortfolio: boolean;
            emphasizeQuantitativeResults: boolean;
            showTechnicalSkills: boolean;
            showSoftSkills: boolean;
            includeSideProjects: boolean;

            // Design preferences
            colorScheme: string;
            fontFamily: string;
            layoutStyle: string;
            headerStyle: string;

            // Export settings
            preferredFormat: "pdf" | "docx" | "txt" | "json";
            pageFormat: "a4" | "us_letter";
            orientation: "portrait" | "landscape";

            // Privacy settings
            showPersonalPhoto: boolean;
            showFullAddress: boolean;
            anonymizeCompanyNames: boolean;

            // Industry-specific settings
            emphasizeCompliance?: boolean; // For regulated industries
            showPublications?: boolean; // For academic/research roles
            includePortfolioGallery?: boolean; // For creative/technical roles
        }>()
        .default({
            includePortfolio: true,
            emphasizeQuantitativeResults: true,
            showTechnicalSkills: true,
            showSoftSkills: true,
            includeSideProjects: true,
            colorScheme: "professional",
            fontFamily: "Inter",
            layoutStyle: "single_column",
            headerStyle: "standard",
            preferredFormat: "pdf",
            pageFormat: "a4",
            orientation: "portrait",
            showPersonalPhoto: false,
            showFullAddress: false,
            anonymizeCompanyNames: false,
        }),

    // Document lifecycle and collaboration
    isPublic: boolean("is_public").default(false), // For portfolio sharing
    shareToken: text("share_token"), // For secure sharing
    collaborators: jsonb("collaborators").$type<
        Array<{
            userId: string;
            permissions: ("view" | "edit" | "comment")[];
            addedAt: string;
        }>
    >().default([]),

    // Version and change tracking
    version: integer("version").default(1),
    lastExportedAt: timestamp("last_exported_at"),
    exportCount: integer("export_count").default(0),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const resumesRelations = relations(resumes, ({ one, many }) => ({
    user: one(user, {
        fields: [resumes.userId],
        references: [user.id],
    }),
    template: one(documentTemplates, {
        fields: [resumes.templateId],
        references: [documentTemplates.id],
    }),
    aiInteractions: many(aiInteractions),
}));
