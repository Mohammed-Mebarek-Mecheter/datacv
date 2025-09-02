// admin-templates.ts
// Pure Template CRUD & Management Operations

import {
	and,
	asc,
	count,
	desc,
	eq,
	gte,
	inArray,
	isNull,
	like,
	lte,
	or,
	sql,
} from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { documentTemplates } from "@/db/schema/document-templates";
import { userTemplateCustomizations } from "@/db/schema/template-customizations";
import { templateVersions } from "@/db/schema/template-versions";
import type {
	DataIndustry,
	DataSpecialization,
	DocumentsType,
} from "@/lib/data-ai";
import { adminProcedure, router } from "@/lib/trpc";

// Enhanced input schemas for admin operations
const sectionValidationSchema = z.object({
	minItems: z.number().optional(),
	requiredFields: z.array(z.string()).optional(),
	fieldTypes: z.record(z.string(), z.string()).optional(),
});

const conditionalVisibilitySchema = z.object({
	dependsOn: z.string().optional(),
	condition: z.enum(["exists", "empty", "equals"]).optional(),
	value: z.any().optional(),
});

const sectionSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.enum([
		"personal_info",
		"summary",
		"experience",
		"education",
		"skills",
		"projects",
		"custom",
	]),
	isRequired: z.boolean(),
	order: z.number(),
	description: z.string().optional(),
	maxItems: z.number().optional(),
	validation: sectionValidationSchema.optional(),
	conditionalVisibility: conditionalVisibilitySchema.optional(),
});

const customFieldSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.enum(["text", "textarea", "date", "url", "list"]),
	section: z.string(),
	order: z.number(),
	validation: z.any().optional(),
});

const templateStructureSchema = z.object({
	sections: z.array(sectionSchema),
	layout: z.object({
		columns: z.union([z.literal(1), z.literal(2)]),
		headerStyle: z.enum(["minimal", "standard", "prominent"]),
		pageMargins: z
			.object({
				top: z.number(),
				bottom: z.number(),
				left: z.number(),
				right: z.number(),
			})
			.optional(),
		sectionSpacing: z.number().optional(),
		allowReordering: z.boolean().optional(),
	}),
	customFields: z.array(customFieldSchema).optional(),
});

const enhancedDesignConfigSchema = z.object({
	colors: z.object({
		primary: z.string(),
		secondary: z.string().optional(),
		accent: z.string().optional(),
		text: z.string(),
		textSecondary: z.string().optional(),
		background: z.string(),
		border: z.string().optional(),
		variations: z
			.record(
				z.string(),
				z.object({
					primary: z.string(),
					secondary: z.string().optional(),
					accent: z.string().optional(),
				}),
			)
			.optional(),
	}),
	typography: z.object({
		fontFamily: z.string(),
		fontSize: z.number(),
		lineHeight: z.number().optional(),
		headingFontFamily: z.string().optional(),
		headingSizes: z
			.object({
				h1: z.number(),
				h2: z.number(),
				h3: z.number(),
			})
			.optional(),
		fontWeights: z
			.object({
				normal: z.number(),
				bold: z.number(),
				heading: z.number(),
			})
			.optional(),
		letterSpacing: z.number().optional(),
	}),
	spacing: z.object({
		sectionSpacing: z.number(),
		itemSpacing: z.number().optional(),
		paragraphSpacing: z.number().optional(),
		marginTop: z.number().optional(),
		marginBottom: z.number().optional(),
	}),
	borders: z
		.object({
			sectionDividers: z.boolean(),
			headerUnderline: z.boolean(),
			style: z.enum(["solid", "dotted", "dashed"]),
			width: z.number(),
			radius: z.number().optional(),
		})
		.optional(),
	layout: z
		.object({
			maxWidth: z.string().optional(),
			columnGap: z.number().optional(),
			rowGap: z.number().optional(),
			alignment: z.enum(["left", "center", "right"]).optional(),
		})
		.optional(),
	effects: z
		.object({
			shadows: z.boolean().optional(),
			animations: z.boolean().optional(),
			gradients: z.boolean().optional(),
		})
		.optional(),
});

