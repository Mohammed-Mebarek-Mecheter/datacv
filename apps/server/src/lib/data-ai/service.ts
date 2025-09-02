// apps/server/src/lib/data-ai/service.ts
import { GoogleGenAI } from "@google/genai";
import {
	buildContentImprovementPrompt,
	buildCoverLetterPrompt,
	buildDataAchievementPrompt,
	buildDataProfessionalSummaryPrompt,
	buildDataProjectDescriptionPrompt,
	buildDocumentAnalysisPrompt,
	buildDocumentsTypeRecommendationPrompt,
	buildJobMatchAnalysisPrompt,
} from "./prompts";
import type {
	AISuggestion,
	ContentType,
	DataProfessionalContext,
	DocumentAnalysis,
	DocumentsType,
	ImprovementGoal,
	JobMatchAnalysis,
} from "./types";

export class DataAIService {
	private client: GoogleGenAI;

	constructor() {
		if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
			throw new Error(
				"GOOGLE_GENERATIVE_AI_API_KEY environment variable is required",
			);
		}
		this.client = new GoogleGenAI({
			apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
		});
	}

	// Document Type Recommendation
	async recommendDocumentsType(context: {
		targetRole: string;
		targetIndustry: string;
		region: string;
		dataSpecialization?: string;
	}): Promise<{
		recommendedType: DocumentsType;
		reasoning: string;
		confidence: number;
		regionalGuidance?: string;
		mightNeedBoth?: boolean;
		dataCareerNotes?: string;
	}> {
		const prompt = buildDocumentsTypeRecommendationPrompt(context);

		try {
			const response = await this.client.models.generateContent({
				model: "gemini-2.5-flash",
				contents: prompt,
				config: {
					temperature: 0.7,
					maxOutputTokens: 1000,
				},
			});

			const parts = response.text?.split("|").map((part) => part.trim()) || [];

			if (parts.length >= 4) {
				return {
					recommendedType: parts[0].toLowerCase() as DocumentsType,
					reasoning: parts[1],
					confidence: Math.min(
						100,
						Math.max(0, Number.parseInt(parts[2]) || 70),
					),
					regionalGuidance: parts[3],
					mightNeedBoth:
						parts[4]?.toLowerCase().includes("true") ||
						parts[4]?.toLowerCase().includes("yes"),
					dataCareerNotes: parts[5] || undefined,
				};
			}

			return {
				recommendedType: "resume",
				reasoning: "Default recommendation based on data role standards",
				confidence: 60,
				regionalGuidance:
					"Follow standard practices for data professionals in your region",
			};
		} catch (error) {
			console.error("Error recommending document type:", error);
			throw new Error("Failed to recommend document type");
		}
	}

	// Professional Summary Generation
	async generateProfessionalSummary(
		context: DataProfessionalContext,
	): Promise<AISuggestion[]> {
		const prompt = buildDataProfessionalSummaryPrompt(context);
		return this.generateSuggestions(prompt, "professional_summary");
	}

	// Achievement Bullet Generation
	async generateAchievementBullets(
		context: DataProfessionalContext & {
			position: string;
			company: string;
			responsibilities?: string[];
			specificTechnologies?: string[];
		},
	): Promise<AISuggestion[]> {
		const prompt = buildDataAchievementPrompt(context);
		return this.generateSuggestions(prompt, "achievement_bullet");
	}

	// Project Description Generation
	async generateProjectDescription(
		context: DataProfessionalContext & {
			projectName: string;
			projectType: string;
			technologies: string[];
			businessProblem?: string;
			solution?: string;
			impactMetrics?: Array<{ description: string; value: string }>;
		},
	): Promise<AISuggestion[]> {
		const prompt = buildDataProjectDescriptionPrompt(context);
		return this.generateSuggestions(prompt, "project_description");
	}

	// Cover Letter Generation
	async generateCoverLetter(
		context: DataProfessionalContext & {
			jobDescription: string;
			companyName: string;
			personalInfo: {
				firstName: string;
				lastName: string;
			};
			salutation?: string;
			closingSignature?: string;
		},
	): Promise<AISuggestion[]> {
		const prompt = buildCoverLetterPrompt(context);
		return this.generateSuggestions(prompt, "cover_letter", 1500);
	}

	// Job Match Analysis
	async analyzeJobMatch(
		jobDescription: string,
		context: DataProfessionalContext,
	): Promise<JobMatchAnalysis> {
		const prompt = buildJobMatchAnalysisPrompt(jobDescription, context);

		try {
			const response = await this.client.models.generateContent({
				model: "gemini-2.5-flash",
				contents: prompt,
				config: {
					temperature: 0.3,
					maxOutputTokens: 1500,
				},
			});

			return this.parseJobMatchAnalysis(response.text || "");
		} catch (error) {
			console.error("Error analyzing job match:", error);
			throw new Error("Failed to analyze job match");
		}
	}

	// Document Analysis
	async analyzeDocument(
		documentData: any,
		context: DataProfessionalContext,
	): Promise<DocumentAnalysis> {
		const prompt = buildDocumentAnalysisPrompt(documentData, context);

		try {
			const response = await this.client.models.generateContent({
				model: "gemini-2.5-flash",
				contents: prompt,
				config: {
					temperature: 0.3,
					maxOutputTokens: 1200,
				},
			});

			return this.parseDocumentAnalysis(response.text || "");
		} catch (error) {
			console.error("Error analyzing document:", error);
			throw new Error("Failed to analyze document");
		}
	}

	// Content Improvement
	async improveContent(
		content: string,
		context: DataProfessionalContext & {
			contentType: ContentType;
			improvementGoals?: ImprovementGoal[];
			audienceLevel?: "non_technical" | "semi_technical" | "technical";
		},
	): Promise<AISuggestion[]> {
		const prompt = buildContentImprovementPrompt(content, context);
		return this.generateSuggestions(prompt, "content_improvement");
	}

	// Generic suggestion generation method
	private async generateSuggestions(
		prompt: string,
		type: string,
		maxTokens = 800,
	): Promise<AISuggestion[]> {
		try {
			const response = await this.client.models.generateContent({
				model: "gemini-2.5-flash",
				contents: prompt,
				config: {
					temperature: 0.8,
					maxOutputTokens: maxTokens,
				},
			});

			return this.parseSuggestions(response.text || "", type);
		} catch (error) {
			console.error(`Error generating ${type} suggestions:`, error);
			throw new Error(`Failed to generate ${type} suggestions`);
		}
	}

	// Parse suggestions from AI response
	private parseSuggestions(response: string, type: string): AISuggestion[] {
		const suggestions: AISuggestion[] = [];
		const lines = response.split("\n").filter((line) => line.includes("|"));

		lines.forEach((line, index) => {
			const parts = line.split("|");
			if (parts.length >= 4) {
				suggestions.push({
					id: `${type}_${Date.now()}_${index}`,
					content: parts[2]?.trim() || "",
					confidence: Math.min(
						100,
						Math.max(0, Number.parseInt(parts[1]) || 70),
					),
					reasoning: parts[3]?.trim() || "",
					metadata: {
						type,
						generated_at: new Date().toISOString(),
					},
				});
			}
		});

		// Fallback if parsing fails
		if (suggestions.length === 0) {
			suggestions.push({
				id: `${type}_${Date.now()}_fallback`,
				content: response.trim(),
				confidence: 60,
				reasoning: "Generated content (parsing format not recognized)",
				metadata: {
					type,
					generated_at: new Date().toISOString(),
				},
			});
		}

		return suggestions;
	}

	// Parse job match analysis
	private parseJobMatchAnalysis(response: string): JobMatchAnalysis {
		const parts = response.split("|");

		// Default structure if parsing fails
		const defaultAnalysis: JobMatchAnalysis = {
			overallMatch: 70,
			technicalMatch: 70,
			experienceMatch: 70,
			matchedRequirements: [],
			missingRequirements: [],
			strengthAreas: [],
			improvementSuggestions: [],
			keywordsToAdd: [],
			technicalGaps: [],
			businessImpactOpportunities: [],
		};

		try {
			if (parts.length >= 10) {
				return {
					overallMatch: Number.parseInt(parts[0]) || 70,
					technicalMatch: Number.parseInt(parts[1]) || 70,
					experienceMatch: Number.parseInt(parts[2]) || 70,
					matchedRequirements: this.parseMatchedRequirements(parts[3]),
					missingRequirements: this.parseMissingRequirements(parts[4]),
					strengthAreas: this.parseStrengthAreas(parts[5]),
					improvementSuggestions: this.parseImprovementSuggestions(parts[6]),
					keywordsToAdd:
						parts[7]
							?.split(",")
							.map((k) => k.trim())
							.filter((k) => k) || [],
					technicalGaps:
						parts[8]
							?.split(",")
							.map((g) => g.trim())
							.filter((g) => g) || [],
					businessImpactOpportunities:
						parts[9]
							?.split(",")
							.map((o) => o.trim())
							.filter((o) => o) || [],
				};
			}
		} catch (error) {
			console.error("Error parsing job match analysis:", error);
		}

		return defaultAnalysis;
	}

	// Parse document analysis
	private parseDocumentAnalysis(response: string): DocumentAnalysis {
		const parts = response.split("|");

		const defaultAnalysis: DocumentAnalysis = {
			completenessScore: 60,
			dataRelevanceScore: 60,
			technicalDepthScore: 60,
			businessImpactScore: 60,
			quantificationScore: 60,
			missingCriticalSections: [],
			strengthAreas: [],
			improvementSuggestions: [],
			skillGaps: [],
			industryAlignment: 60,
			roleAlignment: 60,
		};

		try {
			if (parts.length >= 11) {
				return {
					completenessScore: Number.parseInt(parts[0]) || 60,
					dataRelevanceScore: Number.parseInt(parts[1]) || 60,
					technicalDepthScore: Number.parseInt(parts[2]) || 60,
					businessImpactScore: Number.parseInt(parts[3]) || 60,
					quantificationScore: Number.parseInt(parts[4]) || 60,
					missingCriticalSections:
						parts[5]
							?.split(",")
							.map((s) => s.trim())
							.filter((s) => s) || [],
					strengthAreas:
						parts[6]
							?.split(",")
							.map((s) => s.trim())
							.filter((s) => s) || [],
					improvementSuggestions: this.parseDocumentImprovementSuggestions(
						parts[7],
					),
					skillGaps: this.parseSkillGaps(parts[8]),
					industryAlignment: Number.parseInt(parts[9]) || 60,
					roleAlignment: Number.parseInt(parts[10]) || 60,
				};
			}
		} catch (error) {
			console.error("Error parsing document analysis:", error);
		}

		return defaultAnalysis;
	}

	// Helper parsing methods
	private parseMatchedRequirements(part: string): Array<{
		requirement: string;
		userEvidence: string;
		matchStrength: "strong" | "moderate" | "weak";
	}> {
		if (!part) return [];
		return part
			.split(",")
			.map((item) => {
				const [requirement = "", evidence = "", strength = "moderate"] =
					item.split(":");
				return {
					requirement: requirement.trim(),
					userEvidence: evidence.trim(),
					matchStrength:
						(strength.trim() as "strong" | "moderate" | "weak") || "moderate",
				};
			})
			.filter((item) => item.requirement);
	}

	private parseMissingRequirements(part: string): Array<{
		requirement: string;
		importance: "critical" | "important" | "nice_to_have";
		howToAddress: string;
	}> {
		if (!part) return [];
		return part
			.split(",")
			.map((item) => {
				const [requirement = "", importance = "important", howToAddress = ""] =
					item.split(":");
				return {
					requirement: requirement.trim(),
					importance:
						(importance.trim() as "critical" | "important" | "nice_to_have") ||
						"important",
					howToAddress: howToAddress.trim(),
				};
			})
			.filter((item) => item.requirement);
	}

	private parseStrengthAreas(part: string): Array<{
		area: string;
		evidence: string[];
		competitiveAdvantage?: string;
	}> {
		if (!part) return [];
		return part
			.split(",")
			.map((item) => {
				const [area = "", evidence = "", advantage = ""] = item.split(":");
				return {
					area: area.trim(),
					evidence: evidence ? [evidence.trim()] : [],
					competitiveAdvantage: advantage.trim() || undefined,
				};
			})
			.filter((item) => item.area);
	}

	private parseImprovementSuggestions(part: string): Array<{
		area: string;
		suggestion: string;
		priority: "high" | "medium" | "low";
		estimatedImpact: string;
	}> {
		if (!part) return [];
		return part
			.split(",")
			.map((item) => {
				const [area = "", suggestion = "", priority = "medium", impact = ""] =
					item.split(":");
				return {
					area: area.trim(),
					suggestion: suggestion.trim(),
					priority: (priority.trim() as "high" | "medium" | "low") || "medium",
					estimatedImpact: impact.trim(),
				};
			})
			.filter((item) => item.area && item.suggestion);
	}

	private parseDocumentImprovementSuggestions(part: string): Array<{
		section: string;
		suggestion: string;
		priority: "high" | "medium" | "low";
		estimatedImpact: string;
		dataSpecific: boolean;
	}> {
		if (!part) return [];
		return part
			.split(",")
			.map((item) => {
				const [
					section = "",
					suggestion = "",
					priority = "medium",
					impact = "",
					dataSpecific = "false",
				] = item.split(":");
				return {
					section: section.trim(),
					suggestion: suggestion.trim(),
					priority: (priority.trim() as "high" | "medium" | "low") || "medium",
					estimatedImpact: impact.trim(),
					dataSpecific: dataSpecific.trim().toLowerCase() === "true",
				};
			})
			.filter((item) => item.section && item.suggestion);
	}

	private parseSkillGaps(part: string): Array<{
		skill: string;
		importance: "critical" | "important" | "nice_to_have";
		learningResources: string[];
	}> {
		if (!part) return [];
		return part
			.split(",")
			.map((item) => {
				const [skill = "", importance = "important", resources = ""] =
					item.split(":");
				return {
					skill: skill.trim(),
					importance:
						(importance.trim() as "critical" | "important" | "nice_to_have") ||
						"important",
					learningResources: resources
						? resources.split(";").map((r) => r.trim())
						: [],
				};
			})
			.filter((item) => item.skill);
	}
}

// Create and export singleton instance
export const dataAIService = new DataAIService();
