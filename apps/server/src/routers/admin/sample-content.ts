// apps/server/src/routes/admin/sample-content.ts
import { and, asc, count, desc, eq, inArray, like, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sampleContent } from "@/db/schema/sample-content";
import type { DataIndustry, DataSpecialization } from "@/lib/data-ai";
import { adminProcedure, router } from "@/lib/trpc";

const createSampleContentSchema = z.object({
	contentType: z.string().min(1, "Content type is required"),
	content: z.any(), // JSONB content
	targetIndustry: z.array(z.string()).optional(),
	targetSpecialization: z.array(z.string()).optional(),
	experienceLevel: z
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
	tags: z.array(z.string()).default([]),
});

const updateSampleContentSchema = createSampleContentSchema.partial();

const filterSchema = z.object({
	contentType: z.string().optional(),
	targetIndustry: z.string().optional(),
	targetSpecialization: z.string().optional(),
	experienceLevel: z
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
	search: z.string().optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
});

export const adminSampleContentRouter = router({
	// List sample content with filtering
	list: adminProcedure.input(filterSchema).query(async ({ input }) => {
		const {
			contentType,
			targetIndustry,
			targetSpecialization,
			experienceLevel,
			tags,
			search,
			page,
			limit,
		} = input;

		// Build where conditions
		const conditions = [];

		if (contentType) {
			conditions.push(eq(sampleContent.contentType, contentType));
		}

		if (targetIndustry) {
			conditions.push(
				sql`${sampleContent.targetIndustry}::jsonb @> ${JSON.stringify([targetIndustry])}::jsonb`,
			);
		}

		if (targetSpecialization) {
			conditions.push(
				sql`${sampleContent.targetSpecialization}::jsonb @> ${JSON.stringify([targetSpecialization])}::jsonb`,
			);
		}

		if (experienceLevel) {
			conditions.push(eq(sampleContent.experienceLevel, experienceLevel));
		}

		if (tags && tags.length > 0) {
			for (const tag of tags) {
				conditions.push(
					sql`${sampleContent.tags}::jsonb @> ${JSON.stringify([tag])}::jsonb`,
				);
			}
		}

		if (search) {
			conditions.push(like(sampleContent.content, `%${search}%`));
		}

		// Add pagination
		const offset = (page - 1) * limit;

		const results = await db
			.select()
			.from(sampleContent)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(sampleContent.createdAt))
			.limit(limit)
			.offset(offset);

		// Get total count for pagination
		const countResult = await db
			.select({ count: count() })
			.from(sampleContent)
			.where(conditions.length > 0 ? and(...conditions) : undefined);

		const totalCount = countResult[0]?.count || 0;

		return {
			data: results,
			pagination: {
				page,
				limit,
				total: totalCount,
				totalPages: Math.ceil(totalCount / limit),
			},
		};
	}),

	// Get specific sample content
	getById: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const { id } = input;

			const [result] = await db
				.select()
				.from(sampleContent)
				.where(eq(sampleContent.id, id));

			if (!result) {
				throw new Error("Sample content not found");
			}

			return { data: result };
		}),

	// Create new sample content
	create: adminProcedure
		.input(createSampleContentSchema)
		.mutation(async ({ input }) => {
			const [result] = await db
				.insert(sampleContent)
				.values({
					...input,
					targetIndustry: input.targetIndustry as DataIndustry[],
					targetSpecialization:
						input.targetSpecialization as DataSpecialization[],
				})
				.returning();

			return { data: result };
		}),

	getForTemplatePreview: adminProcedure
		.input(
			z.object({
				targetIndustry: z.string().optional(),
				targetSpecialization: z.string().optional(),
				experienceLevel: z.string().optional(),
				contentTypes: z.array(z.string()).optional(), // Specific section types needed
			}),
		)
		.query(async ({ input }) => {
			const conditions = [];

			if (input.targetIndustry) {
				conditions.push(
					sql`${sampleContent.targetIndustry}::jsonb @> ${JSON.stringify([input.targetIndustry])}::jsonb`,
				);
			}

			if (input.targetSpecialization) {
				conditions.push(
					sql`${sampleContent.targetSpecialization}::jsonb @> ${JSON.stringify([input.targetSpecialization])}::jsonb`,
				);
			}

			if (input.experienceLevel) {
				conditions.push(
					sql`${(sampleContent.experienceLevel, input.experienceLevel)}`,
				);
			}

			if (input.contentTypes?.length) {
				conditions.push(inArray(sampleContent.contentType, input.contentTypes));
			}

			const results = await db
				.select()
				.from(sampleContent)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(sampleContent.createdAt));

			// Group by content type for easy access
			const grouped = results.reduce(
				(acc, item) => {
					if (!acc[item.contentType]) acc[item.contentType] = [];
					acc[item.contentType].push(item);
					return acc;
				},
				{} as Record<string, typeof results>,
			);

			return { data: grouped };
		}),

	// Update sample content
	update: adminProcedure
		.input(z.object({ id: z.string() }).merge(updateSampleContentSchema))
		.mutation(async ({ input }) => {
			const { id, ...data } = input;

			const [result] = await db
				.update(sampleContent)
				.set({
					...data,
					targetIndustry: data.targetIndustry as DataIndustry[],
					targetSpecialization:
						data.targetSpecialization as DataSpecialization[],
					updatedAt: new Date(),
				})
				.where(eq(sampleContent.id, id))
				.returning();

			if (!result) {
				throw new Error("Sample content not found");
			}

			return { data: result };
		}),

	// Delete sample content
	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const { id } = input;

			const [result] = await db
				.delete(sampleContent)
				.where(eq(sampleContent.id, id))
				.returning();

			if (!result) {
				throw new Error("Sample content not found");
			}

			return { message: "Sample content deleted successfully" };
		}),

	// Get available content types
	getContentTypes: adminProcedure.query(async () => {
		const types = await db
			.selectDistinct({ contentType: sampleContent.contentType })
			.from(sampleContent)
			.orderBy(asc(sampleContent.contentType));

		return { data: types.map((t) => t.contentType) };
	}),
});