const createTemplateSchema = z.object({
	name: z.string().min(1, "Template name is required"),
	description: z.string().optional(),
	category: z.enum(["professional", "modern", "creative", "academic"]),
	documentType: z.enum([
		"resume",
		"cv",
		"cover_letter",
	]) as z.ZodType<DocumentsType>,

	// Template inheritance
	parentTemplateId: z.string().optional(),
	isBaseTemplate: z.boolean().default(false),

	// Target audience
	targetSpecialization: z.array(z.string()).optional() as z.ZodOptional<
		z.ZodType<DataSpecialization[]>
	>,
	targetIndustries: z.array(z.string()).optional() as z.ZodOptional<
		z.ZodType<DataIndustry[]>
	>,
	targetExperienceLevel: z
		.enum([
			"entry",
			"junior",
			"mid",
			"senior",
			"lead",
			"principal",
			"executive",
		])
		.optional(),

	// Template structure
	templateStructure: templateStructureSchema,
	designConfig: enhancedDesignConfigSchema,

	// Component management
	componentCode: z.string().optional(),
	componentPath: z.string().optional(),
	componentVersion: z.string().default("1.0.0"),

	// Preview and SEO
	previewImageUrl: z.string().optional(),
	previewImages: z
		.object({
			desktop: z.string().optional(),
			mobile: z.string().optional(),
			thumbnail: z.string().optional(),
			variations: z.record(z.string(), z.string()).optional(),
		})
		.optional(),
	previewImageAlt: z.string().optional(),
	seoTitle: z.string().optional(),
	seoDescription: z.string().optional(),

	// Tags and keywords
	tags: z.array(z.string()).optional(),
	searchKeywords: z.string().optional(),

	// Settings
	isPremium: z.boolean().default(false),
	isActive: z.boolean().default(true),
	isPublic: z.boolean().default(true),
	isDraft: z.boolean().default(false),
	isFeatured: z.boolean().default(false),
	featuredOrder: z.number().optional(),
	featuredUntil: z.date().optional(),
	version: z.string().default("1.0.0"),

	// Quality assurance
	reviewStatus: z.enum(["pending", "approved", "rejected"]).default("pending"),
	reviewNotes: z.string().optional(),
});

const updateTemplateSchema = createTemplateSchema
	.extend({
		id: z.string(),
	})
	.partial()
	.required({ id: true });

const templateVersionSchema = z.object({
	templateId: z.string(),
	versionNumber: z.string(),
	versionType: z.enum(["major", "minor", "patch"]).default("minor"),
	changelogNotes: z.string().optional(),
	isBreaking: z.boolean().default(false),
	deprecatedFeatures: z.array(z.string()).optional(),
	migrationNotes: z.string().optional(),
	backwardCompatible: z.boolean().default(true),
	isPublished: z.boolean().default(false),
	publishedAt: z.date().optional(),
});

