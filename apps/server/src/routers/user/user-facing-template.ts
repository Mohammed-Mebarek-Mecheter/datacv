// apps/server/src/routers/user-facing-template.ts

import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { documentTemplates } from "../../db/schema/document-templates";
import { userTemplateCustomizations } from "../../db/schema/template-customizations";
import { templateUsage } from "../../db/schema/template-usage";
import type {
	DataIndustry,
	DataSpecialization,
	DocumentsType,
	ExperienceLevel,
} from "../../lib/data-ai";
import { protectedProcedure, publicProcedure, router } from "../../lib/trpc";

const customizationSchema = z.object({
	templateId: z.string(),
	customName: z.string().optional(),
	description: z.string().optional(),
	customizations: z
		.object({
			colorChanges: z
				.object({
					primary: z.string().optional(),
					secondary: z.string().optional(),
					accent: z.string().optional(),
					text: z.string().optional(),
					textSecondary: z.string().optional(),
					background: z.string().optional(),
					border: z.string().optional(),
				})
				.optional(),
			layoutChanges: z
				.object({
					columns: z.union([z.literal(1), z.literal(2)]).optional(),
					headerStyle: z.enum(["minimal", "standard", "prominent"]).optional(),
					pageMargins: z
						.object({
							top: z.number(),
							bottom: z.number(),
							left: z.number(),
							right: z.number(),
						})
						.optional(),
				})
				.optional(),
			typographyChanges: z
				.object({
					fontFamily: z.string().optional(),
					fontSize: z.number().optional(),
					lineHeight: z.number().optional(),
					headingFontFamily: z.string().optional(),
					headingSizes: z
						.object({
							h1: z.number().optional(),
							h2: z.number().optional(),
							h3: z.number().optional(),
						})
						.optional(),
				})
				.optional(),
			sectionChanges: z
				.object({
					sectionsRemoved: z.array(z.string()).optional(),
					sectionsAdded: z
						.array(
							z.object({
								id: z.string(),
								name: z.string(),
								type: z.literal("custom"),
								order: z.number(),
							}),
						)
						.optional(),
					orderChanges: z.record(z.string(), z.number()).optional(),
					sectionSettings: z
						.record(
							z.string(),
							z.object({
								maxItems: z.number().optional(),
								isRequired: z.boolean().optional(),
							}),
						)
						.optional(),
				})
				.optional(),
			spacingChanges: z
				.object({
					sectionSpacing: z.number().optional(),
					itemSpacing: z.number().optional(),
					paragraphSpacing: z.number().optional(),
				})
				.optional(),
			borderChanges: z
				.object({
					sectionDividers: z.boolean().optional(),
					headerUnderline: z.boolean().optional(),
					style: z.enum(["solid", "dotted", "dashed"]).optional(),
					width: z.number().optional(),
				})
				.optional(),
			customContent: z
				.object({
					personal_info: z.record(z.string(), z.any()).optional(),
					summary: z.string().optional(),
					experience: z.string().optional(),
					education: z.string().optional(),
					skills: z.string().optional(),
					projects: z.string().optional(),
					achievements: z.string().optional(),
					references: z.string().optional(),
					custom: z.record(z.string(), z.any()).optional(),
				})
				.optional(),
		})
		.optional(),
	isShared: z.boolean().default(false),
});

