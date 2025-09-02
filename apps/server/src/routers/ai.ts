// apps/server/src/routers/ai.ts

import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import type {
	ContentType,
	DocumentsType,
	ImprovementGoal,
} from "@/lib/data-ai";
import { dataAIService } from "@/lib/data-ai";
import {
	dataProfessionalProcedure,
	extractDataProfessionalContext,
	protectedProcedure,
	router,
} from "@/lib/trpc";
import {aiInteractions} from "@/db/schema/ai-interactions";
import {resumes} from "@/db/schema/resumes";
import {cvs} from "@/db/schema/cvs";
import {coverLetters} from "@/db/schema/cover-letters";

// Input validation schemas
const DocumentsTypeRecommendationSchema = z.object({
	targetRole: z.string(),
	targetIndustry: z.string(),
	region: z.string(),
	dataSpecialization: z.string().optional(),
});

const generateContentSchema = z.object({
	documentId: z.string(),
	DocumentsType: z.enum(["resume", "cv", "cover_letter"]),
	contentType: z.string() as z.ZodType<ContentType>,
	section: z.string().optional(),
	jobDescription: z.string().optional(),
	targetRole: z.string().optional(),
	companyName: z.string().optional(),
	existingContent: z.string().optional(),
});

const improveContentSchema = z.object({
	documentId: z.string(),
	DocumentsType: z.enum(["resume", "cv", "cover_letter"]),
	contentType: z.string() as z.ZodType<ContentType>,
	content: z.string(),
	improvementGoals: z.array(z.string()).optional() as z.ZodOptional<
		z.ZodArray<z.ZodType<ImprovementGoal>>
	>,
	audienceLevel: z
		.enum(["non_technical", "semi_technical", "technical"])
		.optional(),
	targetRole: z.string().optional(),
	jobDescription: z.string().optional(),
});

const jobMatchAnalysisSchema = z.object({
	documentId: z.string(),
	DocumentsType: z.enum(["resume", "cv", "cover_letter"]),
	jobDescription: z.string(),
	targetRole: z.string().optional(),
	companyName: z.string().optional(),
});

const documentAnalysisSchema = z.object({
	documentId: z.string(),
	DocumentsType: z.enum(["resume", "cv", "cover_letter"]),
	analysisType: z
		.enum([
			"completeness",
			"optimization",
			"ats_compatibility",
			"comprehensive",
		])
		.default("comprehensive"),
});

const generateCoverLetterSchema = z.object({
	resumeId: z.string().optional(),
	jobDescription: z.string(),
	companyName: z.string(),
	targetRole: z.string(),
	personalInfo: z.object({
		firstName: z.string(),
		lastName: z.string(),
		email: z.string(),
		phone: z.string().optional(),
	}),
	salutation: z.string().optional(),
	tone: z
		.enum(["professional", "enthusiastic", "formal", "conversational"])
		.default("professional"),
});

const aiInteractionFeedbackSchema = z.object({
	interactionId: z.string(),
	selectedSuggestion: z.string().optional(),
	userFeedback: z.enum(["accepted", "rejected", "modified"]),
	userRating: z.number().min(1).max(5).optional(),
	improvementNote: z.string().optional(),
});

