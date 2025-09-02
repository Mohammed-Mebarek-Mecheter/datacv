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

// Simplified CV table for MVP
export const cvs = pgTable("cvs", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),

	title: text("title").notNull(),
	isDefault: boolean("is_default").default(false),

	// Template connection
	templateId: text("template_id").references(() => documentTemplates.id),
	isFromTemplate: boolean("is_from_template").default(false),

	// Academic/Research context
	targetPosition: text("target_position"),
	targetSpecialization: text(
		"target_specialization",
	).$type<DataSpecialization>(),
	researchArea: text("research_area"),

	// Personal info
	personalInfo: jsonb("personal_info").$type<{
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		linkedIn?: string;
		googleScholar?: string;
		orcid?: string;
	}>(),

	// Research statement
	researchStatement: text("research_statement"),

	// Education - more detailed for academic CVs
	education: jsonb("education")
		.$type<
			Array<{
				id: string;
				institution: string;
				degree: string;
				fieldOfStudy: string;
				startDate: string;
				endDate?: string;

				thesis?: {
					title: string;
					advisor: string;
					abstract?: string;
				};

				isVisible: boolean;
				priority: number;
			}>
		>()
		.default([]),

	// Academic positions
	academicPositions: jsonb("academic_positions")
		.$type<
			Array<{
				id: string;
				institution: string;
				position: string;
				type: "faculty" | "postdoc" | "research" | "visiting";
				startDate: string;
				endDate?: string;

				description: string;
				achievements: string[];

				isVisible: boolean;
				priority: number;
			}>
		>()
		.default([]),

	// Publications
	publications: jsonb("publications")
		.$type<
			Array<{
				id: string;
				title: string;
				authors: string[];
				venue: string;
				year: string;
				type: "journal" | "conference" | "preprint" | "other";

				url?: string;
				citations?: number;

				isVisible: boolean;
				priority: number;
			}>
		>()
		.default([]),

	// Research projects
	researchProjects: jsonb("research_projects")
		.$type<
			Array<{
				id: string;
				title: string;
				description: string;
				status: "completed" | "ongoing" | "planned";
				startDate: string;
				endDate?: string;

				technologiesUsed: string[];

				isVisible: boolean;
				priority: number;
			}>
		>()
		.default([]),

	// Technical skills
	technicalSkills: jsonb("technical_skills")
		.$type<
			Array<{
				id: string;
				name: string;
				category: DataSkillCategory;
				proficiency: "beginner" | "intermediate" | "advanced" | "expert";

				isVisible: boolean;
				priority: number;
			}>
		>()
		.default([]),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	version: integer("version").default(1),
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
