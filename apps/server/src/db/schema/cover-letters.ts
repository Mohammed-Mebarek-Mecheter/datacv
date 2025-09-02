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

// Simplified Cover Letter table for MVP
export const coverLetters = pgTable("cover_letters", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),

	title: text("title").notNull(),

	// Template connection
	templateId: text("template_id").references(() => documentTemplates.id),
	isFromTemplate: boolean("is_from_template").default(false),

	// Job context - critical for cover letters
	targetCompany: text("target_company").notNull(),
	targetRole: text("target_role").notNull(),
	targetSpecialization: text(
		"target_specialization",
	).$type<DataSpecialization>(),
	targetIndustry: text("target_industry").$type<DataIndustry>(),

	// Job description for AI context
	jobDescription: text("job_description"),

	// Personal info
	personalInfo: jsonb("personal_info").$type<{
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
	}>(),

	// Letter content structure
	salutation: text("salutation").default("Dear Hiring Manager"),

	opening: jsonb("opening").$type<{
		content: string;
		hookType?:
			| "personal_connection"
			| "company_news"
			| "shared_values"
			| "impressive_metric";
	}>(),

	bodyParagraphs: jsonb("body_paragraphs")
		.$type<
			Array<{
				id: string;
				type: "experience" | "skills" | "achievements" | "cultural_fit";
				content: string;
				priority: number;
			}>
		>()
		.default([]),

	closing: jsonb("closing").$type<{
		content: string;
		callToAction: string;
	}>(),

	// Project highlights for data roles
	projectHighlights: jsonb("project_highlights")
		.$type<
			Array<{
				id: string;
				projectName: string;
				description: string;
				relevanceToRole: string;
				technologiesUsed: string[];
				priority: number;
			}>
		>()
		.default([]),

	// Application tracking
	applicationStatus: text("application_status").default("draft"), // draft, sent, interview, rejected, offered
	dateSubmitted: timestamp("date_submitted"),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	version: integer("version").default(1),
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
		aiInteractions: many(aiInteractions),
	}),
);