export const aiRouter = router({
	// ===== DOCUMENT TYPE RECOMMENDATION =====

	// Recommend whether user should create resume or CV based on context
	recommendDocumentsType: protectedProcedure
		.input(DocumentsTypeRecommendationSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				const recommendation = await dataAIService.recommendDocumentsType({
					targetRole: input.targetRole,
					targetIndustry: input.targetIndustry,
					region: input.region,
					dataSpecialization: input.dataSpecialization,
				});

				// Log the interaction for analytics
				await db.insert(aiInteractions).values({
					userId,
					type: "document_type_recommendation",
					DocumentsType: recommendation.recommendedType,
					userPrompt: `Role: ${input.targetRole}, Industry: ${input.targetIndustry}, Region: ${input.region}`,
					targetRole: input.targetRole,
					suggestions: [
						{
							id: `rec_${Date.now()}`,
							content: recommendation.reasoning,
							type: "enhancement" as const,
							confidence: recommendation.confidence,
						},
					],
					modelUsed: "gemini-2.5-flash",
				});

				return {
					recommendation: recommendation.recommendedType,
					reasoning: recommendation.reasoning,
					confidence: recommendation.confidence,
					regionalGuidance: recommendation.regionalGuidance,
					mightNeedBoth: recommendation.mightNeedBoth,
					dataCareerNotes: recommendation.dataCareerNotes,
				};
			} catch (error) {
				console.error("Error in document type recommendation:", error);
				throw new Error("Failed to recommend document type");
			}
		}),

	// ===== CONTENT GENERATION =====

	// Generate AI-powered content for various document sections
	generateContent: dataProfessionalProcedure
		.input(generateContentSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			const startTime = Date.now();

			try {
				// Get document data for context
				const documentData = await getDocumentData(
					input.documentId,
					input.DocumentsType,
					userId,
				);
				if (!documentData) {
					throw new Error("Document not found");
				}

				// Extract user's data professional context
				const userContext = extractDataProfessionalContext(ctx.userContext);

				// Build comprehensive context for AI
				const aiContext = {
					...userContext,
					DocumentsType: input.DocumentsType,
					targetRole:
						input.targetRole ||
						(documentData as { targetRole?: string }).targetRole,
					existingContent: input.existingContent,
					jobDescription: input.jobDescription,
					...buildDataProfessionalContextFromDocument(
						documentData,
						input.DocumentsType,
					),
				};

				let suggestions;

				// Generate content based on type
				switch (input.contentType) {
					case "professional_summary":
						suggestions =
							await dataAIService.generateProfessionalSummary(aiContext);
						break;

					case "achievement_bullet": {
						if (!input.section)
							throw new Error("Section required for achievement bullets");
						const [company, position] = input.section.split("|");
						suggestions = await dataAIService.generateAchievementBullets({
							...aiContext,
							company,
							position,
						});
						break;
					}

					case "project_description": {
						if (!input.section)
							throw new Error("Project ID required for project descriptions");
						const project = findProjectInDocument(documentData, input.section);
						if (!project) throw new Error("Project not found");

						suggestions = await dataAIService.generateProjectDescription({
							...aiContext,
							projectName: project.name,
							projectType: project.type,
							technologies:
								project.technologiesUsed || project.technologies || [],
							businessProblem: project.businessProblem,
							solution: project.solution || project.description,
							impactMetrics: project.impactMetrics,
						});
						break;
					}

					case "cover_letter":
						if (!input.jobDescription || !input.companyName) {
							throw new Error(
								"Job description and company name required for cover letter",
							);
						}

						suggestions = await dataAIService.generateCoverLetter({
							...aiContext,
							jobDescription: input.jobDescription,
							companyName: input.companyName,
							personalInfo: documentData.personalInfo,
						});
						break;

					default:
						throw new Error(
							`Content type "${input.contentType}" not supported`,
						);
				}

				// Log the interaction
				const processingTime = Date.now() - startTime;
				// Create the correct document reference based on document type
				const documentRef = {
					[`${input.DocumentsType}Id`]: input.documentId,
				};

				const interaction = await db
					.insert(aiInteractions)
					.values({
						userId,
						...documentRef,
						type: `${input.DocumentsType}_${input.contentType}`,
						section: input.section,
						DocumentsType: input.DocumentsType,
						userPrompt: input.existingContent || "Generate new content",
						jobDescription: input.jobDescription,
						targetRole: input.targetRole,
						suggestions: suggestions.map((s) => ({
							id: s.id,
							content: s.content,
							type: "generation" as const,
							confidence: s.confidence,
						})),
						processingTime,
						modelUsed: "gemini-2.5-flash",
					})
					.returning();

				return {
					interactionId: interaction[0].id,
					suggestions,
					processingTime,
				};
			} catch (error) {
				console.error("Error generating content:", error);
				throw new Error(`Failed to generate ${input.contentType}`);
			}
		}),

	// ===== CONTENT IMPROVEMENT =====

	// Improve existing content with AI suggestions
	improveContent: dataProfessionalProcedure
		.input(improveContentSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			const startTime = Date.now();

			try {
				// Get document for additional context
				const documentData = await getDocumentData(
					input.documentId,
					input.DocumentsType,
					userId,
				);
				if (!documentData) {
					throw new Error("Document not found");
				}

				// Extract user context
				const userContext = extractDataProfessionalContext(ctx.userContext);

				// Build AI context
				const aiContext = {
					...userContext,
					DocumentsType: input.DocumentsType,
					contentType: input.contentType,
					improvementGoals: input.improvementGoals,
					audienceLevel: input.audienceLevel,
					targetRole:
						input.targetRole ||
						(documentData as { targetRole?: string }).targetRole,
					jobDescription: input.jobDescription,
					...buildDataProfessionalContextFromDocument(
						documentData,
						input.DocumentsType,
					),
				};

				const suggestions = await dataAIService.improveContent(
					input.content,
					aiContext,
				);

				// Log the interaction
				const processingTime = Date.now() - startTime;
				const documentRef = {
					[`${input.DocumentsType}Id`]: input.documentId,
				};

				const interaction = await db
					.insert(aiInteractions)
					.values({
						userId,
						...documentRef,
						type: `improve_${input.contentType}`,
						section: input.contentType,
						DocumentsType: input.DocumentsType,
						userPrompt: input.content,
						jobDescription: input.jobDescription,
						targetRole: input.targetRole,
						suggestions: suggestions.map((s) => ({
							id: s.id,
							content: s.content,
							type: "enhancement" as const,
							confidence: s.confidence,
						})),
						processingTime,
						modelUsed: "gemini-2.5-flash",
					})
					.returning();

				return {
					interactionId: interaction[0].id,
					suggestions,
					processingTime,
				};
			} catch (error) {
				console.error("Error improving content:", error);
				throw new Error("Failed to improve content");
			}
		}),

	// ===== JOB MATCHING ANALYSIS =====

	// Analyze how well a document matches a job description
	analyzeJobMatch: dataProfessionalProcedure
		.input(jobMatchAnalysisSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			const startTime = Date.now();

			try {
				// Get document data
				const documentData = await getDocumentData(
					input.documentId,
					input.DocumentsType,
					userId,
				);
				if (!documentData) {
					throw new Error("Document not found");
				}

				// Extract user context
				const userContext = extractDataProfessionalContext(ctx.userContext);

				// Build comprehensive context
				const aiContext = {
					...userContext,
					targetRole:
						input.targetRole ||
						(documentData as { targetRole?: string }).targetRole,
					...buildDataProfessionalContextFromDocument(
						documentData,
						input.DocumentsType,
					),
				};

				const analysis = await dataAIService.analyzeJobMatch(
					input.jobDescription,
					aiContext,
				);

				// Log the interaction
				const processingTime = Date.now() - startTime;
				const documentRef = {
					[`${input.DocumentsType}Id`]: input.documentId,
				};

				await db.insert(aiInteractions).values({
					userId,
					...documentRef,
					type: "job_matching",
					section: "job_analysis",
					DocumentsType: input.DocumentsType,
					jobDescription: input.jobDescription,
					targetRole: input.targetRole,
					suggestions: [
						{
							id: `match_${Date.now()}`,
							content: `Overall Match: ${analysis.overallMatch}%`,
							type: "recommendation" as const,
							confidence: analysis.overallMatch,
						},
					],
					processingTime,
					modelUsed: "gemini-2.5-flash",
				});

				return analysis;
			} catch (error) {
				console.error("Error analyzing job match:", error);
				throw new Error("Failed to analyze job match");
			}
		}),

	// ===== DOCUMENT ANALYSIS =====

	// Comprehensive document analysis and scoring
	analyzeDocument: dataProfessionalProcedure
		.input(documentAnalysisSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			const startTime = Date.now();

			try {
				// Get document data
				const documentData = await getDocumentData(
					input.documentId,
					input.DocumentsType,
					userId,
				);
				if (!documentData) {
					throw new Error("Document not found");
				}

				// Extract user context
				const userContext = extractDataProfessionalContext(ctx.userContext);

				// Build analysis context
				const aiContext = {
					...userContext,
					DocumentsType: input.DocumentsType,
					...buildDataProfessionalContextFromDocument(
						documentData,
						input.DocumentsType,
					),
				};

				const analysis = await dataAIService.analyzeDocument(
					documentData,
					aiContext,
				);

				// Update document with AI insights
				await updateDocumentAIInsights(
					input.documentId,
					input.DocumentsType,
					userId,
					analysis,
				);

				// Log the interaction
				const processingTime = Date.now() - startTime;
				const documentRef = {
					[`${input.DocumentsType}Id`]: input.documentId,
				};

				await db.insert(aiInteractions).values({
					userId,
					...documentRef,
					type: "document_analysis",
					section: "analysis",
					DocumentsType: input.DocumentsType,
					suggestions: [
						{
							id: `analysis_${Date.now()}`,
							content: `Completeness: ${analysis.completenessScore}%`,
							type: "recommendation" as const,
							confidence: analysis.completenessScore,
						},
					],
					processingTime,
					modelUsed: "gemini-2.5-flash",
				});

				return analysis;
			} catch (error) {
				console.error("Error analyzing document:", error);
				throw new Error("Failed to analyze document");
			}
		}),

	// ===== COVER LETTER GENERATION =====

	// Generate a complete cover letter from resume + job description
	generateCoverLetter: dataProfessionalProcedure
		.input(generateCoverLetterSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			const startTime = Date.now();

			try {
				let resumeData = null;

				// Get resume data if provided for context
				if (input.resumeId) {
					resumeData = await getDocumentData(input.resumeId, "resume", userId);
				}

				// Extract user context
				const userContext = extractDataProfessionalContext(ctx.userContext);

				// Build AI context
				const aiContext = {
					...userContext,
					jobDescription: input.jobDescription,
					companyName: input.companyName,
					targetRole: input.targetRole,
					personalInfo: input.personalInfo,
					...(resumeData &&
						buildDataProfessionalContextFromDocument(resumeData, "resume")),
				};

				const suggestions = await dataAIService.generateCoverLetter(aiContext);

				// Log the interaction
				const processingTime = Date.now() - startTime;
				const interaction = await db
					.insert(aiInteractions)
					.values({
						userId,
						resumeId: input.resumeId,
						type: "cover_letter_generation",
						DocumentsType: "cover_letter",
						jobDescription: input.jobDescription,
						targetRole: input.targetRole,
						suggestions: suggestions.map((s) => ({
							id: s.id,
							content: s.content,
							type: "generation",
							confidence: s.confidence,
						})),
						processingTime,
						modelUsed: "gemini-2.5-flash",
					})
					.returning();

				return {
					interactionId: interaction[0].id,
					suggestions,
					processingTime,
				};
			} catch (error) {
				console.error("Error generating cover letter:", error);
				throw new Error("Failed to generate cover letter");
			}
		}),

	// ===== FEEDBACK AND ANALYTICS =====

	// Record user feedback on AI suggestions
	recordFeedback: protectedProcedure
		.input(aiInteractionFeedbackSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				// Update the AI interaction with user feedback
				await db
					.update(aiInteractions)
					.set({
						selectedSuggestion: input.selectedSuggestion,
						userFeedback: input.userFeedback,
						userRating: input.userRating,
					})
					.where(
						and(
							eq(aiInteractions.id, input.interactionId),
							eq(aiInteractions.userId, userId),
						),
					);

				return { success: true };
			} catch (error) {
				console.error("Error recording feedback:", error);
				throw new Error("Failed to record feedback");
			}
		}),

	// Get user's AI interaction history
	getInteractionHistory: protectedProcedure
		.input(
			z.object({
				documentId: z.string().optional(),
				DocumentsType: z.enum(["resume", "cv", "cover_letter"]).optional(),
				limit: z.number().default(20),
			}),
		)
		.query(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			try {
				const conditions = [eq(aiInteractions.userId, userId)];

				if (input.documentId) {
					conditions.push(eq(aiInteractions.resumeId, input.documentId));
					// Add conditions for other document types as needed
				}

				if (input.DocumentsType) {
					conditions.push(
						eq(aiInteractions.DocumentsType, input.DocumentsType),
					);
				}

				const interactions = await db
					.select({
						id: aiInteractions.id,
						type: aiInteractions.type,
						DocumentsType: aiInteractions.DocumentsType,
						targetRole: aiInteractions.targetRole,
						userFeedback: aiInteractions.userFeedback,
						userRating: aiInteractions.userRating,
						processingTime: aiInteractions.processingTime,
						createdAt: aiInteractions.createdAt,
					})
					.from(aiInteractions)
					.where(and(...conditions))
					.orderBy(aiInteractions.createdAt)
					.limit(input.limit);

				return { interactions };
			} catch (error) {
				console.error("Error fetching interaction history:", error);
				throw new Error("Failed to fetch interaction history");
			}
		}),

	// Get AI usage statistics for user dashboard
	getUsageStats: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		try {
			// Get counts by interaction type
			const stats = await db
				.select({
					type: aiInteractions.type,
					count: sql<number>`count(*)`,
				})
				.from(aiInteractions)
				.where(eq(aiInteractions.userId, userId))
				.groupBy(aiInteractions.type);

			// Get recent interactions
			const recentInteractions = await db
				.select({
					type: aiInteractions.type,
					DocumentsType: aiInteractions.DocumentsType,
					createdAt: aiInteractions.createdAt,
				})
				.from(aiInteractions)
				.where(eq(aiInteractions.userId, userId))
				.orderBy(aiInteractions.createdAt)
				.limit(5);

			return {
				totalInteractions: stats.reduce((sum, stat) => sum + stat.count, 0),
				interactionsByType: stats,
				recentInteractions,
			};
		} catch (error) {
			console.error("Error fetching usage stats:", error);
			throw new Error("Failed to fetch usage stats");
		}
	}),
});

