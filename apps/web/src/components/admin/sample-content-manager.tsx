// apps/web/src/components/admin/sample-content-manager.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

interface SampleContent {
    id: string;
    contentType: string;
    contentSubtype?: string | null;
    content?: any;
    targetIndustry?: string[] | null;
    targetSpecialization?: string[] | null;
    targetJobTitles?: string[] | null;
    targetCompanyTypes?: ("startup" | "enterprise" | "consulting" | "agency" | "non_profit" | "government")[] | null;
    experienceLevel?: "entry" | "junior" | "mid" | "senior" | "lead" | "principal" | "executive" | null;
    contentQuality?: "basic" | "good" | "excellent" | "premium" | null;
    contentSource?: "ai_generated" | "expert_written" | "user_contributed" | "curated" | null;
    isActive?: boolean | null;
    isApproved?: boolean | null;
    tags: string[] | null;
    keywords: string[] | null;
    createdAt: string;
    updatedAt: string;
    title?: string | null;
    description?: string | null;
}

interface SampleContentFilters {
    contentType?: string;
    targetIndustry?: string;
    targetSpecialization?: string;
    experienceLevel?: "entry" | "junior" | "mid" | "senior" | "lead" | "principal" | "executive";
    contentQuality?: "basic" | "good" | "excellent" | "premium";
    contentSource?: "ai_generated" | "expert_written" | "user_contributed" | "curated";
    isActive?: boolean;
    isApproved?: boolean;
    tags?: string[];
    keywords?: string[];
    search?: string;
    page?: number;
    limit?: number;
}

const CONTENT_TYPES = [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "achievements",
    "personal_info",
    "opening",
    "body_paragraphs",
    "closing",
];

const INDUSTRIES = [
    "technology",
    "finance",
    "healthcare",
    "education",
    "retail",
    "manufacturing",
    "consulting",
    "government",
    "nonprofit",
    "startup",
];

const SPECIALIZATIONS = [
    "data_science",
    "data_engineering",
    "data_analytics",
    "machine_learning",
    "business_intelligence",
    "data_architecture",
    "statistical_analysis",
    "big_data",
    "ai_research",
    "product_analytics",
];

const COMPANY_TYPES = [
    "startup",
    "enterprise",
    "consulting",
    "agency",
    "non_profit",
    "government"
];

const CONTENT_QUALITY = [
    "basic",
    "good",
    "excellent",
    "premium"
];

const CONTENT_SOURCE = [
    "ai_generated",
    "expert_written",
    "user_contributed",
    "curated"
];

