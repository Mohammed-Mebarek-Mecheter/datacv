// apps/server/src/db/schema/cvs.ts

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
import type { DataSkillCategory, DataSpecialization } from "@/lib/data-ai";

// Enhanced CV schema for academic and research professionals
export const cvs = pgTable("cvs", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),

    // Basic metadata
    title: text("title").notNull(),
    isDefault: boolean("is_default").default(false),

    // Template and design configuration
    templateId: text("template_id").references(() => documentTemplates.id),
    templateVariantId: text("template_variant_id"),
    isFromTemplate: boolean("is_from_template").default(false),

    designConfig: jsonb("design_config").$type<{
        colors?: any;
        typography?: any;
        layout?: any;
        spacing?: any;
        borders?: any;
        effects?: any;
        icons?: any;
        contentStyles?: any;

        // CV-specific styling
        academicStyle?: boolean;
        publicationStyle?: "apa" | "mla" | "chicago" | "ieee" | "nature" | "custom";
        pageNumbering?: boolean;
        sectionNumbering?: boolean;
    }>(),

    // Academic targeting and context
    targetPosition: text("target_position"),
    targetSpecialization: text("target_specialization").$type<DataSpecialization>(),
    targetInstitutionType: text("target_institution_type").$type<
        "university" | "research_institute" | "industry_lab" | "government" | "startup" | "non_profit"
    >(),
    researchArea: text("research_area"),
    researchKeywords: jsonb("research_keywords").$type<string[]>().default([]),

    // Content source tracking
    contentSources: jsonb("content_sources").$type<Record<string, "specific" | "generic" | "default" | "user_created">>(),

    // Personal information with academic context
    personalInfo: jsonb("personal_info").$type<{
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;

        // Academic addressing
        institutionAddress?: {
            institution: string;
            department?: string;
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
        };

        homeAddress?: {
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
        };

        // Academic profiles and identifiers
        linkedIn?: string;
        googleScholar?: string;
        orcid?: string;
        researchGate?: string;
        academiaEdu?: string;
        personalWebsite?: string;
        professionalTitle?: string;
        credentials?: string[];
        citizenship?: string;
        workAuthorization?: string;
    }>(),

    // Research statement
    researchStatement: text("research_statement"),
    researchStatementStyle: text("research_statement_style").$type<
        "narrative" | "structured" | "problem_focused" | "methodology_focused"
    >().default("narrative"),

    // Teaching philosophy and experience
    teachingPhilosophy: text("teaching_philosophy"),
    teachingExperience: jsonb("teaching_experience").$type<
        Array<{
            id: string;
            institution: string;
            courseTitle: string;
            courseNumber?: string;
            level: "undergraduate" | "graduate" | "professional" | "workshop";
            role: "instructor" | "teaching_assistant" | "guest_lecturer" | "course_designer";
            semester: string;
            year: string;

            enrollment?: number;
            courseDescription?: string;
            syllabusUrl?: string;
            evaluationMethods?: string[];

            studentEvaluations?: {
                averageRating?: number;
                totalResponses?: number;
                highlights?: string[];
            };

            teachingInnovations?: string[];
            technologyUsed?: string[];

            isVisible: boolean;
            priority: number;
        }>
    >().default([]),

    // Enhanced education section
    education: jsonb("education").$type<
        Array<{
            id: string;
            institution: string;
            degree: string;
            fieldOfStudy: string;
            startDate: string;
            endDate?: string;
            gpa?: string;
            honors?: string[];
            departmentRanking?: string;

            // Dissertation/thesis details
            thesis?: {
                title: string;
                advisor: string;
                committee?: string[];
                abstract?: string;
                keywords?: string[];
                defenseDate?: string;
                pages?: number;
                relatedPublications?: string[];
            };

            // Academic coursework and achievements
            relevantCoursework?: Array<{
                course: string;
                instructor?: string;
                grade?: string;
                credits?: number;
            }>;

            researchProjects?: Array<{
                title: string;
                advisor: string;
                description: string;
                duration: string;
            }>;

            fellowships?: Array<{
                name: string;
                amount?: string;
                duration?: string;
            }>;

            academicHonors?: string[];
            isVisible: boolean;
            priority: number;
        }>
    >().default([]),

    // Academic positions and appointments
    academicPositions: jsonb("academic_positions").$type<
        Array<{
            id: string;
            institution: string;
            position: string;
            type: "faculty" | "postdoc" | "research" | "visiting" | "adjunct" | "lecturer" | "clinical";
            startDate: string;
            endDate?: string;

            department?: string;
            division?: string;
            rank?: "assistant" | "associate" | "full" | "distinguished" | "emeritus";
            tenure?: "tenure_track" | "tenured" | "non_tenure" | "clinical_track";

            description: string;
            achievements: string[];
            teachingLoad?: string;
            researchFocus?: string[];

            administrativeRoles?: Array<{
                title: string;
                startDate: string;
                endDate?: string;
                responsibilities: string[];
            }>;

            collaborations?: Array<{
                type: "internal" | "external" | "international";
                partners: string[];
                description: string;
            }>;

            mentoringRecord?: {
                graduateStudents?: number;
                undergraduateStudents?: number;
                postdocs?: number;
                visitingScholars?: number;
            };

            isVisible: boolean;
            priority: number;
        }>
    >().default([]),

    // Publications with comprehensive metadata
    publications: jsonb("publications").$type<
        Array<{
            id: string;
            title: string;
            authors: string[];
            venue: string;
            year: string;
            type: "journal" | "conference" | "preprint" | "book" | "chapter" | "report" | "patent" | "other";

            // Publication metrics and identifiers
            citations?: number;
            hIndex?: number;
            impactFactor?: number;
            doi?: string;
            isbn?: string;
            url?: string;

            // Content details
            abstract?: string;
            keywords?: string[];
            pages?: string;
            volume?: string;
            issue?: string;

            // Academic context
            peerReviewed?: boolean;
            openAccess?: boolean;
            invited?: boolean;
            authorPosition?: "first" | "last" | "corresponding" | "middle";
            contributionPercentage?: number;
            collaborationType?: "internal" | "external" | "international";

            // Associated funding and grants
            fundingSource?: string[];
            grantNumbers?: string[];

            // Impact and media attention
            mediaAttention?: Array<{
                outlet: string;
                date: string;
                url?: string;
            }>;
            industryApplications?: string[];

            isVisible: boolean;
            priority: number;
            featured?: boolean;
        }>
    >().default([]),

    // Research projects and initiatives
    researchProjects: jsonb("research_projects").$type<
        Array<{
            id: string;
            title: string;
            description: string;
            status: "completed" | "ongoing" | "planned" | "paused" | "cancelled";
            startDate: string;
            endDate?: string;

            // Project organization
            institution?: string;
            collaboratingInstitutions?: string[];
            principalInvestigator?: string;
            role: "PI" | "Co-PI" | "Senior Personnel" | "Postdoc" | "Graduate Student" | "Research Scientist";

            // Funding information
            fundingSource?: Array<{
                agency: string;
                grantNumber?: string;
                amount?: string;
                duration?: string;
                role?: "PI" | "Co-PI" | "Senior Personnel";
            }>;
            totalFunding?: string;

            // Technical methodology
            technologiesUsed: string[];
            methodologies?: string[];
            dataTypes?: string[];

            // Outputs and deliverables
            publications?: string[];
            presentations?: Array<{
                title: string;
                venue: string;
                date: string;
                type: "conference" | "seminar" | "workshop" | "keynote";
            }>;

            patents?: Array<{
                title: string;
                number?: string;
                status: "filed" | "pending" | "granted";
                date: string;
            }>;

            softwareDeveloped?: Array<{
                name: string;
                description: string;
                url?: string;
                license?: string;
                users?: string;
            }>;

            // Team and mentoring
            teamSize?: number;
            studentsSupervised?: Array<{
                name: string;
                level: "undergraduate" | "masters" | "phd" | "postdoc";
                project: string;
                outcome?: string;
            }>;

            // Impact assessment
            citationsGenerated?: number;
            mediaAttention?: string[];
            industryAdoption?: string[];
            policyInfluence?: string[];

            isVisible: boolean;
            priority: number;
        }>
    >().default([]),

    // Technical skills and expertise
    technicalSkills: jsonb("technical_skills").$type<
        Array<{
            id: string;
            name: string;
            category: DataSkillCategory;
            proficiency: "beginner" | "intermediate" | "advanced" | "expert";
            yearsOfExperience?: number;

            // Academic context
            learnedAt?: string;
            appliedInResearch?: string[];
            publicationsUsing?: string[];

            // Validation and teaching
            certifications?: Array<{
                name: string;
                issuer: string;
                date: string;
                url?: string;
            }>;

            taughtAs?: Array<{
                course: string;
                institution: string;
                year: string;
            }>;

            // Research applications
            researchApplications?: string[];
            methodologyExpertise?: string[];

            isVisible: boolean;
            priority: number;
        }>
    >().default([]),

    // Grants and funding
    grants: jsonb("grants").$type<
        Array<{
            id: string;
            title: string;
            agency: string;
            grantNumber?: string;
            amount: string;
            currency?: string;
            startDate: string;
            endDate?: string;

            role: "PI" | "Co-PI" | "Senior Personnel" | "Collaborator";
            collaborators?: Array<{
                name: string;
                institution: string;
                role: string;
            }>;

            status: "submitted" | "pending" | "awarded" | "rejected" | "completed";
            abstract?: string;
            objectives?: string[];

            // Grant outcomes
            publications?: string[];
            presentations?: string[];
            studentsSupported?: Array<{
                name: string;
                level: string;
                supportType: "RA" | "TA" | "Fellowship";
            }>;

            impactStatement?: string;
            followUpGrants?: string[];

            isVisible: boolean;
            priority: number;
        }>
    >().default([]),

    // Professional service and activities
    professionalService: jsonb("professional_service").$type<
        Array<{
            id: string;
            organization: string;
            role: string;
            type: "editorial" | "review" | "committee" | "organization" | "conference" | "panel";
            startDate: string;
            endDate?: string;

            description?: string;
            responsibilities?: string[];
            timeCommitment?: string;

            // Service-specific details
            journalName?: string;
            editorialRole?: "editor" | "associate_editor" | "guest_editor" | "reviewer";
            manuscriptsReviewed?: number;
            conferenceName?: string;
            conferenceRole?: "chair" | "co_chair" | "committee_member" | "reviewer" | "session_chair";

            serviceAwards?: string[];
            isVisible: boolean;
            priority: number;
        }>
    >().default([]),

    // Awards and honors
    awards: jsonb("awards").$type<
        Array<{
            id: string;
            name: string;
            issuer: string;
            date: string;
            category: "research" | "teaching" | "service" | "professional" | "student" | "fellowship";
            level: "institutional" | "national" | "international";

            competitiveness?: string;
            monetaryValue?: string;
            description?: string;
            criteria?: string;
            recognitionFor?: string;

            relatedPublications?: string[];
            relatedProjects?: string[];

            mediaAttention?: Array<{
                outlet: string;
                date: string;
                url?: string;
            }>;

            isVisible: boolean;
            priority: number;
            featured?: boolean;
        }>
    >().default([]),

    // Presentations and speaking engagements
    presentations: jsonb("presentations").$type<
        Array<{
            id: string;
            title: string;
            venue: string;
            location: string;
            date: string;
            type: "invited_talk" | "conference_presentation" | "seminar" | "workshop" | "keynote" | "panel" | "poster";

            audience: "academic" | "industry" | "public" | "student" | "mixed";
            audienceSize?: string;

            abstract?: string;
            slidesUrl?: string;
            videoUrl?: string;
            coAuthors?: string[];

            awards?: string[];
            mediaAttention?: string[];
            relatedPublications?: string[];
            relatedProjects?: string[];

            isVisible: boolean;
            priority: number;
        }>
    >().default([]),

    // Professional memberships
    memberships: jsonb("memberships").$type<
        Array<{
            id: string;
            organization: string;
            membershipType: "professional" | "honorary" | "student" | "emeritus";
            startDate: string;
            endDate?: string;

            membershipNumber?: string;
            level?: "associate" | "member" | "fellow" | "distinguished";
            status: "active" | "inactive" | "lapsed";

            roles?: Array<{
                title: string;
                startDate: string;
                endDate?: string;
                responsibilities: string[];
            }>;

            credentialsGranted?: string[];
            accessToResources?: string[];

            isVisible: boolean;
            priority: number;
        }>
    >().default([]),

    // AI insights for academic optimization
    aiInsights: jsonb("ai_insights").$type<{
        completenessScore?: number;
        academicImpactScore?: number;
        researchProductivityScore?: number;
        collaborationScore?: number;
        teachingEffectivenessScore?: number;

        strengthAreas?: string[];
        improvementSuggestions?: Array<{
            area: string;
            suggestion: string;
            priority: "high" | "medium" | "low";
            academicRelevance: string;
        }>;

        lastAnalyzed?: string;
        publicationGaps?: string[];
        fundingOpportunities?: string[];
        collaborationSuggestions?: string[];
        careerStageAssessment?: "early_career" | "mid_career" | "senior" | "distinguished";

        peerComparison?: {
            field: string;
            careerStage: string;
            publicationPercentile?: number;
            citationPercentile?: number;
            fundingPercentile?: number;
        };
    }>(),

    // Academic-specific settings
    settings: jsonb("settings").$type<{
        // Content inclusion
        includePersonalPhoto: boolean;
        includeResearchStatement: boolean;
        includeTeachingPhilosophy: boolean;
        includeDiversityStatement: boolean;
        includeReferences: boolean;

        // Academic formatting
        citationStyle: "apa" | "mla" | "chicago" | "ieee" | "nature" | "custom";
        showPageNumbers: boolean;
        showSectionNumbers: boolean;
        useAcademicDateFormat: boolean;

        // Publication settings
        groupPublicationsByType: boolean;
        sortPublicationsBy: "date" | "importance" | "citations" | "alphabetical";
        showCitationCounts: boolean;
        showImpactFactors: boolean;
        showHIndex: boolean;

        // Detail level control
        maxCvLength: "no_limit" | "5_pages" | "10_pages" | "15_pages";
        detailLevel: "concise" | "standard" | "comprehensive";
        includeAbstracts: boolean;
        includeKeywords: boolean;

        // Research emphasis
        emphasizeRecentWork: boolean;
        highlightCollaborations: boolean;
        showFundingAmounts: boolean;
        includePendingSubmissions: boolean;

        // Teaching and service
        showTeachingEvaluations: boolean;
        includeServiceDetails: boolean;
        showMentorshipRecord: boolean;

        // Export preferences
        preferredFormat: "pdf" | "docx" | "txt" | "json";
        pageFormat: "a4" | "us_letter";
        orientation: "portrait" | "landscape";

        // Privacy controls
        anonymizeInProgress: boolean;
        showPersonalAddress: boolean;
        includePhoneNumber: boolean;
    }>().default({
        includePersonalPhoto: false,
        includeResearchStatement: true,
        includeTeachingPhilosophy: false,
        includeDiversityStatement: false,
        includeReferences: true,
        citationStyle: "apa",
        showPageNumbers: true,
        showSectionNumbers: false,
        useAcademicDateFormat: true,
        groupPublicationsByType: true,
        sortPublicationsBy: "date",
        showCitationCounts: true,
        showImpactFactors: false,
        showHIndex: false,
        maxCvLength: "no_limit",
        detailLevel: "standard",
        includeAbstracts: false,
        includeKeywords: false,
        emphasizeRecentWork: true,
        highlightCollaborations: true,
        showFundingAmounts: false,
        includePendingSubmissions: false,
        showTeachingEvaluations: false,
        includeServiceDetails: true,
        showMentorshipRecord: true,
        preferredFormat: "pdf",
        pageFormat: "us_letter",
        orientation: "portrait",
        anonymizeInProgress: false,
        showPersonalAddress: true,
        includePhoneNumber: true,
    }),

    // Collaboration and sharing
    isPublic: boolean("is_public").default(false),
    shareToken: text("share_token"),
    collaborators: jsonb("collaborators").$type<
        Array<{
            userId: string;
            permissions: ("view" | "edit" | "comment")[];
            addedAt: string;
        }>
    >().default([]),

    // Document lifecycle tracking
    version: integer("version").default(1),
    lastExportedAt: timestamp("last_exported_at"),
    exportCount: integer("export_count").default(0),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const cvsRelations = relations(cvs, ({ one, many }) => ({
    user: one(user, {
        fields: [cvs.userId],
        references: [user.id],
    }),
    template: one(documentTemplates, {
        fields: [cvs.templateId],
        references: [documentTemplates.id],
    }),
    aiInteractions: many(aiInteractions),
}));