// ===== HELPER FUNCTIONS =====

// Get document data based on type and ID
async function getDocumentData(
	documentId: string,
	DocumentsType: DocumentsType,
	userId: string,
) {
	try {
		switch (DocumentsType) {
			case "resume": {
				const resume = await db
					.select()
					.from(resumes)
					.where(and(eq(resumes.id, documentId), eq(resumes.userId, userId)))
					.limit(1);
				return resume[0] || null;
			}

			case "cv": {
				const cv = await db
					.select()
					.from(cvs)
					.where(and(eq(cvs.id, documentId), eq(cvs.userId, userId)))
					.limit(1);
				return cv[0] || null;
			}

			case "cover_letter": {
				const coverLetter = await db
					.select()
					.from(coverLetters)
					.where(
						and(
							eq(coverLetters.id, documentId),
							eq(coverLetters.userId, userId),
						),
					)
					.limit(1);
				return coverLetter[0] || null;
			}

			default:
				return null;
		}
	} catch (error) {
		console.error(`Error getting ${DocumentsType} data:`, error);
		return null;
	}
}

// Build data professional context from document data
function buildDataProfessionalContextFromDocument(
	documentData: any,
	DocumentsType: DocumentsType,
) {
	const context: any = {
		technicalSkills: [],
		primaryTechnologies: [],
		dataProjects: [],
		dataExperience: [],
		education: [],
		certifications: [],
	};

	try {
		if (DocumentsType === "resume") {
			context.technicalSkills = documentData.skills || [];
			context.primaryTechnologies = extractPrimaryTechnologies(documentData);
			context.dataProjects = documentData.projects || [];
			context.dataExperience =
				documentData.workExperience?.map((exp: any) => ({
					position: exp.position,
					company: exp.company,
					achievements:
						exp.achievements?.map((ach: any) => ach.description) || [],
					technologies: exp.primaryTechnologies || [],
					businessImpact:
						exp.achievements
							?.filter((ach: any) => ach.impactMetrics)
							.flatMap((ach: any) => ach.impactMetrics) || [],
				})) || [];
			context.education = documentData.education || [];
			context.certifications = documentData.certifications || [];
		} else if (DocumentsType === "cv") {
			context.technicalSkills = documentData.technicalSkills || [];
			context.dataProjects = documentData.researchProjects || [];
			context.education = documentData.education || [];
			context.publications = documentData.publications || [];
		} else if (DocumentsType === "cover_letter") {
			context.dataProjects = documentData.projectHighlights || [];
		}

		// Extract current role if available
		if (documentData.workExperience?.length > 0) {
			const currentRole = documentData.workExperience.find(
				(exp: any) => exp.isCurrentRole,
			);
			if (currentRole) {
				context.currentRole = currentRole.position;
			}
		}

		return context;
	} catch (error) {
		console.error("Error building context from document:", error);
		return context;
	}
}

