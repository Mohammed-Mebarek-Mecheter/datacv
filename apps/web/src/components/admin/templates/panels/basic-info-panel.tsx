// components/admin/templates/panels/basic-info-panel.tsx
import { Crown, Eye, EyeOff, Star } from "lucide-react";
import type React from "react";
import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const BasicInfoPanel: React.FC = () => {
	const form = useFormContext();

	return (
		<div className="max-h-full space-y-6 overflow-y-auto">
			{/* Template Identity */}
			<Card>
				<CardHeader>
					<CardTitle>Template Identity</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Template Name *</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Modern Data Professional Resume"
										className="font-medium"
									/>
								</FormControl>
								<FormDescription>
									Choose a descriptive name that indicates the template's style
									and target audience
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										placeholder="A clean, modern template designed for data professionals with 2-5 years of experience..."
										rows={3}
									/>
								</FormControl>
								<FormDescription>
									Provide context about the template's design, target audience,
									and key features
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="category"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category *</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select category" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="professional">Professional</SelectItem>
											<SelectItem value="modern">Modern</SelectItem>
											<SelectItem value="creative">Creative</SelectItem>
											<SelectItem value="academic">Academic</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="documentType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Document Type *</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="resume">Resume</SelectItem>
											<SelectItem value="cv">CV</SelectItem>
											<SelectItem value="cover_letter">Cover Letter</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="version"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Version</FormLabel>
								<FormControl>
									<Input {...field} placeholder="1.0.0" />
								</FormControl>
								<FormDescription>
									Use semantic versioning (major.minor.patch)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>

			{/* Target Audience */}
			<Card>
				<CardHeader>
					<CardTitle>Target Audience</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="targetSpecialization"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Specializations</FormLabel>
								<FormControl>
									<Input
										placeholder="data_science, data_engineering, machine_learning"
										value={field.value?.join(", ") || ""}
										onChange={(e) => {
											const values = e.target.value
												.split(",")
												.map((v) => v.trim())
												.filter(Boolean);
											field.onChange(values);
										}}
									/>
								</FormControl>
								<FormDescription>
									Comma-separated list of target specializations (leave empty
									for all)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="targetIndustries"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Industries</FormLabel>
								<FormControl>
									<Input
										placeholder="technology, finance, healthcare"
										value={field.value?.join(", ") || ""}
										onChange={(e) => {
											const values = e.target.value
												.split(",")
												.map((v) => v.trim())
												.filter(Boolean);
											field.onChange(values);
										}}
									/>
								</FormControl>
								<FormDescription>
									Comma-separated list of target industries (leave empty for
									all)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="targetExperienceLevel"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Experience Level</FormLabel>
								<Select
									onValueChange={field.onChange}
									value={field.value || ""}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select level" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="none">Not specified</SelectItem>
										<SelectItem value="entry">
											Entry Level (0-2 years)
										</SelectItem>
										<SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
										<SelectItem value="senior">
											Senior Level (5+ years)
										</SelectItem>
										<SelectItem value="executive">
											Executive/Leadership
										</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>

			{/* Template Settings */}
			<Card>
				<CardHeader>
					<CardTitle>Template Settings</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-6">
						<FormField
							control={form.control}
							name="isPremium"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="flex items-center gap-2">
											<Crown className="h-4 w-4 text-yellow-500" />
											Premium Template
										</FormLabel>
										<FormDescription>
											Requires Pro subscription to use
										</FormDescription>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isFeatured"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="flex items-center gap-2">
											<Star className="h-4 w-4 text-blue-500" />
											Featured Template
										</FormLabel>
										<FormDescription>
											Highlighted in template gallery
										</FormDescription>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isActive"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="flex items-center gap-2">
											{field.value ? (
												<Eye className="h-4 w-4 text-green-500" />
											) : (
												<EyeOff className="h-4 w-4 text-gray-400" />
											)}
											Active Template
										</FormLabel>
										<FormDescription>Available to users</FormDescription>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isBaseTemplate"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel>Base Template</FormLabel>
										<FormDescription>
											Can be used as foundation for other templates
										</FormDescription>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>

					<Separator />

					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="isDraft"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Draft Status</FormLabel>
									<Select
										onValueChange={(value: string) => field.onChange(value === "true")}
										value={field.value.toString()}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="true">Draft</SelectItem>
											<SelectItem value="false">Published</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										Draft templates are not visible to end users
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="reviewStatus"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Review Status</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="pending">Pending Review</SelectItem>
											<SelectItem value="approved">Approved</SelectItem>
											<SelectItem value="rejected">Rejected</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Preview & SEO */}
			<Card>
				<CardHeader>
					<CardTitle>Preview & SEO</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="previewImageUrl"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Preview Image URL</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="https://example.com/preview.png"
										type="url"
									/>
								</FormControl>
								<FormDescription>
									URL for the template preview image shown in galleries
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="tags"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Tags</FormLabel>
								<FormControl>
									<Input
										value={
											Array.isArray(field.value) ? field.value.join(", ") : ""
										}
										onChange={(e) =>
											field.onChange(
												e.target.value
													.split(",")
													.map((tag) => tag.trim())
													.filter(Boolean),
											)
										}
										placeholder="modern, data-science, professional"
									/>
								</FormControl>
								<FormDescription>
									Comma-separated tags for search and categorization
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>

			{/* Template Relationship */}
			<Card>
				<CardHeader>
					<CardTitle>Template Relationship</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="parentTemplateId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Parent Template ID</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Leave empty for root template"
									/>
								</FormControl>
								<FormDescription>
									If this template inherits from another template, specify the
									parent ID
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{form.watch("parentTemplateId") && (
						<div className="rounded-lg bg-blue-50 p-3">
							<p className="text-blue-800 text-sm">
								This template will inherit structure and design from its parent
								template. Changes to the parent may affect this template.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Current Status Preview */}
			<Card>
				<CardHeader>
					<CardTitle>Current Status</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2">
						<Badge variant={form.watch("isActive") ? "default" : "secondary"}>
							{form.watch("isActive") ? "Active" : "Inactive"}
						</Badge>
						<Badge variant={form.watch("isDraft") ? "outline" : "default"}>
							{form.watch("isDraft") ? "Draft" : "Published"}
						</Badge>
						<Badge variant="outline">{form.watch("reviewStatus")}</Badge>
						{form.watch("isPremium") && (
							<Badge className="bg-yellow-100 text-yellow-800">
								<Crown className="mr-1 h-3 w-3" />
								Premium
							</Badge>
						)}
						{form.watch("isFeatured") && (
							<Badge className="bg-blue-100 text-blue-800">
								<Star className="mr-1 h-3 w-3" />
								Featured
							</Badge>
						)}
						{form.watch("isBaseTemplate") && (
							<Badge variant="outline">Base Template</Badge>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