export function SampleContentManager() {
    const [filters, setFilters] = useState<SampleContentFilters>({});
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<SampleContent | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
    });

    // Form state for create/edit
    const [formData, setFormData] = useState({
        contentType: "",
        contentSubtype: "",
        content: "",
        targetIndustry: [] as string[],
        targetSpecialization: [] as string[],
        targetJobTitles: [] as string[],
        targetCompanyTypes: [] as string[],
        experienceLevel: undefined as "entry" | "junior" | "mid" | "senior" | "lead" | "principal" | "executive" | undefined,
        contentQuality: "good" as "basic" | "good" | "excellent" | "premium",
        contentSource: "ai_generated" as "ai_generated" | "expert_written" | "user_contributed" | "curated",
        isActive: true,
        isApproved: false,
        tags: [] as string[],
        keywords: [] as string[],
        title: "",
        description: "",
    });

    // tRPC queries and mutations
    const { data, isLoading, refetch } = trpc.admin.sampleContent.list.useQuery({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
    });

    const createMutation = trpc.admin.sampleContent.create.useMutation({
        onSuccess: () => {
            toast.success("Sample content created successfully");
            setIsCreateDialogOpen(false);
            resetForm();
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create sample content");
        },
    });

    const updateMutation = trpc.admin.sampleContent.update.useMutation({
        onSuccess: () => {
            toast.success("Sample content updated successfully");
            setIsEditDialogOpen(false);
            setEditingContent(null);
            resetForm();
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update sample content");
        },
    });

    const deleteMutation = trpc.admin.sampleContent.delete.useMutation({
        onSuccess: () => {
            toast.success("Sample content deleted successfully");
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete sample content");
        },
    });

    const contentTypesQuery = trpc.admin.sampleContent.getContentTypes.useQuery();

    // Handle create
    const handleCreate = () => {
        let parsedContent;
        try {
            parsedContent = JSON.parse(formData.content);
        } catch {
            parsedContent = formData.content;
        }

        createMutation.mutate({
            contentType: formData.contentType,
            contentSubtype: formData.contentSubtype,
            content: parsedContent,
            targetIndustry: formData.targetIndustry.length > 0 ? formData.targetIndustry : undefined,
            targetSpecialization: formData.targetSpecialization.length > 0 ? formData.targetSpecialization : undefined,
            targetJobTitles: formData.targetJobTitles.length > 0 ? formData.targetJobTitles : undefined,
            targetCompanyTypes: formData.targetCompanyTypes.length > 0 ? formData.targetCompanyTypes as any : undefined,
            experienceLevel: formData.experienceLevel,
            contentQuality: formData.contentQuality,
            contentSource: formData.contentSource,
            isActive: formData.isActive,
            isApproved: formData.isApproved,
            tags: formData.tags.length > 0 ? formData.tags : undefined,
            keywords: formData.keywords.length > 0 ? formData.keywords : undefined,
            title: formData.title,
            description: formData.description,
        });
    };

    // Handle edit
    const handleEdit = () => {
        if (!editingContent) return;
        let parsedContent;
        try {
            parsedContent = JSON.parse(formData.content);
        } catch {
            parsedContent = formData.content;
        }

        updateMutation.mutate({
            id: editingContent.id,
            contentType: formData.contentType,
            contentSubtype: formData.contentSubtype,
            content: parsedContent,
            targetIndustry: formData.targetIndustry.length > 0 ? formData.targetIndustry : undefined,
            targetSpecialization: formData.targetSpecialization.length > 0 ? formData.targetSpecialization : undefined,
            targetJobTitles: formData.targetJobTitles.length > 0 ? formData.targetJobTitles : undefined,
            targetCompanyTypes: formData.targetCompanyTypes.length > 0 ? formData.targetCompanyTypes as any : undefined,
            experienceLevel: formData.experienceLevel,
            contentQuality: formData.contentQuality,
            contentSource: formData.contentSource,
            isActive: formData.isActive,
            isApproved: formData.isApproved,
            tags: formData.tags.length > 0 ? formData.tags : undefined,
            keywords: formData.keywords.length > 0 ? formData.keywords : undefined,
            title: formData.title,
            description: formData.description,
        });
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this sample content?")) return;
        deleteMutation.mutate({ id });
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            contentType: "",
            contentSubtype: "",
            content: "",
            targetIndustry: [],
            targetSpecialization: [],
            targetJobTitles: [],
            targetCompanyTypes: [],
            experienceLevel: undefined,
            contentQuality: "good",
            contentSource: "ai_generated",
            isActive: true,
            isApproved: false,
            tags: [],
            keywords: [],
            title: "",
            description: "",
        });
    };

    // Open edit dialog
    const openEditDialog = (content: SampleContent) => {
        setEditingContent(content);
        const raw = content.content;
        const contentString = raw === undefined || raw === null
            ? ""
            : (typeof raw === "string" ? raw : JSON.stringify(raw, null, 2));

        setFormData({
            contentType: content.contentType,
            contentSubtype: content.contentSubtype || "",
            content: contentString,
            targetIndustry: content.targetIndustry || [],
            targetSpecialization: content.targetSpecialization || [],
            targetJobTitles: content.targetJobTitles || [],
            targetCompanyTypes: content.targetCompanyTypes || [],
            experienceLevel: content.experienceLevel || undefined,
            contentQuality: content.contentQuality || "good",
            contentSource: content.contentSource || "ai_generated",
            isActive: content.isActive ?? true,
            isApproved: content.isApproved ?? false,
            tags: content.tags || [],
            keywords: content.keywords || [],
            title: content.title || "",
            description: content.description || "",
        });
        setIsEditDialogOpen(true);
    };

    const sampleContent = data?.data || [];
    const paginationData = data?.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Sample Content Manager</h1>
                    <p className="text-muted-foreground">
                        Manage sample content snippets for template initialization
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Sample Content
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create Sample Content</DialogTitle>
                            <DialogDescription>
                                Add new sample content for template initialization
                            </DialogDescription>
                        </DialogHeader>
                        <SampleContentForm
                            formData={formData}
                            setFormData={setFormData}
                            contentTypes={contentTypesQuery.data?.data || CONTENT_TYPES}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? "Creating..." : "Create"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div>
                            <Label>Content Type</Label>
                            <Select
                                value={filters.contentType || ""}
                                onValueChange={(value: string) =>
                                    setFilters({ ...filters, contentType: value || undefined })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">All types</SelectItem>
                                    {CONTENT_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace("_", " ").toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Industry</Label>
                            <Select
                                value={filters.targetIndustry || ""}
                                onValueChange={(value: string) =>
                                    setFilters({ ...filters, targetIndustry: value || undefined })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All industries" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">All industries</SelectItem>
                                    {INDUSTRIES.map((industry) => (
                                        <SelectItem key={industry} value={industry}>
                                            {industry.replace("_", " ").toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Specialization</Label>
                            <Select
                                value={filters.targetSpecialization || ""}
                                onValueChange={(value: string) =>
                                    setFilters({ ...filters, targetSpecialization: value || undefined })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All specializations" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">All specializations</SelectItem>
                                    {SPECIALIZATIONS.map((spec) => (
                                        <SelectItem key={spec} value={spec}>
                                            {spec.replace("_", " ").toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Experience Level</Label>
                            <Select
                                value={filters.experienceLevel || ""}
                                onValueChange={(value: string) =>
                                    setFilters({
                                        ...filters,
                                        experienceLevel: value as "entry" | "junior" | "mid" | "senior" | "lead" | "principal" | "executive" | undefined
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">All levels</SelectItem>
                                    <SelectItem value="entry">Entry</SelectItem>
                                    <SelectItem value="junior">Junior</SelectItem>
                                    <SelectItem value="mid">Mid</SelectItem>
                                    <SelectItem value="senior">Senior</SelectItem>
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="principal">Principal</SelectItem>
                                    <SelectItem value="executive">Executive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Search</Label>
                            <Input
                                placeholder="Search content..."
                                value={filters.search || ""}
                                onChange={(e) =>
                                    setFilters({ ...filters, search: e.target.value || undefined })
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Sample Content ({paginationData.total})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Content Preview</TableHead>
                                        <TableHead>Targeting</TableHead>
                                        <TableHead>Tags</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sampleContent.map((content) => (
                                        <TableRow key={content.id}>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {content.contentType.replace("_", " ").toUpperCase()}
                                                </Badge>
                                                {content.contentSubtype && (
                                                    <Badge variant="secondary" className="ml-1 text-xs">
                                                        {content.contentSubtype}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="truncate">
                                                    {typeof content.content === "string"
                                                        ? content.content
                                                        : JSON.stringify(content.content).substring(0, 100) + "..."}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {content.experienceLevel && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {content.experienceLevel}
                                                        </Badge>
                                                    )}
                                                    {content.targetIndustry?.map((industry) => (
                                                        <Badge key={industry} variant="outline" className="text-xs">
                                                            {industry}
                                                        </Badge>
                                                    ))}
                                                    {content.contentQuality && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {content.contentQuality}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {(content.tags || []).slice(0, 3).map((tag) => (
                                                        <Badge key={tag} variant="secondary" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {(content.tags || []).length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{(content.tags || []).length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(content.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditDialog(content)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(content.id)}
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(paginationData.page - 1) * paginationData.limit + 1} to{" "}
                                    {Math.min(paginationData.page * paginationData.limit, paginationData.total)} of{" "}
                                    {paginationData.total} results
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={paginationData.page === 1}
                                        onClick={() =>
                                            setPagination({ ...pagination, page: pagination.page - 1 })
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={paginationData.page === paginationData.totalPages}
                                        onClick={() =>
                                            setPagination({ ...pagination, page: pagination.page + 1 })
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Sample Content</DialogTitle>
                        <DialogDescription>
                            Update the sample content details
                        </DialogDescription>
                    </DialogHeader>
                    <SampleContentForm
                        formData={formData}
                        setFormData={setFormData}
                        contentTypes={contentTypesQuery.data?.data || CONTENT_TYPES}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEdit}
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? "Updating..." : "Update"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Form component for create/edit
function SampleContentForm({
                               formData,
                               setFormData,
                               contentTypes,
                           }: {
    formData: any;
    setFormData: (data: any) => void;
    contentTypes: string[];
}) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Content Type *</Label>
                    <Select
                        value={formData.contentType}
                        onValueChange={(value: string) => setFormData({ ...formData, contentType: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                            {contentTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type.replace("_", " ").toUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Content Subtype</Label>
                    <Input
                        placeholder="More granular content type"
                        value={formData.contentSubtype}
                        onChange={(e) => setFormData({ ...formData, contentSubtype: e.target.value })}
                    />
                </div>
            </div>

            <div>
                <Label>Title</Label>
                <Input
                    placeholder="Human-readable title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
            </div>

            <div>
                <Label>Description</Label>
                <Textarea
                    placeholder="What this content demonstrates"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div>
                <Label>Content *</Label>
                <Textarea
                    placeholder="Enter content (JSON for structured data, text for simple content)"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Target Industries</Label>
                    <Input
                        placeholder="Comma-separated industries"
                        value={formData.targetIndustry.join(", ")}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                targetIndustry: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                            })
                        }
                    />
                </div>
                <div>
                    <Label>Target Specializations</Label>
                    <Input
                        placeholder="Comma-separated specializations"
                        value={formData.targetSpecialization.join(", ")}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                targetSpecialization: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                            })
                        }
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Target Job Titles</Label>
                    <Input
                        placeholder="Comma-separated job titles"
                        value={formData.targetJobTitles.join(", ")}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                targetJobTitles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                            })
                        }
                    />
                </div>
                <div>
                    <Label>Target Company Types</Label>
                    <Input
                        placeholder="Comma-separated company types"
                        value={formData.targetCompanyTypes.join(", ")}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                targetCompanyTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                            })
                        }
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Experience Level</Label>
                    <Select
                        value={formData.experienceLevel || ""}
                        onValueChange={(value: string) =>
                            setFormData({
                                ...formData,
                                experienceLevel: value as "entry" | "junior" | "mid" | "senior" | "lead" | "principal" | "executive" | undefined
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="entry">Entry</SelectItem>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="mid">Mid</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="principal">Principal</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Content Quality</Label>
                    <Select
                        value={formData.contentQuality}
                        onValueChange={(value: string) =>
                            setFormData({
                                ...formData,
                                contentQuality: value as "basic" | "good" | "excellent" | "premium"
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                            {CONTENT_QUALITY.map((quality) => (
                                <SelectItem key={quality} value={quality}>
                                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Content Source</Label>
                    <Select
                        value={formData.contentSource}
                        onValueChange={(value: string) =>
                            setFormData({
                                ...formData,
                                contentSource: value as "ai_generated" | "expert_written" | "user_contributed" | "curated"
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                            {CONTENT_SOURCE.map((source) => (
                                <SelectItem key={source} value={source}>
                                    {source.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-4 pt-6">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded"
                        />
                        <span>Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.isApproved}
                            onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                            className="rounded"
                        />
                        <span>Approved</span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Tags</Label>
                    <Input
                        placeholder="Comma-separated tags"
                        value={formData.tags.join(", ")}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                            })
                        }
                    />
                </div>
                <div>
                    <Label>Keywords</Label>
                    <Input
                        placeholder="Comma-separated keywords"
                        value={formData.keywords.join(", ")}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                            })
                        }
                    />
                </div>
            </div>
        </div>
    );
}
