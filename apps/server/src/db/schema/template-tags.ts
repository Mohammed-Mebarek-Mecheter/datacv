// apps/server/src/db/schema/template-tags.ts

import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";
import { documentTemplates } from "@/db/schema/document-templates";

// Template tags system for better organization
export const templateTags = pgTable(
	"template_tags",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		name: text("name").notNull().unique(),
		slug: text("slug").notNull().unique(),
		description: text("description"),
		color: text("color").default("#000000"),

		// Tag categorization
		category: text("category"), // e.g., "style", "industry", "feature", "difficulty"
		isSystemTag: boolean("is_system_tag").default(false), // Managed by system vs user-created

		// Usage statistics
		usageCount: integer("usage_count").default(0),

		// Hierarchy support
		parentTagId: text("parent_tag_id").references((): any => templateTags.id),

		createdBy: text("created_by").references(() => user.id),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		nameIdx: index("template_tags_name_idx").on(table.name),
		slugIdx: index("template_tags_slug_idx").on(table.slug),
		categoryIdx: index("template_tags_category_idx").on(table.category),
		usageIdx: index("template_tags_usage_idx").on(table.usageCount),
	}),
);

// Junction table for many-to-many relationship between templates and tags
export const templateTagRelations = pgTable(
	"template_tag_relations",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		templateId: text("template_id")
			.notNull()
			.references(() => documentTemplates.id, { onDelete: "cascade" }),
		tagId: text("tag_id")
			.notNull()
			.references(() => templateTags.id, { onDelete: "cascade" }),

		createdBy: text("created_by").references(() => user.id),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => ({
		templateTagIdx: index("template_tag_relations_template_tag_idx").on(
			table.templateId,
			table.tagId,
		),
		tagTemplateIdx: index("template_tag_relations_tag_template_idx").on(
			table.tagId,
			table.templateId,
		),
	}),
);

// Relations
export const templateTagsRelations = relations(
	templateTags,
	({ one, many }) => ({
		creator: one(user, {
			fields: [templateTags.createdBy],
			references: [user.id],
		}),
		parentTag: one(templateTags, {
			fields: [templateTags.parentTagId],
			references: [templateTags.id],
			relationName: "tag_hierarchy",
		}),
		childTags: many(templateTags, {
			relationName: "tag_hierarchy",
		}),
		templateRelations: many(templateTagRelations),
	}),
);

export const templateTagRelationsRelations = relations(
	templateTagRelations,
	({ one }) => ({
		template: one(documentTemplates, {
			fields: [templateTagRelations.templateId],
			references: [documentTemplates.id],
		}),
		tag: one(templateTags, {
			fields: [templateTagRelations.tagId],
			references: [templateTags.id],
		}),
		creator: one(user, {
			fields: [templateTagRelations.createdBy],
			references: [user.id],
		}),
	}),
);

// Enhanced helper types
export type TemplateTag = typeof templateTags.$inferSelect & {
	parentTag?: typeof templateTags.$inferSelect;
	childTags?: (typeof templateTags.$inferSelect)[];
};
