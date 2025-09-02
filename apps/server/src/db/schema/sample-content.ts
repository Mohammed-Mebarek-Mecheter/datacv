// apps/server/src/db/schema/sample-content.ts

import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { experienceLevelEnum } from "../../db/schema/document-templates";
import type { DataIndustry, DataSpecialization } from "../../lib/data-ai";

export const sampleContent = pgTable(
	"sample_content",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		contentType: text("content_type").notNull(), // e.g., 'summary', 'experience', 'skill'
		content: jsonb("content").notNull(), // The actual sample data snippet
		targetIndustry: jsonb("target_industry").$type<DataIndustry[]>(),
		targetSpecialization: jsonb("target_specialization").$type<
			DataSpecialization[]
		>(),
		experienceLevel: experienceLevelEnum("experience_level"),
		tags: jsonb("tags").$type<string[]>().default([]),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		contentTypeIdx: index("sample_content_content_type_idx").on(
			table.contentType,
		),
		experienceLevelIdx: index("sample_content_experience_level_idx").on(
			table.experienceLevel,
		),
		tagsIdx: index("sample_content_tags_gin_idx").using("gin", table.tags),
	}),
);

// Relations
export const sampleContentRelations = relations(sampleContent, ({}) => ({}));
