// apps/server/src/routers/document-initialization.ts
import { and, eq, inArray, sql } from "drizzle-orm"; // Import 'inArray'
import { z } from "zod";
import { db } from "@/db";
import { coverLetters } from "@/db/schema/cover-letters";
import { cvs } from "@/db/schema/cvs";
import { documentTemplates } from "@/db/schema/document-templates";
import { resumes } from "@/db/schema/resumes";
import { sampleContent } from "@/db/schema/sample-content";
import type { ExperienceLevel } from "@/lib/data-ai";
import { protectedProcedure, router } from "@/lib/trpc";

// Validation schema
const initializeDocumentSchema = z.object({
	templateId: z.string().min(1, "Template ID is required"),
	targetIndustry: z.string().optional(),
	targetSpecialization: z.string().optional(),
	documentType: z.enum(["resume", "cv", "cover_letter"]),
	title: z.string().optional(),
});

const previewSampleContentSchema = z.object({
	templateId: z.string(),
	targetIndustry: z.string().optional(),
	targetSpecialization: z.string().optional(),
});

// Helper function to fetch sample content by ID
async function fetchSpecificSampleContent(contentIds: string[]) {
	if (contentIds.length === 0) return [];
	const results = await db
		.select()
		.from(sampleContent)
		.where(inArray(sampleContent.id, contentIds));
	return results;
}

// Helper function (modified to accept an array of samples or a single sample ID for fetching)
async function fetchSampleContent(
	contentType: string,
	targetIndustry?: string,
	targetSpecialization?: string,
	experienceLevel?: ExperienceLevel,
) {
	const conditions = [eq(sampleContent.contentType, contentType)];

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

	const results = await db
		.select()
		.from(sampleContent)
		.where(and(...conditions))
		.limit(5);

	return results;
}

// Helper function to structure sample content (Assuming it aggregates/structures the array of samples)
// You'll need to implement the logic inside this function based on your data structure needs.
function structureSampleContent(samples: any[], contentType: string) {
	// Example: Simply return the first sample's content, or aggregate them somehow.
	// This logic depends heavily on how your sample content JSON is structured
	// and how you want to merge multiple samples for a single section type.
	if (samples.length > 0) {
		// Placeholder logic - adapt based on your needs
		if (contentType === "personal_info") {
			// Usually expect one snippet
			return samples[0]?.content || {};
		}
		if (
			contentType === "summary" ||
			contentType === "opening" ||
			contentType === "closing"
		) {
			// Usually expect one snippet
			return samples[0]?.content || "";
		}
		// For arrays like experience, projects, education, skills
		// You might want to concatenate or pick a few
		return samples.map((s) => s.content); // Returns array of content objects
	}
	return contentType === "personal_info"
		? {}
		: ["summary", "opening", "closing"].includes(contentType)
			? ""
			: [];
}

