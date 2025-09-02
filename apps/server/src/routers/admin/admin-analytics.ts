// admin-analytics.ts

// Comprehensive Analytics and Reporting Operations

import { and, count, desc, eq, gte, inArray, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { aiInteractions } from "../../db/schema/ai-interactions";
import { user } from "../../db/schema/auth";
import { coverLetters } from "../../db/schema/cover-letters";
import { cvs } from "../../db/schema/cvs";
import { documentTemplates } from "../../db/schema/document-templates";
import { resumes } from "../../db/schema/resumes";
import { templateUsage } from "../../db/schema/template-usage";
import { templateVersions } from "../../db/schema/template-versions";
import { userPreferences } from "../../db/schema/user";
import { adminProcedure, router } from "../../lib/trpc";

export const adminAnalytics = router({
	// ===== SYSTEM-WIDE ANALYTICS =====

	// Enhanced system stats
	getSystemStats: adminProcedure.query(async () => {
		// User statistics
		const [totalUsers] = await db.select({ count: count() }).from(user);
		const [freeUsers] = await db
			.select({ count: count() })
			.from(userPreferences)
			.where(eq(userPreferences.subscriptionPlan, "free"));
		const [monthlyUsers] = await db
			.select({ count: count() })
			.from(userPreferences)
			.where(eq(userPreferences.subscriptionPlan, "monthly"));
		const [lifetimeUsers] = await db
			.select({ count: count() })
			.from(userPreferences)
			.where(eq(userPreferences.subscriptionPlan, "lifetime"));

		// Document statistics
		const [totalResumes] = await db.select({ count: count() }).from(resumes);
		const [totalCvs] = await db.select({ count: count() }).from(cvs);
		const [totalCoverLetters] = await db
			.select({ count: count() })
			.from(coverLetters);

		// AI usage statistics
		const [totalAiInteractions] = await db
			.select({ count: count() })
			.from(aiInteractions);

		// Template statistics
		const [totalTemplates] = await db
			.select({ count: count() })
			.from(documentTemplates)
			.where(eq(documentTemplates.isActive, true));
		const [draftTemplates] = await db
			.select({ count: count() })
			.from(documentTemplates)
			.where(eq(documentTemplates.isDraft, true));
		const [premiumTemplates] = await db
			.select({ count: count() })
			.from(documentTemplates)
			.where(eq(documentTemplates.isPremium, true));

		// Quality statistics
		const [pendingReviews] = await db
			.select({ count: count() })
			.from(documentTemplates)
			.where(eq(documentTemplates.reviewStatus, "pending"));

		// Recent activity (last 7 days)
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const [recentUsers] = await db
			.select({ count: count() })
			.from(user)
			.where(sql`${user.createdAt} >= ${sevenDaysAgo}`);
		const [recentTemplates] = await db
			.select({ count: count() })
			.from(documentTemplates)
			.where(sql`${documentTemplates.createdAt} >= ${sevenDaysAgo}`);
		const [recentAiUsage] = await db
			.select({ count: count() })
			.from(aiInteractions)
			.where(sql`${aiInteractions.createdAt} >= ${sevenDaysAgo}`);

		return {
			users: {
				total: totalUsers.count,
				free: freeUsers.count,
				monthly: monthlyUsers.count,
				lifetime: lifetimeUsers.count,
				recentSignups: recentUsers.count,
			},
			documents: {
				resumes: totalResumes.count,
				cvs: totalCvs.count,
				coverLetters: totalCoverLetters.count,
				total: totalResumes.count + totalCvs.count + totalCoverLetters.count,
			},
			templates: {
				active: totalTemplates.count,
				drafts: draftTemplates.count,
				premium: premiumTemplates.count,
				pendingReview: pendingReviews.count,
				recentlyCreated: recentTemplates.count,
			},
			ai: {
				totalInteractions: totalAiInteractions.count,
				recentUsage: recentAiUsage.count,
			},
		};
	}),

	// Get recent activity with enhanced details
	getRecentActivity: adminProcedure
		.input(
			z.object({
				limit: z.number().default(20),
				types: z
					.array(
						z.enum([
							"user_signup",
							"template_created",
							"ai_interaction",
							"document_created",
						]),
					)
					.optional(),
			}),
		)
		.query(async ({ input }) => {
			// Get recent user signups
			const recentUsers = await db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					createdAt: user.createdAt,
					role: user.role,
				})
				.from(user)
				.orderBy(desc(user.createdAt))
				.limit(input.limit);

			// Get recent AI interactions
			const recentAiInteractions = await db
				.select({
					id: aiInteractions.id,
					type: aiInteractions.type,
					documentType: aiInteractions.DocumentsType,
					createdAt: aiInteractions.createdAt,
				})
				.from(aiInteractions)
				.orderBy(desc(aiInteractions.createdAt))
				.limit(input.limit);

			// Get recent template creations
			const recentTemplateCreations = await db
				.select({
					id: documentTemplates.id,
					name: documentTemplates.name,
					category: documentTemplates.category,
					createdAt: documentTemplates.createdAt,
				})
				.from(documentTemplates)
				.orderBy(desc(documentTemplates.createdAt))
				.limit(input.limit);

			// Combine and sort activities
			const allActivity = [
				...recentUsers.map((u) => ({
					id: u.id,
					type: "user_signup" as const,
					description: `New user: ${u.name || u.email}`,
					createdAt: u.createdAt,
					metadata: { email: u.email, name: u.name },
				})),
				...recentAiInteractions.map((ai) => ({
					id: ai.id,
					type: "ai_interaction" as const,
					description: `${ai.type} for ${ai.documentType}`,
					createdAt: ai.createdAt,
					metadata: { type: ai.type, documentType: ai.documentType },
				})),
				...recentTemplateCreations.map((t) => ({
					id: t.id,
					type: "template_created" as const,
					description: `Template created: ${t.name}`,
					createdAt: t.createdAt,
					metadata: { name: t.name, category: t.category },
				})),
			]
				.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				)
				.slice(0, input.limit);

			return { activities: allActivity };
		}),

	// ===== TEMPLATE ANALYTICS =====

	// Comprehensive template analytics with detailed metrics
	getTemplateAnalytics: adminProcedure
		.input(
			z.object({
				templateId: z.string().optional(),
				templateIds: z.array(z.string()).optional(),
				timeRange: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
				groupBy: z.enum(["day", "week", "month"]).default("day"),
				metrics: z
					.array(z.enum(["usage", "rating", "conversion", "performance"]))
					.default(["usage"]),
			}),
		)
		.query(async ({ input }) => {
			const timeRangeMap = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
			const daysAgo = timeRangeMap[input.timeRange];
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - daysAgo);

			const conditions = [sql`${templateUsage.createdAt} >= ${startDate}`];

			if (input.templateId) {
				conditions.push(eq(templateUsage.templateId, input.templateId));
			} else if (input.templateIds && input.templateIds.length > 0) {
				conditions.push(inArray(templateUsage.templateId, input.templateIds));
			}

			// Usage analytics
			const usageAnalytics = await db
				.select({
					templateId: templateUsage.templateId,
					templateName: documentTemplates.name,
					actionType: templateUsage.actionType,
					count: count(),
					avgRating: sql<number>`avg(${templateUsage.userRating})`.as(
						"avg_rating",
					),
					avgLoadTime: sql<number>`avg(${templateUsage.loadTime})`.as(
						"avg_load_time",
					),
					conversionRate: sql<number>`
                        (count(case when ${templateUsage.convertedToDocument} then 1 end) * 100.0 / count(*))
                    `.as("conversion_rate"),
				})
				.from(templateUsage)
				.leftJoin(
					documentTemplates,
					eq(templateUsage.templateId, documentTemplates.id),
				)
				.where(and(...conditions))
				.groupBy(
					templateUsage.templateId,
					documentTemplates.name,
					templateUsage.actionType,
				)
				.orderBy(desc(count()));

			// Geographic analytics
			const geoAnalytics = await db
				.select({
					country: templateUsage.country,
					count: count(),
				})
				.from(templateUsage)
				.where(and(...conditions))
				.groupBy(templateUsage.country)
				.orderBy(desc(count()))
				.limit(10);

			// Device analytics
			const deviceAnalytics = await db
				.select({
					deviceType: templateUsage.deviceType,
					count: count(),
					avgLoadTime: sql<number>`avg(${templateUsage.loadTime})`.as(
						"avg_load_time",
					),
				})
				.from(templateUsage)
				.where(and(...conditions))
				.groupBy(templateUsage.deviceType)
				.orderBy(desc(count()));

			return {
				usageAnalytics,
				geoAnalytics,
				deviceAnalytics,
				timeRange: input.timeRange,
				totalRecords: usageAnalytics.reduce(
					(sum, item) => sum + Number(item.count),
					0,
				),
			};
		}),

	// Template performance metrics (moved from admin-templates)
	getTemplatePerformanceMetrics: adminProcedure
		.input(
			z.object({
				templateIds: z.array(z.string()).optional(),
				dateRange: z
					.object({
						from: z.date(),
						to: z.date(),
					})
					.optional(),
				includeConversions: z.boolean().default(true),
				includeEngagement: z.boolean().default(true),
			}),
		)
		.query(async ({ input }) => {
			const conditions: any[] = [sql`1=1`];

			if (input.templateIds && input.templateIds.length > 0) {
				conditions.push(inArray(documentTemplates.id, input.templateIds));
			}

			if (input.dateRange?.from) {
				conditions.push(gte(documentTemplates.createdAt, input.dateRange.from));
			}
			if (input.dateRange?.to) {
				conditions.push(lte(documentTemplates.createdAt, input.dateRange.to));
			}

			const analytics = await db
				.select({
					totalTemplates: count(),
					avgQualityScore: sql<number>`AVG(${documentTemplates.qualityScore})`,
					avgUsageCount: sql<number>`AVG(${documentTemplates.usageCount})`,
					avgRating: sql<number>`AVG(${documentTemplates.avgRating})`,
					avgConversionRate: sql<number>`AVG(${documentTemplates.conversionRate})`,
					activeTemplates: sql<number>`SUM(CASE WHEN ${documentTemplates.isActive} THEN 1 ELSE 0 END)`,
					draftTemplates: sql<number>`SUM(CASE WHEN ${documentTemplates.isDraft} THEN 1 ELSE 0 END)`,
					featuredTemplates: sql<number>`SUM(CASE WHEN ${documentTemplates.isFeatured} THEN 1 ELSE 0 END)`,
					premiumTemplates: sql<number>`SUM(CASE WHEN ${documentTemplates.isPremium} THEN 1 ELSE 0 END)`,
				})
				.from(documentTemplates)
				.where(and(...conditions));

			// Get category breakdown
			const categoryBreakdown = await db
				.select({
					category: documentTemplates.category,
					count: count(),
					avgQualityScore: sql<number>`AVG(${documentTemplates.qualityScore})`,
					avgUsageCount: sql<number>`AVG(${documentTemplates.usageCount})`,
				})
				.from(documentTemplates)
				.where(and(...conditions))
				.groupBy(documentTemplates.category);

			// Get review status breakdown
			const reviewStatusBreakdown = await db
				.select({
					reviewStatus: documentTemplates.reviewStatus,
					count: count(),
				})
				.from(documentTemplates)
				.where(and(...conditions))
				.groupBy(documentTemplates.reviewStatus);

			// Performance trends over time
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const performanceTrends = await db
				.select({
					date: sql<string>`DATE(${templateUsage.createdAt})`.as("date"),
					totalUsage: count(),
					avgLoadTime: sql<number>`AVG(${templateUsage.loadTime})`,
					avgRenderTime: sql<number>`AVG(${templateUsage.renderTime})`,
					conversionCount: sql<number>`SUM(CASE WHEN ${templateUsage.convertedToDocument} THEN 1 ELSE 0 END)`,
				})
				.from(templateUsage)
				.where(sql`${templateUsage.createdAt} >= ${thirtyDaysAgo}`)
				.groupBy(sql`DATE(${templateUsage.createdAt})`)
				.orderBy(sql`DATE(${templateUsage.createdAt})`);

			return {
				overview: analytics[0],
				categoryBreakdown,
				reviewStatusBreakdown,
				performanceTrends,
			};
		}),

	// Get quality metrics for templates
	getTemplateQualityMetrics: adminProcedure
		.input(
			z.object({
				templateIds: z.array(z.string()).optional(),
				includeDetails: z.boolean().default(false),
				qualityThreshold: z.number().default(70),
			}),
		)
		.query(async ({ input }) => {
			const conditions: any[] = [sql`1=1`];
			if (input.templateIds && input.templateIds.length > 0) {
				conditions.push(inArray(documentTemplates.id, input.templateIds));
			}

			const templates = await db
				.select({
					id: documentTemplates.id,
					name: documentTemplates.name,
					qualityScore: documentTemplates.qualityScore,
					avgRating: documentTemplates.avgRating,
					totalRatings: documentTemplates.totalRatings,
					usageCount: documentTemplates.usageCount,
					conversionRate: documentTemplates.conversionRate,
					reviewStatus: documentTemplates.reviewStatus,
					reviewNotes: input.includeDetails
						? documentTemplates.reviewNotes
						: sql<string>`NULL`,
					// Calculate derived metrics
					popularityScore: sql<number>`
                        (${documentTemplates.usageCount} * 0.4 +
                         ${documentTemplates.avgRating} * ${documentTemplates.totalRatings} * 0.3 +
                         ${documentTemplates.conversionRate} * 100 * 0.3)
                    `.as("popularity_score"),
					qualityGrade: sql<string>`
                        CASE 
                            WHEN ${documentTemplates.qualityScore} >= 90 THEN 'A'
                            WHEN ${documentTemplates.qualityScore} >= 80 THEN 'B'
                            WHEN ${documentTemplates.qualityScore} >= 70 THEN 'C'
                            WHEN ${documentTemplates.qualityScore} >= 60 THEN 'D'
                            ELSE 'F'
                        END
                    `.as("quality_grade"),
				})
				.from(documentTemplates)
				.where(and(...conditions))
				.orderBy(desc(documentTemplates.qualityScore));

			// Get quality distribution
			const qualityDistribution = await db
				.select({
					range: sql<string>`
                        CASE 
                            WHEN ${documentTemplates.qualityScore} >= 90 THEN '90-100'
                            WHEN ${documentTemplates.qualityScore} >= 80 THEN '80-89'
                            WHEN ${documentTemplates.qualityScore} >= 70 THEN '70-79'
                            WHEN ${documentTemplates.qualityScore} >= 60 THEN '60-69'
                            ELSE '0-59'
                        END
                    `.as("range"),
					count: count(),
				})
				.from(documentTemplates)
				.where(and(...conditions))
				.groupBy(sql`
                    CASE 
                        WHEN ${documentTemplates.qualityScore} >= 90 THEN '90-100'
                        WHEN ${documentTemplates.qualityScore} >= 80 THEN '80-89'
                        WHEN ${documentTemplates.qualityScore} >= 70 THEN '70-79'
                        WHEN ${documentTemplates.qualityScore} >= 60 THEN '60-69'
                        ELSE '0-59'
                    END
                `)
				.orderBy(sql`range DESC`);

			return {
				templates,
				qualityDistribution,
				belowThreshold: templates.filter(
					(t) => (t.qualityScore || 0) < input.qualityThreshold,
				),
			};
		}),

	// Template engagement analytics
	getTemplateEngagementAnalytics: adminProcedure
		.input(
			z.object({
				templateId: z.string().optional(),
				userSegment: z.enum(["free", "premium", "all"]).default("all"),
				timeRange: z.enum(["7d", "30d", "90d"]).default("30d"),
			}),
		)
		.query(async ({ input }) => {
			const timeRangeMap = { "7d": 7, "30d": 30, "90d": 90 };
			const daysAgo = timeRangeMap[input.timeRange];
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - daysAgo);

			const usageConditions = [sql`${templateUsage.createdAt} >= ${startDate}`];
			const templateConditions: any[] = [];

			if (input.templateId) {
				usageConditions.push(eq(templateUsage.templateId, input.templateId));
				templateConditions.push(eq(documentTemplates.id, input.templateId));
			}

			// User segment filtering
			if (input.userSegment !== "all") {
				const isPremium = input.userSegment === "premium";
				usageConditions.push(
					sql`${templateUsage.userId} IN (
                        SELECT ${userPreferences.userId} 
                        FROM ${userPreferences} 
                        WHERE ${userPreferences.subscriptionPlan} ${isPremium ? `!= 'free'` : `= 'free'`}
                    )`,
				);
			}

			// Engagement metrics
			const engagementData = await db
				.select({
					templateId: templateUsage.templateId,
					templateName: documentTemplates.name,
					totalViews: sql<number>`COUNT(CASE WHEN ${templateUsage.actionType} = 'preview' THEN 1 END)`,
					totalSelections: sql<number>`COUNT(CASE WHEN ${templateUsage.actionType} = 'select' THEN 1 END)`,
					totalCustomizations: sql<number>`COUNT(CASE WHEN ${templateUsage.actionType} = 'customize' THEN 1 END)`,
					totalExports: sql<number>`COUNT(CASE WHEN ${templateUsage.actionType} = 'export' THEN 1 END)`,
					uniqueUsers: sql<number>`COUNT(DISTINCT ${templateUsage.userId})`,
					avgTimeOnPage: sql<number>`AVG(${templateUsage.timeOnPage})`,
					avgScrollDepth: sql<number>`AVG(${templateUsage.scrollDepth})`,
					avgClicksCount: sql<number>`AVG(${templateUsage.clicksCount})`,
					conversionRate: sql<number>`
                        (COUNT(CASE WHEN ${templateUsage.convertedToDocument} THEN 1 END) * 100.0 / 
                         COUNT(CASE WHEN ${templateUsage.actionType} = 'preview' THEN 1 END))
                    `.as("conversion_rate"),
				})
				.from(templateUsage)
				.leftJoin(
					documentTemplates,
					eq(templateUsage.templateId, documentTemplates.id),
				)
				.where(and(...usageConditions))
				.groupBy(templateUsage.templateId, documentTemplates.name)
				.orderBy(
					desc(
						sql<number>`COUNT(CASE WHEN ${templateUsage.actionType} = 'preview' THEN 1 END)`,
					),
				);

			return {
				engagementData,
				timeRange: input.timeRange,
				userSegment: input.userSegment,
			};
		}),

	// Template optimization insights
	getTemplateOptimizationInsights: adminProcedure
		.input(
			z.object({
				templateIds: z.array(z.string()).optional(),
				focusAreas: z
					.union([
						z.literal("all"),
						z.array(
							z.enum(["conversion", "performance", "engagement", "quality"]),
						),
					])
					.default("all"),
			}),
		)
		.query(async ({ input }) => {
			const conditions: any[] = [eq(documentTemplates.isActive, true)];

			if (input.templateIds && input.templateIds.length > 0) {
				conditions.push(inArray(documentTemplates.id, input.templateIds));
			}

			// Get templates with performance issues
			const performanceIssues = await db
				.select({
					templateId: templateUsage.templateId,
					templateName: documentTemplates.name,
					avgLoadTime: sql<number>`AVG(${templateUsage.loadTime})`,
					maxLoadTime: sql<number>`MAX(${templateUsage.loadTime})`,
					slowLoadCount: sql<number>`COUNT(CASE WHEN ${templateUsage.loadTime} > 3000 THEN 1 END)`,
					totalUsage: count(),
				})
				.from(templateUsage)
				.leftJoin(
					documentTemplates,
					eq(templateUsage.templateId, documentTemplates.id),
				)
				.where(and(...conditions))
				.groupBy(templateUsage.templateId, documentTemplates.name)
				.having(sql`AVG(${templateUsage.loadTime}) > 2000`)
				.orderBy(desc(sql<number>`AVG(${templateUsage.loadTime})`));

			// Get templates with low conversion rates
			const lowConversionTemplates = await db
				.select({
					id: documentTemplates.id,
					name: documentTemplates.name,
					conversionRate: documentTemplates.conversionRate,
					usageCount: documentTemplates.usageCount,
					avgRating: documentTemplates.avgRating,
				})
				.from(documentTemplates)
				.where(
					and(
						...conditions,
						sql`${documentTemplates.conversionRate} < 0.1`,
						sql`${documentTemplates.usageCount} > 10`,
					),
				)
				.orderBy(documentTemplates.conversionRate);

			// Get templates with quality issues
			const qualityIssues = await db
				.select({
					id: documentTemplates.id,
					name: documentTemplates.name,
					qualityScore: documentTemplates.qualityScore,
					avgRating: documentTemplates.avgRating,
					totalRatings: documentTemplates.totalRatings,
					reviewStatus: documentTemplates.reviewStatus,
					reviewNotes: documentTemplates.reviewNotes,
				})
				.from(documentTemplates)
				.where(
					and(
						...conditions,
						or(
							sql`${documentTemplates.qualityScore} < 70`,
							sql`${documentTemplates.avgRating} < 3.0`,
							eq(documentTemplates.reviewStatus, "rejected"),
						),
					),
				)
				.orderBy(documentTemplates.qualityScore);

			// Get engagement insights
			const engagementInsights = await db
				.select({
					templateId: templateUsage.templateId,
					templateName: documentTemplates.name,
					avgTimeOnPage: sql<number>`AVG(${templateUsage.timeOnPage})`,
					avgScrollDepth: sql<number>`AVG(${templateUsage.scrollDepth})`,
					bounceRate: sql<number>`
                        (COUNT(CASE WHEN ${templateUsage.timeOnPage} < 30 THEN 1 END) * 100.0 / COUNT(*))
                    `.as("bounce_rate"),
					lowEngagementSessions: sql<number>`COUNT(CASE WHEN ${templateUsage.scrollDepth} < 25 THEN 1 END)`,
				})
				.from(templateUsage)
				.leftJoin(
					documentTemplates,
					eq(templateUsage.templateId, documentTemplates.id),
				)
				.where(and(...conditions))
				.groupBy(templateUsage.templateId, documentTemplates.name)
				.having(
					sql`AVG(${templateUsage.timeOnPage}) < 60 OR AVG(${templateUsage.scrollDepth}) < 50`,
				)
				.orderBy(
					desc(sql<number>`
                    (COUNT(CASE WHEN ${templateUsage.timeOnPage} < 30 THEN 1 END) * 100.0 / COUNT(*))
                `),
				);

			return {
				performanceIssues,
				lowConversionTemplates,
				qualityIssues,
				engagementInsights,
				recommendations: {
					performance:
						performanceIssues.length > 0
							? "Consider optimizing templates with high load times"
							: null,
					conversion:
						lowConversionTemplates.length > 0
							? "Review templates with low conversion rates for UX improvements"
							: null,
					quality:
						qualityIssues.length > 0
							? "Address quality issues in flagged templates"
							: null,
					engagement:
						engagementInsights.length > 0
							? "Improve content and design for templates with low engagement"
							: null,
				},
			};
		}),

	// ===== USER ANALYTICS =====

	// Enhanced user analytics
	getUserAnalytics: adminProcedure
		.input(
			z.object({
				timeRange: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
				userSegment: z
					.enum(["all", "free", "premium", "new", "active"])
					.default("all"),
				includeTemplateUsage: z.boolean().default(true),
			}),
		)
		.query(async ({ input }) => {
			const timeRangeMap = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
			const daysAgo = timeRangeMap[input.timeRange];
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - daysAgo);

			// User behavior analytics
			const userBehavior = await db
				.select({
					userId: templateUsage.userId,
					totalActions: count(),
					uniqueTemplatesViewed: sql<number>`COUNT(DISTINCT ${templateUsage.templateId})`,
					conversionsCount: sql<number>`SUM(CASE WHEN ${templateUsage.convertedToDocument} THEN 1 ELSE 0 END)`,
					avgSessionTime: sql<number>`AVG(${templateUsage.timeOnPage})`,
					subscriptionPlan: userPreferences.subscriptionPlan,
				})
				.from(templateUsage)
				.leftJoin(user, eq(templateUsage.userId, user.id))
				.leftJoin(userPreferences, eq(user.id, userPreferences.userId))
				.where(sql`${templateUsage.createdAt} >= ${startDate}`)
				.groupBy(templateUsage.userId, userPreferences.subscriptionPlan)
				.orderBy(desc(count()));

			// Segmentation analysis
			const segmentAnalysis = await db
				.select({
					subscriptionPlan: userPreferences.subscriptionPlan,
					userCount: count(),
					avgTemplateUsage: sql<number>`AVG(usage_stats.total_usage)`,
					avgConversions: sql<number>`AVG(usage_stats.conversions)`,
				})
				.from(userPreferences)
				.leftJoin(
					sql`(
                        SELECT 
                            user_id,
                            COUNT(*) as total_usage,
                            SUM(CASE WHEN converted_to_document THEN 1 ELSE 0 END) as conversions
                        FROM ${templateUsage}
                        WHERE ${templateUsage.createdAt} >= ${startDate}
                        GROUP BY user_id
                    ) as usage_stats`,
					sql`${userPreferences.userId} = usage_stats.user_id`,
				)
				.groupBy(userPreferences.subscriptionPlan);

			return {
				userBehavior: userBehavior.slice(0, 20), // Top 20 active users
				segmentAnalysis,
				timeRange: input.timeRange,
			};
		}),

	// ===== CONVERSION ANALYTICS =====

	// Template conversion funnel analysis
	getConversionFunnelAnalytics: adminProcedure
		.input(
			z.object({
				templateId: z.string().optional(),
				timeRange: z.enum(["7d", "30d", "90d"]).default("30d"),
			}),
		)
		.query(async ({ input }) => {
			const timeRangeMap = { "7d": 7, "30d": 30, "90d": 90 };
			const daysAgo = timeRangeMap[input.timeRange];
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - daysAgo);

			const conditions = [sql`${templateUsage.createdAt} >= ${startDate}`];
			if (input.templateId) {
				conditions.push(eq(templateUsage.templateId, input.templateId));
			}

			const funnelData = await db
				.select({
					templateId: templateUsage.templateId,
					templateName: documentTemplates.name,
					previews: sql<number>`COUNT(CASE WHEN ${templateUsage.actionType} = 'preview' THEN 1 END)`,
					customizations: sql<number>`COUNT(CASE WHEN ${templateUsage.actionType} = 'customize' THEN 1 END)`,
					selections: sql<number>`COUNT(CASE WHEN ${templateUsage.actionType} = 'select' THEN 1 END)`,
					exports: sql<number>`COUNT(CASE WHEN ${templateUsage.actionType} = 'export' THEN 1 END)`,
					conversions: sql<number>`COUNT(CASE WHEN ${templateUsage.convertedToDocument} THEN 1 END)`,
					// Calculate funnel rates
					customizationRate: sql<number>`
                        (COUNT(CASE WHEN ${templateUsage.actionType} = 'customize' THEN 1 END) * 100.0 / 
                         NULLIF(COUNT(CASE WHEN ${templateUsage.actionType} = 'preview' THEN 1 END), 0))
                    `.as("customization_rate"),
					selectionRate: sql<number>`
                        (COUNT(CASE WHEN ${templateUsage.actionType} = 'select' THEN 1 END) * 100.0 / 
                         NULLIF(COUNT(CASE WHEN ${templateUsage.actionType} = 'customize' THEN 1 END), 0))
                    `.as("selection_rate"),
					conversionRate: sql<number>`
                        (COUNT(CASE WHEN ${templateUsage.convertedToDocument} THEN 1 END) * 100.0 / 
                         NULLIF(COUNT(CASE WHEN ${templateUsage.actionType} = 'select' THEN 1 END), 0))
                    `.as("conversion_rate"),
				})
				.from(templateUsage)
				.leftJoin(
					documentTemplates,
					eq(templateUsage.templateId, documentTemplates.id),
				)
				.where(and(...conditions))
				.groupBy(templateUsage.templateId, documentTemplates.name)
				.orderBy(
					desc(
						sql<number>`COUNT(CASE WHEN ${templateUsage.actionType} = 'preview' THEN 1 END)`,
					),
				);

			return {
				funnelData,
				timeRange: input.timeRange,
			};
		}),

	// ===== COMPARATIVE ANALYTICS =====

	// Compare template performance
	compareTemplatePerformance: adminProcedure
		.input(
			z.object({
				templateIds: z.array(z.string()).min(2),
				metrics: z
					.array(
						z.enum(["usage", "rating", "conversion", "engagement", "quality"]),
					)
					.default(["usage", "conversion"]),
				timeRange: z.enum(["7d", "30d", "90d"]).default("30d"),
			}),
		)
		.query(async ({ input }) => {
			const timeRangeMap = { "7d": 7, "30d": 30, "90d": 90 };
			const daysAgo = timeRangeMap[input.timeRange];
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - daysAgo);

			// Get comparative metrics
			const comparison = await db
				.select({
					templateId: documentTemplates.id,
					templateName: documentTemplates.name,
					category: documentTemplates.category,
					qualityScore: documentTemplates.qualityScore,
					totalUsageCount: documentTemplates.usageCount,
					avgRating: documentTemplates.avgRating,
					totalRatings: documentTemplates.totalRatings,
					conversionRate: documentTemplates.conversionRate,
					// Recent usage metrics
					recentUsage: sql<number>`(
                        SELECT COUNT(*) 
                        FROM ${templateUsage} 
                        WHERE ${templateUsage.templateId} = ${documentTemplates.id} 
                        AND ${templateUsage.createdAt} >= ${startDate}
                    )`.as("recent_usage"),
					recentConversions: sql<number>`(
                        SELECT COUNT(*) 
                        FROM ${templateUsage} 
                        WHERE ${templateUsage.templateId} = ${documentTemplates.id} 
                        AND ${templateUsage.convertedToDocument} = true
                        AND ${templateUsage.createdAt} >= ${startDate}
                    )`.as("recent_conversions"),
				})
				.from(documentTemplates)
				.where(inArray(documentTemplates.id, input.templateIds))
				.orderBy(documentTemplates.name);

			// Calculate comparative insights
			const insights = {
				bestPerforming: comparison.reduce((best, current) =>
					(current.totalUsageCount || 0) > (best.totalUsageCount || 0)
						? current
						: best,
				),
				highestRated: comparison.reduce((best, current) =>
					(current.avgRating || 0) > (best.avgRating || 0) ? current : best,
				),
				highestConversion: comparison.reduce((best, current) =>
					(current.conversionRate || 0) > (best.conversionRate || 0)
						? current
						: best,
				),
			};

			return {
				comparison,
				insights,
				timeRange: input.timeRange,
			};
		}),

	// ===== TREND ANALYTICS =====

	// Get analytics trends over time
	getAnalyticsTrends: adminProcedure
		.input(
			z.object({
				metric: z.enum([
					"usage",
					"conversions",
					"new_templates",
					"user_signups",
					"ai_usage",
				]),
				timeRange: z.enum(["30d", "90d", "1y"]).default("90d"),
				groupBy: z.enum(["day", "week", "month"]).default("week"),
			}),
		)
		.query(async ({ input }) => {
			const timeRangeMap = { "30d": 30, "90d": 90, "1y": 365 };
			const daysAgo = timeRangeMap[input.timeRange];
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - daysAgo);

			let dateGrouping: string;
			switch (input.groupBy) {
				case "day":
					dateGrouping = "DATE(created_at)";
					break;
				case "week":
					dateGrouping = "DATE_TRUNC('week', created_at)";
					break;
				case "month":
					dateGrouping = "DATE_TRUNC('month', created_at)";
					break;
			}

			let trendData;

			switch (input.metric) {
				case "usage":
					trendData = await db
						.select({
							date: sql<string>`${sql.raw(dateGrouping)}`.as("date"),
							value: count(),
						})
						.from(templateUsage)
						.where(sql`${templateUsage.createdAt} >= ${startDate}`)
						.groupBy(sql`${sql.raw(dateGrouping)}`)
						.orderBy(sql`${sql.raw(dateGrouping)}`);
					break;

				case "conversions":
					trendData = await db
						.select({
							date: sql<string>`${sql.raw(dateGrouping)}`.as("date"),
							value: sql<number>`COUNT(CASE WHEN ${templateUsage.convertedToDocument} THEN 1 END)`,
						})
						.from(templateUsage)
						.where(sql`${templateUsage.createdAt} >= ${startDate}`)
						.groupBy(sql`${sql.raw(dateGrouping)}`)
						.orderBy(sql`${sql.raw(dateGrouping)}`);
					break;

				case "new_templates":
					trendData = await db
						.select({
							date: sql<string>`${sql.raw(dateGrouping)}`.as("date"),
							value: count(),
						})
						.from(documentTemplates)
						.where(sql`${documentTemplates.createdAt} >= ${startDate}`)
						.groupBy(sql`${sql.raw(dateGrouping)}`)
						.orderBy(sql`${sql.raw(dateGrouping)}`);
					break;

				case "user_signups":
					trendData = await db
						.select({
							date: sql<string>`${sql.raw(dateGrouping)}`.as("date"),
							value: count(),
						})
						.from(user)
						.where(sql`${user.createdAt} >= ${startDate}`)
						.groupBy(sql`${sql.raw(dateGrouping)}`)
						.orderBy(sql`${sql.raw(dateGrouping)}`);
					break;

				case "ai_usage":
					trendData = await db
						.select({
							date: sql<string>`${sql.raw(dateGrouping)}`.as("date"),
							value: count(),
						})
						.from(aiInteractions)
						.where(sql`${aiInteractions.createdAt} >= ${startDate}`)
						.groupBy(sql`${sql.raw(dateGrouping)}`)
						.orderBy(sql`${sql.raw(dateGrouping)}`);
					break;
			}

			return {
				trendData,
				metric: input.metric,
				timeRange: input.timeRange,
				groupBy: input.groupBy,
			};
		}),

	// ===== ADVANCED ANALYTICS =====

	// Template lifecycle analytics
	getTemplateLifecycleAnalytics: adminProcedure
		.input(
			z.object({
				includeInactive: z.boolean().default(false),
			}),
		)
		.query(async ({ input }) => {
			const conditions = input.includeInactive
				? []
				: [eq(documentTemplates.isActive, true)];

			const lifecycleData = await db
				.select({
					templateId: documentTemplates.id,
					templateName: documentTemplates.name,
					createdAt: documentTemplates.createdAt,
					version: documentTemplates.version,
					totalVersions: sql<number>`(
                        SELECT COUNT(*) 
                        FROM ${templateVersions} 
                        WHERE ${templateVersions.templateId} = ${documentTemplates.id}
                    )`.as("total_versions"),
					daysSinceCreation: sql<number>`
                        EXTRACT(days FROM NOW() - ${documentTemplates.createdAt})
                    `.as("days_since_creation"),
					usageVelocity: sql<number>`
                        (${documentTemplates.usageCount} / 
                         NULLIF(EXTRACT(days FROM NOW() - ${documentTemplates.createdAt}), 0))
                    `.as("usage_velocity"),
					maturityStage: sql<string>`
                        CASE 
                            WHEN EXTRACT(days FROM NOW() - ${documentTemplates.createdAt}) <= 30 THEN 'new'
                            WHEN EXTRACT(days FROM NOW() - ${documentTemplates.createdAt}) <= 90 THEN 'growing'
                            WHEN ${documentTemplates.usageCount} > 100 THEN 'mature'
                            ELSE 'stable'
                        END
                    `.as("maturity_stage"),
				})
				.from(documentTemplates)
				.where(conditions.length > 0 ? and(...conditions) : sql`1=1`)
				.orderBy(desc(documentTemplates.createdAt));

			return { lifecycleData };
		}),

	// Revenue analytics (for premium templates)
	getRevenueAnalytics: adminProcedure
		.input(
			z.object({
				timeRange: z.enum(["30d", "90d", "1y"]).default("90d"),
			}),
		)
		.query(async ({ input }) => {
			const timeRangeMap = { "30d": 30, "90d": 90, "1y": 365 };
			const daysAgo = timeRangeMap[input.timeRange];
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - daysAgo);

			// Premium template usage by paying users
			const premiumUsage = await db
				.select({
					templateId: templateUsage.templateId,
					templateName: documentTemplates.name,
					premiumUsageCount: count(),
					uniquePremiumUsers: sql<number>`COUNT(DISTINCT ${templateUsage.userId})`,
				})
				.from(templateUsage)
				.leftJoin(
					documentTemplates,
					eq(templateUsage.templateId, documentTemplates.id),
				)
				.leftJoin(
					userPreferences,
					eq(templateUsage.userId, userPreferences.userId),
				)
				.where(
					and(
						eq(documentTemplates.isPremium, true),
						sql`${userPreferences.subscriptionPlan} != 'free'`,
						sql`${templateUsage.createdAt} >= ${startDate}`,
					),
				)
				.groupBy(templateUsage.templateId, documentTemplates.name)
				.orderBy(desc(count()));

			// Subscription conversion correlation
			const conversionCorrelation = await db
				.select({
					subscriptionPlan: userPreferences.subscriptionPlan,
					totalTemplateUsage: count(),
					avgConversions: sql<number>`AVG(CASE WHEN ${templateUsage.convertedToDocument} THEN 1 ELSE 0 END)`,
					premiumTemplateUsage: sql<number>`SUM(CASE WHEN ${documentTemplates.isPremium} THEN 1 ELSE 0 END)`,
				})
				.from(templateUsage)
				.leftJoin(
					documentTemplates,
					eq(templateUsage.templateId, documentTemplates.id),
				)
				.leftJoin(
					userPreferences,
					eq(templateUsage.userId, userPreferences.userId),
				)
				.where(sql`${templateUsage.createdAt} >= ${startDate}`)
				.groupBy(userPreferences.subscriptionPlan);

			return {
				premiumUsage,
				conversionCorrelation,
				timeRange: input.timeRange,
			};
		}),

	// Export analytics data
	exportAnalyticsData: adminProcedure
		.input(
			z.object({
				dataType: z.enum(["templates", "users", "usage", "conversions", "all"]),
				format: z.enum(["json", "csv"]).default("json"),
				timeRange: z.enum(["7d", "30d", "90d", "1y"]).optional(),
				filters: z
					.object({
						templateIds: z.array(z.string()).optional(),
						userSegment: z.enum(["free", "premium", "all"]).optional(),
					})
					.optional(),
			}),
		)
		.query(async ({ input }) => {
			const timeRangeMap = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
			let startDate: Date | undefined;

			if (input.timeRange) {
				const daysAgo = timeRangeMap[input.timeRange];
				startDate = new Date();
				startDate.setDate(startDate.getDate() - daysAgo);
			}

			const exportData: any = {};

			if (input.dataType === "templates" || input.dataType === "all") {
				const conditions: any[] = [];
				if (startDate) {
					conditions.push(gte(documentTemplates.createdAt, startDate));
				}
				if (input.filters?.templateIds) {
					conditions.push(
						inArray(documentTemplates.id, input.filters.templateIds),
					);
				}

				exportData.templates = await db
					.select({
						id: documentTemplates.id,
						name: documentTemplates.name,
						category: documentTemplates.category,
						documentType: documentTemplates.DocumentsType,
						usageCount: documentTemplates.usageCount,
						avgRating: documentTemplates.avgRating,
						conversionRate: documentTemplates.conversionRate,
						qualityScore: documentTemplates.qualityScore,
						isPremium: documentTemplates.isPremium,
						createdAt: documentTemplates.createdAt,
					})
					.from(documentTemplates)
					.where(conditions.length > 0 ? and(...conditions) : sql`1=1`)
					.orderBy(desc(documentTemplates.createdAt));
			}

			if (input.dataType === "usage" || input.dataType === "all") {
				const usageConditions: any[] = [];
				if (startDate) {
					usageConditions.push(gte(templateUsage.createdAt, startDate));
				}
				if (input.filters?.templateIds) {
					usageConditions.push(
						inArray(templateUsage.templateId, input.filters.templateIds),
					);
				}

				exportData.usage = await db
					.select({
						id: templateUsage.id,
						templateId: templateUsage.templateId,
						userId: templateUsage.userId,
						actionType: templateUsage.actionType,
						deviceType: templateUsage.deviceType,
						country: templateUsage.country,
						loadTime: templateUsage.loadTime,
						timeOnPage: templateUsage.timeOnPage,
						convertedToDocument: templateUsage.convertedToDocument,
						userRating: templateUsage.userRating,
						createdAt: templateUsage.createdAt,
					})
					.from(templateUsage)
					.where(
						usageConditions.length > 0 ? and(...usageConditions) : sql`1=1`,
					)
					.orderBy(desc(templateUsage.createdAt));
			}

			return {
				data: exportData,
				generatedAt: new Date(),
				format: input.format,
				filters: input.filters,
			};
		}),
});
