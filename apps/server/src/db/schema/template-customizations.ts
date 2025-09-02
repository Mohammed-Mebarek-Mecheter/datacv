// apps/server/src/db/schema/template-customizations.ts

import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";
import { documentTemplates } from "@/db/schema/document-templates";
import { templateUsage } from "@/db/schema/template-usage";

// Enhanced user template customizations
export const userTemplateCustomizations = pgTable(
	"user_template_customizations",
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

		customName: text("custom_name"),
		description: text("description"),

		// Enhanced customization options
		customizations: jsonb("customizations").$type<{
			colorChanges?: {
				primary?: string;
				secondary?: string;
				accent?: string;
				text?: string;
				textSecondary?: string;
				background?: string;
				border?: string;
			};
			layoutChanges?: {
				columns?: 1 | 2;
				headerStyle?: "minimal" | "standard" | "prominent";
				pageMargins?: {
					top: number;
					bottom: number;
					left: number;
					right: number;
				};
				sectionSpacing?: number;
			};
			typographyChanges?: {
				fontFamily?: string;
				fontSize?: number;
				lineHeight?: number;
				headingFontFamily?: string;
				headingSizes?: {
					h1?: number;
					h2?: number;
					h3?: number;
				};
				fontWeights?: {
					normal?: number;
					bold?: number;
					heading?: number;
				};
			};
			sectionChanges?: {
				sectionsRemoved?: string[];
				sectionsAdded?: Array<{
					id: string;
					name: string;
					type: "custom";
					order: number;
				}>;
				orderChanges?: Record<string, number>;
				sectionSettings?: Record<
					string,
					{
						maxItems?: number;
						isRequired?: boolean;
					}
				>;
			};
			spacingChanges?: {
				sectionSpacing?: number;
				itemSpacing?: number;
				paragraphSpacing?: number;
			};
			borderChanges?: {
				sectionDividers?: boolean;
				headerUnderline?: boolean;
				style?: "solid" | "dotted" | "dashed";
				width?: number;
			};
			customContent?: {
				personal_info?: Record<string, string>;
				summary?: string;
				experience?: string;
				education?: string;
				skills?: string;
				projects?: string;
				achievements?: string;
				references?: string;
				custom?: Record<string, unknown>;
			};
			// Advanced customizations
			effectChanges?: {
				shadows?: boolean;
				animations?: boolean;
				gradients?: boolean;
			};
			customCSS?: string; // For power users
		}>(),

		// Usage tracking
		lastUsedAt: timestamp("last_used_at"),
		timesUsed: integer("times_used").default(0),

		// Sharing and collaboration
		isShared: boolean("is_shared").default(false),
		shareToken: text("share_token"),
		sharedWith: jsonb("shared_with")
			.$type<
				Array<{
					userId: string;
					permissions: ("view" | "edit" | "clone")[];
					sharedAt: string;
				}>
			>()
			.default([]),

		// Version tracking
		baseTemplateVersion: text("base_template_version"), // Track which template version this was based on

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		userTemplateIdx: index("user_customizations_user_template_idx").on(
			table.userId,
			table.templateId,
		),
		lastUsedIdx: index("user_customizations_last_used_idx").on(
			table.lastUsedAt,
		),
		sharedIdx: index("user_customizations_shared_idx").on(table.isShared),
	}),
);

// Relations
export const userTemplateCustomizationsRelations = relations(
	userTemplateCustomizations,
	({ one, many }) => ({
		user: one(user, {
			fields: [userTemplateCustomizations.userId],
			references: [user.id],
		}),
		template: one(documentTemplates, {
			fields: [userTemplateCustomizations.templateId],
			references: [documentTemplates.id],
		}),
		usage: many(templateUsage),
	}),
);

// Enhanced helper types
export type UserCustomization =
	typeof userTemplateCustomizations.$inferSelect & {
		template: typeof documentTemplates.$inferSelect;
	};
