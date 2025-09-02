// src/app/(app)/(admin)/admin/templates/page.tsx
"use client";

import { format } from "date-fns";
import {
	AlertCircle,
	CheckCircle,
	Clock,
	Copy,
	Crown,
	Edit,
	Eye,
	Grid,
	List,
	MoreHorizontal,
	Plus,
	Search,
	SortAsc,
	SortDesc,
	Star,
	Trash2,
	TrendingUp,
	Users,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import BulkActions from "@/components/admin/templates/bulk-actions";
import DuplicateTemplate from "@/components/admin/templates/duplicate-template";
import TemplateFilters from "@/components/admin/templates/template-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
// Import components
import type { Template } from "@/types/templates";
import { trpc } from "@/utils/trpc";

// Helper function to safely parse template data
const parseTemplateData = (data: any): Template => ({
	...data,
	isPremium: data.isPremium ?? false,
	isBaseTemplate: data.isBaseTemplate ?? false,
	tags: data.tags ?? [],
	reviewStatus:
		data.reviewStatus === "rejected" ||
		data.reviewStatus === "pending" ||
		data.reviewStatus === "approved"
			? data.reviewStatus
			: null,
	avgRating:
		typeof data.avgRating === "string"
			? Number.parseFloat(data.avgRating)
			: data.avgRating,
});

const createHref = (path: string) => path as any;

export default function AdminTemplatesPage() {
	const [viewMode, setViewMode] = useState<"list" | "grid">("list");
	const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
	const [filters, setFilters] = useState({});
	const [searchTerm, setSearchTerm] = useState("");
	const [sortConfig, setSortConfig] = useState({
		field: "updated" as
			| "name"
			| "created"
			| "updated"
			| "usage"
			| "rating"
			| "quality",
		order: "desc" as "asc" | "desc",
	});
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(20);

	// Fetch templates with filters
	const {
		data: templatesData,
		isLoading,
		refetch,
	} = trpc.admin.templates.getTemplates.useQuery({
		...filters,
		search: searchTerm || undefined,
		sortBy: sortConfig.field as any,
		sortOrder: sortConfig.order,
		limit: pageSize,
		offset: (currentPage - 1) * pageSize,
	});

	const templates = templatesData?.templates?.map(parseTemplateData) || [];
	const totalCount = templatesData?.totalCount || 0;
	const totalPages = Math.ceil(totalCount / pageSize);

	// Delete template mutation
	const deleteTemplateMutation =
		trpc.admin.templates.deleteTemplate.useMutation({
			onSuccess: () => {
				toast({
					title: "Template deleted",
					description: "Template has been successfully deleted.",
				});
				refetch();
				setSelectedTemplates((prev) => prev.filter((id) => !prev.includes(id)));
			},
			onError: (error) => {
				toast({
					title: "Delete failed",
					description: error.message,
					variant: "destructive",
				});
			},
		});

	const handleSelectTemplate = (templateId: string) => {
		setSelectedTemplates((prev) =>
			prev.includes(templateId)
				? prev.filter((id) => id !== templateId)
				: [...prev, templateId],
		);
	};

	const handleSelectAll = () => {
		if (selectedTemplates.length === templates.length) {
			setSelectedTemplates([]);
		} else {
			setSelectedTemplates(templates.map((t) => t.id));
		}
	};

	const handleDeleteTemplate = (templateId: string) => {
		if (confirm("Are you sure you want to delete this template?")) {
			deleteTemplateMutation.mutate({ id: templateId });
		}
	};

	const handleSort = (
		field: "name" | "created" | "updated" | "usage" | "rating" | "quality",
	) => {
		setSortConfig((prev) => ({
			field,
			order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
		}));
	};

	const getStatusIcon = (template: Template) => {
		if (!template.isActive)
			return <XCircle className="h-4 w-4 text-gray-400" />;
		if (template.reviewStatus === "pending")
			return <Clock className="h-4 w-4 text-orange-500" />;
		if (template.reviewStatus === "approved")
			return <CheckCircle className="h-4 w-4 text-green-500" />;
		if (template.reviewStatus === "rejected")
			return <XCircle className="h-4 w-4 text-red-500" />;
		return <AlertCircle className="h-4 w-4 text-gray-400" />;
	};

	const getCategoryColor = (category: string) => {
		const colors = {
			professional: "bg-blue-100 text-blue-800",
			modern: "bg-purple-100 text-purple-800",
			creative: "bg-pink-100 text-pink-800",
			academic: "bg-green-100 text-green-800",
		};
		return (
			colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
		);
	};

	const getSortIcon = (field: string) => {
		if (sortConfig.field !== field) return null;
		return sortConfig.order === "asc" ? (
			<SortAsc className="h-4 w-4" />
		) : (
			<SortDesc className="h-4 w-4" />
		);
	};

	const renderListView = () => (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Templates ({totalCount})</CardTitle>
					<div className="flex items-center gap-2">
						{selectedTemplates.length > 0 && (
							<BulkActions
								selectedTemplates={selectedTemplates
									.map((id) => templates.find((t) => t.id === id)!)
									.filter(Boolean)}
								onSuccess={() => {
									setSelectedTemplates([]);
									refetch();
								}}
							/>
						)}
						<Button asChild>
							<Link href="/admin/templates/create">
								<Plus className="mr-2 h-4 w-4" />
								Create Template
							</Link>
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">
								<Checkbox
									checked={
										selectedTemplates.length === templates.length &&
										templates.length > 0
									}
									onCheckedChange={handleSelectAll}
								/>
							</TableHead>
							<TableHead>
								<Button
									variant="ghost"
									onClick={() => handleSort("name")}
									className="h-auto p-0 font-medium"
								>
									Template {getSortIcon("name")}
								</Button>
							</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>
								<Button
									variant="ghost"
									onClick={() => handleSort("usage")}
									className="h-auto p-0 font-medium"
								>
									Metrics {getSortIcon("usage")}
								</Button>
							</TableHead>
							<TableHead>
								<Button
									variant="ghost"
									onClick={() => handleSort("updated")}
									className="h-auto p-0 font-medium"
								>
									Updated {getSortIcon("updated")}
								</Button>
							</TableHead>
							<TableHead className="w-12" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{templates.map((template) => (
							<TableRow key={template.id} className="hover:bg-muted/50">
								<TableCell>
									<Checkbox
										checked={selectedTemplates.includes(template.id)}
										onCheckedChange={() => handleSelectTemplate(template.id)}
									/>
								</TableCell>
								<TableCell>
									<div className="flex items-start gap-3">
										{template.previewImageUrl && (
											<img
												src={template.previewImageUrl}
												alt={template.name}
												className="h-16 w-12 rounded border object-cover"
											/>
										)}
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<h3 className="truncate font-medium">
													{template.name}
												</h3>
												<div className="flex items-center gap-1">
													{template.isPremium && (
														<Crown className="h-3 w-3 text-yellow-500" />
													)}
													{template.isFeatured && (
														<Star className="h-3 w-3 text-blue-500" />
													)}
													{template.isBaseTemplate && (
														<Badge variant="outline" className="text-xs">
															Base
														</Badge>
													)}
												</div>
											</div>
											{template.description && (
												<p className="mt-1 truncate text-muted-foreground text-sm">
													{template.description}
												</p>
											)}
											<div className="mt-1 flex items-center gap-2">
												<Badge variant="outline" className="text-xs">
													{template.documentType}
												</Badge>
												<span className="text-muted-foreground text-xs">
													v{template.version}
												</span>
												{template.tags?.slice(0, 2).map((tag) => (
													<Badge
														key={tag}
														variant="secondary"
														className="text-xs"
													>
														{tag}
													</Badge>
												))}
												{template.tags && template.tags.length > 2 && (
													<span className="text-muted-foreground text-xs">
														+{template.tags.length - 2}
													</span>
												)}
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Badge className={getCategoryColor(template.category)}>
										{template.category}
									</Badge>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										{getStatusIcon(template)}
										<div className="text-sm">
											<div className="capitalize">
												{template.reviewStatus || "unknown"}
											</div>
											{template.isDraft && (
												<div className="text-muted-foreground text-xs">
													Draft
												</div>
											)}
										</div>
									</div>
								</TableCell>
								<TableCell>
									<div className="space-y-1 text-sm">
										<div className="flex items-center gap-1">
											<Users className="h-3 w-3" />
											<span>{template.usageCount}</span>
										</div>
										{template.avgRating && (
											<div className="flex items-center gap-1">
												<Star className="h-3 w-3" />
												<span>{template.avgRating.toFixed(1)}</span>
											</div>
										)}
										{template.qualityScore && (
											<div className="flex items-center gap-1">
												<TrendingUp className="h-3 w-3" />
												<span>{template.qualityScore}%</span>
											</div>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="text-muted-foreground text-sm">
										{format(new Date(template.updatedAt), "MMM d, yyyy")}
									</div>
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={createHref(`/admin/templates/${template.id}`)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={createHref(`/admin/templates/${template.id}/edit`)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
											<DropdownMenuSeparator />
											<DuplicateTemplate
												template={template}
												onSuccess={refetch}
												trigger={
                                                    <DuplicateTemplate
                                                        template={template}
                                                        onSuccess={refetch}
                                                        trigger={
                                                            <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                Duplicate
                                                            </DropdownMenuItem>
                                                        }
                                                    />
												}
											/>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="text-destructive"
												onClick={() => handleDeleteTemplate(template.id)}
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				{templates.length === 0 && !isLoading && (
					<div className="py-8 text-center">
						<p className="text-muted-foreground">
							No templates found matching your criteria.
						</p>
						<Button asChild className="mt-4">
							<Link href="/admin/templates/create">
								<Plus className="mr-2 h-4 w-4" />
								Create Your First Template
							</Link>
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);

	const renderGridView = () => (
		<div className="space-y-4">
			{selectedTemplates.length > 0 && (
				<div className="flex items-center justify-between">
					<div />
					<BulkActions
						selectedTemplates={selectedTemplates
							.map((id) => templates.find((t) => t.id === id)!)
							.filter(Boolean)}
						onSuccess={() => {
							setSelectedTemplates([]);
							refetch();
						}}
					/>
				</div>
			)}

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{templates.map((template) => (
					<Card
						key={template.id}
						className="group transition-shadow hover:shadow-lg"
					>
						<CardHeader className="pb-2">
							<div className="flex items-start justify-between">
								<Checkbox
									checked={selectedTemplates.includes(template.id)}
									onCheckedChange={() => handleSelectTemplate(template.id)}
									className="mt-1"
								/>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="opacity-0 group-hover:opacity-100"
										>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem asChild>
											<Link href={`/admin/templates/${template.id}` as any}>
												<Eye className="mr-2 h-4 w-4" />
												View Details
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href={`/admin/templates/${template.id}/edit`}>
												<Edit className="mr-2 h-4 w-4" />
												Edit
											</Link>
										</DropdownMenuItem>
										<DuplicateTemplate
											template={template}
											onSuccess={refetch}
											trigger={
                                                <DuplicateTemplate
                                                    template={template}
                                                    onSuccess={refetch}
                                                    trigger={
                                                        <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                    }
                                                />
											}
										/>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => handleDeleteTemplate(template.id)}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardHeader>
						<CardContent className="space-y-3">
							{template.previewImageUrl && (
								<div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
									<img
										src={template.previewImageUrl}
										alt={template.name}
										className="h-full w-full object-cover"
									/>
								</div>
							)}

							<div>
								<div className="mb-1 flex items-center gap-2">
									<h3 className="truncate font-medium">{template.name}</h3>
									<div className="flex items-center gap-1">
										{template.isPremium && (
											<Crown className="h-3 w-3 text-yellow-500" />
										)}
										{template.isFeatured && (
											<Star className="h-3 w-3 text-blue-500" />
										)}
									</div>
								</div>

								<div className="mb-2 flex items-center gap-2">
									<Badge className={getCategoryColor(template.category)}>
										{template.category}
									</Badge>
									<Badge variant="outline" className="text-xs">
										{template.documentType}
									</Badge>
								</div>

								<div className="flex items-center justify-between text-muted-foreground text-sm">
									<div className="flex items-center gap-1">
										{getStatusIcon(template)}
										<span className="capitalize">
											{template.reviewStatus || "unknown"}
										</span>
									</div>
									<span>v{template.version}</span>
								</div>

								<div className="mt-2 flex items-center justify-between text-sm">
									<div className="flex items-center gap-3">
										<div className="flex items-center gap-1">
											<Users className="h-3 w-3" />
											<span>{template.usageCount}</span>
										</div>
										{template.avgRating && (
											<div className="flex items-center gap-1">
												<Star className="h-3 w-3" />
												<span>{template.avgRating.toFixed(1)}</span>
											</div>
										)}
									</div>
									<span className="text-muted-foreground text-xs">
										{format(new Date(template.updatedAt), "MMM d")}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);

	return (
		<div className="container mx-auto space-y-6 py-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Template Management</h1>
					<p className="text-muted-foreground">
						Manage document templates, categories, and settings
					</p>
				</div>
				<Button asChild>
					<Link href="/admin/templates/create">
						<Plus className="mr-2 h-4 w-4" />
						Create Template
					</Link>
				</Button>
			</div>

			{/* Filters */}
			<TemplateFilters
				filters={filters}
				onChange={setFilters}
				onReset={() => setFilters({})}
				isLoading={isLoading}
			/>

			{/* Search and View Controls */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
						<Input
							placeholder="Search templates..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-80 pl-10"
						/>
					</div>
					{selectedTemplates.length > 0 && (
						<Badge variant="secondary">
							{selectedTemplates.length} selected
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant={viewMode === "list" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("list")}
					>
						<List className="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === "grid" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("grid")}
					>
						<Grid className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Templates Display */}
			{isLoading ? (
				<div className="py-8 text-center">
					<p>Loading templates...</p>
				</div>
			) : viewMode === "list" ? (
				renderListView()
			) : (
				renderGridView()
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						variant="outline"
						disabled={currentPage === 1}
						onClick={() => setCurrentPage((prev) => prev - 1)}
					>
						Previous
					</Button>
					<span className="text-muted-foreground text-sm">
						Page {currentPage} of {totalPages}
					</span>
					<Button
						variant="outline"
						disabled={currentPage === totalPages}
						onClick={() => setCurrentPage((prev) => prev + 1)}
					>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
