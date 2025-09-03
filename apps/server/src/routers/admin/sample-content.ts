// apps/server/src/routes/admin/sample-content.ts
import {and, asc, count, desc, eq, inArray, sql} from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sampleContent } from "@/db/schema/sample-content";
import type { DataIndustry, DataSpecialization } from "@/lib/data-ai";
import { adminProcedure, router } from "@/lib/trpc";

//
// ─── SCHEMAS ────
//
const createSampleContentSchema = z.object({
    contentType: z.string().min(1, "Content type is required"),
    content: z.any(), // JSONB content
    targetIndustry: z.array(z.string() as z.ZodType<DataIndustry>).optional(),
    targetSpecialization: z.array(z.string() as z.ZodType<DataSpecialization>).optional(),
    targetJobTitles: z.array(z.string()).optional(),
    targetCompanyTypes: z.array(z.enum(["startup", "enterprise", "consulting", "agency", "non_profit", "government"])).optional(),
    experienceLevel: z.enum([
        "entry",
        "junior",
        "mid",
        "senior",
        "lead",
        "principal",
        "executive",
    ]).optional(),
    contentQuality: z.enum(["basic", "good", "excellent", "premium"]).optional(),
    contentSource: z.enum(["ai_generated", "expert_written", "user_contributed", "curated"]).optional(),
    isActive: z.boolean().optional(),
    isApproved: z.boolean().optional(),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
});

const updateSampleContentSchema = createSampleContentSchema.partial();

const filterSchema = z.object({
    contentType: z.string().optional(),
    targetIndustry: z.string().optional(),
    targetSpecialization: z.string().optional(),
    experienceLevel: z.enum([
        "entry",
        "junior",
        "mid",
        "senior",
        "lead",
        "principal",
        "executive",
    ]).optional(),
    contentQuality: z.enum(["basic", "good", "excellent", "premium"]).optional(),
    contentSource: z.enum(["ai_generated", "expert_written", "user_contributed", "curated"]).optional(),
    isActive: z.boolean().optional(),
    isApproved: z.boolean().optional(),
    requiredSkills: z.array(z.string()).optional(),
    businessContexts: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    search: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
});

