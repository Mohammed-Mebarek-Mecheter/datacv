// apps/server/src/db/schema/template-versions.ts

import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";
import { documentTemplates } from "@/db/schema/document-templates";

// Template versions table for comprehensive versioning
export const templateVersions = pgTable(
	"template_versions",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		templateId: text("template_id")
			.notNull()
			.references(() => documentTemplates.id, { onDelete: "cascade" }),

		versionNumber: text("version_number").notNull(), // e.g., "1.2.3"
		versionType: text("version_type").default("minor"), // major, minor, patch

		// Snapshot of template data at this version
		snapshot: jsonb("snapshot")
			.$type<{
				name: string;
				description?: string;
				templateStructure: any;
				sampleContent?: any;
				designConfig: any;
				componentCode?: string;
				tags: string[];
			}>()
			.notNull(),

		// Version metadata
		changelogNotes: text("changelog_notes"),
		isBreaking: boolean("is_breaking").default(false),
		deprecatedFeatures: jsonb("deprecated_features")
			.$type<string[]>()
			.default([]),

		// Migration information
		migrationNotes: text("migration_notes"),
		backwardCompatible: boolean("backward_compatible").default(true),

		createdBy: text("created_by")
			.notNull()
			.references(() => user.id),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		isPublished: boolean("is_published").default(false),
		publishedAt: timestamp("published_at"),
	},
	(table) => ({
		templateVersionIdx: index("template_versions_template_idx").on(
			table.templateId,
			table.versionNumber,
		),
		createdByIdx: index("template_versions_created_by_idx").on(table.createdBy),
	}),
);

// Relations
export const templateVersionsRelations = relations(
	templateVersions,
	({ one }) => ({
		template: one(documentTemplates, {
			fields: [templateVersions.templateId],
			references: [documentTemplates.id],
		}),
		creator: one(user, {
			fields: [templateVersions.createdBy],
			references: [user.id],
		}),
	}),
);

// Enhanced helper types
export type TemplateVersion = typeof templateVersions.$inferSelect & {
	creator: typeof user.$inferSelect;
};
