// types/templates.ts
export interface Template {
	id: string;
	name: string;
	description?: string | null;
	category: "professional" | "modern" | "creative" | "academic";
	documentType: "resume" | "cv" | "cover_letter";
	parentTemplateId?: string | null;
	isBaseTemplate: boolean | null;
	targetSpecialization?: string | null;
	targetIndustry?: string | null;
	targetExperienceLevel?: string | null;
	previewImageUrl?: string | null;
	tags?: string[] | null;
	isPremium: boolean | null;
	isActive: boolean;
	isDraft: boolean;
	isFeatured: boolean;
	reviewStatus: "rejected" | "pending" | "approved" | null;
	qualityScore?: number | null;
	usageCount: number;
	avgRating?: number | null;
	version: string;
	createdBy?: string | null;
	createdAt: Date;
	updatedAt: Date;
}