// Extract primary technologies from document
function extractPrimaryTechnologies(documentData: any): string[] {
	const technologies = new Set<string>();

	try {
		// From skills
		documentData.skills?.forEach((skill: any) => {
			if (
				skill.category === "programming" ||
				skill.category === "ml_frameworks"
			) {
				technologies.add(skill.name);
			}
		});

		// From work experience
		documentData.workExperience?.forEach((exp: any) => {
			exp.primaryTechnologies?.forEach((tech: string) =>
				technologies.add(tech),
			);
		});

		// From projects
		documentData.projects?.forEach((project: any) => {
			project.technologiesUsed?.forEach((tech: string) =>
				technologies.add(tech),
			);
		});

		return Array.from(technologies);
	} catch (error) {
		console.error("Error extracting primary technologies:", error);
		return [];
	}
}

// Find project in document by ID
function findProjectInDocument(documentData: any, projectId: string) {
	try {
		return (
			documentData.projects?.find((project: any) => project.id === projectId) ||
			null
		);
	} catch (error) {
		console.error("Error finding project:", error);
		return null;
	}
}

// Update document with AI insights
async function updateDocumentAIInsights(
	documentId: string,
	DocumentsType: DocumentsType,
	userId: string,
	analysis: any,
) {
	try {
		const aiInsights = {
			completenessScore: analysis.completenessScore,
			strengthAreas: analysis.strengthAreas,
			improvementSuggestions: analysis.improvementSuggestions.map(
				(s: any) => s.suggestion,
			),
			lastAnalyzed: new Date().toISOString(),
		};

		switch (DocumentsType) {
			case "resume":
				await db
					.update(resumes)
					.set({
						aiInsights,
						updatedAt: new Date(),
					})
					.where(and(eq(resumes.id, documentId), eq(resumes.userId, userId)));
				break;

			// CVs and cover letters don't have aiInsights field in current schema
			// but this could be added in the future
		}
	} catch (error) {
		console.error("Error updating AI insights:", error);
		// Don't throw - this is supplementary data
	}
}
