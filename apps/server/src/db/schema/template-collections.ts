// apps/server/src/db/schema/template-collections.ts

import { type InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "../../db/schema/auth";
import { documentTemplates } from "../../db/schema/document-templates";

// Template collections/categories for better organization
export const templateCollections = pgTable(
	"template_collections",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		name: text("name").notNull(),
		description: text("description"),
		slug: text("slug").notNull().unique(),

		// Visual presentation
		coverImageUrl: text("cover_image_url"),
		color: text("color").default("#000000"),
		icon: text("icon"), // Icon name or URL

		// Organization and hierarchy
		order: integer("order").default(0),
		parentCollectionId: text("parent_collection_id").references(
            (): any => templateCollections.id,
		),

		// Status and access
		isActive: boolean("is_active").default(true),
		isFeatured: boolean("is_featured").default(false),
		isPremium: boolean("is_premium").default(false),

		// Curation settings
		isCurated: boolean("is_curated").default(false), // Hand-picked templates
		curatedBy: text("curated_by").references(() => user.id),
		curatedAt: timestamp("curated_at"),

		// Auto-collection rules (for dynamic collections)
		autoRules: jsonb("auto_rules").$type<{
			tags?: string[];
			categories?: string[];
			minRating?: number;
			industries?: string[];
			documentTypes?: string[];
			createdAfter?: string;
		}>(),

		createdBy: text("created_by").references(() => user.id),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		slugIdx: index("collections_slug_idx").on(table.slug),
		orderIdx: index("collections_order_idx").on(table.order),
		featuredIdx: index("collections_featured_idx").on(table.isFeatured),
		parentIdx: index("collections_parent_idx").on(table.parentCollectionId),
	}),
);

// Many-to-many relationship between templates and collections
export const templateCollectionItems = pgTable(
	"template_collection_items",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		collectionId: text("collection_id")
			.notNull()
			.references(() => templateCollections.id, { onDelete: "cascade" }),
		templateId: text("template_id")
			.notNull()
			.references(() => documentTemplates.id, { onDelete: "cascade" }),

		order: integer("order").default(0),
		isFeatured: boolean("is_featured").default(false), // Featured within the collection
		addedReason: text("added_reason"), // Why this template was added to collection

		addedBy: text("added_by").references(() => user.id),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => ({
		collectionTemplateIdx: index("collection_items_collection_template_idx").on(
			table.collectionId,
			table.templateId,
		),
		orderIdx: index("collection_items_order_idx").on(
			table.collectionId,
			table.order,
		),
	}),
);

// Relations
export const templateCollectionsRelations = relations(
	templateCollections,
	({ one, many }) => ({
		creator: one(user, {
			fields: [templateCollections.createdBy],
			references: [user.id],
			relationName: "collection_creator",
		}),
		curator: one(user, {
			fields: [templateCollections.curatedBy],
			references: [user.id],
			relationName: "collection_curator",
		}),
		parentCollection: one(templateCollections, {
			fields: [templateCollections.parentCollectionId],
			references: [templateCollections.id],
			relationName: "collection_hierarchy",
		}),
		childCollections: many(templateCollections, {
			relationName: "collection_hierarchy",
		}),
		items: many(templateCollectionItems),
	}),
);

export const templateCollectionItemsRelations = relations(
	templateCollectionItems,
	({ one }) => ({
		collection: one(templateCollections, {
			fields: [templateCollectionItems.collectionId],
			references: [templateCollections.id],
		}),
		template: one(documentTemplates, {
			fields: [templateCollectionItems.templateId],
			references: [documentTemplates.id],
		}),
		addedBy: one(user, {
			fields: [templateCollectionItems.addedBy],
			references: [user.id],
		}),
	}),
);

// Enhanced helper types
export type TemplateCollection = typeof templateCollections.$inferSelect & {
	templates?: (typeof documentTemplates.$inferSelect)[];
	parentCollection?: typeof templateCollections.$inferSelect;
	childCollections?: (typeof templateCollections.$inferSelect)[];
};
