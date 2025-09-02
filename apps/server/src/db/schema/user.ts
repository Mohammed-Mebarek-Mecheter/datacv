// apps/server/src/db/schema/user.ts

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
import type {
	DataIndustry,
	DataSpecialization,
	DocumentsType,
	ExperienceLevel,
} from "../../lib/data-ai";

// onboarding progress tracking for MVP
export const userOnboarding = pgTable("user_onboarding", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),

	currentStep: text("current_step").default("welcome"),
	// welcome, basic_info, document_choice, document_creation, complete
	isCompleted: boolean("is_completed").default(false),

	// Essential user info for AI personalization
	collectedInfo: jsonb("collected_info").$type<{
		firstName?: string;
		lastName?: string;
		email?: string;
		dataSpecialization?: DataSpecialization;
		experienceLevel?: ExperienceLevel;
		targetIndustries?: DataIndustry[];
		yearsOfExperience?: number;
	}>(),

	initialDocumentChoice: text("initial_document_choice").$type<DocumentsType>(),
	firstDocumentCreated: boolean("first_document_created").default(false),

	completedAt: timestamp("completed_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// user preferences for MVP
export const userPreferences = pgTable("user_preferences", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),

	// Core profile info
	dataSpecialization: text("data_specialization").$type<DataSpecialization>(),
	experienceLevel: text("experience_level").$type<ExperienceLevel>(),
	primaryIndustry: text("primary_industry").$type<DataIndustry>(),
	yearsOfExperience: integer("years_of_experience"),
	targetRoles: jsonb("target_roles").$type<string[]>().default([]),

	// AI preferences
	aiWritingStyle: text("ai_writing_style").default("professional"), // professional, technical, creative, academic
	defaultDocumentsType: text("default_document_type")
		.$type<DocumentsType>()
		.default("resume"),

	// Document preferences
	defaultTemplate: text("default_template").default("modern"),
	includePortfolio: boolean("include_portfolio").default(true),
	emphasizeQuantitativeResults: boolean(
		"emphasize_quantitative_results",
	).default(true),

	// Subscription info
	subscriptionPlan: text("subscription_plan").default("free"), // free, monthly, lifetime

	// Admin flag - NEW FIELD
	isAdmin: boolean("is_admin").default(false),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const userOnboardingRelations = relations(userOnboarding, ({ one }) => ({
	user: one(user, {
		fields: [userOnboarding.userId],
		references: [user.id],
	}),
}));

export const userPreferencesRelations = relations(
	userPreferences,
	({ one }) => ({
		user: one(user, {
			fields: [userPreferences.userId],
			references: [user.id],
		}),
	}),
);
