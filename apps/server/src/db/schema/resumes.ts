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
import { user } from "../../db/schema/auth";
import { documentTemplates } from "../../db/schema/document-templates";
import { aiInteractions } from "../../db/schema/ai-interactions";
import type {
	DataIndustry,
	DataProjectType,
	DataSkillCategory,
	DataSpecialization,
	ExperienceLevel,
} from "../../lib/data-ai";

// Simplified Resume table for MVP - focused on data professionals
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

	// Template connection
	templateId: text("template_id").references(() => documentTemplates.id),
	isFromTemplate: boolean("is_from_template").default(false),

	// Target context for AI
	targetRole: text("target_role"),
	targetSpecialization: text(
		"target_specialization",
	).$type<DataSpecialization>(),
	targetIndustry: text("target_industry").$type<DataIndustry>(),
	experienceLevel: text("experience_level").$type<ExperienceLevel>(),

	// Personal information
	personalInfo: jsonb("personal_info").$type<{
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		location?: string;
		linkedIn?: string;
		github?: string;
		portfolio?: string;
	}>(),

	// Professional summary
	professionalSummary: text("professional_summary"),

	// Work experience - simplified but data-focused
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

				achievements: Array<{
					description: string;
					technologiesUsed?: string[];
				}>;

				primaryTechnologies: string[];

				isVisible: boolean;
				priority: number;
			}>
		>()
		.default([]),

	// Education
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

				isVisible: boolean;
				priority: number;
			}>
		>()
		.default([]),

	// Skills - enhanced for data professionals
	skills: jsonb("skills")
		.$type<
			Array<{
				id: string;
				name: string;
				category: DataSkillCategory;
				proficiency: "beginner" | "intermediate" | "advanced" | "expert";
				yearsOfExperience?: number;

				isVisible: boolean;
				priority: number;
			}>
		>()
		.default([]),

	// Projects - key for data professionals
	projects: jsonb("projects")
		.$type<
			Array<{
				id: string;
				name: string;
				description: string;
				type: DataProjectType;

				technologiesUsed: string[];
				businessProblem: string;
				solution: string;

				githubUrl?: string;
				liveUrl?: string;

				isVisible: boolean;
				priority: number;
			}>
		>()
		.default([]),

	// Certifications
	certifications: jsonb("certifications")
		.$type<
			Array<{
				id: string;
				name: string;
				issuer: string;
				issueDate?: string;
				credentialUrl?: string;

				isVisible: boolean;
				priority: number;
			}>
		>()
		.default([]),

	// Basic AI insights for feedback
	aiInsights: jsonb("ai_insights").$type<{
		completenessScore?: number; // 0-100
		strengthAreas?: string[];
		improvementSuggestions?: string[];
		lastAnalyzed?: string;
	}>(),

	// Simple settings
	settings: jsonb("settings")
		.$type<{
			includePortfolio: boolean;
			emphasizeQuantitativeResults: boolean;
			colorScheme: string;
			fontFamily: string;
		}>()
		.default({
			includePortfolio: true,
			emphasizeQuantitativeResults: true,
			colorScheme: "professional",
			fontFamily: "Arial",
		}),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	version: integer("version").default(1),
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
