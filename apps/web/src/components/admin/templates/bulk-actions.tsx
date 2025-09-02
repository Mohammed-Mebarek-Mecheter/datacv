// components/admin/templates/bulk-actions.tsx

import {
    CheckCircle,
    ChevronDown,
    Edit,
    Eye,
    EyeOff,
    Star,
    Trash2,
} from "lucide-react";
import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "@/hooks/use-toast";
import type { Template } from "@/types/templates";
import { trpc } from "@/utils/trpc";

interface BulkActionsProps {
    selectedTemplates: Template[];
    onSuccess?: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
                                                     selectedTemplates,
                                                     onSuccess,
                                                 }) => {
    const [updateDialogOpen, setUpdateDialogOpen] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [bulkSettings, setBulkSettings] = React.useState({
        isActive: undefined as boolean | undefined,
        isPremium: undefined as boolean | undefined,
        isFeatured: undefined as boolean | undefined,
        reviewStatus: undefined as string | undefined,
        category: undefined as string | undefined,
        version: undefined as string | undefined,
    });
    const [deleteSettings, setDeleteSettings] = React.useState({
        hardDelete: false,
        transferDependenciesTo: undefined as string | undefined,
    });

    const bulkUpdateMutation =
        trpc.admin.templates.bulkUpdateTemplates.useMutation({
            onSuccess: (data) => {
                toast({
                    title: "Bulk update completed",
                    description: `Updated ${data.updated} templates successfully.`,
                });
                setUpdateDialogOpen(false);
                onSuccess?.();
            },
            onError: (error) => {
                toast({
                    title: "Bulk update failed",
                    description: error.message,
                    variant: "destructive",
                });
            },
        });

    const bulkDeleteMutation =
        trpc.admin.templates.bulkDeleteTemplates.useMutation({
            onSuccess: (data) => {
                toast({
                    title: "Bulk delete completed",
                    description: `Deleted ${data.successCount} templates. ${data.errors.length} errors.`,
                });
                if (data.errors.length > 0) {
                    console.warn("Bulk delete errors:", data.errors);
                }
                setDeleteDialogOpen(false);
                onSuccess?.();
            },
            onError: (error) => {
                toast({
                    title: "Bulk delete failed",
                    description: error.message,
                    variant: "destructive",
                });
            },
        });

    const handleBulkUpdate = () => {
        const updates = Object.fromEntries(
            Object.entries(bulkSettings).filter(([_, value]) => value !== undefined),
        );

        if (Object.keys(updates).length === 0) {
            toast({
                title: "No changes specified",
                description: "Please select at least one field to update.",
                variant: "destructive",
            });
            return;
        }

        bulkUpdateMutation.mutate({
            templateIds: selectedTemplates.map((t) => t.id),
            updates,
            createVersions: !!updates.version,
        });
    };

    const handleBulkDelete = () => {
        bulkDeleteMutation.mutate({
            templateIds: selectedTemplates.map((t) => t.id),
            hardDelete: deleteSettings.hardDelete,
            transferDependenciesTo: deleteSettings.transferDependenciesTo,
        });
    };

    const getActionText = (action: string) => {
        const count = selectedTemplates.length;
        return `${action} ${count} template${count === 1 ? "" : "s"}`;
    };

    if (selectedTemplates.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedTemplates.length} selected</Badge>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        Bulk Actions
                        <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                        <DialogTrigger asChild>
                            {/* ✅ properly typed event */}
                            <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                                <Edit className="mr-2 h-4 w-4" />
                                {getActionText("Edit")}
                            </DropdownMenuItem>
                        </DialogTrigger>
                    </Dialog>

                    <DropdownMenuSeparator />

                    {/* Quick Actions */}
                    <DropdownMenuItem
                        onClick={() => {
                            bulkUpdateMutation.mutate({
                                templateIds: selectedTemplates.map((t) => t.id),
                                updates: { isActive: true },
                            });
                        }}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Activate All
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => {
                            bulkUpdateMutation.mutate({
                                templateIds: selectedTemplates.map((t) => t.id),
                                updates: { isActive: false },
                            });
                        }}
                    >
                        <EyeOff className="mr-2 h-4 w-4" />
                        Deactivate All
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => {
                            bulkUpdateMutation.mutate({
                                templateIds: selectedTemplates.map((t) => t.id),
                                updates: { isFeatured: true },
                            });
                        }}
                    >
                        <Star className="mr-2 h-4 w-4" />
                        Feature All
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => {
                            bulkUpdateMutation.mutate({
                                templateIds: selectedTemplates.map((t) => t.id),
                                updates: { reviewStatus: "approved" },
                            });
                        }}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve All
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <AlertDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                    >
                        {/* ✅ properly typed event */}
                        <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(e: Event) => {
                                e.preventDefault();
                                setDeleteDialogOpen(true);
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {getActionText("Delete")}
                        </DropdownMenuItem>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Bulk Update Dialog */}
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Bulk Update Templates</DialogTitle>
                        <DialogDescription>
                            Update {selectedTemplates.length} selected template
                            {selectedTemplates.length === 1 ? "" : "s"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Status Updates */}
                        <div className="space-y-3">
                            <Label className="font-medium text-base">Status Updates</Label>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="bulk-active">Active Status</Label>
                                <Select
                                    value={bulkSettings.isActive?.toString() || ""}
                                    onValueChange={(value: string) =>
                                        setBulkSettings((prev) => ({
                                            ...prev,
                                            isActive:
                                                value === "" || value === "none"
                                                    ? undefined
                                                    : value === "true",
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="No change" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No change</SelectItem>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="bulk-premium">Premium Status</Label>
                                <Select
                                    value={bulkSettings.isPremium?.toString() || ""}
                                    onValueChange={(value: string) =>
                                        setBulkSettings((prev) => ({
                                            ...prev,
                                            isPremium:
                                                value === "" || value === "none"
                                                    ? undefined
                                                    : value === "true",
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="No change" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No change</SelectItem>
                                        <SelectItem value="true">Premium</SelectItem>
                                        <SelectItem value="false">Free</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="bulk-featured">Featured Status</Label>
                                <Select
                                    value={bulkSettings.isFeatured?.toString() || ""}
                                    onValueChange={(value: string) =>
                                        setBulkSettings((prev) => ({
                                            ...prev,
                                            isFeatured:
                                                value === "" || value === "none"
                                                    ? undefined
                                                    : value === "true",
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="No change" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No change</SelectItem>
                                        <SelectItem value="true">Featured</SelectItem>
                                        <SelectItem value="false">Not Featured</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="bulk-review-status">Review Status</Label>
                                <Select
                                    value={bulkSettings.reviewStatus || ""}
                                    onValueChange={(value: string) =>
                                        setBulkSettings((prev) => ({
                                            ...prev,
                                            reviewStatus:
                                                value === "" || value === "none" ? undefined : value,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="No change" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No change</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Category Update */}
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={bulkSettings.category || ""}
                                onValueChange={(value: string) =>
                                    setBulkSettings((prev) => ({
                                        ...prev,
                                        category:
                                            value === "" || value === "none" ? undefined : value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="No change" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No change</SelectItem>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="modern">Modern</SelectItem>
                                    <SelectItem value="creative">Creative</SelectItem>
                                    <SelectItem value="academic">Academic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Version Update */}
                        <div className="space-y-2">
                            <Label>Version (creates new versions)</Label>
                            <Input
                                placeholder="e.g., 1.2.0"
                                value={bulkSettings.version || ""}
                                // ✅ properly typed change event
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setBulkSettings((prev) => ({
                                        ...prev,
                                        version: e.target.value || undefined,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setUpdateDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkUpdate}
                            disabled={bulkUpdateMutation.isPending}
                        >
                            {bulkUpdateMutation.isPending
                                ? "Updating..."
                                : "Update Templates"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Templates</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedTemplates.length}{" "}
                            template{selectedTemplates.length === 1 ? "" : "s"}? This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="hard-delete">Hard Delete</Label>
                            <Switch
                                id="hard-delete"
                                checked={deleteSettings.hardDelete}
                                onCheckedChange={(checked: boolean) =>
                                    setDeleteSettings((prev) => ({
                                        ...prev,
                                        hardDelete: checked,
                                    }))
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Transfer Dependencies To (Optional)</Label>
                            <Input
                                placeholder="Template ID to transfer dependencies..."
                                value={deleteSettings.transferDependenciesTo || ""}
                                // ✅ properly typed change event
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setDeleteSettings((prev) => ({
                                        ...prev,
                                        transferDependenciesTo:
                                            e.target.value || undefined,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={bulkDeleteMutation.isPending}
                        >
                            {bulkDeleteMutation.isPending
                                ? "Deleting..."
                                : "Delete Templates"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BulkActions;
