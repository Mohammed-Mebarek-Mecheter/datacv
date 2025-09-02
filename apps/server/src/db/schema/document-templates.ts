// apps/server/src/db/schema/document-templates.ts

import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";
import { templateVersions } from "@/db/schema/template-versions";
import { templateTagRelations, templateTags } from "@/db/schema/template-tags";
import {
	templateCollectionItems,
	templateCollections,
} from "@/db/schema/template-collections";
import { userTemplateCustomizations } from "@/db/schema/template-customizations";
import { templateUsage } from "@/db/schema/template-usage";
import type {
	DataIndustry,
	DataSpecialization,
	DocumentsType,
} from "@/lib/data-ai";

// PostgreSQL enums for better type safety and query performance
export const templateCategoryEnum = pgEnum("template_category", [
	"professional",
	"modern",
	"creative",
	"academic",
]);
export const experienceLevelEnum = pgEnum("experience_level", [
	"entry",
	"junior",
	"mid",
	"senior",
	"lead",
	"principal",
	"executive",
]);

// Enhanced template system for MVP+
export const documentTemplates = pgTable(
	"document_templates",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		// Basic metadata
		name: text("name").notNull(),
		description: text("description"),
		category: templateCategoryEnum("category").notNull(),
		DocumentsType: text("document_type").$type<DocumentsType>().notNull(),

		// Template inheritance system
		parentTemplateId: text("parent_template_id").references(
			(): any => documentTemplates.id,
		),
		isBaseTemplate: boolean("is_base_template").default(false),

		// Preview for template gallery
		previewImageUrl: text("preview_image_url"), // Primary preview
		previewImages: jsonb("preview_images").$type<{
			desktop?: string;
			mobile?: string;
			thumbnail?: string;
			variations?: Record<string, string>; // Different themes/colors
		}>(),
		previewImageAlt: text("preview_image_alt"), // Accessibility description

		// Target audience
		targetSpecialization: jsonb("target_specialization").$type<
			DataSpecialization[]
		>(),
		targetIndustries: jsonb("target_industries").$type<DataIndustry[]>(),
		targetExperienceLevel: experienceLevelEnum("target_experience_level"),

		// Enhanced template structure definition
		templateStructure: jsonb("template_structure")
			.$type<{
				sections: Array<{
					id: string;
					name: string;
					type:
						| "personal_info"
						| "summary"
						| "experience"
						| "education"
						| "skills"
						| "projects"
						| "custom";
					isRequired: boolean;
					order: number;
					description?: string;
					maxItems?: number;
					validation?: {
						minItems?: number;
						requiredFields?: string[];
						fieldTypes?: Record<string, string>;
					};
					conditionalVisibility?: {
						dependsOn?: string;
						condition?: "exists" | "empty" | "equals";
						value?: string | number | boolean;
					};
				}>;
				layout: {
					columns: 1 | 2;
					headerStyle: "minimal" | "standard" | "prominent";
					pageMargins?: {
						top: number;
						bottom: number;
						left: number;
						right: number;
					};
					sectionSpacing?: number;
					allowReordering?: boolean;
				};
				customFields?: Array<{
					id: string;
					name: string;
					type: "text" | "textarea" | "date" | "url" | "list";
					section: string;
					order: number;
					validation?: any;
				}>;
			}>()
			.notNull(),

		specificSampleContentMap: jsonb("specific_sample_content_map")
			.$type<Record<string, string>>() // Key: section type (e.g., 'experience'), Value: sampleContent.id
			.default({}), // Default to an empty object

		// Enhanced design configuration
		designConfig: jsonb("design_config")
			.$type<{
				colors: {
					primary: string;
					secondary?: string;
					accent?: string;
					text: string;
					textSecondary?: string;
					background: string;
					border?: string;
					// Color variations for different themes
					variations?: Record<
						string,
						{
							primary: string;
							secondary?: string;
							accent?: string;
						}
					>;
				};
				typography: {
					fontFamily: string;
					fontSize: number;
					lineHeight?: number;
					headingFontFamily?: string;
					headingSizes?: {
						h1: number;
						h2: number;
						h3: number;
					};
					fontWeights?: {
						normal: number;
						bold: number;
						heading: number;
					};
					letterSpacing?: number;
				};
				spacing: {
					sectionSpacing: number;
					itemSpacing?: number;
					paragraphSpacing?: number;
					marginTop?: number;
					marginBottom?: number;
				};
				borders?: {
					sectionDividers: boolean;
					headerUnderline: boolean;
					style: "solid" | "dotted" | "dashed";
					width: number;
					radius?: number;
				};
				layout?: {
					maxWidth?: string;
					columnGap?: number;
					rowGap?: number;
					alignment?: "left" | "center" | "right";
				};
				effects?: {
					shadows?: boolean;
					animations?: boolean;
					gradients?: boolean;
				};
			}>()
			.notNull(),

		// Component management (for low-code template creation)
		componentCode: text("component_code"), // React component code as string
		componentPath: text("component_path"), // Path to component file in storage
		componentVersion: text("component_version").default("1.0.0"),

		// Enhanced SEO and discoverability
		tags: jsonb("tags").$type<string[]>().default([]), // Searchable tags
		searchKeywords: text("search_keywords"), // Additional search terms
		seoTitle: text("seo_title"),
		seoDescription: text("seo_description"),

		// Usage statistics
		usageCount: integer("usage_count").default(0),
		avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0"),
		totalRatings: integer("total_ratings").default(0),
		conversionRate: decimal("conversion_rate", {
			precision: 5,
			scale: 4,
		}).default("0"), // Preview to usage rate

		// Featured status and ordering
		isFeatured: boolean("is_featured").default(false),
		featuredOrder: integer("featured_order"),
		featuredUntil: timestamp("featured_until"), // Auto-expire featured status

		// Template status and access
		isActive: boolean("is_active").default(true),
		isPremium: boolean("is_premium").default(false),
		isPublic: boolean("is_public").default(true),
		isDraft: boolean("is_draft").default(false), // For templates under development

		// Enhanced versioning
		version: text("version").default("1.0.0"),
		changelog: jsonb("changelog")
			.$type<
				Array<{
					version: string;
					date: string;
					changes: string[];
					author: string;
					breaking?: boolean;
				}>
			>()
			.default([]),

		// Quality assurance
		qualityScore: integer("quality_score"), // 0-100 based on various factors
		reviewStatus: text("review_status").default("pending"), // pending, approved, rejected
		reviewNotes: text("review_notes"),
		reviewedBy: text("reviewed_by").references(() => user.id),
		reviewedAt: timestamp("reviewed_at"),

		// Analytics and insights
		analyticsData: jsonb("analytics_data").$type<{
			avgLoadTime?: number;
			popularSections?: string[];
			commonCustomizations?: Record<string, number>;
			userFeedbackSummary?: {
				positive: string[];
				negative: string[];
				suggestions: string[];
			};
		}>(),

		// Metadata
		createdBy: text("created_by").references(() => user.id),
		updatedBy: text("updated_by").references(() => user.id),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		// Enhanced indexes for better query performance
		categoryIdx: index("templates_category_idx").on(table.category),
		activeIdx: index("templates_active_idx").on(table.isActive),
		premiumIdx: index("templates_premium_idx").on(table.isPremium),
		featuredIdx: index("templates_featured_idx").on(
			table.isFeatured,
			table.featuredOrder,
		),
		usageIdx: index("templates_usage_idx").on(table.usageCount),
		ratingIdx: index("templates_rating_idx").on(table.avgRating),
		documentTypeIdx: index("templates_document_type_idx").on(
			table.DocumentsType,
		),
		parentTemplateIdx: index("templates_parent_idx").on(table.parentTemplateId),
		reviewStatusIdx: index("templates_review_status_idx").on(
			table.reviewStatus,
		),
		createdByIdx: index("templates_created_by_idx").on(table.createdBy),
		tagsIdx: index("templates_tags_gin_idx").using("gin", table.tags),
	}),
);