//
// ─── ROUTER ──────
//
export const adminSampleContentRouter = router({

    //
    // ─── LIST WITH ADVANCED FILTERS ──────
    //
    list: adminProcedure.input(filterSchema).query(async ({ input }) => {
        const {
            contentType,
            targetIndustry,
            targetSpecialization,
            experienceLevel,
            contentQuality,
            contentSource,
            isActive,
            isApproved,
            requiredSkills,
            businessContexts,
            tags,
            keywords,
            search,
            page,
            limit,
        } = input;

        const conditions: any[] = [];

        if (contentType) conditions.push(eq(sampleContent.contentType, contentType));
        if (experienceLevel) conditions.push(eq(sampleContent.experienceLevel, experienceLevel));
        if (contentQuality) conditions.push(eq(sampleContent.contentQuality, contentQuality));
        if (contentSource) conditions.push(eq(sampleContent.contentSource, contentSource));
        if (isActive !== undefined) conditions.push(eq(sampleContent.isActive, isActive));
        if (isApproved !== undefined) conditions.push(eq(sampleContent.isApproved, isApproved));

        if (targetIndustry) {
            conditions.push(sql`${sampleContent.targetIndustry}::jsonb @> ${JSON.stringify([targetIndustry])}::jsonb`);
        }
        if (targetSpecialization) {
            conditions.push(sql`${sampleContent.targetSpecialization}::jsonb @> ${JSON.stringify([targetSpecialization])}::jsonb`);
        }
        if (requiredSkills?.length) {
            conditions.push(sql`${sampleContent.requiredSkills}::jsonb @> ${JSON.stringify(requiredSkills)}::jsonb`);
        }
        if (businessContexts?.length) {
            conditions.push(sql`${sampleContent.businessContexts}::jsonb @> ${JSON.stringify(businessContexts)}::jsonb`);
        }
        if (tags?.length) {
            for (const tag of tags) {
                conditions.push(sql`${sampleContent.tags}::jsonb @> ${JSON.stringify([tag])}::jsonb`);
            }
        }
        if (keywords?.length) {
            for (const kw of keywords) {
                conditions.push(sql`${sampleContent.keywords}::jsonb @> ${JSON.stringify([kw])}::jsonb`);
            }
        }

        // Full-text search (title + description)
        if (search) {
            conditions.push(
                sql`to_tsvector('english', coalesce(${sampleContent.title}, '') || ' ' || coalesce(${sampleContent.description}, '')) @@ plainto_tsquery(${search})`,
            );
        }

        const offset = (page - 1) * limit;

        const results = await db
            .select()
            .from(sampleContent)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(sampleContent.createdAt))
            .limit(limit)
            .offset(offset);

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

    //
    // ─── CRUD ─────
    //
    getById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
        const [result] = await db.select().from(sampleContent).where(eq(sampleContent.id, input.id));
        if (!result) throw new Error("Sample content not found");
        return { data: result };
    }),

    create: adminProcedure.input(createSampleContentSchema).mutation(async ({ input }) => {
        const [result] = await db.insert(sampleContent).values({
            ...input,
            targetIndustry: input.targetIndustry as DataIndustry[],
            targetSpecialization: input.targetSpecialization as DataSpecialization[],
        }).returning();
        return { data: result };
    }),

    update: adminProcedure.input(
        z.object({ id: z.string() }).and(updateSampleContentSchema)
    )
        .mutation(async ({ input }) => {
            const { id, ...data } = input;
            const [result] = await db.update(sampleContent).set({
                ...data,
                targetIndustry: data.targetIndustry as DataIndustry[],
                targetSpecialization: data.targetSpecialization as DataSpecialization[],
                updatedAt: new Date(),
            }).where(eq(sampleContent.id, id)).returning();

            if (!result) throw new Error("Sample content not found");
            return { data: result };
        }),

    delete: adminProcedure.input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            const [result] = await db.delete(sampleContent).where(eq(sampleContent.id, input.id)).returning();
            if (!result) throw new Error("Sample content not found");
            return { message: "Sample content deleted successfully" };
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

    //
    // ─── LIFECYCLE MANAGEMENT ─────
    //
    approve: adminProcedure.input(z.object({ id: z.string(), approverId: z.string() }))
        .mutation(async ({ input }) => {
            const [result] = await db.update(sampleContent).set({
                isApproved: true,
                approvedBy: input.approverId,
                approvedAt: new Date(),
            }).where(eq(sampleContent.id, input.id)).returning();
            if (!result) throw new Error("Content not found");
            return { data: result };
        }),

    deactivate: adminProcedure.input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            const [result] = await db.update(sampleContent).set({ isActive: false }).where(eq(sampleContent.id, input.id)).returning();
            if (!result) throw new Error("Content not found");
            return { data: result };
        }),

    //
    // ─── EFFECTIVENESS TRACKING ─────
    //
    trackUsage: adminProcedure.input(z.object({
        id: z.string(),
        action: z.enum(["use", "export", "customize", "rate"]),
        rating: z.number().optional(),
    }))
        .mutation(async ({ input }) => {
            let update: any = {};
            if (input.action === "use") {
                update = { usageCount: sql`${sampleContent.usageCount} + 1` };
            }
            if (input.action === "rate" && input.rating) {
                update = {
                    effectiveness: sql`jsonb_set(coalesce(${sampleContent.effectiveness}, '{}'::jsonb), '{ratingCount}', to_jsonb(coalesce((${sampleContent.effectiveness}->>'ratingCount')::int, 0) + 1), true)`,
                };
            }
            if (input.action === "export") {
                update = {
                    effectiveness: sql`jsonb_set(coalesce(${sampleContent.effectiveness}, '{}'::jsonb), '{exportRate}', to_jsonb(coalesce((${sampleContent.effectiveness}->>'exportRate')::int, 0) + 1), true)`,
                };
            }
            if (input.action === "customize") {
                update = {
                    effectiveness: sql`jsonb_set(coalesce(${sampleContent.effectiveness}, '{}'::jsonb), '{customizationRate}', to_jsonb(coalesce((${sampleContent.effectiveness}->>'customizationRate')::int, 0) + 1), true)`,
                };
            }

            const [result] = await db.update(sampleContent).set(update).where(eq(sampleContent.id, input.id)).returning();
            return { data: result };
        }),

    //
    // ─── VARIATIONS & RELATIONSHIPS ─────
    //
    addVariation: adminProcedure.input(z.object({
        id: z.string(),
        variation: z.object({
            id: z.string(),
            name: z.string(),
            content: z.any(),
            useCase: z.string(),
        }),
    }))
        .mutation(async ({ input }) => {
            const [result] = await db.update(sampleContent).set({
                variations: sql`coalesce(${sampleContent.variations}, '[]'::jsonb) || ${JSON.stringify([input.variation])}::jsonb`,
            }).where(eq(sampleContent.id, input.id)).returning();
            return { data: result };
        }),

    linkRelated: adminProcedure.input(z.object({ id: z.string(), relatedIds: z.array(z.string()) }))
        .mutation(async ({ input }) => {
            const [result] = await db.update(sampleContent).set({
                relatedContentIds: sql`coalesce(${sampleContent.relatedContentIds}, '[]'::jsonb) || ${JSON.stringify(input.relatedIds)}::jsonb`,
            }).where(eq(sampleContent.id, input.id)).returning();
            return { data: result };
        }),

    //
    // ─── ANALYTICS ────
    //
    analytics: adminProcedure.query(async () => {
        const [topUsed] = await db.select({
            type: sampleContent.contentType,
            count: count(),
        }).from(sampleContent).groupBy(sampleContent.contentType).orderBy(desc(count())).limit(1);

        const soonToExpire = await db.select().from(sampleContent)
            .where(sql`${sampleContent.nextReviewDue} < now() + interval '7 days'`);

        return { topUsed, soonToExpire };
    }),

    //
    // ─── GET AVAILABLE CONTENT TYPES ────
    //
    getContentTypes: adminProcedure.query(async () => {
        const types = await db.selectDistinct({ contentType: sampleContent.contentType })
            .from(sampleContent).orderBy(asc(sampleContent.contentType));
        return { data: types.map((t) => t.contentType) };
    }),
});
