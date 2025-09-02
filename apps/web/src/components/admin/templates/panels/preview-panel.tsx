// components/admin/templates/panels/preview-panel.tsx
import {
	Download,
	Eye,
	Maximize2,
	Monitor,
	Printer,
	RefreshCw,
	Smartphone,
} from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PreviewPanelProps {
	templateData: any;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ templateData }) => {
	const [previewMode, setPreviewMode] = React.useState<
		"desktop" | "mobile" | "print"
	>("desktop");
	const [isFullscreen, setIsFullscreen] = React.useState(false);
	const [refreshKey, setRefreshKey] = React.useState(0);

	const handleRefresh = () => {
		setRefreshKey((prev) => prev + 1);
	};

	const handleExport = (format: "pdf" | "png") => {
		// Implementation would connect to export service
		console.log(`Exporting as ${format}`, templateData);
	};

	const renderPreview = () => {
		if (!templateData) {
			return (
				<div className="flex h-96 items-center justify-center text-muted-foreground">
					<div className="text-center">
						<Eye className="mx-auto mb-2 h-8 w-8" />
						<p>Preview will appear here</p>
						<p className="text-sm">
							Configure template structure and design to see preview
						</p>
					</div>
				</div>
			);
		}

		const { templateStructure, designConfig } = templateData;

		return (
			<div
				key={refreshKey}
				className={`rounded-lg border bg-white transition-all duration-300 ${
					previewMode === "mobile"
						? "mx-auto max-w-sm"
						: previewMode === "print"
							? "mx-auto max-w-[8.5in]"
							: "w-full"
				}`}
				style={{
					fontFamily: designConfig?.typography?.fontFamily || "Inter",
					fontSize: `${designConfig?.typography?.fontSize || 12}pt`,
					lineHeight: designConfig?.typography?.lineHeight || 1.5,
					color: designConfig?.colors?.text || "#000000",
					backgroundColor: designConfig?.colors?.background || "#ffffff",
				}}
			>
				{/* Mock Resume Content */}
				<div className="space-y-4 p-6">
					{/* Header */}
					<div
						className={`text-center ${
							templateStructure?.layout?.headerStyle === "prominent"
								? "pb-6"
								: templateStructure?.layout?.headerStyle === "minimal"
									? "pb-2"
									: "pb-4"
						}`}
					>
						<h1
							className="mb-1 font-bold text-2xl"
							style={{
								color: designConfig?.colors?.primary || "#000000",
								fontFamily:
									designConfig?.typography?.headingFontFamily ||
									designConfig?.typography?.fontFamily ||
									"Inter",
							}}
						>
							John Doe
						</h1>
						<p
							className="text-lg"
							style={{ color: designConfig?.colors?.secondary || "#666666" }}
						>
							Senior Data Scientist
						</p>
						<p className="text-sm">
							john.doe@email.com • +1 (555) 123-4567 • New York, NY
						</p>
					</div>

					{templateStructure?.layout?.columns === 2 ? (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-4">
								{templateStructure.sections
									?.filter((section: any, index: number) => index % 2 === 0)
									?.map((section: any, index: number) =>
										renderSection(section, index, designConfig),
									)}
							</div>
							<div className="space-y-4">
								{templateStructure.sections
									?.filter((section: any, index: number) => index % 2 === 1)
									?.map((section: any, index: number) =>
										renderSection(section, index, designConfig),
									)}
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{templateStructure?.sections?.map((section: any, index: number) =>
								renderSection(section, index, designConfig),
							)}
						</div>
					)}
				</div>
			</div>
		);
	};

	const renderSection = (section: any, index: number, designConfig: any) => {
		const sectionSpacing = designConfig?.spacing?.sectionSpacing || 16;

		return (
			<div key={section.id} style={{ marginBottom: `${sectionSpacing}px` }}>
				<h2
					className="mb-2 pb-1 font-semibold"
					style={{
						color: designConfig?.colors?.primary || "#000000",
						borderBottom: designConfig?.borders?.headerUnderline
							? `${designConfig?.borders?.width || 1}px ${designConfig?.borders?.style || "solid"} ${designConfig?.colors?.primary || "#000000"}`
							: "none",
					}}
				>
					{section.name}
				</h2>

				{section.type === "summary" && (
					<p className="text-sm">
						Experienced data scientist with 5+ years developing machine learning
						models that increased revenue by 23% and reduced customer churn by
						18%. Expert in Python, SQL, and cloud platforms.
					</p>
				)}

				{section.type === "experience" && (
					<div className="space-y-3">
						<div>
							<div className="flex items-start justify-between">
								<div>
									<h3 className="font-medium">Senior Data Scientist</h3>
									<p
										style={{
											color: designConfig?.colors?.secondary || "#666666",
										}}
									>
										Tech Corp • San Francisco, CA
									</p>
								</div>
								<span className="text-sm">2022 - Present</span>
							</div>
							<ul className="mt-2 list-inside list-disc space-y-1 text-sm">
								<li>
									Developed ML models improving prediction accuracy by 25%
								</li>
								<li>
									Led team of 3 data scientists on customer segmentation project
								</li>
								<li>
									Implemented A/B testing framework processing 1M+ events daily
								</li>
							</ul>
						</div>
					</div>
				)}

				{section.type === "education" && (
					<div>
						<div className="flex items-start justify-between">
							<div>
								<h3 className="font-medium">M.S. Data Science</h3>
								<p
									style={{
										color: designConfig?.colors?.secondary || "#666666",
									}}
								>
									Stanford University
								</p>
							</div>
							<span className="text-sm">2020</span>
						</div>
					</div>
				)}

				{section.type === "skills" && (
					<div className="grid grid-cols-2 gap-2">
						{["Python", "SQL", "TensorFlow", "AWS", "Tableau", "Git"].map(
							(skill) => (
								<span
									key={skill}
									className="rounded bg-gray-100 px-2 py-1 text-sm"
								>
									{skill}
								</span>
							),
						)}
					</div>
				)}

				{section.type === "projects" && (
					<div>
						<h3 className="font-medium">Customer Churn Prediction Model</h3>
						<p className="mt-1 text-sm">
							Built ensemble model achieving 94% accuracy, reducing churn by 15%
							and saving $2M annually in retention costs.
						</p>
					</div>
				)}

				{section.type === "custom" && (
					<div className="rounded-lg bg-gray-50 p-3">
						<p className="text-muted-foreground text-sm">
							Custom section:{" "}
							{section.description || "User-defined content will appear here"}
						</p>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="flex h-full flex-col">
			{/* Preview Controls */}
			<Card className="mb-4">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Eye className="h-4 w-4" />
							Template Preview
						</CardTitle>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" onClick={handleRefresh}>
								<RefreshCw className="mr-1 h-3 w-3" />
								Refresh
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsFullscreen(!isFullscreen)}
							>
								<Maximize2 className="mr-1 h-3 w-3" />
								{isFullscreen ? "Exit" : "Fullscreen"}
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						{/* Preview Mode Selector */}
						<div className="flex items-center gap-2">
							<Button
								variant={previewMode === "desktop" ? "default" : "outline"}
								size="sm"
								onClick={() => setPreviewMode("desktop")}
							>
								<Monitor className="mr-1 h-4 w-4" />
								Desktop
							</Button>
							<Button
								variant={previewMode === "mobile" ? "default" : "outline"}
								size="sm"
								onClick={() => setPreviewMode("mobile")}
							>
								<Smartphone className="mr-1 h-4 w-4" />
								Mobile
							</Button>
							<Button
								variant={previewMode === "print" ? "default" : "outline"}
								size="sm"
								onClick={() => setPreviewMode("print")}
							>
								<Printer className="mr-1 h-4 w-4" />
								Print
							</Button>
						</div>

						{/* Export Options */}
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleExport("pdf")}
							>
								<Download className="mr-1 h-4 w-4" />
								Export PDF
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleExport("png")}
							>
								<Download className="mr-1 h-4 w-4" />
								Export PNG
							</Button>
						</div>
					</div>

					<Separator className="my-4" />

					{/* Template Info */}
					<div className="flex items-center gap-4 text-muted-foreground text-sm">
						<div className="flex items-center gap-1">
							<span>Category:</span>
							<Badge variant="outline">{templateData?.category}</Badge>
						</div>
						<div className="flex items-center gap-1">
							<span>Type:</span>
							<Badge variant="outline">{templateData?.documentType}</Badge>
						</div>
						<div className="flex items-center gap-1">
							<span>Sections:</span>
							<Badge variant="outline">
								{templateData?.templateStructure?.sections?.length || 0}
							</Badge>
						</div>
						<div className="flex items-center gap-1">
							<span>Layout:</span>
							<Badge variant="outline">
								{templateData?.templateStructure?.layout?.columns || 1}{" "}
								Column(s)
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Preview Container */}
			<div
				className={`flex-1 overflow-auto ${isFullscreen ? "fixed inset-0 z-50 bg-white p-4" : ""}`}
			>
				<div className="flex h-full w-full items-start justify-center">
					{renderPreview()}
				</div>
			</div>
		</div>
	);
};