export const documentInitializationRouter = router({
	initialize: protectedProcedure
		.input(initializeDocumentSchema)
		.mutation(async ({ input, ctx }) => {
			const {
				templateId,
				targetIndustry,
				targetSpecialization,
				documentType,
				title,
			} = input;
			const userId = ctx.session.user.id;

			// 1. Fetch template INCLUDING the specificSampleContentMap
			const [template] = await db
				.select({
					id: documentTemplates.id,
					name: documentTemplates.name,
					DocumentsType: documentTemplates.DocumentsType,
					isActive: documentTemplates.isActive,
					isPublic: documentTemplates.isPublic,
					templateStructure: documentTemplates.templateStructure,
					targetExperienceLevel: documentTemplates.targetExperienceLevel,
					specificSampleContentMap: documentTemplates.specificSampleContentMap, // <-- Fetch the map
				})
				.from(documentTemplates)
				.where(
					and(
						eq(documentTemplates.id, templateId),
						eq(documentTemplates.isActive, true),
						eq(documentTemplates.isPublic, true),
					),
				);

			if (!template) {
				throw new Error("Template not found or not accessible");
			}

			// Verify document type matches template
			if (template.DocumentsType !== documentType) {
				throw new Error("Document type mismatch with template");
			}

			// 2. Fetch relevant sample content based on template structure
			const templateStructure = template.templateStructure as any;
			const sections = templateStructure?.sections || [];
			const specificSampleMap = template.specificSampleContentMap as Record<
				string,
				string
			> | null; // Type assertion

			const sampleData: any = {};

			// Get list of specific sample content IDs to fetch in one go (for efficiency)
			const specificSampleIdsToFetch = Object.values(
				specificSampleMap || {},
			).filter((id) => id) as string[];
			let specificSampleLookup: Record<
				string,
				typeof sampleContent.$inferSelect
			> = {};

			if (specificSampleIdsToFetch.length > 0) {
				const specificSamples = await fetchSpecificSampleContent(
					specificSampleIdsToFetch,
				);
				specificSampleLookup = specificSamples.reduce(
					(acc, sample) => {
						acc[sample.id] = sample;
						return acc;
					},
					{} as Record<string, typeof sampleContent.$inferSelect>,
				);
			}

			// Iterate through sections and fetch content
			for (const section of sections) {
				const contentType = section.type;
				let contentToUse = null;

				// 2a. Check for Template-Specific Sample Content First
				const specificSampleId = specificSampleMap?.[contentType];
				if (specificSampleId && specificSampleLookup[specificSampleId]) {
					const specificSample = specificSampleLookup[specificSampleId];
					// Structure the specific sample content (passing the single item as an array)
					contentToUse = structureSampleContent([specificSample], contentType);
				}

				// 2b. Fallback to Generic Content Fetching if no specific content found or fetch failed
				if (!contentToUse) {
					const samples = await fetchSampleContent(
						contentType,
						targetIndustry,
						targetSpecialization,
						template.targetExperienceLevel as ExperienceLevel,
					);

					if (samples.length > 0) {
						contentToUse = structureSampleContent(samples, contentType);
					}
				}

				if (contentToUse !== null && contentToUse !== undefined) {
					// Check for null/undefined
					sampleData[contentType] = contentToUse;
				}
			}

			// 3. Create document with pre-populated sample data
			let documentId: string;
			const documentTitle =
				title || `${template.name} - ${new Date().toLocaleDateString()}`;

			switch (documentType) {
				case "resume": {
					const [newResume] = await db
						.insert(resumes)
						.values({
							userId,
							title: documentTitle,
							templateId: template.id, // Use template.id from the selected fields
							isFromTemplate: true,
							targetSpecialization: targetSpecialization as any,
							targetIndustry: targetIndustry as any,
							experienceLevel: template.targetExperienceLevel,
							personalInfo: sampleData.personal_info || {
								firstName: "Your",
								lastName: "Name",
								email: "your.email@example.com",
							},
							professionalSummary: sampleData.summary || "", // Ensure string default
							workExperience: sampleData.experience || [], // Ensure array default
							education: sampleData.education || [],
							skills: sampleData.skills || [],
							projects: sampleData.projects || [],
							certifications: sampleData.certifications || [],
						})
						.returning({ id: resumes.id });

					documentId = newResume.id;
					break;
				}

				case "cv": {
					const [newCV] = await db
						.insert(cvs)
						.values({
							userId,
							title: documentTitle,
							templateId: template.id,
							isFromTemplate: true,
							targetSpecialization: targetSpecialization as any,
							researchArea: targetSpecialization,
							personalInfo: sampleData.personal_info || {
								firstName: "Your",
								lastName: "Name",
								email: "your.email@example.com",
							},
							researchStatement: sampleData.summary || "", // Ensure string default
							education: sampleData.education || [],
							academicPositions: sampleData.experience || [], // Ensure array default
							publications: sampleData.publications || [],
							researchProjects: sampleData.projects || [],
							technicalSkills: sampleData.skills || [],
						})
						.returning({ id: cvs.id });

					documentId = newCV.id;
					break;
				}

				case "cover_letter": {
					const [newCoverLetter] = await db
						.insert(coverLetters)
						.values({
							userId,
							title: documentTitle,
							templateId: template.id,
							isFromTemplate: true,
							targetCompany: "Target Company",
							targetRole: "Target Role",
							targetSpecialization: targetSpecialization as any,
							targetIndustry: targetIndustry as any,
							personalInfo: sampleData.personal_info || {
								firstName: "Your",
								lastName: "Name",
								email: "your.email@example.com",
							},
							opening: sampleData.opening || {
								content:
									"I am writing to express my interest in the position at your company.",
								hookType: "shared_values",
							},
							bodyParagraphs: sampleData.body_paragraphs || [], // Ensure array default
							closing: sampleData.closing || {
								content: "Thank you for considering my application.",
								callToAction: "I look forward to hearing from you.",
							},
							projectHighlights: sampleData.projects || [], // Ensure array default
						})
						.returning({ id: coverLetters.id });

					documentId = newCoverLetter.id;
					break;
				}

				default:
					throw new Error("Invalid document type");
			}

			return {
				success: true,
				documentId,
				documentType,
				templateId: template.id,
				prePopulatedSections: Object.keys(sampleData),
				message: "Document initialized successfully with sample content",
			};
		}),

	preview: protectedProcedure
		.input(previewSampleContentSchema)
		.query(async ({ input }) => {
			const { templateId, targetIndustry, targetSpecialization } = input;

			// Fetch template INCLUDING the specificSampleContentMap
			const [template] = await db
				.select({
					id: documentTemplates.id,
					name: documentTemplates.name,
					DocumentsType: documentTemplates.DocumentsType,
					templateStructure: documentTemplates.templateStructure,
					targetExperienceLevel: documentTemplates.targetExperienceLevel,
					specificSampleContentMap: documentTemplates.specificSampleContentMap, // <-- Fetch the map
				})
				.from(documentTemplates)
				.where(eq(documentTemplates.id, templateId));

			if (!template) {
				throw new Error("Template not found");
			}

			// Get template structure
			const templateStructure = template.templateStructure as any;
			const sections = templateStructure?.sections || [];
			const specificSampleMap = template.specificSampleContentMap as Record<
				string,
				string
			> | null;

			const previewData: any = {};

			// --- Logic for Preview using specificSampleContentMap ---
			const specificSampleIdsToFetch = Object.values(
				specificSampleMap || {},
			).filter((id) => id) as string[];
			let specificSampleLookup: Record<
				string,
				typeof sampleContent.$inferSelect
			> = {};

			if (specificSampleIdsToFetch.length > 0) {
				const specificSamples = await fetchSpecificSampleContent(
					specificSampleIdsToFetch,
				);
				specificSampleLookup = specificSamples.reduce(
					(acc, sample) => {
						acc[sample.id] = sample;
						return acc;
					},
					{} as Record<string, typeof sampleContent.$inferSelect>,
				);
			}

			// Fetch sample content for each section (Preview logic)
			for (const section of sections) {
				const contentType = section.type;
				let previewInfo: any = { availableSamples: 0, samplePreview: [] };

				// Check for Template-Specific Sample Content for Preview
				const specificSampleId = specificSampleMap?.[contentType];
				if (specificSampleId && specificSampleLookup[specificSampleId]) {
					const specificSample = specificSampleLookup[specificSampleId];
					previewInfo = {
						availableSamples: 1, // Indicate one specific sample is linked
						samplePreview: [specificSample], // Show the specific sample
						source: "specific", // Indicate source
					};
				} else {
					// Fallback to Generic Content Fetching for Preview
					const samples = await fetchSampleContent(
						contentType,
						targetIndustry,
						targetSpecialization,
						template.targetExperienceLevel as ExperienceLevel,
					);
					previewInfo = {
						availableSamples: samples.length,
						samplePreview: samples.slice(0, 2),
						source: "generic", // Indicate source
					};
				}

				previewData[contentType] = previewInfo;
			}

			return {
				template: {
					id: template.id,
					name: template.name,
					documentType: template.DocumentsType,
				},
				sampleContentPreview: previewData,
			};
		}),
});
