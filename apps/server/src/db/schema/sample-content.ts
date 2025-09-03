// apps/server/src/db/schema/sample-content.ts

import { relations } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { experienceLevelEnum } from "@/db/schema/document-templates";
import type { DataIndustry, DataSpecialization } from "@/lib/data-ai";
import {user} from "@/db/schema/auth";

// Enhanced enums for content quality and type
export const contentQualityEnum = pgEnum("content_quality", [
    "basic",
    "good",
    "excellent",
    "premium"
]);

export const contentSourceEnum = pgEnum("content_source", [
    "ai_generated",
    "expert_written",
    "user_contributed",
    "curated"
]);

export const sampleContent = pgTable(
    "sample_content",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),

        // Content identification
        contentType: text("content_type").notNull(), // 'summary', 'experience', 'skill', etc.
        contentSubtype: text("content_subtype"), // More granular: 'opening_summary', 'technical_summary', 'achievement_bullet'
        content: jsonb("content").notNull(), // The actual sample data

        // Enhanced targeting with job-specific content
        targetIndustry: jsonb("target_industry").$type<DataIndustry[]>(),
        targetSpecialization: jsonb("target_specialization").$type<DataSpecialization[]>(),
        targetJobTitles: jsonb("target_job_titles").$type<string[]>(), // Specific job titles
        targetCompanyTypes: jsonb("target_company_types").$type<
            ("startup" | "enterprise" | "consulting" | "agency" | "non_profit" | "government")[]
        >(),
        experienceLevel: experienceLevelEnum("experience_level"),

        // Geographic and cultural targeting
        targetRegions: jsonb("target_regions").$type<
            ("north_america" | "europe" | "asia_pacific" | "latin_america" | "africa" | "middle_east")[]
        >(),
        culturalContext: text("cultural_context"), // "us_corporate", "eu_formal", "startup_casual"

        // Content metadata and quality
        title: text("title"), // Human-readable title for admin purposes
        description: text("description"), // What this content demonstrates
        contentQuality: contentQualityEnum("content_quality").default("good"),
        contentSource: contentSourceEnum("content_source").default("ai_generated"),

        // Content characteristics for AI matching
        contentCharacteristics: jsonb("content_characteristics").$type<{
            // Technical depth and complexity
            technicalDepth?: "basic" | "intermediate" | "advanced" | "expert";
            businessFocus?: "technical" | "business" | "balanced";
            quantificationLevel?: "low" | "medium" | "high"; // How metric-heavy the content is

            // Writing style
            tone?: "formal" | "professional" | "conversational" | "confident" | "humble";
            length?: "concise" | "standard" | "detailed";
            perspective?: "first_person" | "third_person" | "action_focused";

            // Content type specifics
            emphasizes?: ("achievements" | "skills" | "impact" | "leadership" | "innovation" | "collaboration")[];
            includesMetrics?: boolean;
            includesTechStack?: boolean;
            includesBusinessImpact?: boolean;

            // Industry-specific elements
            industryJargon?: "minimal" | "moderate" | "heavy";
            complianceAware?: boolean; // For regulated industries
            startupLanguage?: boolean; // For startup-focused content
        }>(),

        // Usage and effectiveness tracking
        usageCount: integer("usage_count").default(0),
        effectiveness: jsonb("effectiveness").$type<{
            userRating?: number; // 1-5 average rating
            ratingCount?: number;
            successRate?: number; // How often this leads to completed documents
            customizationRate?: number; // How often users modify this content
            exportRate?: number; // How often documents with this content get exported
        }>(),

        // Content variations and alternatives
        variations: jsonb("variations").$type<Array<{
            id: string;
            name: string;
            content: any; // Alternative version of the main content
            useCase: string; // When to use this variation
            characteristics?: any; // Different characteristics than main content
        }>>().default([]),

        // Relationships to other content
        relatedContentIds: jsonb("related_content_ids").$type<string[]>().default([]),

        // Content lifecycle and maintenance
        isActive: boolean("is_active").default(true),
        isApproved: boolean("is_approved").default(false),
        approvedBy: text("approved_by"), // User ID who approved this content
        approvedAt: timestamp("approved_at"),

        // Content freshness and relevance
        lastReviewedAt: timestamp("last_reviewed_at"),
        nextReviewDue: timestamp("next_review_due"),
        contentFreshness: integer("content_freshness").default(100), // 0-100, decreases over time

        // Advanced targeting based on job requirements
        requiredSkills: jsonb("required_skills").$type<string[]>().default([]),
        recommendedSkills: jsonb("recommended_skills").$type<string[]>().default([]),
        technicalComplexity: text("technical_complexity"), // "basic", "intermediate", "advanced"
        businessContexts: jsonb("business_contexts").$type<
            ("b2b" | "b2c" | "saas" | "fintech" | "healthtech" | "edtech" | "e_commerce" | "consulting")[]
        >(),

        // Usage metadata
        tags: jsonb("tags").$type<string[]>().default([]),
        keywords: jsonb("keywords").$type<string[]>().default([]), // For content matching

        // Timestamps
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
        createdBy: text("created_by"), // User ID who created this content
    },
    (table) => ({
        // Indexes for efficient querying
        contentTypeIdx: index("sample_content_content_type_idx").on(table.contentType),
        contentSubtypeIdx: index("sample_content_subtype_idx").on(table.contentSubtype),
        experienceLevelIdx: index("sample_content_experience_level_idx").on(table.experienceLevel),
        qualityIdx: index("sample_content_quality_idx").on(table.contentQuality),
        activeIdx: index("sample_content_active_idx").on(table.isActive),
        approvedIdx: index("sample_content_approved_idx").on(table.isApproved),
        usageIdx: index("sample_content_usage_idx").on(table.usageCount),
        freshnessIdx: index("sample_content_freshness_idx").on(table.contentFreshness),

        // GIN indexes for array/JSON fields
        tagsIdx: index("sample_content_tags_gin_idx").using("gin", table.tags),
        keywordsIdx: index("sample_content_keywords_gin_idx").using("gin", table.keywords),
        targetIndustryIdx: index("sample_content_target_industry_gin_idx").using("gin", table.targetIndustry),
        targetSpecializationIdx: index("sample_content_target_specialization_gin_idx").using("gin", table.targetSpecialization),
        targetJobTitlesIdx: index("sample_content_target_job_titles_gin_idx").using("gin", table.targetJobTitles),
        requiredSkillsIdx: index("sample_content_required_skills_gin_idx").using("gin", table.requiredSkills),
        businessContextsIdx: index("sample_content_business_contexts_gin_idx").using("gin", table.businessContexts),

        // Composite indexes for common queries
        typeActiveIdx: index("sample_content_type_active_idx").on(table.contentType, table.isActive),
        typeQualityIdx: index("sample_content_type_quality_idx").on(table.contentType, table.contentQuality),
        experienceQualityIdx: index("sample_content_exp_quality_idx").on(table.experienceLevel, table.contentQuality),
    }),
);