export const adminTemplateRouter = router({
	// ===== TEMPLATE LISTING & FILTERING =====

	// Get all templates with enhanced filtering
	getTemplates: adminProcedure
		.input(
			z.object({
				documentType: z.enum(["resume", "cv", "cover_letter"]).optional(),
				category: z
					.enum(["professional", "modern", "creative", "academic"])
					.optional(),
				isActive: z.boolean().optional(),
				isDraft: z.boolean().optional(),
				reviewStatus: z.enum(["pending", "approved", "rejected"]).optional(),
				hasParent: z.boolean().optional(),
				isBaseTemplate: z.boolean().optional(),
				isFeatured: z.boolean().optional(),
				search: z.string().optional(),
				tags: z.array(z.string()).optional(),
				createdBy: z.string().optional(),
				dateRange: z
					.object({
						from: z.date().optional(),
						to: z.date().optional(),
					})
					.optional(),
				qualityScoreMin: z.number().optional(),
				usageCountMin: z.number().optional(),
				avgRatingMin: z.number().optional(),
				targetExperienceLevel: z.string().optional(),
				targetIndustries: z.string().optional(),
				targetSpecialization: z.string().optional(),
				sortBy: z
					.enum(["name", "created", "updated", "usage", "rating", "quality"])
					.default("updated"),
				sortOrder: z.enum(["asc", "desc"]).default("desc"),
				limit: z.number().default(50),
				offset: z.number().default(0),
			}),
		)
		.query(async ({ input }) => {
			const conditions: any[] = [sql`1=1`];

			// Apply filters
			if (input.documentType) {
				conditions.push(
					eq(documentTemplates.DocumentsType, input.documentType),
				);
			}
			if (input.category) {
				conditions.push(eq(documentTemplates.category, input.category));
			}
			if (input.isActive !== undefined) {
				conditions.push(eq(documentTemplates.isActive, input.isActive));
			}
			if (input.isDraft !== undefined) {
				conditions.push(eq(documentTemplates.isDraft, input.isDraft));
			}
			if (input.reviewStatus) {
				conditions.push(eq(documentTemplates.reviewStatus, input.reviewStatus));
			}
			if (input.hasParent !== undefined) {
				if (input.hasParent) {
					conditions.push(
						sql`${documentTemplates.parentTemplateId} IS NOT NULL`,
					);
				} else {
					conditions.push(isNull(documentTemplates.parentTemplateId));
				}
			}
			if (input.isBaseTemplate !== undefined) {
				conditions.push(
					eq(documentTemplates.isBaseTemplate, input.isBaseTemplate),
				);
			}
			if (input.isFeatured !== undefined) {
				conditions.push(eq(documentTemplates.isFeatured, input.isFeatured));
			}
			if (input.qualityScoreMin !== undefined) {
				conditions.push(
					gte(documentTemplates.qualityScore, input.qualityScoreMin),
				);
			}
			if (input.usageCountMin !== undefined) {
				conditions.push(gte(documentTemplates.usageCount, input.usageCountMin));
			}
			if (input.avgRatingMin !== undefined) {
				conditions.push(
					sql`${documentTemplates.avgRating} >= ${input.avgRatingMin}`,
				);
			}
			if (input.targetExperienceLevel) {
				conditions.push(
					sql`${documentTemplates.targetExperienceLevel} = ${input.targetExperienceLevel}::text`,
				);
			}
			if (input.targetIndustries) {
				conditions.push(
					sql`${documentTemplates.targetIndustries} @> ${JSON.stringify([input.targetIndustries])}`,
				);
			}
			if (input.targetSpecialization) {
				conditions.push(
					sql`${documentTemplates.targetSpecialization} @> ${JSON.stringify([input.targetSpecialization])}`,
				);
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
			if (input.createdBy) {
				conditions.push(eq(documentTemplates.createdBy, input.createdBy));
			}
			if (input.dateRange?.from) {
				conditions.push(gte(documentTemplates.createdAt, input.dateRange.from));
			}
			if (input.dateRange?.to) {
				conditions.push(lte(documentTemplates.createdAt, input.dateRange.to));
			}

			// Determine sort order
			let orderBy;
			const direction = input.sortOrder === "asc" ? asc : desc;
			switch (input.sortBy) {
				case "name":
					orderBy = direction(documentTemplates.name);
					break;
				case "created":
					orderBy = direction(documentTemplates.createdAt);
					break;
				case "usage":
					orderBy = direction(documentTemplates.usageCount);
					break;
				case "rating":
					orderBy = direction(documentTemplates.avgRating);
					break;
				default:
					orderBy = direction(documentTemplates.updatedAt);
			}

			const templates = await db
				.select({
					id: documentTemplates.id,
					name: documentTemplates.name,
					description: documentTemplates.description,
					category: documentTemplates.category,
					documentType: documentTemplates.DocumentsType,
					parentTemplateId: documentTemplates.parentTemplateId,
					isBaseTemplate: documentTemplates.isBaseTemplate,
					targetSpecialization: documentTemplates.targetSpecialization,
					targetIndustries: documentTemplates.targetIndustries,
					targetExperienceLevel: documentTemplates.targetExperienceLevel,
					previewImageUrl: documentTemplates.previewImageUrl,
					tags: documentTemplates.tags,
					isPremium: documentTemplates.isPremium,
					isActive: documentTemplates.isActive,
					isDraft: documentTemplates.isDraft,
					isFeatured: documentTemplates.isFeatured,
					reviewStatus: documentTemplates.reviewStatus,
					qualityScore: documentTemplates.qualityScore,
					usageCount: documentTemplates.usageCount,
					avgRating: documentTemplates.avgRating,
					version: documentTemplates.version,
					createdBy: documentTemplates.createdBy,
					createdAt: documentTemplates.createdAt,
					updatedAt: documentTemplates.updatedAt,
				})
				.from(documentTemplates)
				.where(and(...conditions))
				.orderBy(orderBy)
				.limit(input.limit)
				.offset(input.offset);

			// Get total count
			const [{ total }] = await db
				.select({ total: count() })
				.from(documentTemplates)
				.where(and(...conditions));

			return {
				templates,
				totalCount: total,
			};
		}),

	// ===== INDIVIDUAL TEMPLATE OPERATIONS =====

	// Get specific template with full details including versions
	getTemplate: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const [template] = await db
				.select()
				.from(documentTemplates)
				.where(eq(documentTemplates.id, input.id))
				.limit(1);

			if (!template) {
				throw new Error("Template not found");
			}

			// Get template versions
			const versions = await db
				.select({
					id: templateVersions.id,
					versionNumber: templateVersions.versionNumber,
					versionType: templateVersions.versionType,
					changelogNotes: templateVersions.changelogNotes,
					isBreaking: templateVersions.isBreaking,
					createdBy: templateVersions.createdBy,
					createdAt: templateVersions.createdAt,
				})
				.from(templateVersions)
				.where(eq(templateVersions.templateId, input.id))
				.orderBy(desc(templateVersions.createdAt));

			// Get parent template if exists
			let parentTemplate = null;
			if (template.parentTemplateId) {
				[parentTemplate] = await db
					.select({
						id: documentTemplates.id,
						name: documentTemplates.name,
						version: documentTemplates.version,
					})
					.from(documentTemplates)
					.where(eq(documentTemplates.id, template.parentTemplateId))
					.limit(1);
			}

			// Get child templates
			const childTemplates = await db
				.select({
					id: documentTemplates.id,
					name: documentTemplates.name,
					version: documentTemplates.version,
					isActive: documentTemplates.isActive,
				})
				.from(documentTemplates)
				.where(eq(documentTemplates.parentTemplateId, input.id));

			return {
				template,
				versions,
				parentTemplate,
				childTemplates,
			};
		}),

	// ===== TEMPLATE CREATION & UPDATES =====

	// Create new template with enhanced validation
	createTemplate: adminProcedure
		.input(createTemplateSchema)
		.mutation(async ({ input, ctx }) => {
			const createdBy = ctx.session.user.id;

			// Validate parent template if specified
			if (input.parentTemplateId) {
				const [parentTemplate] = await db
					.select({ id: documentTemplates.id })
					.from(documentTemplates)
					.where(eq(documentTemplates.id, input.parentTemplateId))
					.limit(1);

				if (!parentTemplate) {
					throw new Error("Parent template not found");
				}
			}

			const [newTemplate] = await db
				.insert(documentTemplates)
				.values({
					name: input.name,
					description: input.description,
					category: input.category,
					DocumentsType: input.documentType,
					parentTemplateId: input.parentTemplateId,
					isBaseTemplate: input.isBaseTemplate,
					targetSpecialization: input.targetSpecialization,
					targetIndustries: input.targetIndustries,
					targetExperienceLevel: input.targetExperienceLevel,
					templateStructure: input.templateStructure as any,
					designConfig: input.designConfig as any,
					componentCode: input.componentCode,
					componentPath: input.componentPath,
					componentVersion: input.componentVersion,
					previewImageUrl: input.previewImageUrl,
					previewImages: input.previewImages as any,
					previewImageAlt: input.previewImageAlt,
					seoTitle: input.seoTitle,
					seoDescription: input.seoDescription,
					tags: input.tags || [],
					searchKeywords: input.searchKeywords,
					isPremium: input.isPremium,
					isActive: input.isActive,
					isPublic: input.isPublic,
					isDraft: input.isDraft,
					isFeatured: input.isFeatured,
					featuredOrder: input.featuredOrder,
					featuredUntil: input.featuredUntil,
					version: input.version,
					reviewStatus: input.reviewStatus,
					reviewNotes: input.reviewNotes,
					createdBy,
					updatedBy: createdBy,
				})
				.returning();

			// Create initial version
			await db.insert(templateVersions).values({
				templateId: newTemplate.id,
				versionNumber: input.version,
				versionType: "major",
				snapshot: {
					name: input.name,
					description: input.description,
					templateStructure: input.templateStructure,
					designConfig: input.designConfig,
					componentCode: input.componentCode,
					tags: input.tags || [],
				},
				changelogNotes: "Initial template version",
				createdBy,
			} as typeof templateVersions.$inferInsert);

			return {
				success: true,
				template: newTemplate,
			};
		}),

	// Update existing template with version tracking
	updateTemplate: adminProcedure
		.input(updateTemplateSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, ...updateData } = input;
			const updatedBy = ctx.session.user.id;

			// Get current template for version comparison
			const [currentTemplate] = await db
				.select()
				.from(documentTemplates)
				.where(eq(documentTemplates.id, id))
				.limit(1);

			if (!currentTemplate) {
				throw new Error("Template not found");
			}

			// Prepare update data
			const mappedData: any = {
				updatedBy,
				updatedAt: new Date(),
			};

			// Map all possible update fields
			Object.entries(updateData).forEach(([key, value]) => {
				if (value !== undefined) {
					switch (key) {
						case "documentType":
							mappedData.DocumentsType = value;
							break;
						case "targetSpecialization":
						case "targetIndustries":
							mappedData[key] = value;
							break;
						case "targetExperienceLevel":
							mappedData[key] = value;
							break;
						case "templateStructure":
						case "designConfig":
						case "previewImages":
							mappedData[key] = value as any;
							break;
						default:
							mappedData[key] = value;
					}
				}
			});

			// Update template
			await db
				.update(documentTemplates)
				.set(mappedData)
				.where(eq(documentTemplates.id, id));

			// Check if this warrants a new version
			const significantChanges = [
				"templateStructure",
				"designConfig",
				"componentCode",
				"version",
			].some(
				(field) => (updateData as Record<string, unknown>)[field] !== undefined,
			);

			if (
				significantChanges &&
				updateData.version &&
				updateData.version !== currentTemplate.version
			) {
				// Create new version
				await db.insert(templateVersions).values({
					templateId: id,
					versionNumber: updateData.version as string,
					versionType: "minor", // Could be determined by semver logic
					snapshot: {
						name: updateData.name || currentTemplate.name,
						description: updateData.description || currentTemplate.description,
						templateStructure:
							updateData.templateStructure || currentTemplate.templateStructure,
						designConfig:
							updateData.designConfig || currentTemplate.designConfig,
						componentCode:
							updateData.componentCode || currentTemplate.componentCode,
						tags: updateData.tags || currentTemplate.tags,
					},
					changelogNotes: `Updated to version ${updateData.version}`,
					createdBy: updatedBy,
				} as typeof templateVersions.$inferInsert);
			}

			return { success: true };
		}),

	// ===== TEMPLATE DUPLICATION & DERIVATION =====

	// Enhanced template duplication with customization
	duplicateTemplate: adminProcedure
		.input(
			z.object({
				templateId: z.string(),
				name: z.string(),
				description: z.string().optional(),
				category: z
					.enum(["professional", "modern", "creative", "academic"])
					.optional(),
				setAsChildTemplate: z.boolean().default(false),
				designConfigOverrides: enhancedDesignConfigSchema.partial().optional(),
				templateStructureOverrides: templateStructureSchema
					.partial()
					.optional(),
				tags: z.array(z.string()).optional(),
				targetSpecialization: z.string().optional(),
				targetIndustries: z.string().optional(),
				targetExperienceLevel: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const createdBy = ctx.session.user.id;

			// Get original template
			const [originalTemplate] = await db
				.select()
				.from(documentTemplates)
				.where(eq(documentTemplates.id, input.templateId))
				.limit(1);

			if (!originalTemplate) {
				throw new Error("Template not found");
			}

			// Merge overrides
			const designConfig = input.designConfigOverrides
				? { ...originalTemplate.designConfig, ...input.designConfigOverrides }
				: originalTemplate.designConfig;

			const templateStructure = input.templateStructureOverrides
				? {
						...originalTemplate.templateStructure,
						...input.templateStructureOverrides,
					}
				: originalTemplate.templateStructure;

			// Create new template
			const [newTemplate] = await db
				.insert(documentTemplates)
				.values({
					...originalTemplate,
					id: undefined, // Remove ID to create new template
					name: input.name,
					description: input.description || originalTemplate.description,
					category: input.category || originalTemplate.category,
					parentTemplateId: input.setAsChildTemplate ? input.templateId : null,
					designConfig: designConfig as any,
					templateStructure: templateStructure as any,
					tags: input.tags || originalTemplate.tags,
					targetSpecialization:
						(input.targetSpecialization as any) ||
						originalTemplate.targetSpecialization,
					targetIndustries:
						(input.targetIndustries as any) ||
						originalTemplate.targetIndustries,
					targetExperienceLevel:
						(input.targetExperienceLevel as any) ||
						originalTemplate.targetExperienceLevel,
					version: "1.0.0",
					isDraft: true, // Start as draft
					reviewStatus: "pending",
					createdBy,
					updatedBy: createdBy,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			return {
				success: true,
				template: newTemplate,
			};
		}),

	// Create template from base template
	createTemplateFromBase: adminProcedure
		.input(
			z.object({
				baseTemplateId: z.string(),
				name: z.string(),
				description: z.string().optional(),
				overrides: z
					.object({
						category: z
							.enum(["professional", "modern", "creative", "academic"])
							.optional(),
						designConfig: enhancedDesignConfigSchema.partial().optional(),
						templateStructure: templateStructureSchema.partial().optional(),
						targetSpecialization: z.array(z.string()).optional(),
						targetIndustries: z.array(z.string()).optional(),
						targetExperienceLevel: z
							.enum([
								"entry",
								"junior",
								"mid",
								"senior",
								"lead",
								"principal",
								"executive",
							])
							.optional(),
						tags: z.array(z.string()).optional(),
					})
					.optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const createdBy = ctx.session.user.id;

			// Get base template
			const [baseTemplate] = await db
				.select()
				.from(documentTemplates)
				.where(eq(documentTemplates.id, input.baseTemplateId))
				.limit(1);

			if (!baseTemplate) {
				throw new Error("Base template not found");
			}

			// Merge overrides with base template
			const newTemplateData = {
				...baseTemplate,
				id: undefined, // Remove ID to create new template
				name: input.name,
				description: input.description || baseTemplate.description,
				parentTemplateId: input.baseTemplateId,
				category: input.overrides?.category || baseTemplate.category,
				designConfig: input.overrides?.designConfig
					? { ...baseTemplate.designConfig, ...input.overrides.designConfig }
					: baseTemplate.designConfig,
				templateStructure: input.overrides?.templateStructure
					? {
							...baseTemplate.templateStructure,
							...input.overrides.templateStructure,
						}
					: baseTemplate.templateStructure,
				targetSpecialization:
					input.overrides?.targetSpecialization ||
					baseTemplate.targetSpecialization,
				targetIndustries:
					input.overrides?.targetIndustries || baseTemplate.targetIndustries,
				targetExperienceLevel:
					input.overrides?.targetExperienceLevel ||
					baseTemplate.targetExperienceLevel,
				tags: input.overrides?.tags || baseTemplate.tags,
				version: "1.0.0", // Reset version for new template
				createdBy,
				updatedBy: createdBy,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const [newTemplate] = await db
				.insert(documentTemplates)
				.values(newTemplateData as any)
				.returning();

			return {
				success: true,
				template: newTemplate,
			};
		}),

	generatePreviewImages: adminProcedure
		.input(
			z.object({
				templateId: z.string(),
				regenerate: z.boolean().default(false),
			}),
		)
		.mutation(async ({ input }) => {
			// This would integrate with a service like Puppeteer or Playwright
			// to generate actual preview images of the rendered template

			const [template] = await db
				.select()
				.from(documentTemplates)
				.where(eq(documentTemplates.id, input.templateId))
				.limit(1);

			if (!template) {
				throw new Error("Template not found");
			}

			// Generate preview URLs (implementation depends on your image service)
			const previewImages = {
				desktop: `/api/previews/${input.templateId}/desktop.png`,
				mobile: `/api/previews/${input.templateId}/mobile.png`,
				thumbnail: `/api/previews/${input.templateId}/thumb.png`,
			};

			// Update template with generated preview URLs
			await db
				.update(documentTemplates)
				.set({
					previewImages: previewImages as any,
					previewImageUrl: previewImages.desktop,
					updatedAt: new Date(),
				})
				.where(eq(documentTemplates.id, input.templateId));

			return { success: true, previewImages };
		}),

	// ===== TEMPLATE VALIDATION =====

	// Validate template structure before saving
	validateTemplateStructure: adminProcedure
		.input(
			z.object({
				templateStructure: templateStructureSchema,
				sampleContent: z.any().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const issues: string[] = [];
			const warnings: string[] = [];

			const { sections, layout } = input.templateStructure;

			// Validate section structure
			const sectionIds = sections.map((s) => s.id);
			const duplicateIds = sectionIds.filter(
				(id, index) => sectionIds.indexOf(id) !== index,
			);
			if (duplicateIds.length > 0) {
				issues.push(`Duplicate section IDs: ${duplicateIds.join(", ")}`);
			}

			// Check for required sections
			type SectionType = z.infer<typeof sectionSchema>["type"];
			const requiredSectionTypes: SectionType[] = ["personal_info"];
			const presentTypes = sections.map((s) => s.type as SectionType);
			const missingRequired = requiredSectionTypes.filter(
				(type) => !presentTypes.includes(type),
			);
			if (missingRequired.length > 0) {
				issues.push(`Missing required sections: ${missingRequired.join(", ")}`);
			}

			// Validate section ordering
			const orders = sections.map((s) => s.order).sort((a, b) => a - b);
			for (let i = 0; i < orders.length - 1; i++) {
				if (orders[i] === orders[i + 1]) {
					warnings.push(`Duplicate section order: ${orders[i]}`);
				}
			}

			// Validate layout
			if (layout.columns > 2) {
				warnings.push(
					"More than 2 columns may not render well on mobile devices",
				);
			}

			// Validate sample content against structure if provided
			if (input.sampleContent) {
				const sampleSections = Object.keys(input.sampleContent);
				const structureSectionTypes = sections.map((s) => s.type) as string[];

				const extraSampleSections = sampleSections.filter(
					(section) =>
						!structureSectionTypes.includes(section) && section !== "custom",
				);
				if (extraSampleSections.length > 0) {
					warnings.push(
						`Sample content has sections not in structure: ${extraSampleSections.join(", ")}`,
					);
				}
			}

			return {
				isValid: issues.length === 0,
				issues,
				warnings,
			};
		}),

	// ===== VERSION MANAGEMENT =====

	// Get template versions
	getTemplateVersions: adminProcedure
		.input(
			z.object({
				templateId: z.string(),
				limit: z.number().default(20),
				offset: z.number().default(0),
			}),
		)
		.query(async ({ input }) => {
			const versions = await db
				.select({
					id: templateVersions.id,
					versionNumber: templateVersions.versionNumber,
					versionType: templateVersions.versionType,
					changelogNotes: templateVersions.changelogNotes,
					isBreaking: templateVersions.isBreaking,
					backwardCompatible: templateVersions.backwardCompatible,
					isPublished: templateVersions.isPublished,
					publishedAt: templateVersions.publishedAt,
					createdBy: templateVersions.createdBy,
					createdAt: templateVersions.createdAt,
					// Include creator name
					creatorName: user.name,
				})
				.from(templateVersions)
				.leftJoin(user, eq(templateVersions.createdBy, user.id))
				.where(eq(templateVersions.templateId, input.templateId))
				.orderBy(desc(templateVersions.createdAt))
				.limit(input.limit)
				.offset(input.offset);

			return { versions };
		}),

	// Get specific version details
	getTemplateVersion: adminProcedure
		.input(
			z.object({
				versionId: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const [version] = await db
				.select()
				.from(templateVersions)
				.where(eq(templateVersions.id, input.versionId))
				.limit(1);

			if (!version) {
				throw new Error("Version not found");
			}

			return { version };
		}),

	// Create new template version
	createTemplateVersion: adminProcedure
		.input(templateVersionSchema)
		.mutation(async ({ input, ctx }) => {
			const createdBy = ctx.session.user.id;

			// Get current template data for snapshot
			const [template] = await db
				.select()
				.from(documentTemplates)
				.where(eq(documentTemplates.id, input.templateId))
				.limit(1);

			if (!template) {
				throw new Error("Template not found");
			}

			const [newVersion] = await db
				.insert(templateVersions)
				.values({
					...input,
					snapshot: {
						name: template.name,
						description: template.description,
						templateStructure: template.templateStructure,
						designConfig: template.designConfig,

						tags: template.tags,
					},
					createdBy,
				} as typeof templateVersions.$inferInsert)
				.returning();

			return {
				success: true,
				version: newVersion,
			};
		}),

	// Publish template version
	publishTemplateVersion: adminProcedure
		.input(
			z.object({
				versionId: z.string(),
				unpublishOthers: z.boolean().default(true),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const updatedBy = ctx.session.user.id;

			// Get version details
			const [version] = await db
				.select()
				.from(templateVersions)
				.where(eq(templateVersions.id, input.versionId))
				.limit(1);

			if (!version) {
				throw new Error("Version not found");
			}

			// Unpublish other versions if requested
			if (input.unpublishOthers) {
				await db
					.update(templateVersions)
					.set({
						isPublished: false,
						publishedAt: null,
					})
					.where(eq(templateVersions.templateId, version.templateId));
			}

			// Publish this version
			await db
				.update(templateVersions)
				.set({
					isPublished: true,
					publishedAt: new Date(),
				})
				.where(eq(templateVersions.id, input.versionId));

			return { success: true };
		}),

	// Revert template to specific version
	revertToTemplateVersion: adminProcedure
		.input(
			z.object({
				templateId: z.string(),
				versionId: z.string(),
				createBackup: z.boolean().default(true),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const updatedBy = ctx.session.user.id;

			// Get version data
			const [version] = await db
				.select()
				.from(templateVersions)
				.where(eq(templateVersions.id, input.versionId))
				.limit(1);

			if (!version || version.templateId !== input.templateId) {
				throw new Error("Version not found or doesn't belong to template");
			}

			// Create backup if requested
			if (input.createBackup) {
				const [currentTemplate] = await db
					.select()
					.from(documentTemplates)
					.where(eq(documentTemplates.id, input.templateId))
					.limit(1);

				if (currentTemplate) {
					await db.insert(templateVersions).values({
						templateId: input.templateId,
						versionNumber: `${currentTemplate.version}-backup-${Date.now()}`,
						versionType: "patch",
						snapshot: {
							name: currentTemplate.name,
							description: currentTemplate.description,
							templateStructure: currentTemplate.templateStructure,
							designConfig: currentTemplate.designConfig,
							componentCode: currentTemplate.componentCode,
							tags: currentTemplate.tags,
						},
						changelogNotes: "Backup before reverting to older version",
						createdBy: updatedBy,
					} as typeof templateVersions.$inferInsert);
				}
			}

			// Apply version data to template
			const versionData = version.snapshot;
			await db
				.update(documentTemplates)
				.set({
					name: versionData.name,
					description: versionData.description,
					templateStructure: versionData.templateStructure as any,
					designConfig: versionData.designConfig as any,
					componentCode: versionData.componentCode,
					tags: versionData.tags,
					version: version.versionNumber,
					updatedBy,
					updatedAt: new Date(),
				})
				.where(eq(documentTemplates.id, input.templateId));

			return { success: true };
		}),

	// ===== TEMPLATE DELETION =====

	// Delete template (enhanced with safety checks)
	deleteTemplate: adminProcedure
		.input(
			z.object({
				id: z.string(),
				hardDelete: z.boolean().default(false),
				transferDependenciesTo: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			// Check for dependencies
			const [childTemplates] = await db
				.select({ count: count() })
				.from(documentTemplates)
				.where(eq(documentTemplates.parentTemplateId, input.id));

			const [customizations] = await db
				.select({ count: count() })
				.from(userTemplateCustomizations)
				.where(eq(userTemplateCustomizations.templateId, input.id));

			if (childTemplates.count > 0 || customizations.count > 0) {
				if (!input.transferDependenciesTo && input.hardDelete) {
					throw new Error(
						`Cannot delete template with dependencies. Found ${childTemplates.count} child templates and ${customizations.count} customizations.`,
					);
				}

				// Transfer dependencies if specified
				if (input.transferDependenciesTo) {
					await db
						.update(documentTemplates)
						.set({ parentTemplateId: input.transferDependenciesTo })
						.where(eq(documentTemplates.parentTemplateId, input.id));

					await db
						.update(userTemplateCustomizations)
						.set({ templateId: input.transferDependenciesTo })
						.where(eq(userTemplateCustomizations.templateId, input.id));
				}
			}

			if (input.hardDelete) {
				// Delete all related data
				await db
					.delete(templateVersions)
					.where(eq(templateVersions.templateId, input.id));
				await db
					.delete(documentTemplates)
					.where(eq(documentTemplates.id, input.id));
			} else {
				// Soft delete
				await db
					.update(documentTemplates)
					.set({
						isActive: false,
						updatedAt: new Date(),
					})
					.where(eq(documentTemplates.id, input.id));
			}

			return { success: true };
		}),

	// ===== BULK OPERATIONS =====

	// Bulk update templates (non-analytics)
	bulkUpdateTemplates: adminProcedure
		.input(
			z.object({
				templateIds: z.array(z.string()),
				updates: z.object({
					isActive: z.boolean().optional(),
					isPremium: z.boolean().optional(),
					isFeatured: z.boolean().optional(),
					reviewStatus: z.enum(["pending", "approved", "rejected"]).optional(),
					category: z
						.enum(["professional", "modern", "creative", "academic"])
						.optional(),
					tags: z.array(z.string()).optional(),
					targetSpecialization: z.array(z.string()).optional() as z.ZodOptional<
						z.ZodType<DataSpecialization[]>
					>,
					targetIndustries: z.array(z.string()).optional() as z.ZodOptional<
						z.ZodType<DataIndustry[]>
					>,
					targetExperienceLevel: z
						.enum([
							"entry",
							"junior",
							"mid",
							"senior",
							"lead",
							"principal",
							"executive",
						])
						.optional(),
					version: z.string().optional(),
				}),
				createVersions: z.boolean().default(false),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const updatedBy = ctx.session.user.id;

			// If creating versions for significant changes
			if (
				input.createVersions &&
				(input.updates.version || input.updates.category)
			) {
				for (const templateId of input.templateIds) {
					const [currentTemplate] = await db
						.select()
						.from(documentTemplates)
						.where(eq(documentTemplates.id, templateId))
						.limit(1);

					if (currentTemplate) {
						await db.insert(templateVersions).values({
							templateId,
							versionNumber:
								input.updates.version ||
								`${currentTemplate.version}-bulk-update`,
							versionType: "minor",
							snapshot: {
								name: currentTemplate.name,
								description: currentTemplate.description,
								templateStructure: currentTemplate.templateStructure,
								designConfig: currentTemplate.designConfig,
								componentCode: currentTemplate.componentCode,
								tags: currentTemplate.tags,
							},
							changelogNotes: "Bulk update applied",
							createdBy: updatedBy,
						} as typeof templateVersions.$inferInsert);
					}
				}
			}

			// Apply bulk updates
			const updatesToApply = {
				...input.updates,
				updatedBy,
				updatedAt: new Date(),
			};

			// Convert single values to arrays for targetSpecialization and targetIndustries
			if (
				updatesToApply.targetSpecialization &&
				!Array.isArray(updatesToApply.targetSpecialization)
			) {
				updatesToApply.targetSpecialization = [
					updatesToApply.targetSpecialization,
				];
			}
			if (
				updatesToApply.targetIndustries &&
				!Array.isArray(updatesToApply.targetIndustries)
			) {
				updatesToApply.targetIndustries = [updatesToApply.targetIndustries];
			}

			await db
				.update(documentTemplates)
				.set(updatesToApply)
				.where(inArray(documentTemplates.id, input.templateIds));

			return { success: true, updated: input.templateIds.length };
		}),

	// Bulk delete with dependency handling
	bulkDeleteTemplates: adminProcedure
		.input(
			z.object({
				templateIds: z.array(z.string()),
				hardDelete: z.boolean().default(false),
				transferDependenciesTo: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			let successCount = 0;
			const errors: string[] = [];

			for (const templateId of input.templateIds) {
				try {
					// Check for dependencies
					const [childTemplates] = await db
						.select({ count: count() })
						.from(documentTemplates)
						.where(eq(documentTemplates.parentTemplateId, templateId));

					const [customizations] = await db
						.select({ count: count() })
						.from(userTemplateCustomizations)
						.where(eq(userTemplateCustomizations.templateId, templateId));

					if (
						(childTemplates.count > 0 || customizations.count > 0) &&
						!input.transferDependenciesTo &&
						input.hardDelete
					) {
						errors.push(
							`Template ${templateId}: Cannot delete with dependencies (${childTemplates.count} children, ${customizations.count} customizations)`,
						);
						continue;
					}

					// Transfer dependencies if specified
					if (input.transferDependenciesTo) {
						await db
							.update(documentTemplates)
							.set({ parentTemplateId: input.transferDependenciesTo })
							.where(eq(documentTemplates.parentTemplateId, templateId));

						await db
							.update(userTemplateCustomizations)
							.set({ templateId: input.transferDependenciesTo })
							.where(eq(userTemplateCustomizations.templateId, templateId));
					}

					if (input.hardDelete) {
						await db
							.delete(templateVersions)
							.where(eq(templateVersions.templateId, templateId));
						await db
							.delete(documentTemplates)
							.where(eq(documentTemplates.id, templateId));
					} else {
						await db
							.update(documentTemplates)
							.set({
								isActive: false,
								updatedAt: new Date(),
							})
							.where(eq(documentTemplates.id, templateId));
					}

					successCount++;
				} catch (error) {
					errors.push(
						`Template ${templateId}: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}

			return {
				success: successCount > 0,
				successCount,
				errors,
			};
		}),
});
