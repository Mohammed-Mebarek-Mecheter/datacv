// components/admin/templates/duplicate-template.tsx

import { Copy, Crown, Star } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { Template } from "@/types/templates";
import { trpc } from "@/utils/trpc";

interface DuplicateTemplateProps {
	template: Template;
	onSuccess?: () => void;
	trigger?: React.ReactNode;
}

const DuplicateTemplate: React.FC<DuplicateTemplateProps> = ({
	template,
	onSuccess,
	trigger,
}) => {
	const [open, setOpen] = React.useState(false);
	const [formData, setFormData] = React.useState({
		name: `${template.name} (Copy)`,
		description: template.description || "",
		category: template.category,
		setAsChildTemplate: false,
		targetSpecialization: template.targetSpecialization || "",
		targetIndustry: template.targetIndustry || "",
		targetExperienceLevel: template.targetExperienceLevel || "",
	});
	const [designOverrides, setDesignOverrides] = React.useState({
		enableColorOverride: false,
		primaryColor: "#000000",
		enableFontOverride: false,
		fontFamily: "Inter",
		enableLayoutOverride: false,
		columns: 1 as 1 | 2,
	});

	const duplicateMutation = trpc.admin.templates.duplicateTemplate.useMutation({
		onSuccess: () => {
			toast({
				title: "Template duplicated",
				description: "Template has been successfully duplicated.",
			});
			setOpen(false);
			onSuccess?.();
			resetForm();
		},
		onError: (error) => {
			toast({
				title: "Duplication failed",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const resetForm = () => {
		setFormData({
			name: `${template.name} (Copy)`,
			description: template.description || "",
			category: template.category,
			setAsChildTemplate: false,
			targetSpecialization: template.targetSpecialization || "",
			targetIndustry: template.targetIndustry || "",
			targetExperienceLevel: template.targetExperienceLevel || "",
		});
		setDesignOverrides({
			enableColorOverride: false,
			primaryColor: "#000000",
			enableFontOverride: false,
			fontFamily: "Inter",
			enableLayoutOverride: false,
			columns: 1,
		});
	};

	const handleDuplicate = () => {
		if (!formData.name.trim()) {
			toast({
				title: "Name required",
				description: "Please provide a name for the duplicate template.",
				variant: "destructive",
			});
			return;
		}

		// Build design config overrides
		const designConfigOverrides: any = {};
		if (designOverrides.enableColorOverride) {
			designConfigOverrides.colors = {
				primary: designOverrides.primaryColor,
			};
		}
		if (designOverrides.enableFontOverride) {
			designConfigOverrides.typography = {
				fontFamily: designOverrides.fontFamily,
			};
		}
		if (designOverrides.enableLayoutOverride) {
			designConfigOverrides.layout = {
				columns: designOverrides.columns,
			};
		}

		duplicateMutation.mutate({
			templateId: template.id,
			name: formData.name,
			description: formData.description,
			category: formData.category as any,
			setAsChildTemplate: formData.setAsChildTemplate,
			targetSpecialization: formData.targetSpecialization,
			targetIndustries: formData.targetIndustry,
			targetExperienceLevel: formData.targetExperienceLevel,
			designConfigOverrides:
				Object.keys(designConfigOverrides).length > 0
					? designConfigOverrides
					: undefined,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" size="sm">
						<Copy className="mr-2 h-4 w-4" />
						Duplicate
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Duplicate Template</DialogTitle>
					<DialogDescription>
						Create a copy of "{template.name}" with optional customizations
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Source Template Info */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Source Template</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="mb-2 flex items-center gap-2">
								<span className="font-medium">{template.name}</span>
								<div className="flex items-center gap-1">
									{template.isPremium && (
										<Crown className="h-3 w-3 text-yellow-500" />
									)}
									{template.isFeatured && (
										<Star className="h-3 w-3 text-blue-500" />
									)}
								</div>
							</div>
							<div className="flex gap-2">
								<Badge>{template.category}</Badge>
								<Badge variant="outline">{template.documentType}</Badge>
							</div>
						</CardContent>
					</Card>

					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Basic Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="duplicate-name">Template Name *</Label>
								<Input
									id="duplicate-name"
									value={formData.name}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder="Enter template name"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="duplicate-description">Description</Label>
								<Textarea
									id="duplicate-description"
									value={formData.description}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									placeholder="Enter template description"
									rows={3}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="duplicate-category">Category</Label>
								<Select
									value={formData.category}
									onValueChange={(value: Template["category"]) =>
										setFormData((prev) => ({ ...prev, category: value }))
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="professional">Professional</SelectItem>
										<SelectItem value="modern">Modern</SelectItem>
										<SelectItem value="creative">Creative</SelectItem>
										<SelectItem value="academic">Academic</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center justify-between">
								<Label htmlFor="set-as-child">Set as Child Template</Label>
								<Switch
									id="set-as-child"
									checked={formData.setAsChildTemplate}
									onCheckedChange={(checked: boolean) =>
										setFormData((prev) => ({
											...prev,
											setAsChildTemplate: checked,
										}))
									}
								/>
							</div>
							{formData.setAsChildTemplate && (
								<p className="text-muted-foreground text-xs">
									This template will inherit updates from the source template
								</p>
							)}
						</CardContent>
					</Card>

					{/* Target Audience */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Target Audience</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>Specialization</Label>
								<Select
									value={formData.targetSpecialization}
									onValueChange={(value: string) =>
										setFormData((prev) => ({
											...prev,
											targetSpecialization: value,
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select specialization" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">Not specified</SelectItem>
										<SelectItem value="data_scientist">
											Data Scientist
										</SelectItem>
										<SelectItem value="data_analyst">Data Analyst</SelectItem>
										<SelectItem value="data_engineer">Data Engineer</SelectItem>
										<SelectItem value="ml_engineer">ML Engineer</SelectItem>
										<SelectItem value="business_analyst">
											Business Analyst
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Industry</Label>
								<Select
									value={formData.targetIndustry}
									onValueChange={(value: string) =>
										setFormData((prev) => ({
											...prev,
											targetIndustry: value,
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select industry" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">Not specified</SelectItem>
										<SelectItem value="tech">Technology</SelectItem>
										<SelectItem value="finance">Finance</SelectItem>
										<SelectItem value="healthcare">Healthcare</SelectItem>
										<SelectItem value="consulting">Consulting</SelectItem>
										<SelectItem value="retail">Retail</SelectItem>
										<SelectItem value="education">Education</SelectItem>
										<SelectItem value="government">Government</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Experience Level</Label>
								<Select
									value={formData.targetExperienceLevel}
									onValueChange={(value: string) =>
										setFormData((prev) => ({
											...prev,
											targetExperienceLevel: value,
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select experience level" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">Not specified</SelectItem>
										<SelectItem value="entry">Entry Level</SelectItem>
										<SelectItem value="mid">Mid Level</SelectItem>
										<SelectItem value="senior">Senior Level</SelectItem>
										<SelectItem value="executive">Executive</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{/* Design Overrides */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								Design Customizations (Optional)
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Color Override */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label htmlFor="color-override">Override Colors</Label>
									<Switch
										id="color-override"
										checked={designOverrides.enableColorOverride}
										onCheckedChange={(checked: boolean) =>
											setDesignOverrides((prev) => ({
												...prev,
												enableColorOverride: checked,
											}))
										}
									/>
								</div>
								{designOverrides.enableColorOverride && (
									<div className="space-y-2">
										<Label>Primary Color</Label>
										<div className="flex items-center gap-2">
											<Input
												type="color"
												value={designOverrides.primaryColor}
												onChange={(e) =>
													setDesignOverrides((prev) => ({
														...prev,
														primaryColor: e.target.value,
													}))
												}
												className="h-8 w-16"
											/>
											<Input
												value={designOverrides.primaryColor}
												onChange={(e) =>
													setDesignOverrides((prev) => ({
														...prev,
														primaryColor: e.target.value,
													}))
												}
												placeholder="#000000"
											/>
										</div>
									</div>
								)}
							</div>

							{/* Font Override */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label htmlFor="font-override">Override Font</Label>
									<Switch
										id="font-override"
										checked={designOverrides.enableFontOverride}
										onCheckedChange={(checked: boolean) =>
											setDesignOverrides((prev) => ({
												...prev,
												enableFontOverride: checked,
											}))
										}
									/>
								</div>
								{designOverrides.enableFontOverride && (
									<div className="space-y-2">
										<Label>Font Family</Label>
										<Select
											value={designOverrides.fontFamily}
											onValueChange={(value: string) =>
												setDesignOverrides((prev) => ({
													...prev,
													fontFamily: value,
												}))
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Inter">Inter</SelectItem>
												<SelectItem value="Roboto">Roboto</SelectItem>
												<SelectItem value="Open Sans">Open Sans</SelectItem>
												<SelectItem value="Lato">Lato</SelectItem>
												<SelectItem value="Merriweather">
													Merriweather
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								)}
							</div>

							{/* Layout Override */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label htmlFor="layout-override">Override Layout</Label>
									<Switch
										id="layout-override"
										checked={designOverrides.enableLayoutOverride}
										onCheckedChange={(checked: boolean) =>
											setDesignOverrides((prev) => ({
												...prev,
												enableLayoutOverride: checked,
											}))
										}
									/>
								</div>
								{designOverrides.enableLayoutOverride && (
									<div className="space-y-2">
										<Label>Columns</Label>
										<Select
											value={designOverrides.columns.toString()}
											onValueChange={(value: string) =>
												setDesignOverrides((prev) => ({
													...prev,
													columns: Number.parseInt(value) as 1 | 2,
												}))
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">Single Column</SelectItem>
												<SelectItem value="2">Two Columns</SelectItem>
											</SelectContent>
										</Select>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Summary */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Summary</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2 text-sm">
								<div>
									<strong>New Name:</strong> {formData.name}
								</div>
								<div>
									<strong>Category:</strong> {formData.category}
								</div>
								<div>
									<strong>Relationship:</strong>{" "}
									{formData.setAsChildTemplate
										? "Child Template"
										: "Independent Copy"}
								</div>
								{(designOverrides.enableColorOverride ||
									designOverrides.enableFontOverride ||
									designOverrides.enableLayoutOverride) && (
									<div>
										<strong>Design Overrides:</strong>
										<ul className="mt-1 ml-2 list-inside list-disc">
											{designOverrides.enableColorOverride && (
												<li>Primary color: {designOverrides.primaryColor}</li>
											)}
											{designOverrides.enableFontOverride && (
												<li>Font family: {designOverrides.fontFamily}</li>
											)}
											{designOverrides.enableLayoutOverride && (
												<li>Layout: {designOverrides.columns} column(s)</li>
											)}
										</ul>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={handleDuplicate}
							disabled={duplicateMutation.isPending || !formData.name.trim()}
						>
							{duplicateMutation.isPending
								? "Duplicating..."
								: "Create Duplicate"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DuplicateTemplate;