// Relations
export const sampleContentRelations = relations(sampleContent, ({ one }) => ({
    creator: one(user, {
        fields: [sampleContent.createdBy],
        references: [user.id],
        relationName: "content_creator",
    }),
    approver: one(user, {
        fields: [sampleContent.approvedBy],
        references: [user.id],
        relationName: "content_approver",
    }),
}));

// Enhanced helper types
export type SampleContentWithMetadata = typeof sampleContent.$inferSelect & {
    creator?: { id: string; name: string; };
    approver?: { id: string; name: string; };
    matchScore?: number; // Calculated match score for user's context
    relevanceReason?: string; // Why this content was selected
};

// Content structure types for different sections
export type PersonalInfoContent = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
    website?: string;
};

export type SummaryContent = {
    content: string;
    style: "narrative" | "bullet_points" | "hybrid";
    focusAreas: string[];
    keyMetrics?: string[];
};

export type ExperienceContent = {
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    isCurrentRole: boolean;
    achievements: Array<{
        description: string;
        impact?: string;
        metrics?: string[];
        technologiesUsed?: string[];
    }>;
    primaryTechnologies: string[];
    projectTypes?: string[];
    teamSize?: string;
    budgetManaged?: string;
};

export type ProjectContent = {
    name: string;
    description: string;
    type: string;
    technologiesUsed: string[];
    businessProblem: string;
    solution: string;
    dataVolume?: string;
    teamSize?: number;
    duration?: string;
    keyMetrics?: string[];
    githubUrl?: string;
    liveUrl?: string;
    outcomes?: string[];
};

export type SkillContent = {
    name: string;
    category: string;
    proficiency: "beginner" | "intermediate" | "advanced" | "expert";
    yearsOfExperience?: number;
    lastUsed?: string;
    certifications?: string[];
    projects?: string[]; // Project names where this skill was used
};

export type EducationContent = {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    honors?: string;
    relevantCoursework?: string[];
    thesis?: {
        title: string;
        advisor?: string;
        abstract?: string;
    };
};

export type CertificationContent = {
    name: string;
    issuer: string;
    issueDate?: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    skillsValidated?: string[];
    level?: "associate" | "professional" | "expert" | "master";
};

export type CoverLetterContent = {
    opening: {
        content: string;
        hookType: "personal_connection" | "company_news" | "shared_values" | "impressive_metric" | "industry_insight";
        companyReference?: string;
        roleReference?: string;
    };
    bodyParagraphs: Array<{
        type: "experience" | "skills" | "achievements" | "cultural_fit" | "passion" | "problem_solving";
        content: string;
        supportingEvidence?: string[];
        metricsIncluded?: boolean;
    }>;
    closing: {
        content: string;
        callToAction: string;
        availability?: string;
        nextSteps?: string;
    };
};
