// components/admin/templates/panels/quality-panel.tsx
import {
	AlertTriangle,
	CheckCircle,
	Shield,
	Star,
	Target,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import type React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface QualityPanelProps {
	templateData: any;
	validationErrors: string[];
}

export const QualityPanel: React.FC<QualityPanelProps> = ({
	templateData,
	validationErrors,
}) => {
	const calculateQualityScore = () => {
		let score = 0;
		const maxScore = 100;

		// Basic information completeness (20 points)
		if (templateData?.name) score += 5;
		if (templateData?.description && templateData.description.length > 20)
			score += 10;
		if (templateData?.tags && templateData.tags.length > 0) score += 5;

		// Structure quality (30 points)
		const sections = templateData?.templateStructure?.sections || [];
		if (sections.length >= 3) score += 10;
		if (sections.some((s: any) => s.type === "personal_info")) score += 5;
		if (sections.some((s: any) => s.type === "experience")) score += 10;
		if (
			sections.filter((s: any) => s.description).length >=
			sections.length * 0.7
		)
			score += 5;

		// Design configuration (25 points)
		const design = templateData?.designConfig;
		if (design?.colors?.primary && design.colors.primary !== "#000000")
			score += 5;
		if (design?.typography?.fontFamily) score += 5;
		if (design?.spacing?.sectionSpacing) score += 5;
		if (design?.layout?.columns) score += 5;
		if (design?.colors?.background && design.colors.text) score += 5;

		// Target audience specificity (15 points)
		if (templateData?.targetSpecialization) score += 5;
		if (templateData?.targetIndustry) score += 5;
		if (templateData?.targetExperienceLevel) score += 5;

		// Validation and errors (10 points)
		if (validationErrors.length === 0) score += 10;
		else if (validationErrors.length <= 2) score += 5;

		return Math.min(score, maxScore);
	};

	const getScoreColor = (score: number) => {
		if (score >= 80) return "text-green-600";
		if (score >= 60) return "text-yellow-600";
		return "text-red-600";
	};

	const getScoreBadge = (score: number) => {
		if (score >= 80)
			return {
				variant: "default" as const,
				label: "Excellent",
				color: "bg-green-100 text-green-800",
			};
		if (score >= 60)
			return {
				variant: "secondary" as const,
				label: "Good",
				color: "bg-yellow-100 text-yellow-800",
			};
		return {
			variant: "destructive" as const,
			label: "Needs Improvement",
			color: "bg-red-100 text-red-800",
		};
	};

	const qualityScore = calculateQualityScore();
	const scoreBadge = getScoreBadge(qualityScore);

	const checklistItems = [
		{
			id: "basic-info",
			label: "Complete Basic Information",
			check: () =>
				templateData?.name &&
				templateData?.description &&
				templateData.description.length > 20,
			points: 15,
			icon: CheckCircle,
		},
		{
			id: "sections",
			label: "Adequate Section Coverage",
			check: () => {
				const sections = templateData?.templateStructure?.sections || [];
				return (
					sections.length >= 3 &&
					sections.some((s: any) => s.type === "personal_info") &&
					sections.some((s: any) => s.type === "experience")
				);
			},
			points: 20,
			icon: Target,
		},
		{
			id: "design",
			label: "Custom Design Configuration",
			check: () => {
				const design = templateData?.designConfig;
				return (
					design?.colors?.primary &&
					design.colors.primary !== "#000000" &&
					design?.typography?.fontFamily
				);
			},
			points: 15,
			icon: Zap,
		},
		{
			id: "targeting",
			label: "Specific Target Audience",
			check: () =>
				templateData?.targetSpecialization || templateData?.targetIndustry,
			points: 10,
			icon: Users,
		},
		{
			id: "validation",
			label: "No Validation Errors",
			check: () => validationErrors.length === 0,
			points: 20,
			icon: Shield,
		},
		{
			id: "preview",
			label: "Preview Image Available",
			check: () => templateData?.previewImageUrl,
			points: 10,
			icon: Star,
		},
		{
			id: "tags",
			label: "Relevant Tags Added",
			check: () => templateData?.tags && templateData.tags.length >= 2,
			points: 10,
			icon: Target,
		},
	];

	return (
		<div className="max-h-full space-y-6 overflow-y-auto">
			{/* Quality Score Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-4 w-4" />
						Quality Score
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<span
									className={`font-bold text-3xl ${getScoreColor(qualityScore)}`}
								>
									{qualityScore}%
								</span>
								<Badge className={scoreBadge.color}>{scoreBadge.label}</Badge>
							</div>
						</div>

						<Progress value={qualityScore} className="h-2" />

						<div className="grid grid-cols-3 gap-4 text-center">
							<div>
								<p className="text-muted-foreground text-sm">Current Score</p>
								<p className="font-semibold">{qualityScore}/100</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Target</p>
								<p className="font-semibold">80+</p>
							</div>
							<div>
								<p className="text-muted-foreground text-sm">Improvement</p>
								<p className="font-semibold">
									+{Math.max(0, 80 - qualityScore)}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Quality Checklist */}
			<Card>
				<CardHeader>
					<CardTitle>Quality Checklist</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{checklistItems.map((item) => {
							const isCompleted = item.check();
							const Icon = item.icon;

							return (
								<div
									key={item.id}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex items-center gap-3">
										<Icon
											className={`h-4 w-4 ${isCompleted ? "text-green-500" : "text-gray-400"}`}
										/>
										<span
											className={
												isCompleted
													? "text-foreground"
													: "text-muted-foreground"
											}
										>
											{item.label}
										</span>
										{isCompleted && (
											<Badge
												variant="outline"
												className="border-green-600 text-green-600"
											>
												Complete
											</Badge>
										)}
									</div>
									<Badge variant="outline">+{item.points} pts</Badge>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Validation Results */}
			{validationErrors.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-red-600">
							<AlertTriangle className="h-4 w-4" />
							Validation Issues ({validationErrors.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{validationErrors.map((error, index) => (
								<Alert key={index}>
									<AlertTriangle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Recommendations */}
			<Card>
				<CardHeader>
					<CardTitle>Recommendations</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{qualityScore < 60 && (
							<Alert>
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>
									<strong>Quality Score Below 60%:</strong> This template needs
									significant improvements before being published. Focus on
									completing the checklist items above.
								</AlertDescription>
							</Alert>
						)}

						{!templateData?.targetSpecialization && (
							<Alert>
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>
									<strong>Missing Target Specialization:</strong> Specify the
									target role (e.g., Data Scientist, Data Analyst) for better
									user matching.
								</AlertDescription>
							</Alert>
						)}

						{(!templateData?.tags || templateData.tags.length < 2) && (
							<Alert>
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>
									<strong>Insufficient Tags:</strong> Add at least 2-3 relevant
									tags to improve template discoverability.
								</AlertDescription>
							</Alert>
						)}

						{!templateData?.previewImageUrl && (
							<Alert>
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>
									<strong>Missing Preview Image:</strong> Add a preview image to
									help users understand the template's appearance.
								</AlertDescription>
							</Alert>
						)}

						{qualityScore >= 80 && validationErrors.length === 0 && (
							<Alert>
								<CheckCircle className="h-4 w-4" />
								<AlertDescription>
									<strong>Ready for Publishing:</strong> This template meets all
									quality standards and is ready to be published for users.
								</AlertDescription>
							</Alert>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
