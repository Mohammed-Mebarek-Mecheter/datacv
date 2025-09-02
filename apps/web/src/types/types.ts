// src/lib/data-ai/types.ts
export type RegionType = "north_america" | "europe" | "asia" | "global";

export interface DataProfessionalContext {
	// Core identification
	targetRole?: string;
	targetSpecialization?: DataSpecialization;
	targetIndustry?: DataIndustry;
	experienceLevel?: ExperienceLevel;
	DocumentsType?: DocumentsType;
	region?: RegionType;

	// Content context
	existingContent?: string;
	jobDescription?: string;

	// Experience and background
	yearsOfExperience?: number;
	currentRole?: string;

	// Technical skills
	technicalSkills?: Array<{
		name: string;
		category: DataSkillCategory;
		proficiency: "beginner" | "intermediate" | "advanced" | "expert";
		yearsOfExperience?: number;
	}>;

	primaryTechnologies?: string[];

	// Data-specific projects
	dataProjects?: Array<{
		name: string;
		description: string;
		type: DataProjectType;
		technologies: string[];
		businessProblem?: string;
		solution?: string;
		dataVolume?: string;
		teamSize?: number;
	}>;

	// Professional experience
	dataExperience?: Array<{
		position: string;
		company: string;
		achievements: string[];
		technologies: string[];
		projectTypes?: string[];
		dataVolume?: string;
	}>;

	// Education and certifications
	education?: Array<{
		institution: string;
		degree: string;
		fieldOfStudy?: string;
		thesis?: string;
		relevantCoursework?: string[];
	}>;

	certifications?: Array<{
		name: string;
		issuer: string;
		issueDate?: string;
		skillsValidated?: string[];
	}>;

	publications?: Array<{
		title: string;
		authors: string[];
		venue: string;
		year: string;
		type: "journal" | "conference" | "preprint" | "other";
	}>;
}

export interface AISuggestion {
	id: string;
	content: string;
	confidence: number; // 0-100
	reasoning: string;

	// Data-specific enhancement scores
	technicalAccuracy?: number; // 0-100
	businessRelevance?: number; // 0-100
	quantificationLevel?: number; // 0-100
	industryAlignment?: number; // 0-100

	metadata?: {
		type: string;
		section?: string;
		improvement_type?:
			| "replacement"
			| "addition"
			| "restructuring"
			| "enhancement";
		data_tools_mentioned?: string[];
		business_impact_highlighted?: boolean;
		quantification_added?: boolean;
		generated_at: string;
	};
}

export interface DocumentAnalysis {
	completenessScore: number; // 0-100
	dataRelevanceScore: number; // 0-100
	technicalDepthScore: number; // 0-100
	businessImpactScore: number; // 0-100
	quantificationScore: number; // 0-100

	missingCriticalSections: string[];
	strengthAreas: string[];

	improvementSuggestions: Array<{
		section: string;
		suggestion: string;
		priority: "high" | "medium" | "low";
		estimatedImpact: string;
		dataSpecific: boolean;
	}>;

	skillGaps: Array<{
		skill: string;
		importance: "critical" | "important" | "nice_to_have";
		learningResources: string[];
	}>;

	industryAlignment: number; // 0-100
	roleAlignment: number; // 0-100
}

export interface JobMatchAnalysis {
	overallMatch: number; // 0-100
	technicalMatch: number; // 0-100
	experienceMatch: number; // 0-100

	matchedRequirements: Array<{
		requirement: string;
		userEvidence: string;
		matchStrength: "strong" | "moderate" | "weak";
	}>;

	missingRequirements: Array<{
		requirement: string;
		importance: "critical" | "important" | "nice_to_have";
		howToAddress: string;
	}>;

	strengthAreas: Array<{
		area: string;
		evidence: string[];
		competitiveAdvantage?: string;
	}>;

	improvementSuggestions: Array<{
		area: string;
		suggestion: string;
		priority: "high" | "medium" | "low";
		estimatedImpact: string;
	}>;

	keywordsToAdd: string[];
	technicalGaps: string[];
	businessImpactOpportunities: string[];
}

export type ContentType =
	| "professional_summary"
	| "achievement_bullet"
	| "project_description"
	| "research_statement"
	| "teaching_philosophy"
	| "cover_letter"
	| "cover_letter_opening"
	| "cover_letter_body"
	| "cover_letter_closing";

export type ImprovementGoal =
	| "increase_quantification"
	| "highlight_business_impact"
	| "improve_technical_accuracy"
	| "enhance_readability"
	| "better_keyword_optimization"
	| "strengthen_achievements"
	| "clarify_technical_concepts"
	| "add_industry_context";

// Core types for data professional documents
export type DocumentsType = "resume" | "cv" | "cover_letter";
export type ExperienceLevel =
	| "entry"
	| "junior"
	| "mid"
	| "senior"
	| "lead"
	| "principal"
	| "executive";

export type DataSpecialization =
	| "data_scientist"
	| "data_engineer"
	| "data_analyst"
	| "ml_engineer"
	| "data_architect"
	| "business_intelligence"
	| "research_scientist"
	| "product_analytics"
	| "other";

export type DataIndustry =
	| "technology"
	| "finance"
	| "healthcare"
	| "retail"
	| "consulting"
	| "government"
	| "education"
	| "research"
	| "startup"
	| "other";

export type DataSkillCategory =
	| "programming"
	| "databases"
	| "ml_frameworks"
	| "visualization"
	| "cloud_platforms"
	| "big_data"
	| "statistics"
	| "domain_specific"
	| "soft_skills"
	| "other";

export type DataProjectType =
	| "machine_learning_model"
	| "data_pipeline"
	| "dashboard_analytics"
	| "research_analysis"
	| "a_b_testing"
	| "recommendation_system"
	| "time_series_forecasting"
	| "nlp_project"
	| "computer_vision"
	| "data_migration"
	| "optimization"
	| "other";
