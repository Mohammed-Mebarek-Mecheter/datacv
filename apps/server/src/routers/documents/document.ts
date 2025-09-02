// apps/server/src/routers/document.ts
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { coverLetters } from "../../db/schema/cover-letters";
import { cvs } from "../../db/schema/cvs";
import { documentTemplates } from "../../db/schema/document-templates";
import { resumes } from "../../db/schema/resumes";
import type {
	DataIndustry,
	DataProjectType,
	DataSkillCategory,
	DataSpecialization,
	DocumentsType,
	ExperienceLevel,
} from "../../lib/data-ai";
import { protectedProcedure, router } from "../../lib/trpc";

// Common input schemas
const resumePersonalInfoSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	email: z.string(),
	phone: z.string().optional(),
	location: z.string().optional(),
	linkedIn: z.string().optional(),
	github: z.string().optional(),
	portfolio: z.string().optional(),
});

const cvPersonalInfoSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	email: z.string(),
	phone: z.string().optional(),
	linkedIn: z.string().optional(),
	googleScholar: z.string().optional(),
	orcid: z.string().optional(),
});

const coverLetterPersonalInfoSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	email: z.string(),
	phone: z.string().optional(),
});

const skillSchema = z.object({
	id: z.string(),
	name: z.string(),
	category: z.string() as z.ZodType<DataSkillCategory>,
	proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
	yearsOfExperience: z.number().optional(),
	isVisible: z.boolean().default(true),
	priority: z.number().default(0),
});

const projectSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	type: z.string() as z.ZodType<DataProjectType>,
	technologiesUsed: z.array(z.string()),
	businessProblem: z.string(),
	solution: z.string(),
	githubUrl: z.string().optional(),
	liveUrl: z.string().optional(),
	isVisible: z.boolean().default(true),
	priority: z.number().default(0),
});

