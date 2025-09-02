// components/admin/templates/panels/structure-panel.tsx
import {
	DragDropContext,
	Draggable,
	Droppable,
	type DropResult,
} from "@hello-pangea/dnd";
import {
	Briefcase,
	FileText,
	FolderOpen,
	GraduationCap,
	GripVertical,
	Plus,
	Star,
	Trash2,
	User,
	Wrench,
} from "lucide-react";
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const sectionIcons = {
	personal_info: User,
	summary: FileText,
	experience: Briefcase,
	education: GraduationCap,
	skills: Wrench,
	projects: FolderOpen,
	custom: Star,
};

const sectionTypeDescriptions = {
	personal_info: "Name, contact information, and basic details",
	summary: "Professional summary or objective statement",
	experience: "Work history and professional experience",
	education: "Educational background and certifications",
	skills: "Technical and soft skills",
	projects: "Portfolio projects and achievements",
	custom: "Custom section with flexible content",
};

export const StructurePanel: React.FC = () => {
	const form = useFormContext();
	const { fields, append, remove, move } = useFieldArray({
		control: form.control,
		name: "templateStructure.sections",
	});

	const addSection = () => {
		const newOrder =
			Math.max(
				...fields.map(
					(_, index) =>
						form.getValues(`templateStructure.sections.${index}.order`) || 0,
				),
				0,
			) + 1;
		append({
			id: `section-${Date.now()}`,
			name: "New Section",
			type: "custom",
			isRequired: false,
			order: newOrder,
			description: "",
		});
	};

	const onDragEnd = (result: DropResult) => {
		if (!result.destination) return;

		const sourceIndex = result.source.index;
		const destinationIndex = result.destination.index;

		move(sourceIndex, destinationIndex);

		// Update order values
		fields.forEach((_, index) => {
			form.setValue(`templateStructure.sections.${index}.order`, index);
		});
	};

	const getSectionTypeOptions = (currentType: string) => {
		const usedTypes = fields
			.map((_, index) =>
				form.getValues(`templateStructure.sections.${index}.type`),
			)
			.filter(
				(type, _, arr) =>
					type !== currentType || arr.filter((t) => t === type).length > 1,
			);

		return Object.entries(sectionTypeDescriptions)
			.filter(
				([type]) =>
					!usedTypes.includes(type) ||
					type === currentType ||
					type === "custom",
			)
			.map(([type, description]) => ({ type, description }));
	};

	return (
		<div className="max-h-full space-y-6 overflow-y-auto">
			{/* Layout Configuration */}
			<Card>
				<CardHeader>
					<CardTitle>Layout Configuration</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="templateStructure.layout.columns"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Layout Columns</FormLabel>
									<Select
										onValueChange={(value: string) =>
											field.onChange(Number.parseInt(value))
										}
										value={field.value?.toString()}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="1">Single Column</SelectItem>
											<SelectItem value="2">Two Columns</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										Main layout structure for the template
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="templateStructure.layout.headerStyle"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Header Style</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="minimal">Minimal</SelectItem>
											<SelectItem value="standard">Standard</SelectItem>
											<SelectItem value="prominent">Prominent</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										How prominently the header should be displayed
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Sections Management */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Template Sections ({fields.length})</CardTitle>
					<Button onClick={addSection} size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Add Section
					</Button>
				</CardHeader>
				<CardContent>
					{fields.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">
							<p>No sections configured.</p>
							<Button onClick={addSection} variant="outline" className="mt-2">
								<Plus className="mr-2 h-4 w-4" />
								Add First Section
							</Button>
						</div>
					) : (
						<DragDropContext onDragEnd={onDragEnd}>
							<Droppable droppableId="sections">
								{(provided) => (
									<div
										{...provided.droppableProps}
										ref={provided.innerRef}
										className="space-y-4"
									>
										{fields.map((field, index) => {
											const sectionType = form.watch(
												`templateStructure.sections.${index}.type`,
											);
											const SectionIcon =
												sectionIcons[
													sectionType as keyof typeof sectionIcons
												] || Star;

											return (
												<Draggable
													key={field.id}
													draggableId={field.id}
													index={index}
												>
													{(provided, snapshot) => (
														<Card
															ref={provided.innerRef}
															{...provided.draggableProps}
															className={`${snapshot.isDragging ? "shadow-lg" : ""}`}
														>
															<CardHeader className="pb-3">
																<div className="flex items-center justify-between">
																	<div className="flex items-center gap-2">
																		<div {...provided.dragHandleProps}>
																			<GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
																		</div>
																		<SectionIcon className="h-4 w-4" />
																		<span className="font-medium">
																			{form.watch(
																				`templateStructure.sections.${index}.name`,
																			) || "Untitled Section"}
																		</span>
																		<Badge
																			variant="outline"
																			className="text-xs"
																		>
																			Order: {index + 1}
																		</Badge>
																		{form.watch(
																			`templateStructure.sections.${index}.isRequired`,
																		) && (
																			<Badge
																				variant="secondary"
																				className="text-xs"
																			>
																				Required
																			</Badge>
																		)}
																	</div>
																	<Button
																		variant="ghost"
																		size="sm"
																		onClick={() => remove(index)}
																	>
																		<Trash2 className="h-4 w-4 text-red-500" />
																	</Button>
																</div>
															</CardHeader>
															<CardContent className="space-y-4">
																<div className="grid grid-cols-2 gap-4">
																	<FormField
																		control={form.control}
																		name={`templateStructure.sections.${index}.name`}
																		render={({ field }) => (
																			<FormItem>
																				<FormLabel>Section Name</FormLabel>
																				<FormControl>
																					<Input
																						{...field}
																						placeholder="Section name"
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>

																	<FormField
																		control={form.control}
																		name={`templateStructure.sections.${index}.type`}
																		render={({ field }) => (
																			<FormItem>
																				<FormLabel>Section Type</FormLabel>
																				<Select
																					onValueChange={field.onChange}
																					value={field.value}
																				>
																					<FormControl>
																						<SelectTrigger>
																							<SelectValue />
																						</SelectTrigger>
																					</FormControl>
																					<SelectContent>
																						{getSectionTypeOptions(
																							sectionType,
																						).map(({ type, description }) => (
																							<SelectItem
																								key={type}
																								value={type}
																							>
																								<div className="flex items-center gap-2">
																									{React.createElement(
																										sectionIcons[
																											type as keyof typeof sectionIcons
																										] || Star,
																										{ className: "h-3 w-3" },
																									)}
																									<div>
																										<div className="capitalize">
																											{type.replace("_", " ")}
																										</div>
																										<div className="text-muted-foreground text-xs">
																											{description}
																										</div>
																									</div>
																								</div>
																							</SelectItem>
																						))}
																					</SelectContent>
																				</Select>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																</div>

																<FormField
																	control={form.control}
																	name={`templateStructure.sections.${index}.description`}
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel>
																				Description (Optional)
																			</FormLabel>
																			<FormControl>
																				<Textarea
																					{...field}
																					placeholder="Describe what this section should contain..."
																					rows={2}
																				/>
																			</FormControl>
																			<FormDescription>
																				Guidance text shown to users filling out
																				this section
																			</FormDescription>
																			<FormMessage />
																		</FormItem>
																	)}
																/>

																<div className="flex items-center justify-between">
																	<FormField
																		control={form.control}
																		name={`templateStructure.sections.${index}.isRequired`}
																		render={({ field }) => (
																			<FormItem className="flex flex-row items-center space-x-2 space-y-0">
																				<FormControl>
																					<Switch
																						checked={field.value}
																						onCheckedChange={field.onChange}
																					/>
																				</FormControl>
																				<FormLabel className="text-sm">
																					Required Section
																				</FormLabel>
																			</FormItem>
																		)}
																	/>

																	<FormField
																		control={form.control}
																		name={`templateStructure.sections.${index}.maxItems`}
																		render={({ field }) => (
																			<FormItem className="flex items-center gap-2">
																				<FormLabel className="whitespace-nowrap text-sm">
																					Max Items:
																				</FormLabel>
																				<FormControl>
																					<Input
																						type="number"
																						{...field}
																						value={field.value || ""}
																						onChange={(e) =>
																							field.onChange(
																								e.target.value
																									? Number.parseInt(
																											e.target.value,
																										)
																									: undefined,
																							)
																						}
																						className="w-20"
																						placeholder="∞"
																						min="1"
																					/>
																				</FormControl>
																			</FormItem>
																		)}
																	/>
																</div>

																{/* Section Preview */}
																<div className="rounded-lg bg-gray-50 p-3">
																	<div className="mb-2 flex items-center gap-2">
																		<SectionIcon className="h-4 w-4 text-muted-foreground" />
																		<span className="font-medium text-sm">
																			{form.watch(
																				`templateStructure.sections.${index}.name`,
																			)}
																		</span>
																		{form.watch(
																			`templateStructure.sections.${index}.isRequired`,
																		) && (
																			<Badge
																				variant="destructive"
																				className="text-xs"
																			>
																				Required
																			</Badge>
																		)}
																	</div>
																	<p className="text-muted-foreground text-xs">
																		{form.watch(
																			`templateStructure.sections.${index}.description`,
																		) ||
																			sectionTypeDescriptions[
																				sectionType as keyof typeof sectionTypeDescriptions
																			]}
																	</p>
																</div>
															</CardContent>
														</Card>
													)}
												</Draggable>
											);
										})}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</DragDropContext>
					)}
				</CardContent>
			</Card>

			{/* Section Templates */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Add Sections</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
						{Object.entries(sectionTypeDescriptions).map(
							([type, description]) => {
								const isUsed = fields.some(
									(_, index) =>
										form.getValues(
											`templateStructure.sections.${index}.type`,
										) === type,
								);
								const Icon = sectionIcons[type as keyof typeof sectionIcons];

								return (
									<Button
										key={type}
										variant="outline"
										className="flex h-auto flex-col items-start gap-1 p-3"
										onClick={() => {
											if (type !== "custom" && isUsed) return;

											const newOrder =
												Math.max(
													...fields.map(
														(_, index) =>
															form.getValues(
																`templateStructure.sections.${index}.order`,
															) || 0,
													),
													0,
												) + 1;

											append({
												id: `${type}-${Date.now()}`,
												name: type
													.replace("_", " ")
													.replace(/\b\w/g, (l) => l.toUpperCase()),
												type,
												isRequired: type === "personal_info",
												order: newOrder,
												description: description,
											});
										}}
										disabled={type !== "custom" && isUsed}
									>
										<div className="flex items-center gap-2">
											<Icon className="h-4 w-4" />
											<span className="font-medium text-sm capitalize">
												{type.replace("_", " ")}
											</span>
											{isUsed && type !== "custom" && (
												<Badge variant="secondary" className="text-xs">
													Added
												</Badge>
											)}
										</div>
										<p className="text-left text-muted-foreground text-xs">
											{description}
										</p>
									</Button>
								);
							},
						)}
					</div>
				</CardContent>
			</Card>

			{/* Structure Summary */}
			<Card>
				<CardHeader>
					<CardTitle>Structure Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="flex items-center justify-between text-sm">
							<span>Total Sections:</span>
							<Badge>{fields.length}</Badge>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span>Required Sections:</span>
							<Badge>
								{
									fields.filter((_, index) =>
										form.watch(
											`templateStructure.sections.${index}.isRequired`,
										),
									).length
								}
							</Badge>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span>Layout:</span>
							<Badge>
								{form.watch("templateStructure.layout.columns") || 1} Column(s),
								{form.watch("templateStructure.layout.headerStyle") ||
									"standard"}{" "}
								Header
							</Badge>
						</div>

						<Separator />

						<div>
							<p className="mb-2 font-medium text-sm">Section Order:</p>
							<div className="flex flex-wrap gap-1">
								{fields
									.map((_, index) => ({
										index,
										name: form.watch(
											`templateStructure.sections.${index}.name`,
										),
										type: form.watch(
											`templateStructure.sections.${index}.type`,
										),
										isRequired: form.watch(
											`templateStructure.sections.${index}.isRequired`,
										),
									}))
									.sort((a, b) => a.index - b.index)
									.map(({ index, name, type, isRequired }) => {
										const Icon =
											sectionIcons[type as keyof typeof sectionIcons];
										return (
											<Badge
												key={index}
												variant="outline"
												className="flex items-center gap-1"
											>
												<Icon className="h-3 w-3" />
												{name}
												{isRequired && (
													<Star className="h-2 w-2 text-red-500" />
												)}
											</Badge>
										);
									})}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
