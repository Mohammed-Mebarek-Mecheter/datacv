// apps/server/src/db/schema/template-usage.ts

import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "../../db/schema/auth";
import { session } from "../../db/schema/auth";
import { documentTemplates } from "../../db/schema/document-templates";
import { userTemplateCustomizations } from "../../db/schema/template-customizations";
import type { DocumentsType } from "../../lib/data-ai";

export const actionTypeEnum = pgEnum("action_type", [
	"preview",
	"select",
	"customize",
	"export",
	"duplicate",
]);

// Enhanced template usage tracking
export const templateUsage = pgTable(
	"template_usage",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		templateId: text("template_id")
			.notNull()
			.references(() => documentTemplates.id, { onDelete: "cascade" }),
		customizationId: text("customization_id").references(
			() => userTemplateCustomizations.id,
			{ onDelete: "set null" },
		),

		// Document context
		documentId: text("document_id"),
		DocumentsType: text("document_type").$type<DocumentsType>().notNull(),
		actionType: actionTypeEnum("action_type").notNull(),

		// Enhanced analytics data
		sessionId: text("session_id").references(() => session.id),
		deviceType: text("device_type"),
		userAgent: text("user_agent"),
		browserInfo: jsonb("browser_info").$type<{
			name?: string;
			version?: string;
			os?: string;
			mobile?: boolean;
			screen?: { width: number; height: number };
		}>(),

		// Performance metrics
		loadTime: integer("load_time_ms"),
		renderTime: integer("render_time_ms"),
		interactionTime: integer("interaction_time_ms"),

		// Engagement metrics
		timeOnPage: integer("time_on_page_seconds"),
		scrollDepth: integer("scroll_depth_percent"),
		clicksCount: integer("clicks_count"),

		// User feedback and quality
		userRating: integer("user_rating"),
		feedback: text("feedback"),
		bugReports: jsonb("bug_reports")
			.$type<
				Array<{
					type: string;
					description: string;
					severity: "low" | "medium" | "high";
					resolved?: boolean;
				}>
			>()
			.default([]),

		// Conversion tracking
		convertedToDocument: boolean("converted_to_document").default(false),
		conversionTime: integer("conversion_time_seconds"),
		documentsCreated: integer("documents_created").default(0),

		// Template version used
		templateVersion: text("template_version"),

		// Geographic and temporal data
		ipAddress: text("ip_address"),
		country: text("country"),
		timezone: text("timezone"),

		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => ({
		userActionIdx: index("template_usage_user_action_idx").on(
			table.userId,
			table.actionType,
		),
		templateActionIdx: index("template_usage_template_action_idx").on(
			table.templateId,
			table.actionType,
		),
		createdAtIdx: index("template_usage_created_at_idx").on(table.createdAt),
		conversionIdx: index("template_usage_conversion_idx").on(
			table.convertedToDocument,
		),
		sessionIdx: index("template_usage_session_idx").on(table.sessionId),
		countryIdx: index("template_usage_country_idx").on(table.country),
	}),
);

// Relations
export const templateUsageRelations = relations(templateUsage, ({ one }) => ({
	user: one(user, {
		fields: [templateUsage.userId],
		references: [user.id],
	}),
	template: one(documentTemplates, {
		fields: [templateUsage.templateId],
		references: [documentTemplates.id],
	}),
	customization: one(userTemplateCustomizations, {
		fields: [templateUsage.customizationId],
		references: [userTemplateCustomizations.id],
	}),
	session: one(session, {
		fields: [templateUsage.sessionId],
		references: [session.id],
	}),
}));

// Enhanced helper types
export type TemplateUsageWithDetails = typeof templateUsage.$inferSelect & {
	template: typeof documentTemplates.$inferSelect;
	customization?: typeof userTemplateCustomizations.$inferSelect;
};
