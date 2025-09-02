// components/admin/templates/template-filters.tsx
import { format } from "date-fns";
import { CalendarIcon, Filter, RotateCcw, X } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface TemplateFiltersProps {
	filters: Record<string, any>;
	onChange: (filters: Record<string, any>) => void;
	onReset: () => void;
	isLoading?: boolean;
}

const TemplateFilters: React.FC<TemplateFiltersProps> = ({
	filters,
	onChange,
	onReset,
	isLoading = false,
}) => {
	const [isExpanded, setIsExpanded] = React.useState(false);
	const [tempFilters, setTempFilters] = React.useState(filters);

	React.useEffect(() => {
		setTempFilters(filters);
	}, [filters]);

	const updateFilter = (key: string, value: any) => {
		const newFilters = { ...tempFilters };
		if (value === undefined || value === null || value === "") {
			delete newFilters[key];
		} else {
			newFilters[key] = value;
		}
		setTempFilters(newFilters);
	};

	const applyFilters = () => {
		onChange(tempFilters);
	};

	const resetFilters = () => {
		setTempFilters({});
		onReset();
	};

	const getActiveFilterCount = () => {
		return Object.keys(filters).length;
	};

	const removeFilter = (key: string) => {
		const newFilters = { ...filters };
		delete newFilters[key];
		onChange(newFilters);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-4 w-4" />
						Filters
						{getActiveFilterCount() > 0 && (
							<Badge variant="secondary">{getActiveFilterCount()}</Badge>
						)}
					</CardTitle>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsExpanded(!isExpanded)}
						>
							{isExpanded ? "Collapse" : "Expand"}
						</Button>
						{getActiveFilterCount() > 0 && (
							<Button
								variant="outline"
								size="sm"
								onClick={resetFilters}
								disabled={isLoading}
							>
								<RotateCcw className="mr-1 h-3 w-3" />
								Reset
							</Button>
						)}
					</div>
				</div>
			</CardHeader>

			{/* Active Filters Display */}
			{getActiveFilterCount() > 0 && (
				<CardContent className="pt-0">
					<div className="flex flex-wrap gap-2">
						{Object.entries(filters).map(([key, value]) => (
							<Badge
								key={key}
								variant="outline"
								className="flex items-center gap-1"
							>
								<span className="text-xs">
									{key}:{" "}
									{typeof value === "boolean"
										? value
											? "Yes"
											: "No"
										: String(value)}
								</span>
								<X
									className="h-3 w-3 cursor-pointer"
									onClick={() => removeFilter(key)}
								/>
							</Badge>
						))}
					</div>
				</CardContent>
			)}

			{isExpanded && (
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{/* Document Type Filter */}
						<div className="space-y-2">
							<Label>Document Type</Label>
							<Select
								value={tempFilters.documentType || ""}
								onValueChange={(value: string) =>
									updateFilter("documentType", value || undefined)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="All types" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">All Types</SelectItem>
									<SelectItem value="resume">Resume</SelectItem>
									<SelectItem value="cv">CV</SelectItem>
									<SelectItem value="cover_letter">Cover Letter</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Category Filter */}
						<div className="space-y-2">
							<Label>Category</Label>
							<Select
								value={tempFilters.category || ""}
								onValueChange={(value: string) =>
									updateFilter("category", value || undefined)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="All categories" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">All Categories</SelectItem>
									<SelectItem value="professional">Professional</SelectItem>
									<SelectItem value="modern">Modern</SelectItem>
									<SelectItem value="creative">Creative</SelectItem>
									<SelectItem value="academic">Academic</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Review Status Filter */}
						<div className="space-y-2">
							<Label>Review Status</Label>
							<Select
								value={tempFilters.reviewStatus || ""}
								onValueChange={(value: string) =>
									updateFilter("reviewStatus", value || undefined)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="All statuses" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">All Statuses</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="approved">Approved</SelectItem>
									<SelectItem value="rejected">Rejected</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Target Experience Level */}
						<div className="space-y-2">
							<Label>Experience Level</Label>
							<Select
								value={tempFilters.targetExperienceLevel || ""}
								onValueChange={(value: string) =>
									updateFilter("targetExperienceLevel", value || undefined)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="All levels" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">All Levels</SelectItem>
									<SelectItem value="entry">Entry Level</SelectItem>
									<SelectItem value="mid">Mid Level</SelectItem>
									<SelectItem value="senior">Senior Level</SelectItem>
									<SelectItem value="executive">Executive</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Target Industry */}
						<div className="space-y-2">
							<Label>Target Industry</Label>
							<Select
								value={tempFilters.targetIndustry || ""}
								onValueChange={(value: string) =>
									updateFilter("targetIndustry", value || undefined)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="All industries" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">All Industries</SelectItem>
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

						{/* Creator Filter */}
						<div className="space-y-2">
							<Label>Created By</Label>
							<Input
								placeholder="Creator ID or name..."
								value={tempFilters.createdBy || ""}
								onChange={(e) => updateFilter("createdBy", e.target.value)}
							/>
						</div>
					</div>

					{/* Date Range Filters */}
					<div className="space-y-4">
						<Label>Date Range</Label>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label className="text-sm">From</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!tempFilters.dateRange?.from && "text-muted-foreground",
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{tempFilters.dateRange?.from
												? format(tempFilters.dateRange.from, "PPP")
												: "Pick a date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={tempFilters.dateRange?.from}
											onSelect={(date) =>
												updateFilter("dateRange", {
													...tempFilters.dateRange,
													from: date,
												})
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
							<div className="space-y-2">
								<Label className="text-sm">To</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!tempFilters.dateRange?.to && "text-muted-foreground",
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{tempFilters.dateRange?.to
												? format(tempFilters.dateRange.to, "PPP")
												: "Pick a date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={tempFilters.dateRange?.to}
											onSelect={(date) =>
												updateFilter("dateRange", {
													...tempFilters.dateRange,
													to: date,
												})
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>
					</div>

					{/* Numeric Filters */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<Label>Min Quality Score</Label>
							<Input
								type="number"
								min="0"
								max="100"
								placeholder="0-100"
								value={tempFilters.qualityScoreMin || ""}
								onChange={(e) =>
									updateFilter(
										"qualityScoreMin",
										e.target.value
											? Number.parseInt(e.target.value)
											: undefined,
									)
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>Min Usage Count</Label>
							<Input
								type="number"
								min="0"
								placeholder="Minimum usage..."
								value={tempFilters.usageCountMin || ""}
								onChange={(e) =>
									updateFilter(
										"usageCountMin",
										e.target.value
											? Number.parseInt(e.target.value)
											: undefined,
									)
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>Min Average Rating</Label>
							<Input
								type="number"
								min="0"
								max="5"
								step="0.1"
								placeholder="0.0-5.0"
								value={tempFilters.avgRatingMin || ""}
								onChange={(e) =>
									updateFilter(
										"avgRatingMin",
										e.target.value
											? Number.parseFloat(e.target.value)
											: undefined,
									)
								}
							/>
						</div>
					</div>

					{/* Boolean Filters */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						<div className="flex items-center justify-between">
							<Label htmlFor="is-active">Active Only</Label>
							<Switch
								id="is-active"
								checked={tempFilters.isActive === true}
								onCheckedChange={(checked: boolean) =>
									updateFilter("isActive", checked || undefined)
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor="is-featured">Featured Only</Label>
							<Switch
								id="is-featured"
								checked={tempFilters.isFeatured === true}
								onCheckedChange={(checked: boolean) =>
									updateFilter("isFeatured", checked || undefined)
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor="is-draft">Drafts Only</Label>
							<Switch
								id="is-draft"
								checked={tempFilters.isDraft === true}
								onCheckedChange={(checked: boolean) =>
									updateFilter("isDraft", checked || undefined)
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor="is-base-template">Base Templates</Label>
							<Switch
								id="is-base-template"
								checked={tempFilters.isBaseTemplate === true}
								onCheckedChange={(checked: boolean) =>
									updateFilter("isBaseTemplate", checked || undefined)
								}
							/>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-between pt-4">
						<Button
							variant="outline"
							onClick={resetFilters}
							disabled={isLoading}
						>
							<RotateCcw className="mr-2 h-4 w-4" />
							Reset All
						</Button>
						<Button onClick={applyFilters} disabled={isLoading}>
							Apply Filters
						</Button>
					</div>
				</CardContent>
			)}
		</Card>
	);
};

export default TemplateFilters;
