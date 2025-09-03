// apps/server/src/db/schema/cover-letters.ts

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
import type { DataIndustry, DataSpecialization } from "@/lib/data-ai";
import {resumes} from "@/db/schema/resumes";

// Enhanced Cover Letter schema with design variations and targeting
export const coverLetters = pgTable("cover_letters", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),

    title: text("title").notNull(),

    // Enhanced template connection with variant support
    templateId: text("template_id").references(() => documentTemplates.id),
    templateVariantId: text("template_variant_id"), // Selected template variant
    isFromTemplate: boolean("is_from_template").default(false),

    // Design configuration specific to cover letters
    designConfig: jsonb("design_config").$type<{
        // Layout style for cover letters
        layoutStyle?: "traditional" | "modern" | "split_layout" | "header_match" | "creative";

        // Header coordination with resume
        matchResumeHeader?: boolean; // Mirror header design from associated resume
        headerStyle?: "minimal" | "standard" | "prominent" | "branded";

        // Color and typography
        colors?: any;
        typography?: any;
        spacing?: any;
        borders?: any;

        // Cover letter specific styling
        letterhead?: {
            includeLogo?: boolean;
            includeAddress?: boolean;
            dateFormat?: "full" | "short" | "hidden";
            recipientFormat?: "formal" | "modern";
        };

        // Content styling
        paragraphSpacing?: number;
        signatureSpace?: number;
        formalFormatting?: boolean;
    }>(),

    // Enhanced job context - critical for cover letters
    targetCompany: text("target_company").notNull(),
    targetRole: text("target_role").notNull(),
    targetJobTitle: text("target_job_title"), // More specific job title
    targetSpecialization: text("target_specialization").$type<DataSpecialization>(),
    targetIndustry: text("target_industry").$type<DataIndustry>(),
    targetCompanyType: text("target_company_type").$type<
        "startup" | "enterprise" | "consulting" | "agency" | "non_profit" | "government"
    >(),

    // Enhanced job context for AI personalization
    jobContext: jsonb("job_context").$type<{
        jobDescription?: string;
        requiredSkills?: string[];
        preferredSkills?: string[];
        companyValues?: string[];
        companyNews?: string[]; // Recent company news for personalization
        hiringManagerName?: string;
        referralSource?: string; // How they found the job
        applicationDeadline?: string;

        // Research about the company/role
        companyResearch?: {
            recentNews?: string[];
            values?: string[];
            culture?: string[];
            challenges?: string[];
        };
    }>(),

    // Content source tracking
    contentSources: jsonb("content_sources").$type<Record<string, "specific" | "generic" | "default" | "user_created">>(),

    // Enhanced personal info with professional context
    personalInfo: jsonb("personal_info").$type<{
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
        };
        linkedIn?: string;
        portfolio?: string;

        // Professional context
        currentTitle?: string;
        currentCompany?: string;
        professionalSummary?: string;
    }>(),

    // Enhanced letter structure

    // Date and addressing
    letterDate: text("letter_date"), // Date of the letter
    recipientInfo: jsonb("recipient_info").$type<{
        hiringManagerName?: string;
        hiringManagerTitle?: string;
        companyName: string;
        companyAddress?: {
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
        };
        department?: string;
    }>(),

    // Salutation with options
    salutation: text("salutation").default("Dear Hiring Manager"),
    salutationStyle: text("salutation_style").$type<"formal" | "personal" | "modern">().default("formal"),

    // Enhanced opening paragraph
    opening: jsonb("opening").$type<{
        content: string;
        hookType: "personal_connection" | "company_news" | "shared_values" | "impressive_metric" | "industry_insight" | "referral" | "passion_driven";

        // Context for hook
        hookContext?: {
            connectionName?: string; // For personal connections
            newsSource?: string; // For company news hooks
            metricDetails?: {
                metric: string;
                value: string;
                context: string;
            };
            sharedValueDetails?: string;
        };

        // Opening style
        style?: "direct" | "storytelling" | "question" | "statement";
        tone?: "confident" | "enthusiastic" | "professional" | "conversational";
    }>(),

    // Enhanced body paragraphs with strategic organization
    bodyParagraphs: jsonb("body_paragraphs")
        .$type<
            Array<{
                id: string;
                type: "experience" | "skills" | "achievements" | "cultural_fit" | "passion" | "problem_solving" | "innovation" | "leadership";
                content: string;

                // Supporting evidence and context
                supportingEvidence?: Array<{
                    type: "metric" | "achievement" | "skill" | "project" | "reference";
                    description: string;
                    quantifiableResult?: string;
                }>;

                // Connection to job requirements
                addressesRequirement?: string; // Which job requirement this paragraph addresses
                relevanceScore?: number; // 0-100 how relevant this is to the job

                // Content characteristics
                tone?: "confident" | "humble" | "enthusiastic" | "analytical";
                focus?: "technical" | "business" | "personal" | "team";
                includesMetrics?: boolean;
                includesTechStack?: boolean;

                // Organization
                priority: number;
                isCore?: boolean; // Must-include vs optional paragraph
            }>
        >()
        .default([]),

    // Enhanced closing with strategic call-to-action
    closing: jsonb("closing").$type<{
        content: string;
        callToAction: string;

        // Enhanced closing elements
        availability?: {
            immediateStart?: boolean;
            noticePeriod?: string;
            relocatingWillingness?: boolean;
            travelWillingness?: boolean;
        };

        nextSteps?: string;
        followUpTimeline?: string;

        // Closing style and tone
        style?: "formal" | "confident" | "grateful" | "forward_looking";
        urgencyLevel?: "none" | "subtle" | "moderate" | "high";

        // Professional touch
        signature?: {
            includeTitle?: boolean;
            includeCompany?: boolean;
            includeLinkedIn?: boolean;
        };
    }>(),

    // Enhanced project highlights for data roles
    projectHighlights: jsonb("project_highlights")
        .$type<
            Array<{
                id: string;
                projectName: string;
                description: string;
                relevanceToRole: string;

                // Technical context
                technologiesUsed: string[];
                dataVolume?: string;
                complexity?: "low" | "medium" | "high";

                // Business context
                businessProblem: string;
                solution: string;
                impact: string;
                stakeholders?: string[];

                // Results
                quantifiableResults?: Array<{
                    metric: string;
                    value: string;
                    timeframe?: string;
                }>;

                // Evidence
                portfolioUrl?: string;
                githubUrl?: string;
                demoUrl?: string;

                priority: number;
                emphasizeInLetter?: boolean; // Whether to highlight this project prominently
            }>
        >()
        .default([]),

    // AI assistance tracking
    aiAssistanceUsed: jsonb("ai_assistance_used").$type<{
        contentGeneration?: boolean;
        jobAnalysis?: boolean;
        companyResearch?: boolean;
        optimization?: boolean;

        assistanceLevel?: "minimal" | "moderate" | "extensive";
        sectionsGenerated?: string[];
        lastAiSuggestion?: string;
    }>(),

    // Performance analytics
    performance: jsonb("performance").$type<{
        readTime?: number; // Estimated reading time
        readabilityScore?: number; // Flesch-Kincaid or similar
        keywordDensity?: Record<string, number>;
        sentimentScore?: number; // Positive sentiment analysis

        // Engagement metrics (if tracked)
        emailOpenRate?: number;
        responseRate?: number;
        interviewConversionRate?: number;
    }>(),

    // Enhanced settings for cover letters
    settings: jsonb("settings")
        .$type<{
            // Format preferences
            layoutStyle: "traditional" | "modern" | "split_layout" | "branded";
            headerStyle: "minimal" | "standard" | "prominent" | "match_resume";

            // Content preferences
            includeSalutation: boolean;
            includeDate: boolean;
            includeRecipientAddress: boolean;
            includeSubjectLine: boolean;

            // Length and tone preferences
            preferredLength: "concise" | "standard" | "detailed";
            tonePreference: "formal" | "professional" | "conversational" | "enthusiastic";

            // Industry-specific settings
            emphasizeCompliance?: boolean; // For regulated industries
            includePortfolioLinks?: boolean;
            emphasizeRemoteCapability?: boolean;
            highlightDiversityCommitment?: boolean;

            // Export and sharing
            preferredFormat: "pdf" | "docx" | "txt" | "json";
            includeCoverPage?: boolean;
            watermarkEnabled?: boolean;
        }>()
        .default({
            layoutStyle: "traditional",
            headerStyle: "standard",
            includeSalutation: true,
            includeDate: true,
            includeRecipientAddress: true,
            includeSubjectLine: false,
            preferredLength: "standard",
            tonePreference: "professional",
            includePortfolioLinks: true,
            emphasizeRemoteCapability: false,
            highlightDiversityCommitment: false,
            preferredFormat: "pdf",
            includeCoverPage: false,
            watermarkEnabled: false,
        }),

    // Integration with resume
    linkedResumeId: text("linked_resume_id"), // Reference to associated resume
    resumeIntegration: jsonb("resume_integration").$type<{
        syncPersonalInfo?: boolean; // Auto-sync personal info from resume
        syncDesignTheme?: boolean; // Match design theme with resume
        highlightedProjects?: string[]; // Project IDs from resume to highlight
        skillsToEmphasize?: string[]; // Skills from resume to emphasize
    }>(),

    // Personalization and research
    personalization: jsonb("personalization").$type<{
        // Company research results
        companyInsights?: {
            recentNews?: string[];
            values?: string[];
            culture?: string[];
            recentHires?: string[];
            technologies?: string[];
        };

        // Role-specific customization
        roleInsights?: {
            keyResponsibilities?: string[];
            requiredSkills?: string[];
            successMetrics?: string[];
            teamStructure?: string;
        };

        // Personal connection opportunities
        connections?: Array<{
            name: string;
            relationship: string;
            relevance: string;
        }>;

        // Customization level
        personalizationLevel?: "generic" | "basic" | "moderate" | "highly_personalized";
    }>(),

    // Document lifecycle
    isPublic: boolean("is_public").default(false),
    shareToken: text("share_token"),

    // Version and change tracking
    version: integer("version").default(1),
    lastExportedAt: timestamp("last_exported_at"),
    exportCount: integer("export_count").default(0),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const coverLettersRelations = relations(
    coverLetters,
    ({ one, many }) => ({
        user: one(user, {
            fields: [coverLetters.userId],
            references: [user.id],
        }),
        template: one(documentTemplates, {
            fields: [coverLetters.templateId],
            references: [documentTemplates.id],
        }),
        linkedResume: one(resumes, {
            fields: [coverLetters.linkedResumeId],
            references: [resumes.id],
            relationName: "cover_letter_resume_link",
        }),
        aiInteractions: many(aiInteractions),
    }),
);