export const templateRouter = router({
	// ===== PUBLIC TEMPLATE DISCOVERY =====

	// Browse templates (available to all users)
	browse: publicProcedure
		.input(
			z.object({
				documentType: z
					.enum(["resume", "cv", "cover_letter"])
					.optional() as z.ZodOptional<z.ZodType<DocumentsType>>,
				category: z
					.enum(["professional", "modern", "creative", "academic"])
					.optional(),
				specialization: z.string().optional() as z.ZodOptional<
					z.ZodType<DataSpecialization>
				>,
				industry: z.string().optional() as z.ZodOptional<
					z.ZodType<DataIndustry>
				>,
				experienceLevel: z.string().optional() as z.ZodOptional<
					z.ZodType<ExperienceLevel>
				>,
				tags: z.array(z.string()).optional(),
				search: z.string().optional(),
				featured: z.boolean().optional(),
				freeOnly: z.boolean().default(false),
				limit: z.number().default(20),
				offset: z.number().default(0),
			}),
		)
		.query(async ({ input, ctx }) => {
			const conditions: any[] = [
				eq(documentTemplates.isActive, true),
				eq(documentTemplates.isPublic, true),
			];

			// Apply filters
			if (input.documentType) {
				conditions.push(
					eq(documentTemplates.DocumentsType, input.documentType),
				);
			}
			if (input.category) {
				conditions.push(eq(documentTemplates.category, input.category));
			}
			if (input.specialization) {
				conditions.push(
					or(
						sql`${documentTemplates.targetSpecialization} @> ${JSON.stringify([input.specialization])}`,
						sql`${documentTemplates.targetSpecialization} IS NULL`,
					),
				);
			}
			if (input.industry) {
				conditions.push(
					or(
						sql`${documentTemplates.targetIndustries} @> ${JSON.stringify([input.industry])}`,
						sql`${documentTemplates.targetIndustries} IS NULL`,
					),
				);
			}
			if (input.experienceLevel) {
				conditions.push(
					or(
						sql`${(documentTemplates.targetExperienceLevel, input.experienceLevel)}`,
						sql`${documentTemplates.targetExperienceLevel} IS NULL`,
					),
				);
			}
			if (input.featured !== undefined) {
				conditions.push(eq(documentTemplates.isFeatured, input.featured));
			}
			if (input.freeOnly) {
				conditions.push(eq(documentTemplates.isPremium, false));
			}
			if (input.search) {
				conditions.push(
					or(
						like(documentTemplates.name, `%${input.search}%`),
						like(documentTemplates.description, `%${input.search}%`),
						like(documentTemplates.searchKeywords, `%${input.search}%`),
					),
				);
			}
			if (input.tags && input.tags.length > 0) {
				conditions.push(sql`${documentTemplates.tags} && ${input.tags}`);
			}

			// Check if user has pro access
			const userPlan = ctx.userContext?.preferences?.subscriptionPlan || "free";
			const hasProAccess = userPlan === "monthly" || userPlan === "lifetime";

			if (!hasProAccess) {
				conditions.push(eq(documentTemplates.isPremium, false));
			}

			const templates = await db
				.select({
					id: documentTemplates.id,
					name: documentTemplates.name,
					description: documentTemplates.description,
					category: documentTemplates.category,
					documentType: documentTemplates.DocumentsType,
					targetSpecialization: documentTemplates.targetSpecialization,
					targetIndustries: documentTemplates.targetIndustries,
					targetExperienceLevel: documentTemplates.targetExperienceLevel,
					previewImageUrl: documentTemplates.previewImageUrl,
					previewImageAlt: documentTemplates.previewImageAlt,
					tags: documentTemplates.tags,
					isPremium: documentTemplates.isPremium,
					isFeatured: documentTemplates.isFeatured,
					usageCount: documentTemplates.usageCount,
					avgRating: documentTemplates.avgRating,
					version: documentTemplates.version,
				})
				.from(documentTemplates)
				.where(and(...conditions))
				.orderBy(
					input.featured
						? desc(documentTemplates.featuredOrder)
						: desc(documentTemplates.avgRating),
					desc(documentTemplates.usageCount),
				)
				.limit(input.limit)
				.offset(input.offset);

			return { templates };
		}),

	// Get template details for preview
	getTemplate: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const template = await db
				.select()
				.from(documentTemplates)
				.where(
					and(
						eq(documentTemplates.id, input.id),
						eq(documentTemplates.isActive, true),
						eq(documentTemplates.isPublic, true),
					),
				)
				.limit(1);

			if (!template[0]) {
				throw new Error("Template not found or not accessible");
			}

			const templateData = template[0];

			// Check if user has access to premium template
			const userPlan = ctx.userContext?.preferences?.subscriptionPlan || "free";
			const hasProAccess = userPlan === "monthly" || userPlan === "lifetime";

			if (templateData.isPremium && !hasProAccess) {
				// Return limited preview for premium templates
				return {
					...templateData,
					sampleContent: null, // Hide sample content for premium
					designConfig: {
						...templateData.designConfig,
						// Limit design details
					},
					isPremiumPreview: true,
				};
			}

			// Record template preview
			if (ctx.session?.user) {
				await db.insert(templateUsage).values({
					userId: ctx.session.user.id,
					templateId: input.id,
					DocumentsType: templateData.DocumentsType,
					actionType: "preview",
					deviceType: "unknown", // Would be passed from client
				});
			}

			return {
				...templateData,
				isPremiumPreview: false,
			};
		}),

	// ===== USER TEMPLATE OPERATIONS =====

	// Use template (create document from template)
	useTemplate: protectedProcedure
		.input(
			z.object({
				templateId: z.string(),
				customizationId: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			const userPlan = ctx.userContext?.preferences?.subscriptionPlan || "free";
			const hasProAccess = userPlan === "monthly" || userPlan === "lifetime";

			// Get template
			const template = await db
				.select()
				.from(documentTemplates)
				.where(
					and(
						eq(documentTemplates.id, input.templateId),
						eq(documentTemplates.isActive, true),
						eq(documentTemplates.isPublic, true),
					),
				)
				.limit(1);

			if (!template[0]) {
				throw new Error("Template not found");
			}

			const templateData = template[0];

			// Check premium access
			if (templateData.isPremium && !hasProAccess) {
				throw new Error("Pro subscription required for this template");
			}

			// Get customization if provided
			let customization = null;
			if (input.customizationId) {
				const customizationData = await db
					.select()
					.from(userTemplateCustomizations)
					.where(
						and(
							eq(userTemplateCustomizations.id, input.customizationId),
							eq(userTemplateCustomizations.userId, userId),
						),
					)
					.limit(1);

				customization = customizationData[0] || null;
			}

			// Record usage
			await db.insert(templateUsage).values({
				userId,
				templateId: input.templateId,
				customizationId: input.customizationId || null,
				DocumentsType: templateData.DocumentsType,
				actionType: "select",
				convertedToDocument: true,
				deviceType: "unknown",
			});

			// Update template usage count
			await db
				.update(documentTemplates)
				.set({
					usageCount: sql`${documentTemplates.usageCount} + 1`,
				})
				.where(eq(documentTemplates.id, input.templateId));

			// Return template data and customization for document creation
			return {
				template: templateData,
				customization,
				success: true,
			};
		}),

	// Get user's template customizations
	getMyCustomizations: protectedProcedure
		.input(
			z.object({
				templateId: z.string().optional(),
				limit: z.number().default(20),
				offset: z.number().default(0),
			}),
		)
		.query(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			const conditions = [eq(userTemplateCustomizations.userId, userId)];
			if (input.templateId) {
				conditions.push(
					eq(userTemplateCustomizations.templateId, input.templateId),
				);
			}

			const customizations = await db
				.select({
					id: userTemplateCustomizations.id,
					templateId: userTemplateCustomizations.templateId,
					customName: userTemplateCustomizations.customName,
					description: userTemplateCustomizations.description,
					lastUsedAt: userTemplateCustomizations.lastUsedAt,
					timesUsed: userTemplateCustomizations.timesUsed,
					isShared: userTemplateCustomizations.isShared,
					createdAt: userTemplateCustomizations.createdAt,
					// Include template info
					templateName: documentTemplates.name,
					templateCategory: documentTemplates.category,
					templatePreviewUrl: documentTemplates.previewImageUrl,
				})
				.from(userTemplateCustomizations)
				.leftJoin(
					documentTemplates,
					eq(userTemplateCustomizations.templateId, documentTemplates.id),
				)
				.where(conditions.length > 1 ? and(...conditions) : conditions[0])
				.orderBy(desc(userTemplateCustomizations.lastUsedAt))
				.limit(input.limit)
				.offset(input.offset);

			return { customizations };
		}),

	// Create or update template customization
	saveCustomization: protectedProcedure
		.input(
			customizationSchema.extend({
				id: z.string().optional(), // For updates
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			const { id, templateId, ...customizationData } = input;

			// Verify template exists and user has access
			const template = await db
				.select()
				.from(documentTemplates)
				.where(
					and(
						eq(documentTemplates.id, templateId),
						eq(documentTemplates.isActive, true),
						eq(documentTemplates.isPublic, true),
					),
				)
				.limit(1);

			if (!template[0]) {
				throw new Error("Template not found");
			}

			if (id) {
				// Update existing customization
				await db
					.update(userTemplateCustomizations)
					.set({
						customName: customizationData.customName,
						description: customizationData.description,
						customizations:
							customizationData.customizations as (typeof userTemplateCustomizations.$inferInsert)["customizations"],
						isShared: customizationData.isShared ?? false,
						updatedAt: new Date(),
					})
					.where(
						and(
							eq(userTemplateCustomizations.id, id),
							eq(userTemplateCustomizations.userId, userId),
						),
					);

				return { id, success: true };
			}
			// Create new customization
			const [newCustomization] = await db
				.insert(userTemplateCustomizations)
				.values({
					userId,
					templateId,
					customName: customizationData.customName,
					description: customizationData.description,
					customizations:
						customizationData.customizations as (typeof userTemplateCustomizations.$inferInsert)["customizations"],
					isShared: customizationData.isShared ?? false,
				})
				.returning({ id: userTemplateCustomizations.id });

			return { id: newCustomization.id, success: true };
		}),

	// Delete customization
	deleteCustomization: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			await db
				.delete(userTemplateCustomizations)
				.where(
					and(
						eq(userTemplateCustomizations.id, input.id),
						eq(userTemplateCustomizations.userId, userId),
					),
				);

			return { success: true };
		}),

	// Rate template
	rateTemplate: protectedProcedure
		.input(
			z.object({
				templateId: z.string(),
				rating: z.number().min(1).max(5),
				feedback: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			// Record the rating
			await db.insert(templateUsage).values({
				userId,
				templateId: input.templateId,
				DocumentsType: "resume", // Would need to get actual type
				actionType: "preview",
				userRating: input.rating,
				feedback: input.feedback,
			});

			// Update template's average rating (simplified - would need proper calculation)
			const ratings = await db
				.select({ rating: templateUsage.userRating })
				.from(templateUsage)
				.where(
					and(
						eq(templateUsage.templateId, input.templateId),
						sql`${templateUsage.userRating} IS NOT NULL`,
					),
				);

			const totalRatings = ratings.length;
			const avgRating =
				ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings;

			await db
				.update(documentTemplates)
				.set({
					avgRating: avgRating.toFixed(2),
					totalRatings,
				})
				.where(eq(documentTemplates.id, input.templateId));

			return { success: true };
		}),
});
