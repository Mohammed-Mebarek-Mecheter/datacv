// admin-collections.ts

// Collection management operations

import { and, asc, count, eq, inArray, like, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
	templateCollectionItems,
	templateCollections,
} from "@/db/schema/template-collections";
import { adminProcedure, router } from "@/lib/trpc";

const collectionSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	slug: z.string().optional(),
	coverImageUrl: z.string().optional(),
	color: z.string().default("#000000"),
	icon: z.string().optional(),
	order: z.number().default(0),
	parentCollectionId: z.string().optional(),
	isActive: z.boolean().default(true),
	isFeatured: z.boolean().default(false),
	isPremium: z.boolean().default(false),
	isCurated: z.boolean().default(false),
	autoRules: z
		.object({
			tags: z.array(z.string()).optional(),
			categories: z.array(z.string()).optional(),
			minRating: z.number().optional(),
			industries: z.array(z.string()).optional(),
			documentTypes: z.array(z.string()).optional(),
			createdAfter: z.string().optional(),
		})
		.optional(),
});

export const adminCollectionRouter = router({
	// Get collections
	getCollections: adminProcedure
		.input(
			z.object({
				search: z.string().optional(),
				isActive: z.boolean().optional(),
				isFeatured: z.boolean().optional(),
				parentCollectionId: z.string().optional(),
				limit: z.number().default(50),
				offset: z.number().default(0),
			}),
		)
		.query(async ({ input }) => {
			const conditions: any[] = [sql`1=1`];

			if (input.search) {
				conditions.push(like(templateCollections.name, `%${input.search}%`));
			}
			if (input.isActive !== undefined) {
				conditions.push(eq(templateCollections.isActive, input.isActive));
			}
			if (input.isFeatured !== undefined) {
				conditions.push(eq(templateCollections.isFeatured, input.isFeatured));
			}
			if (input.parentCollectionId) {
				conditions.push(
					eq(templateCollections.parentCollectionId, input.parentCollectionId),
				);
			}

			const collections = await db
				.select({
					id: templateCollections.id,
					name: templateCollections.name,
					description: templateCollections.description,
					slug: templateCollections.slug,
					coverImageUrl: templateCollections.coverImageUrl,
					color: templateCollections.color,
					icon: templateCollections.icon,
					order: templateCollections.order,
					isActive: templateCollections.isActive,
					isFeatured: templateCollections.isFeatured,
					isPremium: templateCollections.isPremium,
					isCurated: templateCollections.isCurated,
					parentCollectionId: templateCollections.parentCollectionId,
					createdAt: templateCollections.createdAt,
					// Count templates in collection
					templateCount: count(templateCollectionItems.templateId),
				})
				.from(templateCollections)
				.leftJoin(
					templateCollectionItems,
					eq(templateCollections.id, templateCollectionItems.collectionId),
				)
				.where(and(...conditions))
				.groupBy(templateCollections.id)
				.orderBy(asc(templateCollections.order), asc(templateCollections.name))
				.limit(input.limit)
				.offset(input.offset);

			return { collections };
		}),

	// Create collection
	createCollection: adminProcedure
		.input(collectionSchema)
		.mutation(async ({ input, ctx }) => {
			const createdBy = ctx.session.user.id;

			// Generate slug if not provided
			const slug =
				input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

			const [newCollection] = await db
				.insert(templateCollections)
				.values({
					...input,
					slug,
					createdBy,
					curatedBy: input.isCurated ? createdBy : undefined,
					curatedAt: input.isCurated ? new Date() : undefined,
				})
				.returning();

			return {
				success: true,
				collection: newCollection,
			};
		}),

	// Update collection
	updateCollection: adminProcedure
		.input(
			collectionSchema
				.extend({
					id: z.string(),
				})
				.partial()
				.required({ id: true }),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, ...updateData } = input;
			const updatedBy = ctx.session.user.id;

			// Generate slug if name is being updated
			if (updateData.name && !updateData.slug) {
				updateData.slug = updateData.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-");
			}

			// Handle curation status
			const mappedData: any = { ...updateData };
			if (updateData.isCurated !== undefined) {
				if (updateData.isCurated) {
					mappedData.curatedBy = updatedBy;
					mappedData.curatedAt = new Date();
				} else {
					mappedData.curatedBy = null;
					mappedData.curatedAt = null;
				}
			}

			await db
				.update(templateCollections)
				.set({
					...mappedData,
					updatedAt: new Date(),
				})
				.where(eq(templateCollections.id, id));

			return { success: true };
		}),

	// Delete collection
	deleteCollection: adminProcedure
		.input(
			z.object({
				id: z.string(),
				moveTemplatesTo: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			// Handle template reassignment if specified
			if (input.moveTemplatesTo) {
				await db
					.update(templateCollectionItems)
					.set({ collectionId: input.moveTemplatesTo })
					.where(eq(templateCollectionItems.collectionId, input.id));
			} else {
				// Remove all template assignments
				await db
					.delete(templateCollectionItems)
					.where(eq(templateCollectionItems.collectionId, input.id));
			}

			// Delete collection
			await db
				.delete(templateCollections)
				.where(eq(templateCollections.id, input.id));

			return { success: true };
		}),

	// Add templates to collection
	addTemplatesToCollection: adminProcedure
		.input(
			z.object({
				collectionId: z.string(),
				templateIds: z.array(z.string()),
				startOrder: z.number().default(0),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const addedBy = ctx.session.user.id;

			// Remove existing items if they exist
			await db
				.delete(templateCollectionItems)
				.where(
					and(
						eq(templateCollectionItems.collectionId, input.collectionId),
						inArray(templateCollectionItems.templateId, input.templateIds),
					),
				);

			// Add templates to collection
			const items = input.templateIds.map((templateId, index) => ({
				collectionId: input.collectionId,
				templateId,
				order: input.startOrder + index,
				addedBy,
			}));

			await db.insert(templateCollectionItems).values(items);

			return { success: true, added: input.templateIds.length };
		}),

	// Remove templates from collection
	removeTemplatesFromCollection: adminProcedure
		.input(
			z.object({
				collectionId: z.string(),
				templateIds: z.array(z.string()),
			}),
		)
		.mutation(async ({ input }) => {
			await db
				.delete(templateCollectionItems)
				.where(
					and(
						eq(templateCollectionItems.collectionId, input.collectionId),
						inArray(templateCollectionItems.templateId, input.templateIds),
					),
				);

			return { success: true, removed: input.templateIds.length };
		}),
	getTemplateCollections: adminProcedure
		.input(z.object({ templateId: z.string() }))
		.query(async ({ input }) => {
			const collections = await db
				.select({
					id: templateCollections.id,
					name: templateCollections.name,
					description: templateCollections.description,
					color: templateCollections.color,
					icon: templateCollections.icon,
					isActive: templateCollections.isActive,
					isFeatured: templateCollections.isFeatured,
					isPremium: templateCollections.isPremium,
					isCurated: templateCollections.isCurated,
					templateCount: count(templateCollectionItems.templateId),
				})
				.from(templateCollectionItems)
				.innerJoin(
					templateCollections,
					eq(templateCollectionItems.collectionId, templateCollections.id),
				)
				.where(eq(templateCollectionItems.templateId, input.templateId))
				.groupBy(templateCollections.id);

			return { collections };
		}),
});
