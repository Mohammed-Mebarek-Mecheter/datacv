// admin-tags.ts
import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
// Tag management operations
import { z } from "zod";
import { db } from "../../db";
import { templateTagRelations, templateTags } from "../../db/schema/template-tags";
import { adminProcedure, router } from "../../lib/trpc";

const tagSchema = z.object({
	name: z.string().min(1),
	slug: z.string().optional(),
	description: z.string().optional(),
	color: z.string().default("#000000"),
	category: z.string().optional(),
	isSystemTag: z.boolean().default(false),
	parentTagId: z.string().optional(),
});

export const adminTagRouter = router({
	// Get all tags
	getTags: adminProcedure
		.input(
			z.object({
				category: z.string().optional(),
				isSystemTag: z.boolean().optional(),
				search: z.string().optional(),
				parentTagId: z.string().optional(),
				limit: z.number().default(100),
				offset: z.number().default(0),
			}),
		)
		.query(async ({ input }) => {
			const conditions: any[] = [sql`1=1`];

			if (input.category) {
				conditions.push(eq(templateTags.category, input.category));
			}
			if (input.isSystemTag !== undefined) {
				conditions.push(eq(templateTags.isSystemTag, input.isSystemTag));
			}
			if (input.search) {
				conditions.push(
					or(
						like(templateTags.name, `%${input.search}%`),
						like(templateTags.description, `%${input.search}%`),
					),
				);
			}
			if (input.parentTagId) {
				conditions.push(eq(templateTags.parentTagId, input.parentTagId));
			}

			const tags = await db
				.select({
					id: templateTags.id,
					name: templateTags.name,
					slug: templateTags.slug,
					description: templateTags.description,
					color: templateTags.color,
					category: templateTags.category,
					isSystemTag: templateTags.isSystemTag,
					usageCount: templateTags.usageCount,
					parentTagId: templateTags.parentTagId,
					createdAt: templateTags.createdAt,
				})
				.from(templateTags)
				.where(and(...conditions))
				.orderBy(desc(templateTags.usageCount), asc(templateTags.name))
				.limit(input.limit)
				.offset(input.offset);

			return { tags };
		}),

	// Create tag
	createTag: adminProcedure
		.input(tagSchema)
		.mutation(async ({ input, ctx }) => {
			const createdBy = ctx.session.user.id;

			// Generate slug if not provided
			const slug =
				input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

			const [newTag] = await db
				.insert(templateTags)
				.values({
					...input,
					slug,
					createdBy,
				})
				.returning();

			return {
				success: true,
				tag: newTag,
			};
		}),

	// Update tag
	updateTag: adminProcedure
		.input(
			tagSchema
				.extend({
					id: z.string(),
				})
				.partial()
				.required({ id: true }),
		)
		.mutation(async ({ input }) => {
			const { id, ...updateData } = input;

			// Generate slug if name is being updated
			if (updateData.name && !updateData.slug) {
				updateData.slug = updateData.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-");
			}

			await db
				.update(templateTags)
				.set({
					...updateData,
					updatedAt: new Date(),
				})
				.where(eq(templateTags.id, id));

			return { success: true };
		}),

	// Delete tag
	deleteTag: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			// Remove tag relations first
			await db
				.delete(templateTagRelations)
				.where(eq(templateTagRelations.tagId, input.id));

			// Delete tag
			await db.delete(templateTags).where(eq(templateTags.id, input.id));

			return { success: true };
		}),

	// Assign tags to template
	assignTagsToTemplate: adminProcedure
		.input(
			z.object({
				templateId: z.string(),
				tagIds: z.array(z.string()),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const createdBy = ctx.session.user.id;

			// Remove existing tag relations
			await db
				.delete(templateTagRelations)
				.where(eq(templateTagRelations.templateId, input.templateId));

			// Add new tag relations
			if (input.tagIds.length > 0) {
				const relations = input.tagIds.map((tagId) => ({
					templateId: input.templateId,
					tagId,
					createdBy,
				}));

				await db.insert(templateTagRelations).values(relations);

				// Update tag usage counts
				await db
					.update(templateTags)
					.set({
						usageCount: sql`${templateTags.usageCount} + 1`,
					})
					.where(inArray(templateTags.id, input.tagIds));
			}

			return { success: true };
		}),
});