// Relations
export const documentTemplatesRelations = relations(
	documentTemplates,
	({ one, many }) => ({
		creator: one(user, {
			fields: [documentTemplates.createdBy],
			references: [user.id],
			relationName: "template_creator",
		}),
		updater: one(user, {
			fields: [documentTemplates.updatedBy],
			references: [user.id],
			relationName: "template_updater",
		}),
		reviewer: one(user, {
			fields: [documentTemplates.reviewedBy],
			references: [user.id],
			relationName: "template_reviewer",
		}),
		parentTemplate: one(documentTemplates, {
			fields: [documentTemplates.parentTemplateId],
			references: [documentTemplates.id],
			relationName: "template_inheritance",
		}),
		childTemplates: many(documentTemplates, {
			relationName: "template_inheritance",
		}),
		versions: many(templateVersions),
		customizations: many(userTemplateCustomizations),
		usage: many(templateUsage),
		tagRelations: many(templateTagRelations),
		collectionItems: many(templateCollectionItems),
	}),
);

// Enhanced helper types
export type TemplateWithDetails = typeof documentTemplates.$inferSelect & {
	creator?: typeof user.$inferSelect;
	parentTemplate?: typeof documentTemplates.$inferSelect;
	versions?: (typeof templateVersions.$inferSelect)[];
	tags?: (typeof templateTags.$inferSelect)[];
	collections?: (typeof templateCollections.$inferSelect)[];
	customizations?: (typeof userTemplateCustomizations.$inferSelect)[];
	usageStats?: {
		totalUsage: number;
		avgRating: string;
		recentUsage: number;
		conversionRate: string;
		topCountries: string[];
	};
};
