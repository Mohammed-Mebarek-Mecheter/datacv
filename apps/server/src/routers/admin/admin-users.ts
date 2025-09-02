// admin-users.ts

// User management operations

import { and, asc, count, desc, eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { resumes } from "@/db/schema/resumes";
import { userPreferences } from "@/db/schema/user";
import { adminProcedure, router } from "@/lib/trpc";

export const adminUserRouter = router({
	// Get users with enhanced filtering
	getUsers: adminProcedure
		.input(
			z.object({
				search: z.string().optional(),
				subscriptionPlan: z.enum(["free", "monthly", "lifetime"]).optional(),
				isAdmin: z.boolean().optional(),
				hasCreatedDocuments: z.boolean().optional(),
				hasUsedAI: z.boolean().optional(),
				registeredAfter: z.date().optional(),
				registeredBefore: z.date().optional(),
				sortBy: z
					.enum(["name", "email", "created", "lastActive"])
					.default("created"),
				sortOrder: z.enum(["asc", "desc"]).default("desc"),
				limit: z.number().default(50),
				offset: z.number().default(0),
			}),
		)
		.query(async ({ input }) => {
			const userConditions: any[] = [sql`1=1`];

			if (input.search) {
				userConditions.push(
					or(
						like(user.name, `%${input.search}%`),
						like(user.email, `%${input.search}%`),
					),
				);
			}
			if (input.subscriptionPlan) {
				userConditions.push(
					eq(userPreferences.subscriptionPlan, input.subscriptionPlan),
				);
			}
			if (input.isAdmin !== undefined) {
				userConditions.push(eq(userPreferences.isAdmin, input.isAdmin));
			}
			if (input.registeredAfter) {
				userConditions.push(sql`${user.createdAt} >= ${input.registeredAfter}`);
			}
			if (input.registeredBefore) {
				userConditions.push(
					sql`${user.createdAt} <= ${input.registeredBefore}`,
				);
			}

			// Determine sort order
			let orderBy;
			const direction = input.sortOrder === "asc" ? asc : desc;
			switch (input.sortBy) {
				case "name":
					orderBy = direction(user.name);
					break;
				case "email":
					orderBy = direction(user.email);
					break;
				case "lastActive":
					// Would need to track last active timestamp
					orderBy = direction(user.updatedAt);
					break;
				default:
					orderBy = direction(user.createdAt);
			}

			const users = await db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					emailVerified: user.emailVerified,
					createdAt: user.createdAt,
					subscriptionPlan: userPreferences.subscriptionPlan,
					isAdmin: userPreferences.isAdmin,
					dataSpecialization: userPreferences.dataSpecialization,
					experienceLevel: userPreferences.experienceLevel,
					// Count related records
					documentCount: count(resumes.id),
				})
				.from(user)
				.leftJoin(userPreferences, eq(user.id, userPreferences.userId))
				.leftJoin(resumes, eq(user.id, resumes.userId))
				.where(and(...userConditions))
				.groupBy(
					user.id,
					userPreferences.subscriptionPlan,
					userPreferences.isAdmin,
					userPreferences.dataSpecialization,
					userPreferences.experienceLevel,
				)
				.orderBy(orderBy)
				.limit(input.limit)
				.offset(input.offset);

			const [{ total }] = await db
				.select({ total: count() })
				.from(user)
				.leftJoin(userPreferences, eq(user.id, userPreferences.userId))
				.where(and(...userConditions));

			return { users, totalCount: total };
		}),
	// Add other user management endpoints here
});
