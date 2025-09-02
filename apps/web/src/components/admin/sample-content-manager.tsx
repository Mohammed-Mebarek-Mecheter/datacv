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
    content?: any;
    targetIndustry?: string[] | null;
    targetSpecialization?: string[] | null;
    experienceLevel?: "entry" | "junior" | "mid" | "senior" | "lead" | "principal" | "executive" | null;
    tags: string[] | null;
    createdAt: string;
    updatedAt: string;
}

interface SampleContentFilters {
    contentType?: string;
    targetIndustry?: string;
    targetSpecialization?: string;
    experienceLevel?: "entry" | "junior" | "mid" | "senior" | "lead" | "principal" | "executive";
    tags?: string[];
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
        content: "",
        targetIndustry: [] as string[],
        targetSpecialization: [] as string[],
        experienceLevel: undefined as "entry" | "junior" | "mid" | "senior" | "lead" | "principal" | "executive" | undefined,
        tags: [] as string[],
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
            content: parsedContent,
            targetIndustry: formData.targetIndustry.length > 0 ? formData.targetIndustry : undefined,
            targetSpecialization: formData.targetSpecialization.length > 0 ? formData.targetSpecialization : undefined,
            experienceLevel: formData.experienceLevel,
            tags: formData.tags.length > 0 ? formData.tags : undefined,
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
            content: parsedContent,
            targetIndustry: formData.targetIndustry.length > 0 ? formData.targetIndustry : undefined,
            targetSpecialization: formData.targetSpecialization.length > 0 ? formData.targetSpecialization : undefined,
            experienceLevel: formData.experienceLevel,
            tags: formData.tags.length > 0 ? formData.tags : undefined,
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
            content: "",
            targetIndustry: [],
            targetSpecialization: [],
            experienceLevel: undefined,
            tags: [],
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
            content: contentString,
            targetIndustry: content.targetIndustry || [],
            targetSpecialization: content.targetSpecialization || [],
            experienceLevel: content.experienceLevel || undefined,
            tags: content.tags || [],
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
        </div>
    );
}
