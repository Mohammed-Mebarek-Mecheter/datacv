// apps/server/src/db/schema/ai-interactions.ts

import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../../db/schema/auth";
import { resumes } from "../../db/schema/resumes";
import { cvs } from "../../db/schema/cvs";
import { coverLetters } from "../../db/schema/cover-letters";
import type { DocumentsType } from "../../lib/data-ai";

// Simplified AI interactions table for MVP
export const aiInteractions = pgTable("ai_interactions", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),

	// Document associations
	resumeId: text("resume_id").references(() => resumes.id, {
		onDelete: "cascade",
	}),
	cvId: text("cv_id").references(() => cvs.id, { onDelete: "cascade" }),
	coverLetterId: text("cover_letter_id").references(() => coverLetters.id, {
		onDelete: "cascade",
	}),

	// Interaction details
	type: text("type").notNull(), // "resume_enhancement", "cover_letter_generation", "job_matching"
	section: text("section"), // Which section was being optimized
	DocumentsType: text("document_type").$type<DocumentsType>().notNull(),

	// Context
	userPrompt: text("user_prompt"),
	jobDescription: text("job_description"),
	targetRole: text("target_role"),

	// AI response
	suggestions:
		jsonb("suggestions").$type<
			Array<{
				id: string;
				content: string;
				type:
					| "replacement"
					| "addition"
					| "enhancement"
					| "recommendation"
					| "generation"
					| "improvement";
				confidence: number;
			}>
		>(),

	// User feedback
	selectedSuggestion: text("selected_suggestion_id"),
	userFeedback: text("user_feedback"), // "accepted", "rejected", "modified"
	userRating: integer("user_rating"), // 1-5 stars

	// Performance tracking
	processingTime: integer("processing_time_ms"),
	modelUsed: text("model_used"),

	createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const aiInteractionsRelations = relations(aiInteractions, ({ one }) => ({
	user: one(user, {
		fields: [aiInteractions.userId],
		references: [user.id],
	}),
	resume: one(resumes, {
		fields: [aiInteractions.resumeId],
		references: [resumes.id],
	}),
	cv: one(cvs, {
		fields: [aiInteractions.cvId],
		references: [cvs.id],
	}),
	coverLetter: one(coverLetters, {
		fields: [aiInteractions.coverLetterId],
		references: [coverLetters.id],
	}),
}));
