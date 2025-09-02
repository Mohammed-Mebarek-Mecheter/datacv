// src/lib/data-ai/index.ts

// Commonly used prompt builders for external use if needed
export {
	buildContentImprovementPrompt,
	buildCoverLetterPrompt,
	buildDataAchievementPrompt,
	buildDataProfessionalSummaryPrompt,
	buildDataProjectDescriptionPrompt,
	buildDocumentAnalysisPrompt,
	buildDocumentsTypeRecommendationPrompt,
	buildJobMatchAnalysisPrompt,
} from "./prompts";
// Main exports for the data professional AI system
export { DataAIService, dataAIService } from "./service";
export * from "./types";