export const documentRouter = router({
	// ===== RESUME OPERATIONS =====

	// Get all user's resumes
	getResumes: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		return db
			.select({
				id: resumes.id,
				title: resumes.title,
				isDefault: resumes.isDefault,
				targetRole: resumes.targetRole,
				targetSpecialization: resumes.targetSpecialization,
				updatedAt: resumes.updatedAt,
			})
			.from(resumes)
			.where(eq(resumes.userId, userId))
			.orderBy(resumes.updatedAt);
	}),

	// Get specific resume
	getResume: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			const resume = await db
				.select()
				.from(resumes)
				.where(and(eq(resumes.id, input.id), eq(resumes.userId, userId)))
				.limit(1);

			if (!resume[0]) {
				throw new Error("Resume not found");
			}

			return resume[0];
		}),

	// Create new resume
	createResume: protectedProcedure
		.input(
			z.object({
				title: z.string(),
				targetRole: z.string().optional(),
				targetSpecialization: z.string().optional() as z.ZodOptional<
					z.ZodType<DataSpecialization>
				>,
				targetIndustry: z.string().optional() as z.ZodOptional<
					z.ZodType<DataIndustry>
				>,
				experienceLevel: z.string().optional() as z.ZodOptional<
					z.ZodType<ExperienceLevel>
				>,
				templateId: z.string().optional(),
				personalInfo: resumePersonalInfoSchema.optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			const [newResume] = await db
				.insert(resumes)
				.values({
					userId,
					title: input.title,
					targetRole: input.targetRole,
					targetSpecialization: input.targetSpecialization,
					targetIndustry: input.targetIndustry,
					experienceLevel: input.experienceLevel,
					templateId: input.templateId,
					isFromTemplate: !!input.templateId,
					personalInfo: input.personalInfo || null,
				})
				.returning();

			return newResume;
		}),

	// Update resume
	updateResume: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().optional(),
				targetRole: z.string().optional(),
				targetSpecialization: z.string().optional() as z.ZodOptional<
					z.ZodType<DataSpecialization>
				>,
				targetIndustry: z.string().optional() as z.ZodOptional<
					z.ZodType<DataIndustry>
				>,
				experienceLevel: z.string().optional() as z.ZodOptional<
					z.ZodType<ExperienceLevel>
				>,
				personalInfo: resumePersonalInfoSchema.optional(),
				professionalSummary: z.string().optional(),
				workExperience: z
					.array(
						z.object({
							id: z.string(),
							company: z.string(),
							position: z.string(),
							location: z.string().optional(),
							startDate: z.string(),
							endDate: z.string().optional(),
							isCurrentRole: z.boolean().default(false),
							achievements: z.array(
								z.object({
									description: z.string(),
									technologiesUsed: z.array(z.string()).optional(),
								}),
							),
							primaryTechnologies: z.array(z.string()),
							isVisible: z.boolean().default(true),
							priority: z.number().default(0),
						}),
					)
					.optional(),
				education: z
					.array(
						z.object({
							id: z.string(),
							institution: z.string(),
							degree: z.string(),
							fieldOfStudy: z.string().optional(),
							startDate: z.string().optional(),
							endDate: z.string().optional(),
							gpa: z.string().optional(),
							isVisible: z.boolean().default(true),
							priority: z.number().default(0),
						}),
					)
					.optional(),
				skills: z.array(skillSchema).optional(),
				projects: z.array(projectSchema).optional(),
				certifications: z
					.array(
						z.object({
							id: z.string(),
							name: z.string(),
							issuer: z.string(),
							issueDate: z.string().optional(),
							credentialUrl: z.string().optional(),
							isVisible: z.boolean().default(true),
							priority: z.number().default(0),
						}),
					)
					.optional(),
				settings: z
					.object({
						includePortfolio: z.boolean(),
						emphasizeQuantitativeResults: z.boolean(),
						colorScheme: z.string(),
						fontFamily: z.string(),
					})
					.optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			const { id, ...updateData } = input;

			await db
				.update(resumes)
				.set({
					...updateData,
					updatedAt: new Date(),
					version: 1, // Increment version in real implementation
				})
				.where(and(eq(resumes.id, id), eq(resumes.userId, userId)));

			return { success: true };
		}),

	// Duplicate resume
	duplicateResume: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			// Get original resume
			const original = await db
				.select()
				.from(resumes)
				.where(and(eq(resumes.id, input.id), eq(resumes.userId, userId)))
				.limit(1);

			if (!original[0]) {
				throw new Error("Resume not found");
			}

			// Create duplicate
			const [duplicate] = await db
				.insert(resumes)
				.values({
					...original[0],
					id: undefined, // Let DB generate new ID
					title: input.title || `${original[0].title} (Copy)`,
					isDefault: false, // Duplicates are never default
					createdAt: new Date(),
					updatedAt: new Date(),
					version: 1,
				})
				.returning();

			return duplicate;
		}),

	// Delete resume
	deleteResume: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			await db
				.delete(resumes)
				.where(and(eq(resumes.id, input.id), eq(resumes.userId, userId)));

			return { success: true };
		}),

	// Set default resume
	setDefaultResume: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			// Remove default from all user's resumes
			await db
				.update(resumes)
				.set({ isDefault: false })
				.where(eq(resumes.userId, userId));

			// Set new default
			await db
				.update(resumes)
				.set({ isDefault: true })
				.where(and(eq(resumes.id, input.id), eq(resumes.userId, userId)));

			return { success: true };
		}),

	// ===== CV OPERATIONS =====

	// Get all user's CVs
	getCvs: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		return db
			.select({
				id: cvs.id,
				title: cvs.title,
				isDefault: cvs.isDefault,
				targetPosition: cvs.targetPosition,
				targetSpecialization: cvs.targetSpecialization,
				updatedAt: cvs.updatedAt,
			})
			.from(cvs)
			.where(eq(cvs.userId, userId))
			.orderBy(cvs.updatedAt);
	}),

	// Get specific CV
	getCv: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			const cv = await db
				.select()
				.from(cvs)
				.where(and(eq(cvs.id, input.id), eq(cvs.userId, userId)))
				.limit(1);

			if (!cv[0]) {
				throw new Error("CV not found");
			}

			return cv[0];
		}),

	// Create new CV
	createCv: protectedProcedure
		.input(
			z.object({
				title: z.string(),
				targetPosition: z.string().optional(),
				targetSpecialization: z.string().optional() as z.ZodOptional<
					z.ZodType<DataSpecialization>
				>,
				researchArea: z.string().optional(),
				templateId: z.string().optional(),
				personalInfo: cvPersonalInfoSchema.optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			const [newCv] = await db
				.insert(cvs)
				.values({
					userId,
					title: input.title,
					targetPosition: input.targetPosition,
					targetSpecialization: input.targetSpecialization,
					researchArea: input.researchArea,
					templateId: input.templateId,
					isFromTemplate: !!input.templateId,
					personalInfo: input.personalInfo || null,
				})
				.returning();

			return newCv;
		}),

	// Update CV (similar pattern to resume)
	updateCv: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().optional(),
				targetPosition: z.string().optional(),
				targetSpecialization: z.string().optional() as z.ZodOptional<
					z.ZodType<DataSpecialization>
				>,
				researchArea: z.string().optional(),
				personalInfo: cvPersonalInfoSchema.optional(),
				researchStatement: z.string().optional(),
				// Add other CV-specific fields as needed
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			const { id, ...updateData } = input;

			await db
				.update(cvs)
				.set({
					...updateData,
					updatedAt: new Date(),
				})
				.where(and(eq(cvs.id, id), eq(cvs.userId, userId)));

			return { success: true };
		}),

	// Delete CV
	deleteCv: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			await db
				.delete(cvs)
				.where(and(eq(cvs.id, input.id), eq(cvs.userId, userId)));

			return { success: true };
		}),

	// ===== COVER LETTER OPERATIONS =====

	// Get all user's cover letters
	getCoverLetters: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		return db
			.select({
				id: coverLetters.id,
				title: coverLetters.title,
				targetCompany: coverLetters.targetCompany,
				targetRole: coverLetters.targetRole,
				applicationStatus: coverLetters.applicationStatus,
				updatedAt: coverLetters.updatedAt,
			})
			.from(coverLetters)
			.where(eq(coverLetters.userId, userId))
			.orderBy(coverLetters.updatedAt);
	}),

	// Get specific cover letter
	getCoverLetter: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			const coverLetter = await db
				.select()
				.from(coverLetters)
				.where(
					and(eq(coverLetters.id, input.id), eq(coverLetters.userId, userId)),
				)
				.limit(1);

			if (!coverLetter[0]) {
				throw new Error("Cover letter not found");
			}

			return coverLetter[0];
		}),

	// Create new cover letter
	createCoverLetter: protectedProcedure
		.input(
			z.object({
				title: z.string(),
				targetCompany: z.string(),
				targetRole: z.string(),
				targetSpecialization: z.string().optional() as z.ZodOptional<
					z.ZodType<DataSpecialization>
				>,
				targetIndustry: z.string().optional() as z.ZodOptional<
					z.ZodType<DataIndustry>
				>,
				jobDescription: z.string().optional(),
				templateId: z.string().optional(),
				personalInfo: coverLetterPersonalInfoSchema.optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			const [newCoverLetter] = await db
				.insert(coverLetters)
				.values({
					userId,
					title: input.title,
					targetCompany: input.targetCompany,
					targetRole: input.targetRole,
					targetSpecialization: input.targetSpecialization,
					targetIndustry: input.targetIndustry,
					jobDescription: input.jobDescription,
					templateId: input.templateId,
					isFromTemplate: !!input.templateId,
					personalInfo: input.personalInfo || null,
				})
				.returning();

			return newCoverLetter;
		}),

	// Update cover letter
	updateCoverLetter: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().optional(),
				targetCompany: z.string().optional(),
				targetRole: z.string().optional(),
				jobDescription: z.string().optional(),
				salutation: z.string().optional(),
				opening: z
					.object({
						content: z.string(),
						hookType: z
							.enum([
								"personal_connection",
								"company_news",
								"shared_values",
								"impressive_metric",
							])
							.optional(),
					})
					.optional(),
				bodyParagraphs: z
					.array(
						z.object({
							id: z.string(),
							type: z.enum([
								"experience",
								"skills",
								"achievements",
								"cultural_fit",
							]),
							content: z.string(),
							priority: z.number(),
						}),
					)
					.optional(),
				closing: z
					.object({
						content: z.string(),
						callToAction: z.string(),
					})
					.optional(),
				applicationStatus: z
					.enum(["draft", "sent", "interview", "rejected", "offered"])
					.optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			const { id, ...updateData } = input;

			await db
				.update(coverLetters)
				.set({
					...updateData,
					...(updateData.applicationStatus === "sent" && {
						dateSubmitted: new Date(),
					}),
					updatedAt: new Date(),
				})
				.where(and(eq(coverLetters.id, id), eq(coverLetters.userId, userId)));

			return { success: true };
		}),

	// Delete cover letter
	deleteCoverLetter: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			await db
				.delete(coverLetters)
				.where(
					and(eq(coverLetters.id, input.id), eq(coverLetters.userId, userId)),
				);

			return { success: true };
		}),

	// ===== TEMPLATE OPERATIONS =====

	// Get available templates
	getTemplates: protectedProcedure
		.input(
			z.object({
				DocumentsType: z.string() as z.ZodType<DocumentsType>,
				specialization: z.string().optional() as z.ZodOptional<
					z.ZodType<DataSpecialization>
				>,
				industry: z.string().optional() as z.ZodOptional<
					z.ZodType<DataIndustry>
				>,
			}),
		)
		.query(async ({ input }) => {
			// Add filters based on input
			return db
				.select({
					id: documentTemplates.id,
					name: documentTemplates.name,
					description: documentTemplates.description,
					category: documentTemplates.category,
					templateStructure: documentTemplates.templateStructure,
					designConfig: documentTemplates.designConfig,
					isPremium: documentTemplates.isPremium,
					usageCount: documentTemplates.usageCount,
					avgRating: documentTemplates.avgRating,
				})
				.from(documentTemplates)
				.where(eq(documentTemplates.DocumentsType, input.DocumentsType));
		}),

	// Get template by ID
	getTemplate: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const template = await db
				.select()
				.from(documentTemplates)
				.where(eq(documentTemplates.id, input.id))
				.limit(1);

			if (!template[0]) {
				throw new Error("Template not found");
			}

			return template[0];
		}),
});
