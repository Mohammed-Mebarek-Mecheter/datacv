// components/admin/tags/edit-tag-dialog.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Shield } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { format } from 'date-fns';
import {handleZodErrors} from "@/utils/zod-error-handler";
import {TagCategoryColorFields} from "@/components/admin/tags/tag-category-color-fields";

const updateTagSchema = z.object({
    name: z.string().min(1, "Tag name is required"),
    description: z.string().optional(),
    color: z.string(),
    category: z.string().optional(),
    isSystemTag: z.boolean(),
});

interface Tag {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    category: string | null;
    isSystemTag: boolean | null;
    usageCount: number | null;
    parentTagId: string | null;
    createdAt: string;
}

interface EditTagDialogProps {
    tag: Tag | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const EditTagDialog: React.FC<EditTagDialogProps> = ({
                                                                tag,
                                                                open,
                                                                onOpenChange,
                                                                onSuccess,
                                                            }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        category: '',
        isSystemTag: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Update form when tag changes
    useEffect(() => {
        if (tag) {
            setFormData({
                name: tag.name,
                description: tag.description || '',
                color: tag.color || '#3B82F6',
                category: tag.category || '',
                isSystemTag: tag.isSystemTag || false,
            });
            setErrors({});
        }
    }, [tag]);

    const updateMutation = trpc.admin.tags.updateTag.useMutation({
        onSuccess: () => {
            toast({
                title: "Tag updated",
                description: "Tag has been successfully updated.",
            });
            onOpenChange(false);
            onSuccess();
        },
        onError: (error) => {
            toast({
                title: "Update failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const validateForm = () => {
        try {
            updateTagSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            setErrors(handleZodErrors(error));
            return false;
        }
    };

    const handleSubmit = () => {
        if (!tag || !validateForm()) return;

        updateMutation.mutate({
            id: tag.id,
            ...formData,
            description: formData.description || undefined,
            category: formData.category || undefined,
        });
    };

    if (!tag) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Tag</DialogTitle>
                    <DialogDescription>
                        Update tag details and settings
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Tag Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="data-science"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Templates suitable for data science professionals..."
                            rows={3}
                        />
                    </div>

                    <TagCategoryColorFields
                        category={formData.category}
                        color={formData.color}
                        onCategoryChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        onColorChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                    />

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-green-500" />
                                System Tag
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Protected tag that cannot be deleted
                            </p>
                        </div>
                        <Switch
                            checked={formData.isSystemTag}
                            onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, isSystemTag: checked }))}
                        />
                    </div>

                    {/* Tag Statistics */}
                    <div className="space-y-2">
                        <Label>Tag Statistics</Label>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{tag.usageCount}</div>
                                <div className="text-sm text-blue-800">Templates</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <div className="text-sm font-medium text-green-600">/{tag.slug}</div>
                                <div className="text-sm text-green-800">Slug</div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="text-sm font-medium text-purple-600">
                                    {format(new Date(tag.createdAt), 'MMM d, yyyy')}
                                </div>
                                <div className="text-sm text-purple-800">Created</div>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: formData.color }}
                                />
                                <span
                                    className="px-2 py-1 rounded-md text-sm font-medium"
                                    style={{
                                        backgroundColor: formData.color + '20',
                                        color: formData.color
                                    }}
                                >
                                    {formData.name}
                                </span>
                                {formData.isSystemTag && <Shield className="h-3 w-3 text-green-500" />}
                            </div>
                            {formData.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    {formData.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? 'Updating...' : 'Update Tag'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
